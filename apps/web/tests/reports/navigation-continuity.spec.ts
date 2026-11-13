import { test, expect } from '@playwright/test';
import { clerk, clerkSetup } from '@clerk/testing/playwright';

test.beforeAll(async () => { await clerkSetup(); });
test('collection navigation retains content during a real wait and avoids skeletons on revisits', async ({ browser, baseURL }) => {
  test.setTimeout(90000);
  test.skip(!process.env.FLUIDITY_PROJECT_ID, 'Select an existing synthetic project; this test changes no stored data.');
  const context = await browser.newContext({ baseURL, viewport: { width: 1440, height: 900 } });
  let release: (() => void) | undefined;
  try {
    const page = await context.newPage();
    await page.goto('/sign-in'); await clerk.signIn({ page, emailAddress: process.env.E2E_CLERK_USER_EMAIL! });
    const reports = `/app/projects/${process.env.FLUIDITY_PROJECT_ID}/reports`;
    let reportReads = 0, projectReads = 0;
    page.on('request', request => {
      if (request.headers().rsc !== '1') return;
      const path = new URL(request.url()).pathname;
      if (path === reports) reportReads++;
      if (path === '/app/projects') projectReads++;
    });
    const gate = new Promise<void>(resolve => { release = resolve; });
    await page.route(url => url.pathname === reports, async route => {
      if (route.request().headers().rsc === '1') await gate;
      await route.continue();
    });
    await page.goto('/app/projects');
    await expect(page.getByRole('button', { name: 'Switch project', exact: true })).toBeVisible();
    const projectsHeading = page.getByRole('heading', { name: 'Your projects', exact: true });
    await expect(projectsHeading).toBeVisible();
    const reportLink = page.locator(`.ui-resource-collection a[href="${reports}"]:visible`);
    await reportLink.click({ noWaitAfter: true });
    await page.waitForTimeout(500);
    await expect(projectsHeading).toBeVisible();
    await expect(page.locator('.workspace-content .ui-skeleton')).toHaveCount(0);
    release!();
    await expect(page.getByRole('heading', { name: 'Bug reports', exact: true })).toBeVisible();
    await page.unrouteAll({ behavior: 'wait' });
    await page.waitForTimeout(800);
    await page.evaluate(() => {
      Object.assign(window, { collectionSkeletonSeen: false });
      const observer = new MutationObserver(() => {
        if ([...document.querySelectorAll('.workspace-content .ui-skeleton')].some(node => (node as HTMLElement).offsetParent !== null)) Object.assign(window, { collectionSkeletonSeen: true });
      });
      observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style'] });
    });
    const before = { projectReads, reportReads };
    for (let i = 0; i < 3; i++) {
      await page.getByRole('navigation', { name: 'Workspace', exact: true }).getByRole('link', { name: 'All projects', exact: true }).click();
      await expect(projectsHeading).toBeVisible();
      await reportLink.click();
      await expect(page.getByRole('heading', { name: 'Bug reports', exact: true })).toBeVisible();
    }
    expect(await page.evaluate(() => (window as unknown as { collectionSkeletonSeen: boolean }).collectionSkeletonSeen)).toBe(false);
    console.log('[collection continuity]', JSON.stringify({ origin: baseURL, projectReads: projectReads - before.projectReads, reportReads: reportReads - before.reportReads, skeletonSeen: false }));
    await page.reload(); await expect(page.getByRole('heading', { name: 'Bug reports', exact: true })).toBeVisible();
    await page.goBack(); await expect(projectsHeading).toBeVisible();
  } finally { release?.(); await context.close(); }
});
