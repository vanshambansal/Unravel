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
test.beforeEach(async ({ page }) => { await page.goto('/'); await expect(page.locator('#record-start')).toBeVisible(); });

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
  await page.locator('summary').click(); await page.locator('#trigger-error').click();
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
    await page.goto('http://localhost:3013/sdk-lab');
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
