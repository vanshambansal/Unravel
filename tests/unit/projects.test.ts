import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProject } from '../../apps/web/src/features/projects/validation.ts';
import { projectService } from '../../apps/web/src/server/projects/service.ts';
import type { ProjectRepository } from '../../apps/web/src/server/projects/repository.ts';
import { ApplicationError } from '../../apps/web/src/server/errors.ts';
import { projectBody, errorResponse } from '../../apps/web/src/server/http.ts';

test('website registration normalizes pasted pages and makes the exact origin explicit', () => {
  for (const [websiteUrl, origin] of [
    ['example.com', 'https://example.com'],
    [' HTTPS://EXAMPLE.COM:443/questions?token=synthetic#form ', 'https://example.com'],
    ['http://localhost:4173/questions', 'http://localhost:4173'],
    ['http://127.0.0.1:4173', 'http://127.0.0.1:4173'],
    ['http://[::1]:4173', 'http://[::1]:4173'],
  ]) assert.deepEqual(validateProject({ name: '  Demo  ', websiteUrl }).value, { name: 'Demo', origin });
});
test('invalid names, unsafe URLs and embedded credentials never become registrations', () => {
  for (const websiteUrl of ['', 'not-a-domain', 'javascript:alert(1)', 'ftp://example.com', 'https://user:secret@example.com', 'https://example.com\\evil', 'https://example.com/path with spaces', 'https://example.com.']) {
    const result = validateProject({ name: 'Demo', websiteUrl });
    assert.equal(result.value, undefined, websiteUrl); assert.ok(result.fields.websiteUrl, websiteUrl);
  }
  for (const name of ['', ' '.repeat(4), 'x'.repeat(81), 'bad\u0000name']) assert.ok(validateProject({ name, websiteUrl: 'example.com' }).fields.name);
  assert.equal(validateProject(null).value, undefined);
});
test('anonymous service calls cannot reach persistence; client ownership is ignored', async () => {
  const calls: unknown[][] = [];
  const project = { id: '11111111-1111-4111-8111-111111111111', ownerId: 'owner-a', name: 'Demo', origin: 'https://example.com', createdAt: new Date(0) };
  const repository: ProjectRepository = {
    async list(owner) { calls.push(['list', owner]); return [project]; },
    async find(owner, id) { calls.push(['find', owner, id]); return owner === project.ownerId ? project : undefined; },
    async create(...values) { calls.push(['create', ...values]); return project; },
  };
  const service = projectService(repository);
  for (const call of [() => service.list(null), () => service.get(null, project.id), () => service.create(null, {})]) {
    await assert.rejects(async () => call(), (e: unknown) => e instanceof ApplicationError && e.status === 401);
  }
  assert.equal(calls.length, 0);
  await service.create('owner-a', { name: 'Demo', websiteUrl: 'example.com', ownerId: 'owner-b' });
  assert.deepEqual(calls.pop(), ['create', 'owner-a', 'Demo', 'https://example.com']);
  await assert.rejects(service.get('owner-b', project.id), (e: unknown) => e instanceof ApplicationError && e.status === 404);
  await assert.rejects(service.get('owner-a', 'not-a-uuid'), (e: unknown) => e instanceof ApplicationError && e.status === 404);
});
test('invalid registration and duplicate website produce useful field errors', async () => {
  let writes = 0;
  const service = projectService({ async list() { return []; }, async find() { return undefined; }, async create() { writes++; return undefined; } });
  await assert.rejects(service.create('owner', {}), (e: unknown) => e instanceof ApplicationError && e.status === 422 && !!e.fields?.websiteUrl);
  assert.equal(writes, 0);
  await assert.rejects(service.create('owner', { name: 'Demo', websiteUrl: 'example.com' }), (e: unknown) => e instanceof ApplicationError && e.status === 409);
});
test('project HTTP requests reject cross-origin, invalid JSON, unsupported types and oversized streams', async () => {
  function request(body: string, headers: Record<string, string> = {}) { return new Request('http://localhost:3000/api/projects', { method: 'POST', headers: { origin: 'http://localhost:3000', 'content-type': 'application/json', ...headers }, body }); }
  assert.deepEqual(await projectBody(request('{"name":"Demo"}')), { name: 'Demo' });
  for (const [req, status] of [[request('{}', { origin: 'https://foreign.example' }), 403], [request('{}', { 'content-type': 'text/plain' }), 415], [request('{'), 400], [request('x'.repeat(8193)), 413]] as const) {
    await assert.rejects(projectBody(req), (e: unknown) => e instanceof ApplicationError && e.status === status);
  }
  const response = errorResponse(new Error('secret connection information'));
  assert.equal(response.status, 503); assert.ok(!(await response.text()).includes('secret connection'));
  assert.equal(response.headers.get('cache-control'), 'no-store');
});
