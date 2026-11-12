import assert from 'node:assert/strict';
import test from 'node:test';
import { choreography, journeyTiming, journeyViewports } from '../../apps/web/src/features/landing/motion/choreography.ts';
import { PerformanceGuard } from '../../apps/web/src/features/landing/motion/quality.ts';

test('camera moves through the threshold before heading and controls appear', () => {
  assert.ok(choreography(0).camera.z > 0);
  assert.ok(choreography(.65).camera.z < 0);
  assert.equal(choreography(.7).title, 0);
  assert.equal(choreography(.85).actions, 0);
  assert.equal(choreography(1).actions, 1);
});
test('travel is bounded, monotonic, stationary at the hero and reversible', () => {
  let z = Infinity;
  for (let i = 0; i <= 100; i++) {
    const frame = choreography(i / 100);
    assert.ok(frame.camera.z <= z);
    z = frame.camera.z;
    assert.equal(frame.camera.y, 3.7);
  }
  assert.deepEqual(choreography(.8).camera, choreography(1).camera);
  assert.deepEqual(choreography(-1), choreography(0));
  assert.deepEqual(choreography(2), choreography(1));
  const before = choreography(.4); choreography(1);
  assert.deepEqual(choreography(.4), before);
});
test('glow softens after the threshold instead of remaining at its peak', () => {
  assert.equal(choreography(0).glow, 0);
  assert.ok(choreography(.52).glow > .9);
  assert.ok(choreography(1).glow < .001);
});
test('complete hero has a native reading interval before sticky release', () => {
  assert.equal(choreography(journeyTiming.fullReveal).actions, 1);
  assert.equal(choreography(journeyTiming.fullReveal).description, 1);
  assert.equal(choreography(journeyTiming.fullReveal).title, 1);
  const revealScroll = journeyTiming.cameraViewports * journeyTiming.fullReveal;
  assert.ok(Math.abs((journeyViewports - 1) - revealScroll - .75) < 1e-10);
});
test('performance fallback requires sustained poor frame times and can reset', () => {
  const guard = new PerformanceGuard();
  for (let i = 0; i < 360; i++) assert.equal(guard.push(16.7), false);
  for (let i = 0; i < 110; i++) assert.equal(guard.push(55), false);
  assert.equal(guard.push(55), true);
  guard.reset();
  assert.equal(guard.push(1000), false);
  assert.equal(guard.push(55), false);
  guard.reset();
  for (let i = 0; i < 35; i++) assert.equal(guard.push(1000), false);
  assert.equal(guard.push(1000), true, 'Extremely slow sustained rendering must also fall back');
});
