import test from 'node:test';
import assert from 'node:assert/strict';
import {
  presentationValueAllowed,
  sanitizePresentation,
} from '../../packages/contracts/src/index.ts';

test('presentation accepts finite browser matrices but no CSS functions, resources or malformed components', () => {
  for (const value of [
    'none',
    'matrix(1, 0, 0, 1, 12, -0.5)',
    'matrix(1e-5,0,0,1,0,0)',
    'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)',
  ])
    assert.equal(presentationValueAllowed('transform', value), true, value);
  for (const value of [
    'matrix(,,,,,)',
    'matrix(1,0,0,1,0)',
    'matrix(1,0,0,1,Infinity,0)',
    'matrix(1,0,0,1,1e20,0)',
    'translateX(20px)',
    'url(https://example.com)',
    'var(--private)',
    'matrix(1,0,0,1,0,0);color:red',
  ])
    assert.equal(presentationValueAllowed('transform', value), false, value);
  assert.equal(presentationValueAllowed('transform-origin', '50% 50% 0px'), true);
  assert.equal(sanitizePresentation('transform:url(https://example.com)'), null);
});
