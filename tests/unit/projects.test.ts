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
    ['localhost:4173', 'http://localhost:4173'],
    ['127.0.0.1:4184', 'http://127.0.0.1:4184'],
    ['[::1]:4173', 'http://[::1]:4173'],
    ['http://127.0.0.1:4173', 'http://127.0.0.1:4173'],
    ['http://[::1]:4173', 'http://[::1]:4173'],
  ])
    assert.deepEqual(validateProject({ name: '  Demo  ', websiteUrl }).value, {
      name: 'Demo',
      origin,
    });
});
test('invalid names, unsafe URLs and embedded credentials never become registrations', () => {
  for (const websiteUrl of [
    '',
    'not-a-domain',
    'javascript:alert(1)',
    'ftp://example.com',
    'https://user:secret@example.com',
    'https://example.com\\evil',
    'https://example.com/path with spaces',
    'https://example.com.',
  ]) {
    const result = validateProject({ name: 'Demo', websiteUrl });
    assert.equal(result.value, undefined, websiteUrl);
    assert.ok(result.fields.websiteUrl, websiteUrl);
  }
  for (const name of ['', ' '.repeat(4), 'x'.repeat(81), 'bad\u0000name'])
    assert.ok(validateProject({ name, websiteUrl: 'example.com' }).fields.name);
  assert.equal(validateProject(null).value, undefined);
});
test('anonymous service calls cannot reach persistence; client ownership is ignored', async () => {
  const calls: unknown[][] = [];
  const project = {
    id: '11111111-1111-4111-8111-111111111111',
    ownerId: 'owner-a',
    name: 'Demo',
    origin: 'https://example.com',
    createdAt: new Date(0),
  };
  const repository: ProjectRepository = {
    async list(owner) {
      calls.push(['list', owner]);
      return [project];
    },
    async findSetup() {
      return undefined;
    },
    async find(owner, id) {
      calls.push(['find', owner, id]);
      return owner === project.ownerId ? project : undefined;
    },
    async create(...values) {
      calls.push(['create', ...values]);
      return project;
    },
    async update() {
      return project;
    },
    async remove() {
      return true;
    },
  };
  const service = projectService(repository);
  for (const call of [
    () => service.list(null),
    () => service.get(null, project.id),
    () => service.create(null, {}),
  ]) {
    await assert.rejects(
      async () => call(),
      (e: unknown) => e instanceof ApplicationError && e.status === 401,
    );
  }
  assert.equal(calls.length, 0);
  await service.create('owner-a', { name: 'Demo', websiteUrl: 'example.com', ownerId: 'owner-b' });
  assert.deepEqual(calls.pop(), ['create', 'owner-a', 'Demo', 'https://example.com']);
  await assert.rejects(
    service.get('owner-b', project.id),
    (e: unknown) => e instanceof ApplicationError && e.status === 404,
  );
  await assert.rejects(
    service.get('owner-a', 'not-a-uuid'),
    (e: unknown) => e instanceof ApplicationError && e.status === 404,
  );
});
test('invalid registration and duplicate website produce useful field errors', async () => {
  let writes = 0;
  const service = projectService({
    async list() {
      return [];
    },
    async findSetup() {
      return undefined;
    },
    async find() {
      return undefined;
    },
    async create() {
      writes++;
      return undefined;
    },
    async update() {
      return undefined;
    },
    async remove() {
      return false;
    },
  });
  await assert.rejects(
    service.create('owner', {}),
    (e: unknown) => e instanceof ApplicationError && e.status === 422 && !!e.fields?.websiteUrl,
  );
  assert.equal(writes, 0);
  await assert.rejects(
    service.create('owner', { name: 'Demo', websiteUrl: 'example.com' }),
    (e: unknown) => e instanceof ApplicationError && e.status === 409,
  );
});
test('project HTTP requests reject cross-origin, invalid JSON, unsupported types and oversized streams', async () => {
  function request(body: string, headers: Record<string, string> = {}) {
    return new Request('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: { origin: 'http://localhost:3000', 'content-type': 'application/json', ...headers },
      body,
    });
  }
  assert.deepEqual(await projectBody(request('{"name":"Demo"}')), { name: 'Demo' });
  for (const [req, status] of [
    [request('{}', { origin: 'https://foreign.example' }), 403],
    [request('{}', { 'content-type': 'text/plain' }), 415],
    [request('{'), 400],
    [request('x'.repeat(8193)), 413],
  ] as const) {
    await assert.rejects(
      projectBody(req),
      (e: unknown) => e instanceof ApplicationError && e.status === status,
    );
  }
  const response = errorResponse(new Error('secret connection information'));
  assert.equal(response.status, 503);
  assert.ok(!(await response.text()).includes('secret connection'));
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('project management checks owner, current snapshot, validation and exact deletion confirmation', async () => {
  const project = {
    id: '11111111-1111-4111-8111-111111111111',
    ownerId: 'a',
    name: 'Demo',
    origin: 'https://example.com',
    createdAt: new Date(),
  };
  let current: typeof project | undefined = project,
    collision = false,
    race = false;
  const service = projectService({
    async list() {
      return [];
    },
    async findSetup() {
      return undefined;
    },
    async find(owner) {
      return owner === 'a' ? current : undefined;
    },
    async create() {
      return undefined;
    },
    async update(owner, id, expected, next) {
      assert.equal(owner, 'a');
      assert.equal(id, project.id);
      assert.deepEqual(expected, { name: current!.name, origin: current!.origin });
      if (collision) throw { cause: { code: '23505', constraint: 'projects_owner_origin_unique' } };
      if (race) return undefined;
      current = { ...current!, ...next };
      return current;
    },
    async remove() {
      if (race) return false;
      current = undefined;
      return true;
    },
  });
  const expected = { name: project.name, origin: project.origin };
  const input = { name: 'Renamed', websiteUrl: 'localhost:4184/path', expected };
  for (const method of [
    () => service.update(null, project.id, input),
    () => service.remove(null, project.id, { expected, confirmation: 'Demo' }),
  ])
    await assert.rejects(method, (e: unknown) => e instanceof ApplicationError && e.status === 401);
  for (const method of [
    () => service.update('b', project.id, input),
    () => service.remove('b', project.id, { expected, confirmation: 'Demo' }),
  ])
    await assert.rejects(method, (e: unknown) => e instanceof ApplicationError && e.status === 404);
  await assert.rejects(
    service.update('a', project.id, { ...input, expected: { ...expected, name: 'Old' } }),
    (e: unknown) => e instanceof ApplicationError && e.status === 409,
  );
  await assert.rejects(
    service.update('a', project.id, { ...input, websiteUrl: 'javascript:bad' }),
    (e: unknown) => e instanceof ApplicationError && e.status === 422,
  );
  collision = true;
  await assert.rejects(
    service.update('a', project.id, input),
    (e: unknown) => e instanceof ApplicationError && e.status === 409 && !!e.fields?.websiteUrl,
  );
  collision = false;
  race = true;
  await assert.rejects(
    service.update('a', project.id, input),
    (e: unknown) => e instanceof ApplicationError && e.status === 409,
  );
  race = false;
  const updated = await service.update('a', project.id, input);
  assert.equal(updated.id, project.id);
  assert.equal(updated.origin, 'http://localhost:4184');
  const deletion = {
    expected: { name: updated.name, origin: updated.origin },
    confirmation: 'Renamed',
  };
  await assert.rejects(
    service.remove('a', project.id, { ...deletion, confirmation: 'renamed' }),
    (e: unknown) => e instanceof ApplicationError && e.status === 422,
  );
  race = true;
  await assert.rejects(
    service.remove('a', project.id, deletion),
    (e: unknown) => e instanceof ApplicationError && e.status === 409,
  );
  race = false;
  await service.remove('a', project.id, deletion);
  await assert.rejects(
    service.remove('a', project.id, deletion),
    (e: unknown) => e instanceof ApplicationError && e.status === 404,
  );
});

test('setup reads enforce identity and ownership before exposing report existence', async () => {
  const project = {
    id: '11111111-1111-4111-8111-111111111111',
    ownerId: 'owner',
    name: 'Demo',
    origin: 'https://example.com',
    createdAt: new Date(0),
  };
  let calls = 0;
  const service = projectService({
    async list() {
      return [];
    },
    async find() {
      return undefined;
    },
    async findSetup(owner, id) {
      calls++;
      return owner === project.ownerId && id === project.id
        ? { ...project, hasReports: true }
        : undefined;
    },
    async create() {
      return undefined;
    },
    async update() {
      return undefined;
    },
    async remove() {
      return false;
    },
  });
  await assert.rejects(
    async () => service.getSetup(null, project.id),
    (error: unknown) => error instanceof ApplicationError && error.status === 401,
  );
  await assert.rejects(
    service.getSetup('owner', 'invalid'),
    (error: unknown) => error instanceof ApplicationError && error.status === 404,
  );
  assert.equal(calls, 0);
  await assert.rejects(
    service.getSetup('another-owner', project.id),
    (error: unknown) => error instanceof ApplicationError && error.status === 404,
  );
  assert.equal((await service.getSetup('owner', project.id)).hasReports, true);
});
