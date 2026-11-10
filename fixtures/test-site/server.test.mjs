import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createTestServer } from './server.mjs';

let server;
let origin;
before(async () => {
  server = createTestServer();
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
