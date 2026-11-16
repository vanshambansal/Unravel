import test from 'node:test';
import assert from 'node:assert/strict';
import { createReplaySanitizer } from '../../packages/sdk/src/replay.ts';
import type { Privacy } from '../../packages/sdk/src/privacy.ts';
import { validateSubmission } from '../../apps/web/src/server/reports/validation.ts';
import { syntheticSubmission } from '../fixtures/submission.ts';

test('blocked native controls become inert placeholders with server-valid rounded geometry', () => {
  const privacy = {
    blocked: () => false,
    elementFor: () => null,
    tag: (tag: string) => tag,
    attributes: () => ({}),
    text: () => '[redacted]',
  } as unknown as Privacy;
  const sanitize = createReplaySanitizer(privacy, () => null),
    submission = syntheticSubmission();
  submission.recording.presentation = 1;
  const event = structuredClone(submission.recording.replay[1]);
  const node = (
    id: number,
    tagName: string,
    childNodes: unknown[] = [],
    attributes: Record<string, string> = {},
  ) => ({ id, type: 2, tagName, attributes, childNodes });
  const data = {
    node: {
      id: 1,
      type: 0,
      childNodes: [
        node(2, 'html', [
          node(3, 'body', [
            node(4, 'details', [], { rr_width: '123.123456789px', rr_height: '24.333333333px' }),
            node(5, 'details', [], { rr_width: '0px', rr_height: '0px' }),
          ]),
        ]),
      ],
    },
    initialOffset: { top: 0, left: 0 },
  };
  const safe = sanitize({ ...event, data })!;
  const serialized = JSON.stringify(safe);
  assert.ok(!serialized.includes('details'));
  assert.ok(serialized.includes('123.12px'));
  assert.ok(serialized.includes('display:none'));
  submission.recording.replay[1] = safe;
  assert.doesNotThrow(() => validateSubmission(submission));
});
