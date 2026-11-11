import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createTestServer } from './server.mjs';
import { fixtureConfiguration } from './configuration.mjs';

let server;
let origin;
before(async () => {
  server = createTestServer(fixtureConfiguration({}));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

test('serves the fixture and its browser assets', async () => {
  for (const path of ['/', '/app.js', '/styles.css']) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 200);
    assert.ok((await response.text()).length > 0);
  }
});
test('valid questions produce the intentional real HTTP 500', async () => {
  const response = await fetch(origin + '/api/questions', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'A synthetic test question', category: 'technical' }),
  });
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { error: 'Question submission is intentionally unavailable.' });
});
test('rejects malformed and invalid submissions', async () => {
  for (const body of ['{', '{}', JSON.stringify({ question: ' ', category: 'general' })]) {
    const response = await fetch(origin + '/api/questions', { method: 'POST', body });
    assert.equal(response.status, 400);
  }
});
test('does not expose repository files', async () => {
  assert.equal((await fetch(origin + '/README.md')).status, 404);
  assert.equal((await fetch(origin + '/.env.local')).status, 404);
});

test('public fixture configuration is allowlisted and never substitutes a fake project', async () => {
  const absent = fixtureConfiguration({ CLERK_SECRET_KEY: 'PRIVATE_CONFIG_SENTINEL' });
  assert.equal(absent.projectId, null);
  assert.equal(absent.testOverrides, false);
  assert.ok(absent.error.includes('.env.local'));
  assert.ok(!JSON.stringify(absent).includes('PRIVATE_CONFIG_SENTINEL'));
  const configured = fixtureConfiguration({ UNRAVEL_PROJECT_ID: '12345678-1234-4234-8234-123456789012', UNRAVEL_APPLICATION_ORIGIN: 'http://localhost:3000', DATABASE_URL: 'PRIVATE_DATABASE_SENTINEL' });
  assert.equal(configured.projectId, '12345678-1234-4234-8234-123456789012');
  assert.equal(configured.error, null);
  assert.ok(!JSON.stringify(configured).includes('PRIVATE_DATABASE_SENTINEL'));
  for(const value of ['https://user:password@example.com','javascript:alert(1)','https://example.com/path']) assert.equal(fixtureConfiguration({ UNRAVEL_PROJECT_ID: configured.projectId, UNRAVEL_APPLICATION_ORIGIN: value }).projectId, null);
});

test('configuration endpoint is public settings only, no-store, with no visitor setup form', async () => {
  const response = await fetch(origin + '/unravel-config.js');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.ok((await response.text()).includes('"projectId":null'));
  const html = await (await fetch(origin)).text();
  assert.ok(html.includes('/unravel-config.js'));
  assert.ok(!html.includes('id="widget-configuration"'));
});
