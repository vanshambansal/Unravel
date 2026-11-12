import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import type { Recorder, RecorderOptions } from '../../packages/sdk/src/types';
import type { Recording } from '../../packages/contracts/src/index';

declare global {
  interface Window {
    fixtureRecorder: Recorder;
    UnravelSDK: { initialize(options: RecorderOptions): Recorder };
    savedFetch: typeof fetch;
    savedOpen: typeof XMLHttpRequest.prototype.open;
    savedPush: typeof history.pushState;
    extraRecorder: Recorder;
  }
}
const projectId = '12345678-1234-4234-8234-123456789012';
test('explicit submission retries identical content after response loss and returns one receipt', async ({ page }) => {
  await page.goto('/?debug=1');
  const bodies: string[] = []; let calls = 0;
  const receipt = { reportId: '22345678-1234-4234-8234-123456789012', duplicate: true };
  await page.route('**/api/ingest/*', async route => { calls++; bodies.push(route.request().postData()!); if (calls === 1) await route.abort('failed'); else await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(receipt) }); });
  await page.evaluate(async projectId => {
    window.fixtureRecorder.destroy(); window.fixtureRecorder = window.UnravelSDK.initialize({ projectId, submissionUrl: `${location.origin}/api/ingest/${projectId}` });
    await window.fixtureRecorder.start(); window.fixtureRecorder.stop();
    try { await window.fixtureRecorder.submit({ title: 'Synthetic retry' }); } catch { /* Simulated response loss. */ }
  }, projectId);
  expect(await page.evaluate(() => window.fixtureRecorder.getSubmissionStatus().state)).toBe('error');
  expect(await page.evaluate(() => window.fixtureRecorder.submit({ title: 'Synthetic retry' }))).toEqual(receipt);
  expect(await page.evaluate(() => window.fixtureRecorder.submit({ title: 'Synthetic retry' }))).toEqual(receipt);
  expect(calls).toBe(2); expect(bodies[0]).toBe(bodies[1]);
  await expect(page.evaluate(() => window.fixtureRecorder.submit({ title: 'Changed details' }))).rejects.toThrow('same report details');
});

test('a stalled upload times out without automatic retry and retains its frozen report',async({page})=>{
  await page.clock.install();let attempts=0;const bodies:string[]=[];
  await page.route('**/api/ingest/**',route=>{attempts++;bodies.push(route.request().postData()!);if(attempts===1)return;return route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({reportId:'22345678-1234-4234-8234-123456789012',duplicate:false})});});
  await page.evaluate(async projectId=>{window.fixtureRecorder.destroy();window.fixtureRecorder=window.UnravelSDK.initialize({projectId,submissionUrl:`${location.origin}/api/ingest/${projectId}`});await window.fixtureRecorder.start();window.fixtureRecorder.stop();void window.fixtureRecorder.submit({title:'Stalled upload',description:''}).catch(()=>{});},projectId);
  await expect.poll(()=>attempts).toBe(1);await page.clock.fastForward(30001);
  await expect.poll(()=>page.evaluate(()=>window.fixtureRecorder.getSubmissionStatus().state)).toBe('error');
  expect(await page.evaluate(()=>window.fixtureRecorder.getSubmissionStatus().error)).toContain('timed out');expect(attempts).toBe(1);
  await page.evaluate(()=>window.fixtureRecorder.submit({title:'Stalled upload',description:''}));expect(attempts).toBe(2);expect(bodies[1]).toBe(bodies[0]);
});

test('submission is never automatic and destroy cancels pending upload', async ({ page }) => {
  await page.goto('/?debug=1'); let contacted = false;
  await page.route('**/api/ingest/*', async route => { contacted = true; await new Promise(resolve => setTimeout(resolve, 400)); await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reportId: '22345678-1234-4234-8234-123456789012', duplicate: false }) }).catch(() => {}); });
  await page.evaluate(async projectId => {
    window.fixtureRecorder.destroy(); window.fixtureRecorder = window.UnravelSDK.initialize({ projectId, submissionUrl: `${location.origin}/api/ingest/${projectId}` });
    await window.fixtureRecorder.start(); window.fixtureRecorder.stop();
  }, projectId);
  expect(contacted).toBe(false);
  await page.evaluate(() => { void window.fixtureRecorder.submit({ title: 'Synthetic cancel' }).catch(() => {}); });
  await expect.poll(() => contacted).toBe(true);
  await expect(page.evaluate(() => window.fixtureRecorder.start())).rejects.toThrow('Wait for report submission');
  await page.evaluate(() => window.fixtureRecorder.destroy()); await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.fixtureRecorder.getRecording())).toBeNull();
  expect(await page.evaluate(() => window.fixtureRecorder.getSubmissionStatus().state)).toBe('idle');
});
test.beforeEach(async ({ page }) => { await page.goto('/?debug=1'); await expect(page.locator('#record-start')).toBeVisible(); });

test('explicit recording captures actions and real HTTP failure, with separate JS error', async ({ page }) => {
  expect(await page.evaluate(() => window.fixtureRecorder.getStatus().eventCount)).toBe(0);
  await page.locator('#question').fill('Not captured before start');
  await page.locator('#question').fill('');
  await page.locator('#record-start').click();
  await expect(page.locator('#record-status')).toContainText('recording —');
  await page.locator('#question').fill('Synthetic question');
  await page.locator('#category').selectOption('technical');
  const response = page.waitForResponse(r => r.url().endsWith('/api/questions'));
  await page.locator('#submit-question').click();
  expect((await response).status()).toBe(500);
  await expect(page.locator('#feedback')).toContainText('could not submit');
  await page.getByText('Additional diagnostic check', { exact: true }).click(); await page.locator('#trigger-error').click();
  await page.waitForTimeout(250);
  const recording = await page.evaluate(() => window.fixtureRecorder.stop()) as Recording;
  expect(recording.hasFullSnapshot).toBe(true);
  expect(JSON.stringify(recording.replay)).toContain('Synthetic question');
  expect(recording.events).toEqual(expect.arrayContaining([
    expect.objectContaining({ kind: 'action', action: 'fill', value: 'Synthetic question', redacted: false }),
    expect.objectContaining({ kind: 'network', status: 500, outcome: 'http-error', method: 'POST' }),
    expect.objectContaining({ kind: 'error', source: 'error', message: 'Unravel fixture: intentional JavaScript error' }),
  ]));
  expect(recording.events.filter(e => e.kind === 'error')).toHaveLength(1);
  expect(JSON.stringify(recording)).not.toContain('Not captured before start');
  const count = recording.events.length + recording.replay.length;
  await page.locator('#question').fill('After stop');
  expect(await page.evaluate(() => window.fixtureRecorder.getStatus().eventCount)).toBe(count);
  await page.screenshot({ path: '.playwright-mcp/m3-fixture-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '.playwright-mcp/m3-fixture-mobile.png', fullPage: true });
});

test('cancelled async start leaves no recorder and can restart cleanly', async ({ page }) => {
  await page.evaluate(async () => {
    const pending = window.fixtureRecorder.start(); window.fixtureRecorder.stop(); await pending;
  });
  expect(await page.evaluate(() => window.fixtureRecorder.getStatus().state)).toBe('stopped');
  expect(await page.evaluate(() => window.fixtureRecorder.getRecording())).toBeNull();
  await page.evaluate(() => window.fixtureRecorder.start());
  expect(await page.evaluate(() => window.fixtureRecorder.stop()?.hasFullSnapshot)).toBe(true);
});

test('pending fetch settles normally after stop without adding late events', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/delayed', async route => { await gate; await route.fulfill({ status: 201, body: 'Not captured response body' }); });
  await page.evaluate(() => window.fixtureRecorder.start());
  await page.evaluate(() => { (window as Window & { late?: Promise<number> }).late = fetch('/delayed').then(response => response.status); });
  const before = await page.evaluate(() => window.fixtureRecorder.stop()); release();
  expect(await page.evaluate(() => (window as Window & { late?: Promise<number> }).late)).toBe(201);
  expect(await page.evaluate(() => window.fixtureRecorder.getRecording())).toEqual(before);
});

test('plain React Strict Mode mount/unmount does not duplicate capture', async ({ page }) => {
  await page.goto('/react-smoke');
  await page.getByRole('button', { name: 'Start recording', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('recording');
  await page.getByTestId('lab-question').fill('Synthetic React');
  await page.getByRole('button', { name: 'Toggle mount' }).click();
  await page.getByRole('button', { name: 'Toggle mount' }).click();
  await page.getByRole('button', { name: 'Start recording', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('recording');
  await page.getByTestId('lab-question').fill('Synthetic remount');
  await page.getByRole('button', { name: 'Stop recording', exact: true }).click();
  await expect(page.getByTestId('lab-summary')).toHaveText('1 actions; full snapshot: true');
});

test('Next.js client lifecycle records on desktop and mobile', async ({ page }) => {
  test.setTimeout(90000);
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`${process.env.SDK_LAB_BASE_URL ?? 'http://localhost:3013'}/sdk-lab`);
    await page.getByRole('button', { name: 'Start recording', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('recording');
    await page.getByTestId('lab-question').fill('Synthetic Next');
    await page.getByRole('button', { name: 'Stop recording', exact: true }).click();
    await expect(page.getByTestId('lab-summary')).toHaveText('1 actions; full snapshot: true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.screenshot({ path: '.playwright-mcp/m3-next-sdk-mobile.png' });
});

test('records controlled size and interaction overhead measurements', async ({ page }, testInfo) => {
  const measurement = await page.evaluate(async () => {
    const question = document.querySelector('#question') as HTMLTextAreaElement;
    const run = () => { const started = performance.now(); for (let i = 0; i < 200; i++) { question.value = `Synthetic ${i}`; question.dispatchEvent(new Event('input', { bubbles: true })); } return performance.now() - started; };
    run(); const baselineMs = run(); await window.fixtureRecorder.start();
    const recordingMs = run(); await new Promise(resolve => setTimeout(resolve, 200));
    const result = window.fixtureRecorder.stop()!;
    return { baselineMs, recordingMs, interactions: 200, bytes: new TextEncoder().encode(JSON.stringify(result)).length, replayEvents: result.replay.length, semanticEvents: result.events.length, userAgent: navigator.userAgent, viewport: { width: innerWidth, height: innerHeight } };
  });
  await testInfo.attach('controlled-recording-measurement', { body: JSON.stringify(measurement, null, 2), contentType: 'application/json' });
  await mkdir('.cache', { recursive: true });
  await writeFile('.cache/sdk-recording-measurement.json', JSON.stringify({ measuredAt: new Date().toISOString(), ...measurement }, null, 2) + '\n');
  console.log('SDK controlled measurement:', JSON.stringify(measurement));
  expect(measurement.bytes).toBeLessThan(5000000);
});

test('privacy sentinels never enter replay or semantic channels, including DOM mutations', async ({ page }) => {
  await page.evaluate(() => {
    const input = document.createElement('input'); input.id = 'ordinary'; input.value = 'PRIVATE_VALUE_SENTINEL';
    input.setAttribute('title', 'PRIVATE_TITLE_SENTINEL'); input.dataset.secret = 'PRIVATE_DATA_SENTINEL'; document.body.append(input);
    const p = document.createElement('p'); p.textContent = 'PRIVATE_TEXT_SENTINEL'; document.body.append(p);
    const host=document.createElement('aside'); host.attachShadow({mode:'open'}).innerHTML='<button>PRIVATE_SHADOW_SENTINEL</button>'; document.body.append(host);
    const check = document.createElement('input'); check.type = 'checkbox'; check.id = 'private-check'; check.checked = true; document.body.append(check);
    document.title = 'PRIVATE_TITLE_SENTINEL';
    history.replaceState({}, '', '/?secret=PRIVATE_QUERY_SENTINEL#PRIVATE_HASH_SENTINEL');
    (document.querySelector('#private-value') as HTMLInputElement).value = 'PRIVATE_PASSWORD_SENTINEL';
  });
  await page.evaluate(() => window.fixtureRecorder.start());
  await page.evaluate(async () => {
    const password = document.querySelector('#private-value') as HTMLInputElement;
    password.type = 'text'; password.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('#ordinary')!.textContent = 'PRIVATE_MUTATION_SENTINEL';
    await fetch('/private/PRIVATE_PATH_SENTINEL?token=PRIVATE_QUERY_SENTINEL', { method: 'POST', headers: { Authorization: 'PRIVATE_HEADER_SENTINEL' }, body: 'PRIVATE_BODY_SENTINEL' });
    window.dispatchEvent(new ErrorEvent('error', { message: 'PRIVATE_ERROR_SENTINEL', filename: '/private/PRIVATE_FILE_SENTINEL' }));
    window.dispatchEvent(new PromiseRejectionEvent('unhandledrejection', { promise: Promise.resolve(), reason: new Error('PRIVATE_REJECTION_SENTINEL') }));
    history.pushState({}, '', '/private/PRIVATE_HISTORY_SENTINEL?secret=PRIVATE_QUERY_SENTINEL');
  });
  await page.waitForTimeout(200);
  const recording = await page.evaluate(() => window.fixtureRecorder.stop()) as Recording;
  expect(recording.hasFullSnapshot).toBe(true);
  expect(JSON.stringify(recording)).not.toMatch(/PRIVATE_[A-Z_]+_SENTINEL/);
  expect(JSON.stringify(recording.replay)).not.toContain('"checked":true');
  expect(JSON.stringify(recording.replay)).not.toContain('"isShadow":true');
  expect(recording.events).toContainEqual(expect.objectContaining({ kind: 'network', url: { origin: 'http://127.0.0.1:4183', path: null } }));
});

test('repeated start, stop, destroy and concurrent instances restore host instrumentation', async ({ page }) => {
  await page.evaluate(() => { window.savedFetch = fetch; window.savedOpen = XMLHttpRequest.prototype.open; window.savedPush = history.pushState; });
  await page.evaluate(async () => { await Promise.all([window.fixtureRecorder.start(), window.fixtureRecorder.start()]); });
  await page.evaluate(async (projectId) => {
    window.extraRecorder = window.UnravelSDK.initialize({ projectId });
    try { await window.extraRecorder.start(); throw new Error('Expected concurrent rejection'); }
    catch (error) { if (!(error instanceof Error) || !error.message.includes('Another')) throw error; }
  }, projectId);
  await page.locator('#question').fill('First session');
  expect((await page.evaluate(() => window.fixtureRecorder.stop()))!.events.filter(e => e.kind === 'action' && e.action === 'fill')).toHaveLength(1);
  expect(await page.evaluate(() => fetch === window.savedFetch && XMLHttpRequest.prototype.open === window.savedOpen && history.pushState === window.savedPush)).toBe(true);
  await page.evaluate(() => window.fixtureRecorder.start());
  await page.locator('#question').fill('Second session');
  const copy = await page.evaluate(() => { const first = window.fixtureRecorder.stop()!; first.events.length = 0; return window.fixtureRecorder.getRecording(); });
  expect(copy!.events.filter(e => e.kind === 'action' && e.action === 'fill')).toHaveLength(1);
  await page.evaluate(async () => { await window.extraRecorder.start(); window.extraRecorder.destroy(); window.extraRecorder.destroy(); window.fixtureRecorder.destroy(); });
  expect(await page.evaluate(() => window.fixtureRecorder.getRecording())).toBeNull();
  expect(await page.evaluate(() => fetch === window.savedFetch && XMLHttpRequest.prototype.open === window.savedOpen)).toBe(true);
});

test('XHR, abort, history and no late events after teardown', async ({ page }) => {
  await page.evaluate(() => window.fixtureRecorder.start());
  await page.evaluate(async () => {
    await new Promise<void>(resolve => { const xhr = new XMLHttpRequest(); xhr.open('GET', '/missing?secret=not-recorded'); xhr.onloadend = () => resolve(); xhr.send(); });
    const controller = new AbortController(); controller.abort();
    try { await fetch('/never', { signal: controller.signal }); } catch { /* Host still receives abort. */ }
    history.pushState({}, '', '/next');
  });
  const recording = await page.evaluate(() => window.fixtureRecorder.stop()) as Recording;
  expect(recording.events).toContainEqual(expect.objectContaining({ kind: 'network', transport: 'xhr', status: 404, outcome: 'http-error' }));
  expect(recording.events).toContainEqual(expect.objectContaining({ kind: 'network', transport: 'fetch', outcome: 'aborted' }));
  expect(recording.events).toContainEqual(expect.objectContaining({ kind: 'navigation', source: 'push', url: expect.objectContaining({ path: null }) }));
  expect(JSON.stringify(recording)).not.toContain('not-recorded');
});

for (const [name, limits, expected] of [
  ['duration', { maxDurationMs: 150 }, 'duration-limit'],
  ['size', { maxBytes: 1024 }, 'size-limit'],
  ['events', { maxEvents: 1 }, 'event-limit'],
] as const) {
  test(`${name} limit stops visibly with an explicit incomplete result`, async ({ page }) => {
    await page.evaluate(async ({ projectId, limits }) => {
      window.fixtureRecorder.destroy();
      window.fixtureRecorder = window.UnravelSDK.initialize({ projectId, limits, onStateChange: value => { document.querySelector('#record-status')!.textContent = value.reason ?? value.state; } });
      await window.fixtureRecorder.start();
    }, { projectId, limits });
    await expect(page.locator('#record-status')).toHaveText(expected);
    const recording = await page.evaluate(() => window.fixtureRecorder.getRecording());
    expect(recording!.stopReason).toBe(expected); expect(recording!.truncated).toBe(true);
    if (name === 'size') expect(new TextEncoder().encode(JSON.stringify(recording)).length).toBeLessThanOrEqual(1024);
  });
}
