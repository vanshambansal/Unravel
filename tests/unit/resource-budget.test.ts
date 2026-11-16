import assert from 'node:assert/strict';
import test from 'node:test';
import { conserveSceneResources } from '../../apps/web/src/features/landing/motion/resource-budget.ts';

test('resource conservation honors explicit network preferences and requires combined low-capacity hints', () => {
  for (const hints of [
    { saveData: true },
    { effectiveType: '2g' },
    { effectiveType: 'slow-2g' },
    { deviceMemory: 2, hardwareConcurrency: 2 },
  ])
    assert.equal(conserveSceneResources(hints), true);
  for (const hints of [
    {},
    { effectiveType: '4g' },
    { deviceMemory: 2, hardwareConcurrency: 8 },
    { deviceMemory: 8, hardwareConcurrency: 2 },
    { deviceMemory: 0, hardwareConcurrency: 0 },
    { deviceMemory: NaN, hardwareConcurrency: 2 },
  ])
    assert.equal(conserveSceneResources(hints), false);
});
