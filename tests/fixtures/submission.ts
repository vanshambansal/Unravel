import { randomUUID } from 'node:crypto';
import type { ReportSubmission } from '../../packages/contracts/dist/index.js';
export function syntheticSubmission(projectId: string = randomUUID(), origin = 'http://127.0.0.1:4185'): ReportSubmission {
  const startedAt = Date.now();
  return { version: 1, title: 'Synthetic question fails', description: 'HTTP failure', recording: {
    version: 1, id: randomUUID(), projectId, startedAt, durationMs: 1000, initialUrl: { origin, path: '/' }, stopReason: 'manual', truncated: false, hasFullSnapshot: true, filteredReplayEvents: 0,
    events: [{ kind: 'action', at: 500, action: 'fill', target: { kind: 'testId', value: 'question' }, value: 'Synthetic question', redacted: false }],
    replay: [
      { type: 4, timestamp: startedAt, data: { href: origin + '/', width: 1280, height: 720 } },
      { type: 2, timestamp: startedAt, data: { node: { type: 0, id: 1, childNodes: [{ type: 2, id: 2, tagName: 'html', attributes: {}, childNodes: [{ type: 2, id: 3, tagName: 'body', attributes: {}, childNodes: [{ type: 3, id: 4, textContent: 'Synthetic text' }] }] }] }, initialOffset: { top: 0, left: 0 } } },
    ],
  } };
}
