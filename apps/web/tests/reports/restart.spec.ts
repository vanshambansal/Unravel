import { test, expect } from '@playwright/test';
import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { readFile, writeFile } from 'node:fs/promises';
test.beforeAll(async () => {
  if (!process.env.CLERK_SECRET_KEY?.startsWith('sk_test_') || !process.env.E2E_CLERK_USER_EMAIL) throw new Error('Use only the existing Clerk development app and approved synthetic test user. Production keys are forbidden.');
  await clerkSetup();
});
test('previously retained recording survives an actual application restart', async ({ page, context, baseURL }) => {
  const proof = JSON.parse(await readFile('../../.cache/m4-restart-proof.json', 'utf8')) as { projectId: string; reportId: string; title: string };
  await page.goto('/sign-in'); await clerk.signIn({ page, emailAddress: process.env.E2E_CLERK_USER_EMAIL! });
  const path = `/api/projects/${proof.projectId}/reports/${proof.reportId}`;
  const response = await context.request.get(path); expect(response.status()).toBe(200);
  expect((await response.json()).report.title).toBe(proof.title);
  const replay = await context.request.get(path + '/replay'); expect(replay.status()).toBe(200);
  expect((await replay.json()).replay.length).toBeGreaterThan(1);
  await page.goto(`/app/projects/${proof.projectId}/reports/${proof.reportId}`);
  await expect(page.getByRole('heading', { name: proof.title, exact: true })).toBeVisible();
  await expect(page.getByText('Replay ready', { exact: true })).toBeVisible();
  const playerOrigin = new URL((await page.locator('iframe[title="Session replay"]').getAttribute('src'))!).origin;
  expect(playerOrigin).not.toBe(new URL(baseURL!).origin);
  await writeFile('../../.cache/m4-restart-verification.json', JSON.stringify({ ...proof, checkedAt: new Date().toISOString(), applicationOrigin: baseURL, playerOrigin }));
});
