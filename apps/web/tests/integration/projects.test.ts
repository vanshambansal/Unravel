import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import nextEnv from '@next/env';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { projectRepository } from '../../src/server/projects/repository.ts';
import { projectService } from '../../src/server/projects/service.ts';
import { ApplicationError } from '../../src/server/errors.ts';
import * as schema from '../../src/server/db/schema.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));
nextEnv.loadEnvConfig(root, true, { info() {}, error() {} });
function identity(value: string) {
  try {
    const url = new URL(value);
    return `${url.hostname.replace(/-pooler(?=\.)/, '')}:${url.port || '5432'}${url.pathname}`;
  } catch { throw new Error('Invalid database URL in local configuration; value withheld.'); }
}
test('real PostgreSQL persistence, owner isolation, atomic uniqueness and reconnect', async () => {
  const url = process.env.TEST_DATABASE_URL?.trim();
  assert.ok(url, 'TEST_DATABASE_URL is required; configure a separate disposable test database. No database was started automatically.');
  for (const name of ['DATABASE_URL', 'DATABASE_MIGRATION_URL']) {
    if (process.env[name]) assert.notEqual(identity(url), identity(process.env[name]!), 'Refusing to run integration tests against the application database.');
  }
  let pool: Pool | undefined;
  let migrated = false;
  const prefix = `unravel-test-${randomUUID()}`; const a = `${prefix}-a`, b = `${prefix}-b`;
  try {
    pool = new Pool({ connectionString: url, max: 3, connectionTimeoutMillis: 15000 });
    await migrate(drizzle(pool), { migrationsFolder: `${root}/drizzle` });
    migrated = true;
    let service = projectService(projectRepository(drizzle(pool, { schema })));
    const project = await service.create(a, { name: 'Question Submission', websiteUrl: 'https://example.com/question?redacted=1', ownerId: b });
    assert.equal(project.ownerId, a); assert.equal(project.origin, 'https://example.com');
    assert.equal((await service.list(b)).length, 0);
    await assert.rejects(service.get(b, project.id), (e: unknown) => e instanceof ApplicationError && e.status === 404);
    await service.create(b, { name: 'Independent owner', websiteUrl: 'example.com' });
    assert.equal((await service.list(a)).length, 1);
    await assert.rejects(service.create(a, { name: '', websiteUrl: 'example.com' }));
    const results = await Promise.allSettled([1, 2].map(() => service.create(a, { name: 'Concurrent registration', websiteUrl: 'https://concurrent.example' })));
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    const rejected = results.find(result => result.status === 'rejected');
    assert.ok(rejected?.status === 'rejected' && rejected.reason instanceof ApplicationError && rejected.reason.status === 409);
    await pool.end(); pool = new Pool({ connectionString: url, max: 1, connectionTimeoutMillis: 15000 });
    service = projectService(projectRepository(drizzle(pool, { schema })));
    assert.equal((await service.get(a, project.id)).name, 'Question Submission');
    assert.equal((await service.list(a)).length, 2);
    const expected = { name: project.name, origin: project.origin };
    await assert.rejects(service.update(b, project.id, { name: 'Denied', websiteUrl: 'other.example', expected }), (e: unknown) => e instanceof ApplicationError && e.status === 404);
    await assert.rejects(service.update(a, project.id, { name: 'Duplicate', websiteUrl: 'https://concurrent.example', expected }), (e: unknown) => e instanceof ApplicationError && e.status === 409);
    const updated = await service.update(a, project.id, { name: 'Renamed', websiteUrl: 'localhost:4184/question', expected });
    assert.equal(updated.id, project.id); assert.equal(updated.origin, 'http://localhost:4184');
    await assert.rejects(service.update(a, project.id, { name: 'Stale', websiteUrl: 'other.example', expected }), (e: unknown) => e instanceof ApplicationError && e.status === 409);
    const removal = { confirmation: updated.name, expected: { name: updated.name, origin: updated.origin } };
    await assert.rejects(service.remove(b, project.id, removal), (e: unknown) => e instanceof ApplicationError && e.status === 404);
    await service.remove(a, project.id, removal);
    await assert.rejects(service.remove(a, project.id, removal), (e: unknown) => e instanceof ApplicationError && e.status === 404);
  } catch (error) {
    if (error instanceof assert.AssertionError || error instanceof ApplicationError) throw error;
    // eslint-disable-next-line preserve-caught-error -- Driver causes may expose connection credentials in test logs.
    throw new Error('Database integration failed. Check the isolated test database configuration; connection details were withheld.');
  } finally {
    try { if (migrated && pool) await pool.query('delete from projects where owner_id = any($1::text[])', [[a, b]]); }
    catch { assert.fail('Could not clean this run\'s synthetic project rows. Connection details withheld; inspect the test database.'); }
    finally { await pool?.end(); }
  }
});
