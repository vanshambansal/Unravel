import test from 'node:test';
import assert from 'node:assert/strict';
import { clerkKeysHaveValidFormat } from '../../apps/web/src/features/authentication/configuration.ts';

test('Clerk format preflight rejects masked, Unicode, whitespace and mixed-environment keys', () => {
  // Deliberately synthetic strings test format only; they are not real credentials.
  assert.equal(clerkKeysHaveValidFormat('pk_test_example', 'sk_test_example'), true);
  for (const secret of [undefined, '', 'sk_test_abc…', 'sk_test_abc...', 'sk_test_example ', 'sk_test_\nexample', 'sk_live_example']) {
    assert.equal(clerkKeysHaveValidFormat('pk_test_example', secret), false);
  }
  for (const publishable of [undefined, '', 'pk_test_abc…', 'pk_test_abc...', ' pk_test_example', 'pk_live_example']) {
    assert.equal(clerkKeysHaveValidFormat(publishable, 'sk_test_example'), false);
  }
});
