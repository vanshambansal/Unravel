import { test, expect } from '@playwright/test';
test('isolated host replays inert content, cannot access dashboard and blocks scripts/resources', async ({ page, request }) => {
  expect((await request.get('/replay-host')).status()).toBe(410);
  await page.goto('/sign-in');
  const result = await page.evaluate(() => new Promise<{ type: string; reason?: string }>(resolve => {
    const frame = document.createElement('iframe'); frame.title = 'Isolation fixture'; frame.sandbox.add('allow-scripts', 'allow-same-origin'); frame.src = 'http://127.0.0.1:4191/';
    const at = Date.now();
    window.addEventListener('message', event => {
      if (event.source !== frame.contentWindow || event.origin !== 'http://127.0.0.1:4191') return;
      if (['failure','initialized'].includes(event.data?.type)) resolve(event.data);
      if (event.data?.type !== 'ready') return;
      frame.contentWindow!.postMessage({ type: 'initialize', channel: 'sandbox-fixture', durationMs: 1000, events: [
      { type: 4, timestamp: at, data: { href: 'http://localhost/', width: 1280, height: 720 } },
      { type: 2, timestamp: at, data: { node: { type: 0, id: 1, childNodes: [{ type: 2, id: 2, tagName: 'html', attributes: {}, childNodes: [{ type: 2, id: 3, tagName: 'head', attributes: {}, childNodes: [] }, { type: 2, id: 4, tagName: 'body', attributes: {}, childNodes: [{ type: 3, id: 5, textContent: 'Safe replay fixture' }] }] }] }, initialOffset: { top: 0, left: 0 } } },
      ] }, 'http://127.0.0.1:4191');
    });
    document.body.append(frame);
  }));
  expect(result).toEqual(expect.objectContaining({ type: 'initialized' }));
  const outer = page.frameLocator('iframe[title="Isolation fixture"]');
  await expect(outer.frameLocator('iframe').locator('body')).toContainText('Safe replay fixture');
  expect(await outer.locator('iframe').getAttribute('sandbox')).toBe('allow-same-origin');
  const host = page.frames().find(frame => frame.url() === 'http://127.0.0.1:4191/')!;
  expect(await host.evaluate(() => { try { void parent.document.body; return false; } catch { return true; } })).toBe(true);
  let contacted = 0; await page.route('**/external-replay-test.example/**', async route => { contacted++; await route.abort(); });
  const security = await host.evaluate(async () => {
    const doc = document.querySelector('iframe')!.contentDocument!;
    const script = doc.createElement('script'); script.textContent = 'window.__unsafeReplayRan = true'; doc.body.append(script);
    const img = doc.createElement('img'); img.src = 'https://external-replay-test.example/pixel'; doc.body.append(img);
    let networkBlocked = false;
    try { await fetch('https://external-replay-test.example/secret'); } catch { networkBlocked = true; }
    return { scriptRan: Boolean((doc.defaultView as Window & { __unsafeReplayRan?: boolean }).__unsafeReplayRan), networkBlocked };
  });
  expect(security).toEqual({ scriptRan: false, networkBlocked: true }); expect(contacted).toBe(0);
  expect((await request.get('http://127.0.0.1:4191/.env.local')).status()).toBe(404);
  expect((await request.post('http://127.0.0.1:4191/')).status()).toBe(404);
  const response = await request.get('http://127.0.0.1:4191/');
  expect(response.headers()['content-security-policy']).toContain(`frame-ancestors ${new URL(page.url()).origin}`);
  let blockedScriptLoads = 0;
  page.on('request', item => { if (item.url() === 'http://127.0.0.1:4191/player.js') blockedScriptLoads++; });
  await page.goto('http://127.0.0.1:4185/');
  const denied = page.waitForEvent('console', { predicate: message => message.type() === 'error' && message.text().includes('frame-ancestors') });
  await page.evaluate(() => { const frame = document.createElement('iframe'); frame.src = 'http://127.0.0.1:4191/'; document.body.append(frame); });
  await denied;
  expect(blockedScriptLoads).toBe(0);
});
