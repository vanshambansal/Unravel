import { expect, test } from '@playwright/test';
import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { randomUUID } from 'node:crypto';

test('architectural sign-in has working light, pause, live reduced motion and no renderer', async ({ page }) => {
  const errors: string[] = [], requests: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => requests.push(request.url()));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/sign-in');
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await expect(page.getByLabel('Email address', { exact: true })).toBeVisible();
  await expect(page.locator('.workspace-motion')).toHaveAttribute('data-motion', 'on');
  const shaft = page.locator('.auth-light-shaft--near');
  const before = await shaft.evaluate(element => getComputedStyle(element).transform);
  await expect.poll(() => shaft.evaluate(element => getComputedStyle(element).transform)).not.toBe(before);
  const pointer = page.locator('.workspace-pointer-light');
  const initialLight = await pointer.evaluate(element => (element as HTMLElement).style.background);
  await page.mouse.move(80, 250);
  await expect.poll(() => pointer.evaluate(element => (element as HTMLElement).style.background)).not.toBe(initialLight);
  await page.getByRole('button', { name: 'Pause ambient motion', exact: true }).click();
  await expect(page.locator('.workspace-motion')).toHaveAttribute('data-motion', 'off');
  await expect(shaft).toHaveCSS('animation-play-state', 'paused');
  await page.getByRole('button', { name: 'Resume ambient motion', exact: true }).click();
  await expect(shaft).toHaveCSS('animation-play-state', 'running');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByRole('button', { name: 'Ambient motion disabled by system preference' })).toBeDisabled();
  await expect(page.locator('.workspace-material-light')).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.getByRole('button', { name: 'Pause ambient motion' })).toBeEnabled();
  for (const viewport of [{ width: 1440, height: 900 }, { width: 768, height: 800 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
    await page.setViewportSize(viewport);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByLabel('Email address', { exact: true })).toBeVisible();
  }
  expect(await page.locator('canvas').count()).toBe(0);
  expect(requests.filter(url => /\/landing\/architecture\/|\.glb(?:\?|$)/.test(url))).toEqual([]);
  expect(errors).toEqual([]);
});

test('real-session shell navigation, interruptible switcher and mobile project context', async ({ page, baseURL }, testInfo) => {
  test.setTimeout(180000);
  if (!process.env.CLERK_SECRET_KEY?.startsWith('sk_test_') || !process.env.E2E_CLERK_USER_EMAIL) throw new Error('Existing Clerk development test-user configuration is required.');
  await clerkSetup();
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/sign-in');
  await clerk.signIn({ page, emailAddress: process.env.E2E_CLERK_USER_EMAIL });
  await page.goto('/app/projects');
  const suffix = randomUUID(), name = `Motion QA ${suffix}`;
  const origin = new URL(baseURL!).origin;
  const created = await page.request.post('/api/projects', { headers: { origin }, data: { name, websiteUrl: `https://motion-${suffix}.example` } });
  expect(created.status()).toBe(201);
  const project = (await created.json()).project;
  try {
    // Refresh the server-owned project list after creating this synthetic fixture via API.
    await page.reload();
    const trigger = page.getByRole('button', { name: 'Switch project', exact: true });
    for (let index = 0; index < 10; index++) {
      await trigger.click(); await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Escape'); await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    }
    await trigger.focus(); await page.keyboard.press('Enter');
    await expect(page.locator('.workspace-project-popover')).toBeVisible();
    await page.getByRole('navigation', { name: 'Choose project', exact: true }).getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${project.id}/reports$`));
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    const nav = page.getByRole('navigation', { name: 'Workspace', exact: true });
    await nav.getByRole('link', { name: 'Settings', exact: true }).click();
    await expect(page.getByLabel('Project name', { exact: true })).toHaveValue(name);
    await expect(nav.getByRole('link', { name: 'Settings', exact: true })).toHaveAttribute('aria-current', 'page');
    await nav.getByRole('link', { name: 'SDK setup', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Integration checklist' })).toBeVisible();
    for (const viewport of [{ width: 1440, height: 900 }, { width: 768, height: 800 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
      await page.setViewportSize(viewport);
      await nav.getByRole('link', { name: 'Settings', exact: true }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page.getByLabel('Project name', { exact: true })).toHaveValue(name);
      await trigger.click();
      const bounds = await page.locator('.workspace-project-popover').boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0); expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
      await page.keyboard.press('Escape');
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.workspace-motion')).toHaveAttribute('data-motion', 'off');
    expect(await page.locator('canvas').count()).toBe(0);
    expect(errors).toEqual([]);
  } finally {
    testInfo.setTimeout(testInfo.timeout + 15000);
    // Only the exact synthetic record created above is eligible for cleanup.
    const deleted = await page.request.delete(`/api/projects/${project.id}`, { timeout: 10000, headers: { origin }, data: { confirmation: name, expected: { name, origin: project.origin } } });
    expect(deleted.status()).toBe(204);
  }
});
