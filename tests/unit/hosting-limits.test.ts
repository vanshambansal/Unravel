import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  submissionByteLimit,
  assertHostedResponseFits,
} from '../../apps/web/src/server/hosting-limits.ts';

test('hosted limits leave headroom without changing local recording compatibility', () => {
  assert.equal(submissionByteLimit({ VERCEL: '1' }), 4_000_000);
  assert.equal(submissionByteLimit({}), 5_000_000);
  assert.doesNotThrow(() => assertHostedResponseFits('a'.repeat(4_000_000), { VERCEL: '1' }));
  assert.throws(
    () => assertHostedResponseFits('a'.repeat(4_000_001), { VERCEL: '1' }),
    /remains stored/,
  );
  assert.throws(
    () => assertHostedResponseFits('€'.repeat(1_400_000), { VERCEL: '1' }),
    /size limit/,
  );
  assert.doesNotThrow(() => assertHostedResponseFits('a'.repeat(5_000_000), {}));
});
