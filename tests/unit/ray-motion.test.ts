import assert from 'node:assert/strict';
import test from 'node:test';
import { RayMotion } from '../../apps/web/src/features/landing/motion/ray-motion.ts';

test('pointer damping is bounded, refresh-rate independent and freezes at zero delta', () => {
  const fast = new RayMotion(),
    slow = new RayMotion();
  fast.point(100, -100, true);
  slow.point(100, -100, true);
  fast.update(1 / 120);
  assert.ok(fast.x > 0 && fast.x < 0.1); // No immediate pointer jump.
  for (let i = 1; i < 120; i++) fast.update(1 / 120);
  for (let i = 0; i < 30; i++) slow.update(1 / 30);
  assert.ok(Math.abs(fast.x - slow.x) < 1e-12);
  assert.ok(fast.x < 0.5 && fast.y > -0.5);
  const frozen = [fast.x, fast.y, fast.focus];
  fast.point(-1, 1, true);
  fast.update(0);
  assert.deepEqual([fast.x, fast.y, fast.focus], frozen);
});

test('pointer exit settles back to neutral without overshoot', () => {
  const motion = new RayMotion();
  motion.point(1, 1, true);
  for (let i = 0; i < 60; i++) motion.update(1 / 60);
  motion.point(0, 0, false);
  let previous = motion.x;
  for (let i = 0; i < 120; i++) {
    motion.update(1 / 60);
    assert.ok(motion.x <= previous && motion.x >= 0);
    previous = motion.x;
  }
  assert.ok(motion.x < 0.0001 && motion.focus < 0.0001);
});
