import test from 'node:test';
import assert from 'node:assert/strict';
import { ResolutionGuard } from '../../apps/web/src/features/landing/motion/quality.ts';
import { advanceScroll } from '../../apps/web/src/features/landing/motion/scroll-motion.ts';

test('scroll following is bounded, reversible and independent of refresh rate', () => {
  let at60 = 0,
    at30 = 0;
  for (let i = 0; i < 12; i++) at60 = advanceScroll(at60, 1, 1 / 60);
  for (let i = 0; i < 6; i++) at30 = advanceScroll(at30, 1, 1 / 30);
  assert.ok(Math.abs(at60 - at30) < 1e-10);
  assert.ok(at60 > 0.95 && at60 < 1);
  assert.ok(advanceScroll(at60, 0, 1 / 60) < at60);
  assert.equal(advanceScroll(0.5, 1, 0), 0.5);
  assert.equal(advanceScroll(0.99999, 1, 1 / 60), 1);
  let responsive = 0;
  for (let i = 0; i < 4; i++) responsive = advanceScroll(responsive, 1, 1 / 60);
  assert.ok(responsive > 0.95, 'camera closes 95% of a fixed gap within four 60Hz frames');
});

test('resolution adaptation preserves fast rendering and rejects isolated hitches', () => {
  const fast = new ResolutionGuard(),
    slow = new ResolutionGuard();
  for (let i = 0; i < 360; i++) assert.equal(fast.push(i === 45 ? 500 : 16.7), false);
  for (let i = 0; i < 149; i++) assert.equal(slow.push(25), false);
  assert.equal(slow.push(25), true);
  slow.reset();
  assert.equal(slow.push(Number.NaN), false);
  for (let i = 0; i < 149; i++) assert.equal(slow.push(25), false);
});
