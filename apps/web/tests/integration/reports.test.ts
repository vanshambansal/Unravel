import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import nextEnv from '@next/env';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { reportRepository } from '../../src/server/reports/repository.ts';
import { reportService } from '../../src/server/reports/service.ts';
import { projectRepository } from '../../src/server/projects/repository.ts';
import { projectService } from '../../src/server/projects/service.ts';
import { ApplicationError } from '../../src/server/errors.ts';
import * as schema from '../../src/server/db/schema.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));
nextEnv.loadEnvConfig(root, true, { info() {}, error() {} });
function identity(value: string) { const url = new URL(value); return `${url.hostname.replace(/-pooler(?=\.)/, '')}:${url.port || '5432'}${url.pathname}`; }
test('real PostgreSQL reports: transactions, concurrent deduplication, ownership, reconnect and cascade deletion', async () => {
  const url = process.env.TEST_DATABASE_URL; assert.ok(url, 'A separate TEST_DATABASE_URL is required.');
  for (const name of ['DATABASE_URL','DATABASE_MIGRATION_URL']) if (process.env[name]) assert.notEqual(identity(url), identity(process.env[name]!));
  let pool = new Pool({ connectionString: url, max: 4, connectionTimeoutMillis: 15000 });
  const owner = `unravel-report-test-${randomUUID()}`;
  try {
    await migrate(drizzle(pool), { migrationsFolder: `${root}/drizzle` });
    let db = drizzle(pool, { schema });
    const project = (await projectRepository(db).create(owner, 'Report integration', 'http://127.0.0.1:4185'))!;
    let service = reportService(reportRepository(db));
    const startedAt = Date.now();
    const input = { version: 1, title: 'Synthetic report', description: '', recording: { version: 1, id: randomUUID(), projectId: project.id, startedAt, durationMs: 1000, initialUrl: { origin: project.origin, path: '/' }, stopReason: 'manual', truncated: false, hasFullSnapshot: true, filteredReplayEvents: 0, events: [], replay: [ { type: 4, timestamp: startedAt, data: { href: project.origin, width: 1280, height: 720 } }, { type: 2, timestamp: startedAt, data: { node: { id: 1, type: 0, childNodes: [] }, initialOffset: { top: 0, left: 0 } } } ] } };
    (input.recording.replay[1].data as Record<string, unknown>).node = { id: 1, type: 0, childNodes: [{ id: 2, type: 2, tagName: 'html', attributes: {}, childNodes: [{ id: 3, type: 2, tagName: 'body', attributes: {}, childNodes: [] }] }] };
    const receipts = await Promise.all([service.submit(project.id, project.origin, input), service.submit(project.id, project.origin, input)]);
    assert.equal(receipts[0].reportId, receipts[1].reportId); assert.equal(receipts.filter(r => !r.duplicate).length, 1);
    const id = receipts[0].reportId;
    const context = await service.planContext(owner, project.id, id);
    assert.equal(context.saved, null);
    assert.deepEqual(context.events, input.recording.events);
    assert.equal('replay' in context, false);
    await assert.rejects(service.planContext('other-owner', project.id, id), (e: unknown) => e instanceof ApplicationError && e.status === 404);
    assert.equal((await service.list(owner, project.id)).reports.length, 1);
    assert.equal((await service.list('other-owner', project.id)).reports.length, 0);
    assert.ok(!JSON.stringify(await service.list(owner, project.id)).includes('childNodes'));
    for (const work of [() => service.detail('other-owner', project.id, id), () => service.replay('other-owner', project.id, id), () => service.remove('other-owner', project.id, id)]) await assert.rejects(work(), (e: unknown) => e instanceof ApplicationError && e.status === 404);
    await assert.rejects(service.submit(project.id, project.origin, { ...input, title: 'Changed content' }), (e: unknown) => e instanceof ApplicationError && e.status === 409);
    await assert.rejects(service.submit(project.id, 'https://wrong.example', input));
    // Force failure after metadata INSERT: JSON encoding of payload throws inside the same transaction.
    const broken = structuredClone(input); broken.recording.id = randomUUID();
    (broken.recording.events as unknown[]) = [BigInt(1)];
    await assert.rejects(reportRepository(db).insert(broken as unknown as import('@unravel/contracts').ReportSubmission, 'broken', 100));
    assert.equal((await service.list(owner, project.id)).reports.length, 1);
    await pool.end(); pool = new Pool({ connectionString: url, max: 1, connectionTimeoutMillis: 15000 }); db = drizzle(pool, { schema }); service = reportService(reportRepository(db));
    assert.equal((await service.detail(owner, project.id, id)).report.title, 'Synthetic report');
    assert.equal((await service.replay(owner, project.id, id)).replay.length, 2);
    const beforeEvidence=JSON.stringify(await service.replay(owner,project.id,id));
    const original=(await service.detail(owner,project.id,id)).report;
    const edited=await service.update(owner,project.id,id,{title:'Edited searchable title %_literal',description:'Search this description',status:'resolved',revision:original.revision});
    assert.equal(edited.report.revision,2);assert.equal(edited.report.status,'resolved');
    assert.equal((await service.list(owner,project.id,{q:'%_literal',status:'resolved',page:1})).total,1);
    assert.equal((await service.list(owner,project.id,{q:'missing',status:'all',page:1})).total,0);
    const clamped=await service.list(owner,project.id,{q:'%_literal',status:'resolved',page:999});
    assert.equal(clamped.page,1);assert.equal(clamped.pages,1);assert.equal(clamped.reports[0].id,id);assert.ok(clamped.reports[0].createdAt instanceof Date);
    const empty=await service.list(owner,project.id,{q:'missing',status:'all',page:999});
    assert.equal(empty.page,1);assert.equal(empty.reports.length,0);
    await assert.rejects(service.update('other-owner',project.id,id,{title:'Foreign',description:'',status:'open',revision:2}),(error:unknown)=>error instanceof ApplicationError&&error.status===404);
    await assert.rejects(service.update(owner,project.id,id,{title:'Stale',description:'',status:'open',revision:1}),(error:unknown)=>error instanceof ApplicationError&&error.status===409);
    assert.equal(JSON.stringify(await service.replay(owner,project.id,id)),beforeEvidence);
    assert.equal((await service.submit(project.id,project.origin,input)).reportId,id);
    // Shared database attempts remain bounded even under concurrent callers.
    // A fixed-window limiter intentionally permits a burst across a minute edge.
    // Keep this single-window atomicity assertion inside one database-time window.
    const second=Number((await pool.query('select extract(second from clock_timestamp())::float as second')).rows[0].second);
    if(second>40)await new Promise(resolve=>setTimeout(resolve,(60-second+.25)*1000));
    const budgets=await Promise.allSettled(Array.from({length:35},()=>service.consume(project.id)));
    assert.equal(budgets.filter(value=>value.status==='fulfilled').length,30);
    assert.equal(budgets.filter(value=>value.status==='rejected').length,5);
    await service.remove(owner, project.id, id);
    assert.equal((await service.list(owner, project.id)).reports.length, 0);
    assert.equal((await pool.query('select count(*)::int as n from report_payloads where report_id = $1', [id])).rows[0].n, 0);
    const retained = await service.submit(project.id, project.origin, { ...input, recording: { ...input.recording, id: randomUUID() } });
    const projectsService = projectService(projectRepository(db));
    const updated = await projectsService.update(owner, project.id, { name: 'New origin', websiteUrl: 'http://localhost:4186', expected: { name: project.name, origin: project.origin } });
    await assert.rejects(service.website(project.id, project.origin));
    assert.equal((await service.website(project.id, updated.origin)).id, project.id);
    assert.equal((await service.detail(owner, project.id, retained.reportId)).report.recording.initialUrl.origin, project.origin);
    await db.insert(schema.reportTestPlans).values({ reportId: retained.reportId, plan: { version: 2, initialPath: '/', steps: [], assertions: [], expectedBehaviorConfirmed: false } });
    assert.equal((await service.planContext(owner, project.id, retained.reportId)).saved?.revision, 1);
    assert.equal((await db.select().from(schema.reportTestPlans)).filter(p => p.reportId === retained.reportId).length, 1);
    await projectsService.remove(owner, project.id, { expected: { name: updated.name, origin: updated.origin }, confirmation: updated.name });
    assert.equal((await pool.query('select count(*)::int as n from reports where project_id = $1', [project.id])).rows[0].n, 0);
    assert.equal((await pool.query('select count(*)::int as n from report_payloads where report_id = $1', [retained.reportId])).rows[0].n, 0);
    assert.equal((await pool.query('select count(*)::int as n from report_test_plans where report_id = $1', [retained.reportId])).rows[0].n, 0);
  } catch (error) {
    if (error instanceof assert.AssertionError || error instanceof ApplicationError) throw error;
    const codes:string[]=[];let cause:unknown=error;
    for(let depth=0;depth<5&&cause&&typeof cause==='object';depth++){const item=cause as {code?:unknown;cause?:unknown};if(typeof item.code==='string'&&/^[A-Z0-9_]{2,30}$/.test(item.code))codes.push(item.code);cause=item.cause;}
    // eslint-disable-next-line preserve-caught-error -- Driver errors can include credentials.
    throw new Error('Report database integration failed; connection details withheld. Codes: '+codes.join(', '));
  } finally { try { await pool.query('delete from projects where owner_id = $1', [owner]); } finally { await pool.end(); } }
});
