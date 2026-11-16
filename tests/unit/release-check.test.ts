import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('release command fails while ingestion is disabled, even with complete configuration', () => {
  // Synthetic prefixes exercise configuration declarations only: no provider calls.
  const environment = {
    ...process.env,
    APP_ORIGIN: 'https://app.example',
    REPLAY_ORIGIN: 'https://replay.other.example',
    EDGE_INGESTION_PROTECTED: 'true',
    PUBLIC_PRIVACY_REVIEWED: 'true',
    REPORT_RETENTION_POLICY: 'owner-managed',
    CLERK_WEBHOOK_SIGNING_SECRET: 'whsec_synthetic_unit_test',
    CLERK_SECRET_KEY: 'sk_live_synthetic_unit_test',
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_live_synthetic_unit_test',
  };
  for (const enabled of ['false', 'true']) {
    const result = spawnSync(
      process.execPath,
      ['--experimental-strip-types', 'scripts/release-check.mjs'],
      {
        encoding: 'utf8',
        env: { ...environment, PUBLIC_INGESTION_ENABLED: enabled },
      },
    );
    assert.ifError(result.error);
    const output = JSON.parse(result.stdout);
    assert.equal(output.configurationReady, true);
    assert.equal(output.ready, enabled === 'true');
    assert.equal(result.status, enabled === 'true' ? 0 : 1);
    assert.ok(!result.stdout.includes('synthetic_unit_test'));
  }
});
