import { expect, test } from '@playwright/test';
import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { randomUUID } from 'node:crypto';
import { clerkKeysHaveValidFormat } from '../../src/features/authentication/configuration';

test.beforeAll(async () => {
  if (!clerkKeysHaveValidFormat(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, process.env.CLERK_SECRET_KEY) || !process.env.CLERK_SECRET_KEY?.startsWith('sk_test_')) throw new Error('Configure full, unmasked Clerk development keys in apps/web/.env.local. Production keys are forbidden in this test.');
  if (!process.env.DATABASE_URL?.trim() || !process.env.E2E_CLERK_USER_EMAIL || !process.env.E2E_CLERK_OTHER_EMAIL || process.env.E2E_CLERK_USER_EMAIL === process.env.E2E_CLERK_OTHER_EMAIL) throw new Error('Configure a development database and two different existing synthetic Clerk test-user emails. This test does not create Clerk accounts.');
  await clerkSetup();
});

test('real Clerk sessions, responsive project creation, persistence, ownership and sign-out', async ({ browser, baseURL }) => {
  const first = await browser.newContext({ baseURL, viewport: { width: 1440, height: 900 } });
  const second = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 } });
  try {
    const a = await first.newPage(), b = await second.newPage();
    for (const [page, email] of [[a, process.env.E2E_CLERK_USER_EMAIL!], [b, process.env.E2E_CLERK_OTHER_EMAIL!]] as const) {
      await page.goto('/sign-in'); await clerk.signIn({ page, emailAddress: email });
      await page.goto('/app/projects'); await expect(page.getByRole('heading', { name: 'Your projects' })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await a.getByRole('link', { name: 'Create project', exact: true }).click();
    await a.getByRole('button', { name: 'Create project', exact: true }).click();
    await expect(a.locator('#name-error')).toBeVisible();
    const suffix = randomUUID(); const name = `E2E ${suffix}`;
    await a.getByLabel('Project name').fill(name);
    await a.getByLabel('Website address').fill(`https://${suffix}.example/questions?synthetic=1`);
    await expect(a.locator('.origin-preview')).toContainText(`https://${suffix}.example`);
    await a.getByRole('button', { name: 'Create project', exact: true }).click();
    await expect(a).toHaveURL(/\/app\/projects\/[0-9a-f-]+\/setup$/);
    await expect(a.getByRole('heading', { name, exact: true })).toBeVisible();
    await expect(a.getByRole('heading', { name: 'Recording SDK coming next' })).toBeVisible();
    const id = a.url().split('/').at(-2)!;
    await a.reload(); await expect(a.getByRole('heading', { name, exact: true })).toBeVisible();
    const saved = await (await first.request.get(`/api/projects/${id}`)).json();
    const denied = await second.request.get(`/api/projects/${id}`); expect(denied.status()).toBe(404);
    const otherList = await (await second.request.get('/api/projects')).json();
    expect(otherList.projects.some((p: { id: string }) => p.id === id)).toBe(false);
    await b.goto(`/app/projects/${id}/setup`); await expect(b.getByRole('heading', { name: 'Project not found' })).toBeVisible();
    const origin = new URL(baseURL!).origin;
    const forged = await second.request.post('/api/projects', { headers: { origin }, data: { name: `E2E owner B ${suffix}`, websiteUrl: `https://b-${suffix}.example`, ownerId: saved.project.ownerId } });
    expect(forged.status()).toBe(201); expect((await forged.json()).project.ownerId).not.toBe(saved.project.ownerId);
    const duplicate = await first.request.post('/api/projects', { headers: { origin }, data: { name, websiteUrl: `https://${suffix}.example` } }); expect(duplicate.status()).toBe(409);
    const invalid = await first.request.post('/api/projects', { headers: { origin }, data: { name: '', websiteUrl: 'javascript:alert(1)' } }); expect(invalid.status()).toBe(422);
    const crossOrigin = await first.request.post('/api/projects', { headers: { origin: 'https://foreign.example' }, data: { name, websiteUrl: 'example.com' } }); expect(crossOrigin.status()).toBe(403);
    await a.getByRole('button', { name: 'Sign out', exact: true }).click(); await expect(a).toHaveURL(/\/sign-in/);
    expect((await first.request.get('/api/projects')).status()).toBe(401);
  } finally { await first.close(); await second.close(); }
});
