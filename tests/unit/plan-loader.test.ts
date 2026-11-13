import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlanLoader } from '../../apps/web/src/features/reports/plan-loader.ts';

test('anticipated plan read is shared; reload replaces it and disposal cancels it', async t => {
  const requests: { signal: AbortSignal; resolve(response: Response): void }[] = [];
  t.mock.method(globalThis, 'fetch', (_url: string, options: RequestInit) => new Promise<Response>(resolve => requests.push({ signal: options.signal as AbortSignal, resolve })));
  const loader = createPlanLoader('/api/test/plan');
  loader.prepare();
  const first = loader.read();
  assert.equal(requests.length, 1);
  requests[0].resolve(Response.json({ plan: {}, revision: 1 }));
  assert.equal((await first).revision, 1);
  const fresh = loader.read(true);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].signal.aborted, true);
  requests[1].resolve(Response.json({ plan: {}, revision: 2 }));
  assert.equal((await fresh).revision, 2);
  loader.clear();
  assert.equal(requests[1].signal.aborted, true);
});

test('failed or expired preparation never poisons a later authorized read', async t => {
  let calls = 0, now = 0;
  t.mock.method(performance, 'now', () => now);
  t.mock.method(globalThis, 'fetch', async () => { calls++; return calls === 1 ? new Response('', { status: 503 }) : Response.json({ plan: {}, revision: calls }); });
  const loader = createPlanLoader('/api/test/plan');
  await assert.rejects(loader.read());
  assert.equal((await loader.read()).revision, 2);
  now = 10_001;
  assert.equal((await loader.read()).revision, 3);
  loader.clear();
});
