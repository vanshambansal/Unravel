import test from 'node:test';
import assert from 'node:assert/strict';
import { ingestionAllowed, releaseIssues } from '../../apps/web/src/server/release.ts';

const preview = {
  PUBLIC_INGESTION_ENABLED: 'true',
  APP_ORIGIN: 'https://app.example',
  REPLAY_ORIGIN: 'https://player.other.example',
  NODE_ENV: 'production',
};
test('external preview stays explicit and origin-bound without pretending production checklist passed', () => {
  assert.equal(ingestionAllowed('https://app.example/api/ingest/id', preview), true);
  assert.ok(releaseIssues(preview).length > 0);
  for (const change of [
    { PUBLIC_INGESTION_ENABLED: 'false' },
    { APP_ORIGIN: 'http://app.example' },
    { REPLAY_ORIGIN: 'https://app.example' },
    { REPLAY_ORIGIN: '' },
  ])
    assert.equal(
      ingestionAllowed('https://app.example/api/ingest/id', { ...preview, ...change }),
      false,
    );
  assert.equal(ingestionAllowed('https://wrong.example/api/ingest/id', preview), false);
  assert.equal(ingestionAllowed('https://app.example.evil.test/api/ingest/id', preview), false);
});
