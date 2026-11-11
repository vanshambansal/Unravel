import { expect, test } from '@playwright/test';
import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
test.beforeAll(async () => { if (!process.env.CLERK_SECRET_KEY?.startsWith('sk_test_') || !process.env.E2E_CLERK_USER_EMAIL) throw new Error('Use the approved development test user.'); await clerkSetup(); });
test('real product surfaces: authentication, collection, registration, setup, settings, reports and not-found', async ({ browser, baseURL }) => {
  const anonymous = await browser.newContext({ baseURL }), owner = await browser.newContext({ baseURL });
  try {
    await mkdir('../../.playwright-mcp/page-audit', { recursive: true });
    const auth = await anonymous.newPage();
    for (const route of ['sign-in','sign-up']) {
      await auth.goto(`/${route}`); await auth.getByLabel('Email address', { exact: true }).waitFor();
      for (const viewport of [{ width: 1366, height: 900 }, { width: 390, height: 844 }]) { await auth.setViewportSize(viewport); expect(await auth.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await auth.screenshot({ path: `../../.playwright-mcp/page-audit/${route}-${viewport.width}.png`, fullPage: true }); }
    }
    const page = await owner.newPage(); await page.goto('/sign-in'); await clerk.signIn({ page, emailAddress: process.env.E2E_CLERK_USER_EMAIL! }); await page.goto('/app'); await expect(page.getByRole('heading', { name: 'Your projects' })).toBeVisible();
    const projects = (await (await owner.request.get('/api/projects')).json()).projects;
    expect(projects.length).toBeGreaterThan(0); const project = projects.find((p: { origin: string }) => p.origin === 'http://127.0.0.1:4185') ?? projects[0];
    const routes = [['projects','/app/projects'], ['new-project','/app/projects/new'], ['setup',`/app/projects/${project.id}/setup`], ['settings',`/app/projects/${project.id}/settings`], ['reports',`/app/projects/${project.id}/reports`], ['not-found',`/app/projects/${randomUUID()}/settings`]];
    for (const [name, path] of routes) {
      await page.goto(path); await page.locator('main h1').waitFor();
      for (const viewport of [{ width: 1366, height: 900 }, { width: 390, height: 844 }]) { await page.setViewportSize(viewport); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.screenshot({ path: `../../.playwright-mcp/page-audit/${name}-${viewport.width}.png`, fullPage: true }); }
    }
  } finally { await anonymous.close(); await owner.close(); }
});
