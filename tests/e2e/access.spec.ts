import { expect, test } from '@playwright/test';

test('private routes redirect anonymous visitors and project APIs fail closed', async ({ page, request }) => {
  await page.goto('/app/projects');
  await expect(page).toHaveURL(/\/sign-in/);
  await expect(page.getByRole('heading', { name: 'Welcome to Unravel' })).toBeVisible();
  for (const path of ['/api/projects', '/api/projects/11111111-1111-4111-8111-111111111111']) {
    const response = await request.get(path);
    // 503 means credentials are missing; it is not a verified Clerk session check.
    expect([401, 503]).toContain(response.status());
    expect(response.headers()['cache-control']).toBe('no-store');
    expect(await response.json()).not.toHaveProperty('projects');
  }
  const rejected = await request.post('/api/projects', { data: { name: 'Forbidden', websiteUrl: 'https://example.com', ownerId: 'forged-owner' } });
  expect([401, 503]).toContain(rejected.status());
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`authentication shell is readable at ${viewport.width}px without graphics`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const assets: string[] = [];
    page.on('request', request => { if (/\/landing\/(architecture|artwork)\//.test(request.url())) assets.push(request.url()); });
    await page.goto('/sign-in');
    await expect(page.getByRole('heading', { name: 'Welcome to Unravel' })).toBeVisible();
    expect(await page.locator('canvas').count()).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(assets).toEqual([]);
    await page.getByRole('link', { name: 'Return to Unravel' }).focus();
    await expect(page.getByRole('link', { name: 'Return to Unravel' })).toBeFocused();
  });
}
