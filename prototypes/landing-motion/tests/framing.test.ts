import assert from 'node:assert/strict';
import test from 'node:test';
import { framing } from '../src/framing.ts';

test('desktop poster and renderer share projection and intrinsic raster at every viewport', () => {
  for (const [width, height] of [[1440, 900], [1280, 720], [1920, 1080], [800, 1000]]) {
    const frame = framing(width, height);
    assert.equal(frame.aspect, 1.6);
    assert.equal(frame.width, 1440);
    assert.equal(frame.height, 900);
    assert.ok(Math.abs(frame.width / frame.height - frame.aspect) < .002);
  }
});
test('mobile uses its own shared poster/camera framing', () => {
  const frame = framing(390, 844);
  assert.equal(frame.mobile, true);
  assert.equal(frame.width, 390);
  assert.equal(frame.height, 844);
  assert.equal(framing(701, 844).mobile, false);
  assert.equal(framing(690, 844, 705).mobile, false, 'Scrollbar width must not change the CSS breakpoint');
});
