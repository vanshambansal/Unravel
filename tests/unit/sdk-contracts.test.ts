import test from 'node:test';
import assert from 'node:assert/strict';
import { RecordingSchema, SemanticEventSchema } from '../../packages/contracts/dist/index.js';

test('SDK imports in Node without window or document', async () => {
  assert.equal(typeof globalThis.window, 'undefined');
  const { initialize } = await import('../../packages/sdk/dist/index.js');
  assert.equal(typeof initialize, 'function');
  assert.throws(() => initialize({ projectId: 'not-browser' }), /client lifecycle/);
});
test('contracts reject headers/bodies and arbitrary schema extensions', () => {
  const event = {
    kind: 'network',
    at: 10,
    requestId: '12345678-1234-4234-8234-123456789012',
    transport: 'fetch',
    method: 'POST',
    url: { origin: 'https://example.com', path: null },
    status: 500,
    startedAt: 1,
    durationMs: 9,
    outcome: 'http-error',
  };
  assert.equal(SemanticEventSchema.safeParse(event).success, true);
  assert.equal(SemanticEventSchema.safeParse({ ...event, body: 'private' }).success, false);
  assert.equal(SemanticEventSchema.safeParse({ ...event, headers: {} }).success, false);
  assert.equal(SemanticEventSchema.safeParse({ ...event, status: 900 }).success, false);
  assert.equal(SemanticEventSchema.safeParse({ ...event, status: 200.5 }).success, false);
  assert.equal(
    SemanticEventSchema.safeParse({
      ...event,
      url: { origin: 'https://example.com/private', path: null },
    }).success,
    false,
  );
  assert.equal(
    SemanticEventSchema.safeParse({
      ...event,
      url: { origin: 'https://example.com', path: '/path?secret=hidden' },
    }).success,
    false,
  );
  assert.equal(RecordingSchema.safeParse({ version: 2 }).success, false);
});
