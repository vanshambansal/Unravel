import { test, expect } from '@playwright/test';
import { clerk, clerkSetup } from '@clerk/testing/playwright';

test.beforeAll(async () => { await clerkSetup(); });
test('prepared navigation reuses data and generator reads are shared', async ({ browser, baseURL }) => {
  test.setTimeout(90000);
  test.skip(!process.env.FLUIDITY_PROJECT_ID, 'Select an existing synthetic project for this read-only performance check.');
  const context = await browser.newContext({ baseURL, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  try {
    await page.goto('/sign-in'); await clerk.signIn({ page, emailAddress: process.env.E2E_CLERK_USER_EMAIL! });
    const current = { id: process.env.FLUIDITY_PROJECT_ID! };
    const listed = await context.request.get(`/api/projects/${current.id}/reports`);
    expect(listed.ok()).toBe(true);
    const reportId = (await listed.json()).reports[0]?.id;
    expect(reportId).toBeTruthy();
    const base = `/app/projects/${current.id}/reports`, detail = `${base}/${reportId}`;
    let prepared = 0, routeReads = 0, projectReads = 0, planReads = 0;
    page.on('requestfinished', async request => {
      if (new URL(request.url()).pathname === '/app/projects' && request.headers().rsc === '1') projectReads++;
      if (new URL(request.url()).pathname === base && request.headers().rsc === '1') { routeReads++; await (await request.response())?.finished(); prepared++; }
      if (new URL(request.url()).pathname === `/api/projects/${current.id}/reports/${reportId}/plan`) planReads++;
    });
    await page.goto('/app/projects');
    const link = page.locator(`.ui-resource-collection a[href="${base}"]:visible`);
    await expect(link).toBeVisible();
    await page.screenshot({ path: '.cache/fluid13-projects-desktop.png' });
    await link.hover();
    await expect.poll(() => prepared).toBeGreaterThan(0);
    const readsBefore = routeReads;
    await page.evaluate(() => {
      document.addEventListener('click', () => {
        const start = performance.now();
        const result = { ms: 0, fallback: false };
        Object.assign(window, { fluidityTiming: result });
        function tick() {
          result.fallback ||= !!document.querySelector('.workspace-content [aria-busy="true"]');
          if (document.querySelector('.ui-page-header h1')?.textContent === 'Bug reports') { result.ms = performance.now() - start; return; }
          if (performance.now() - start < 10000) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }, { capture: true, once: true });
    });
    await link.click(); await expect(page.getByRole('heading', { name: 'Bug reports', exact: true })).toBeVisible();
    await page.waitForFunction(() => (window as unknown as { fluidityTiming: { ms: number } }).fluidityTiming.ms > 0);
    expect(routeReads).toBe(readsBefore);
    const timing = await page.evaluate(() => (window as unknown as { fluidityTiming: { ms: number; fallback: boolean } }).fluidityTiming);
    expect(timing.fallback).toBe(false); console.log('[fluidity] prepared navigation', JSON.stringify(timing));
    const search = page.getByRole('searchbox', { name: 'Search reports' });
    await search.fill('hat');
    await expect(page).toHaveURL(/q=hat/);
    await search.focus();
    expect(await search.evaluate(el => getComputedStyle(el).borderTopWidth)).toBe('0px');
    await expect(page.getByRole('button', { name: 'Clear search query', exact: true })).toHaveCount(1);
    await page.screenshot({ path: '.cache/cinema13-search-desktop.png' });
    await page.getByRole('button', { name: 'Clear search query', exact: true }).click();
    await expect(page).not.toHaveURL(/q=/);
    const readsBeforeRevisits = routeReads, projectsBeforeRevisits = projectReads;
    for (let visit = 0; visit < 3; visit++) {
      await page.getByRole('navigation', { name: 'Workspace', exact: true }).getByRole('link', { name: 'All projects', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Your projects', exact: true })).toBeVisible();
      await page.locator(`.ui-resource-collection a[href="${base}"]:visible`).click();
      await expect(page.getByRole('heading', { name: 'Bug reports', exact: true })).toBeVisible();
    }
    expect(routeReads).toBe(readsBeforeRevisits);
    expect(projectReads).toBe(projectsBeforeRevisits);
    await page.locator(`a[href^="${detail}"]`).click();
    await expect(page.getByRole('button', { name: 'Edit details', exact: true })).toBeVisible();
    await expect.poll(() => planReads).toBe(1);
    await page.getByRole('tab', { name: 'Reproduction & test plan', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Create a browser test', exact: true })).toBeVisible();
    expect(planReads).toBe(1);
    await page.screenshot({ path: '.cache/fluid13-generator-desktop.png' });
    await page.getByRole('tab', { name: 'Investigation', exact: true }).click();
    await page.getByRole('link', { name: 'All reports', exact: false }).click();
    await expect(page.getByRole('heading', { name: 'Bug reports', exact: true })).toBeVisible();
    await page.reload(); await expect(page.getByRole('heading', { name: 'Bug reports', exact: true })).toBeVisible();
    await page.goBack(); await expect(page.getByRole('button', { name: 'Edit details', exact: true })).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: '.cache/fluid13-report-mobile.png' });
  } finally {
    await context.close();
  }
});

test('streamed workspace recovers delayed replay host and recording without losing the timeline', async ({ browser, baseURL }) => {
  test.setTimeout(90000);
  test.skip(!process.env.FLUIDITY_PROJECT_ID, 'Select an existing synthetic project for this read-only recovery check.');
  const context = await browser.newContext({ baseURL, viewport: { width: 1440, height: 900 } });
  let releaseHost: (() => void) | undefined;
  try {
    const page = await context.newPage();
    await page.goto('/sign-in'); await clerk.signIn({ page, emailAddress: process.env.E2E_CLERK_USER_EMAIL! });
    const projectId = process.env.FLUIDITY_PROJECT_ID!;
    const reports = await (await context.request.get(`/api/projects/${projectId}/reports`)).json();
    const reportId = reports.reports[0].id;
    await page.goto(`/app/projects/${projectId}/reports/${reportId}`);
    await expect(page.getByText('Replay ready', { exact: true })).toBeVisible();
    const frame = page.locator('iframe[title="Session replay"]'), player = new URL((await frame.getAttribute('src'))!).origin;
    const gate = new Promise<void>(resolve => { releaseHost = resolve; });
    await page.route(`${player}/`, async route => { await gate; await route.continue(); });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: 'Retry replay', exact: true })).toBeVisible();
    releaseHost!();
    await expect(page.getByText('Replay ready', { exact: true })).toBeVisible(); await expect(frame).toBeVisible();
    await page.unroute(`${player}/`);
    await page.route('**/api/projects/*/reports/*/replay', async route => { await new Promise(resolve => setTimeout(resolve, 17000)); await route.continue(); });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: 'Retry replay', exact: true })).toBeVisible();
    await expect(page.getByRole('list', { name: 'Event timeline' })).toBeVisible();
    await expect(page.getByText('Replay ready', { exact: true })).toBeVisible(); await expect(frame).toBeVisible();
    await expect(page.locator('p.product-field-error[role="alert"]')).toHaveCount(0);
  } finally { releaseHost?.(); await context.close(); }
});
