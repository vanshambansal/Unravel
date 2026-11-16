import { test, expect } from '@playwright/test';

test('unconfigured checkout exposes examples without bypassing private access', async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#hero');
  await expect(page.locator('#hero-title')).toBeVisible();
  await page.goto('/demo');
  await expect(
    page.getByRole('status').filter({ hasText: 'Saving reports needs your own Clerk' }),
  ).toBeVisible();
  const response = await request.get('/api/projects');
  expect(response.status()).toBe(503);
  expect((await response.json()).error).toContain('sign-in is not configured');
  expect(errors).toEqual([]);
});

for (const framework of ['react', 'next']) {
  test(`${framework} demo builds from source and works without credentials`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/demo/${framework}`);
    await expect(page.getByRole('heading', { name: 'What’s on your mind?' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Report a bug', exact: true })).toHaveCount(0);
    await page.getByLabel('Your question', { exact: true }).fill('Synthetic clean clone question');
    await page.getByRole('button', { name: 'Submit question', exact: true }).click();
    await expect(page.getByRole('status').filter({ hasText: 'We could not submit' })).toBeVisible();
    await page.getByRole('button', { name: 'Task board', exact: true }).click();
    await page.getByLabel('Search tasks').fill('Account');
    await page.getByLabel('Account settings', { exact: true }).check();
    await page.getByRole('button', { name: 'Open task details' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Close task details' }).click();
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
      false,
    );
    expect(errors).toEqual([]);
  });
}
