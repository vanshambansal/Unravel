import { test, expect } from '@playwright/test';
import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { randomUUID } from 'node:crypto';
import { syntheticSubmission } from '../../../../tests/fixtures/submission';

test.beforeAll(async () => { await clerkSetup(); });
test('search navigation, mobile hit targets, retained paused replay and delayed-host recovery', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 1440, height: 900 } });
  let projectId: string | undefined;
  let expectedProject: { name: string; origin: string } | undefined;
  const projectName = `Responsiveness ${randomUUID().slice(0,8)}`;
  try {
    const page = await context.newPage();
    await page.goto('/sign-in'); await clerk.signIn({ page, emailAddress: process.env.E2E_CLERK_USER_EMAIL! });
    const origin = new URL(baseURL!).origin, website = `http://127.0.0.1:${45000 + Math.floor(Math.random() * 10000)}`;
    const created = await context.request.post('/api/projects', { headers: { origin }, data: { name: projectName, websiteUrl: website } });
    expect(created.status()).toBe(201); const project = (await created.json()).project; projectId = project.id; expectedProject = { name: project.name, origin: project.origin };
    const body = syntheticSubmission(projectId, website); body.recording.durationMs = 10000;
    body.recording.replay.push({ type: 3, timestamp: body.recording.startedAt + 10000, data: { source: 0, texts: [{ id: 4, value: 'Synthetic end' }], attributes: [], removes: [], adds: [] } });
    const submitted = await context.request.post(`/api/ingest/${projectId}`, { headers: { origin: website }, data: body });
    expect(submitted.status()).toBe(201);
    const reportId = (await submitted.json()).reportId, base = `/app/projects/${projectId}`, detail = `${base}/reports/${reportId}`;
    await page.goto(`${base}/reports`);
    await page.getByRole('searchbox', { name: 'Search reports' }).fill('leaving');
    await page.locator(`a[href="${base}/setup"]`).first().evaluate((element: HTMLAnchorElement) => element.click());
    await expect(page).toHaveURL(new RegExp(`${base}/setup$`)); await page.waitForTimeout(600);
    await expect(page).toHaveURL(new RegExp(`${base}/setup$`));
    console.log('[responsiveness] navigation verified');
    await page.goto(`${base}/reports`);
    let received!: () => void, release!: () => void;
    const firstReady = new Promise<void>(resolve => { received = resolve; });
    const responseGate = new Promise<void>(resolve => { release = resolve; });
    await page.route(`**${base}/reports?*`, async route => {
      if (new URL(route.request().url()).searchParams.get('q') !== 'older-response') { await route.continue(); return; }
      const response = await route.fetch(); received(); await responseGate; await route.fulfill({ response });
    });
    const searchBox = page.getByRole('searchbox', { name: 'Search reports' });
    await searchBox.fill('older-response'); await firstReady;
    await searchBox.fill('newer-input'); release();
    await page.waitForFunction(() => document.querySelector('.report-search-chip-val')?.textContent?.includes('older-response'));
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));
    expect(await searchBox.inputValue()).toBe('newer-input');
    await page.unroute(`**${base}/reports?*`);

    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 }); await page.goto(`${base}/reports`);
      expect((await page.getByRole('searchbox', { name: 'Search reports' }).boundingBox())!.height).toBeGreaterThanOrEqual(40);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    console.log('[responsiveness] mobile targets verified');
    await page.setViewportSize({ width: 1440, height: 900 }); await page.goto(detail);
    await expect(page.getByText('Replay ready', { exact: true })).toBeVisible();
    const host = page.locator('iframe[title="Session replay"]'); await host.evaluate(element => element.setAttribute('data-test-identity', 'retained'));
    await page.getByRole('button', { name: 'Play replay', exact: true }).click(); await page.waitForTimeout(300);
    await page.getByRole('tab', { name: 'Reproduction & test plan', exact: true }).click(); await page.waitForTimeout(250);
    const paused = await page.getByTestId('replay-time').textContent(); await page.waitForTimeout(800);
    expect(await page.getByTestId('replay-time').textContent()).toBe(paused);
    await page.getByRole('tab', { name: 'Investigation', exact: true }).click();
    await expect(host).toHaveAttribute('data-test-identity', 'retained'); await expect(page.getByRole('button', { name: 'Play replay', exact: true })).toBeVisible();
    const investigation = page.getByRole('tab', { name: 'Investigation', exact: true });
    await investigation.focus(); await investigation.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Reproduction & test plan', exact: true })).toBeFocused();
    await expect(page.getByRole('tabpanel', { name: 'Reproduction & test plan', exact: true })).toBeVisible();
    await page.getByRole('tab', { name: 'Reproduction & test plan', exact: true }).press('ArrowLeft');
    await expect(investigation).toBeFocused();
    console.log('[responsiveness] paused instance retained');
    const playerOrigin = new URL((await host.getAttribute('src'))!).origin;
    await page.route(`${playerOrigin}/`, async route => { await new Promise(resolve => setTimeout(resolve, 5500)); await route.continue(); });
    await page.reload({ waitUntil: 'domcontentloaded' }); await expect(page.getByRole('button', { name: 'Retry replay', exact: true })).toBeVisible();
    await expect(page.getByText('Replay ready', { exact: true })).toBeVisible(); await expect(host).toBeVisible();
    await expect(page.locator('p.product-field-error[role="alert"]')).toHaveCount(0);
    await expect(page.locator('.report-offline-fallback')).toHaveCount(0);
    await page.unroute(`${playerOrigin}/`); await page.reload(); await expect(page.getByText('Replay ready', { exact: true })).toBeVisible();
    // A slow recording request must recover without the former 15-second abort.
    await page.route('**/api/projects/*/reports/*/replay', async route => {
      await new Promise(resolve => setTimeout(resolve, 17000));
      await route.continue();
    });
    await page.reload(); await expect(page.getByRole('button', { name: 'Retry replay', exact: true })).toBeVisible();
    await expect(page.getByText('Replay ready', { exact: true })).toBeVisible(); await expect(host).toBeVisible();

  } finally {
    if (projectId) { const response = await context.request.delete(`/api/projects/${projectId}`, { headers: { origin: new URL(baseURL!).origin }, data: { confirmation: projectName, expected: expectedProject } }); expect(response.ok()).toBe(true); }
    await context.close();
  }
});
