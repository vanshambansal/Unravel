import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { validateSubmission } from '../../apps/web/src/server/reports/validation.ts';
import { boundedJson } from '../../apps/web/src/server/http.ts';
import { ApplicationError } from '../../apps/web/src/server/errors.ts';
import { reportService } from '../../apps/web/src/server/reports/service.ts';
import type { ReportRepository } from '../../apps/web/src/server/reports/repository.ts';
import { syntheticSubmission } from '../fixtures/submission.ts';

test('replay boundary accepts a bounded inert snapshot and strips resource URLs', () => {
  const input = syntheticSubmission();
  input.recording.replay.push({
    type: 3,
    timestamp: input.recording.startedAt + 500,
    data: {
      source: 0,
      texts: [],
      attributes: [
        { id: 2, attributes: { href: 'https://external.example/style.css', rel: 'stylesheet' } },
      ],
      removes: [],
      adds: [],
    },
  });
  const safe = validateSubmission(input);
  assert.ok(safe.recording.hasFullSnapshot);
  assert.ok(!JSON.stringify(safe).includes('external.example'));
});
test('replay boundary rejects active attributes, malformed trees and unsupported sources', () => {
  const cases: Record<string, string | { secret: string }>[] = [
    { onclick: 'attack()' },
    { src: 'https://external.example' },
    { style: 'background:url(https://external.example)' },
    { value: { secret: 'private' } },
  ];
  for (const attrs of cases) {
    const input = syntheticSubmission();
    input.recording.replay.push({
      type: 3,
      timestamp: input.recording.startedAt + 100,
      data: {
        source: 0,
        texts: [],
        attributes: [{ id: 2, attributes: attrs }],
        removes: [],
        adds: [],
      },
    });
    assert.throws(() => validateSubmission(input), ApplicationError);
  }
  const noSnapshot = syntheticSubmission();
  noSnapshot.recording.replay = [];
  assert.throws(() => validateSubmission(noSnapshot));
  const plugin = syntheticSubmission();
  plugin.recording.replay.push({
    type: 3,
    timestamp: plugin.recording.startedAt,
    data: { source: 9, commands: [] },
  });
  assert.throws(() => validateSubmission(plugin));
  let deep: Record<string, unknown> = {};
  const root = deep;
  for (let i = 0; i < 300; i++) {
    deep.next = {};
    deep = deep.next as Record<string, unknown>;
  }
  assert.throws(() => validateSubmission(root), ApplicationError);
});
test('stream size is enforced without trusting Content-Length', async () => {
  const request = new Request('http://localhost/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': '1' },
    body: JSON.stringify({ large: 'x'.repeat(100) }),
  });
  await assert.rejects(
    boundedJson(request, 20),
    (error: unknown) => error instanceof ApplicationError && error.status === 413,
  );
});
test('report ownership and registered-origin checks run before persistence', async () => {
  let writes = 0;
  const service = reportService({
    publicProject: async () => undefined,
    insert: async () => {
      writes++;
      throw new Error();
    },
  } as unknown as ReportRepository);
  await assert.rejects(
    service.submit(randomUUID(), 'https://foreign.example', syntheticSubmission()),
  );
  assert.throws(() => service.list(null, randomUUID()), ApplicationError);
  await assert.rejects(service.remove(null, randomUUID(), randomUUID()), ApplicationError);
  assert.equal(writes, 0);
});
