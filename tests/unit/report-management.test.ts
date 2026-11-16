import test from 'node:test';
import assert from 'node:assert/strict';
import {
  reportChanges,
  reportQuery,
  reportSearch,
} from '../../apps/web/src/features/reports/management.ts';
import { timelineEntries } from '../../apps/web/src/features/reports/timeline.ts';
import { ingestionAllowed, releaseIssues } from '../../apps/web/src/server/release.ts';
import { boundedJson } from '../../apps/web/src/server/http.ts';
import type { SemanticEvent } from '../../packages/contracts/src/index.ts';
test('report query and edits reject malformed data and preserve escaped navigation', () => {
  for (const value of [
    { page: 0 },
    { page: 1.5 },
    { page: 'bad' },
    { status: 'closed' },
    { q: 'x'.repeat(201) },
  ])
    assert.throws(() => reportQuery(value));
  const query = reportQuery({ q: '%_ & tags', status: 'resolved', page: '2' });
  assert.equal(new URLSearchParams(reportSearch(query).slice(1)).get('q'), query.q);
  assert.equal(
    reportChanges({ title: '  Updated  ', description: 'Notes', status: 'open', revision: 1 })
      .title,
    'Updated',
  );
  for (const value of [
    { title: ' ', description: '', status: 'open', revision: 1 },
    { title: 'Title', description: '', status: 'closed', revision: 1 },
    { title: 'Title', description: '', status: 'open', revision: 0 },
    { title: 'Title', description: '', status: 'open', revision: 1, recording: {} },
  ])
    assert.throws(() => reportChanges(value));
});
test('typing display groups adjacent known targets without mutating raw evidence or crossing diagnostics', () => {
  const fill = (at: number, target = 'field'): SemanticEvent => ({
    kind: 'action',
    action: 'fill',
    at,
    target: { kind: 'testId', value: target },
    value: null,
    redacted: true,
  });
  const events = [
    fill(1),
    fill(20),
    fill(40, 'other'),
    {
      kind: 'navigation',
      source: 'push',
      at: 50,
      url: { origin: 'http://localhost', path: null },
    } as SemanticEvent,
    fill(60, 'other'),
    fill(3000, 'other'),
  ];
  const before = JSON.stringify(events),
    grouped = timelineEntries(events);
  assert.equal(grouped.length, 5);
  assert.deepEqual(grouped[0].indices, [0, 1]);
  assert.equal(grouped[0].event.at, 20);
  assert.equal(timelineEntries(events, true).length, 6);
  assert.equal(JSON.stringify(events), before);
});
test('public ingestion stays closed until explicit production gates; local production is opt-in', () => {
  assert.equal(ingestionAllowed('http://localhost:3000/api', { NODE_ENV: 'production' }), false);
  assert.equal(
    ingestionAllowed('http://localhost:3000/api', {
      NODE_ENV: 'production',
      ALLOW_LOOPBACK_INGESTION: 'true',
    }),
    true,
  );
  assert.equal(ingestionAllowed('https://app.example/api', {}), false);
  const env = {
    CLERK_WEBHOOK_SIGNING_SECRET: 'whsec_synthetic_unit_test',
    PUBLIC_INGESTION_ENABLED: 'true',
    APP_ORIGIN: 'https://app.example',
    REPLAY_ORIGIN: 'https://replay.other.example',
    EDGE_INGESTION_PROTECTED: 'true',
    PUBLIC_PRIVACY_REVIEWED: 'true',
    REPORT_RETENTION_POLICY: 'owner-managed',
    CLERK_SECRET_KEY: 'sk_live_placeholder',
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_live_placeholder',
  };
  assert.deepEqual(releaseIssues(env), []);
  assert.ok(
    releaseIssues({ ...env, CLERK_WEBHOOK_SIGNING_SECRET: undefined }).some((issue) =>
      issue.includes('webhook'),
    ),
  );
  assert.equal(ingestionAllowed('https://app.example/api', env), true);
  assert.equal(ingestionAllowed('https://evil.example/api', env), false);
  assert.ok(releaseIssues({ ...env, REPLAY_ORIGIN: env.APP_ORIGIN }).length);
});
test('slow body reads time out and do not treat a partial body as a successful submission', async () => {
  const request = new Request('http://localhost/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{'));
      },
    }),
    duplex: 'half',
  } as RequestInit);
  await assert.rejects(boundedJson(request, 100, 20), { status: 408 });
});
