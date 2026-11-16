import { test, expect } from '@playwright/test';
import type { mountWidget } from '../../packages/sdk/dist/index';

test('authenticated demo delivery is explicit, same-origin, and keeps session cookies', async ({
  page,
  context,
}) => {
  const origin = 'http://127.0.0.1:4183';
  await context.addCookies([{ name: 'portfolio-test', value: 'synthetic', url: origin }]);
  let cookie = '',
    uploads = 0;
  await page.route('**/api/demo/ingest/*', async (route) => {
    uploads++;
    cookie = (await route.request().allHeaders()).cookie ?? '';
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ reportId: '22345678-1234-4234-8234-123456789012', duplicate: false }),
    });
  });
  await page.goto('/');
  const rejected = await page.evaluate(() => {
    const host = window as unknown as {
      UnravelSDK: { mountWidget: typeof mountWidget };
      fixtureWidget?: { destroy(): void };
    };
    host.fixtureWidget?.destroy();
    try {
      host.UnravelSDK.mountWidget({
        projectId: '12345678-1234-4234-8234-123456789012',
        applicationOrigin: 'https://other.example',
        authenticatedDemo: true,
      });
      return false;
    } catch {
      return true;
    }
  });
  expect(rejected).toBe(true);
  await page.evaluate(() => {
    const host = window as unknown as { UnravelSDK: { mountWidget: typeof mountWidget } };
    host.UnravelSDK.mountWidget({
      projectId: '12345678-1234-4234-8234-123456789012',
      applicationOrigin: location.origin,
      authenticatedDemo: true,
    });
  });
  await page.getByRole('button', { name: 'Report a bug', exact: true }).click();
  await page.getByRole('button', { name: 'Start recording', exact: true }).click();
  await page.getByText('RECORDING', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Stop recording', exact: true }).click();
  await page.getByLabel('Report title', { exact: true }).fill('Synthetic authenticated recording');
  await page.getByRole('button', { name: 'Send bug report', exact: false }).click();
  await expect(page.getByRole('heading', { name: 'Thanks for helping us fix it.' })).toBeVisible();
  expect(uploads).toBe(1);
  expect(cookie).toContain('portfolio-test=synthetic');
});
