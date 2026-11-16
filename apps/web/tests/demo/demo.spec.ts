import { test, expect, type BrowserContext } from '@playwright/test';
import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { mkdir, readFile } from 'node:fs/promises';
let owner: BrowserContext;
let projectId: string;

test.beforeAll(async ({ browser, baseURL }) => {
  test.setTimeout(120000);
  await clerkSetup();
  owner = await browser.newContext({ baseURL });
  const page = await owner.newPage();
  await page.goto('/sign-in');
  await clerk.signIn({ page, emailAddress: process.env.E2E_CLERK_USER_EMAIL! });
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: /Take a bug/ })).toBeVisible();
  const prepare = page.getByRole('button', { name: 'Prepare my demo project' });
  await expect(page.getByRole('link', { name: 'View my reports' }).or(prepare)).toBeVisible();
  if (await prepare.isVisible()) await prepare.click();
  const reports = page.getByRole('link', { name: 'View my reports' });
  await expect(reports).toBeVisible();
  projectId = (await reports.getAttribute('href'))!.split('/')[3];
  await page.close();
});
test.afterAll(async () => {
  await owner?.close();
});

for (const framework of ['next', 'react'])
  for (const mode of ['masked', 'full']) {
    test(`${framework}: ${mode} recording, diagnostics, replay and refresh`, async () => {
      const page = await owner.newPage();
      try {
        await page.goto(`/demo/${framework}?project=${projectId}`);
        await expect(
          page.getByRole('status').filter({ hasText: 'Ready. Open Report a bug' }),
        ).toBeVisible();
        await page.getByRole('button', { name: 'Report a bug', exact: true }).click();
        if (mode === 'full')
          await page.getByRole('radio', { name: /Full-content recording/ }).check();
        await page.getByRole('button', { name: 'Start recording' }).click();
        await page.getByRole('button', { name: 'Minimize bug reporter' }).click();
        await page.getByLabel('Your question', { exact: true }).fill('DEMO_QUESTION_SYNTHETIC');
        await page
          .getByLabel('Private test value', { exact: true })
          .fill('DEMO_PASSWORD_SYNTHETIC');
        await page.getByRole('button', { name: 'Submit question', exact: true }).click();
        await expect(
          page.getByRole('status').filter({ hasText: 'We could not submit' }),
        ).toBeVisible();
        await page.getByText('Test a JavaScript error', { exact: true }).click();
        await page.getByRole('button', { name: 'Trigger demo error' }).click();
        await page.getByRole('button', { name: 'Task board', exact: true }).click();
        await page.getByLabel('Search tasks').fill('Account');
        await page.getByLabel('Account settings', { exact: true }).check();
        await page.getByRole('button', { name: 'Open task details' }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.getByRole('button', { name: 'Close task details' }).click();
        await page.getByRole('button', { name: 'Stop recording', exact: true }).click();
        await page
          .getByLabel('Report title', { exact: true })
          .fill(`E2E hosted demo ${framework} ${mode}`);
        const receipt = page.waitForResponse(
          (response) =>
            response.url().includes('/api/ingest/') && response.request().method() === 'POST',
        );
        await page.getByRole('button', { name: 'Send bug report' }).click();
        const response = await receipt;
        expect(response.status(), await response.text()).toBe(201);
        const payload = response.request().postData()!;
        for (const marker of ['DEMO_QUESTION_SYNTHETIC', 'DEMO_PASSWORD_SYNTHETIC']) {
          if (mode === 'full') expect(payload).toContain(marker);
          else expect(payload).not.toContain(marker);
        }
        const { reportId } = await response.json();
        const endpoint = `/api/projects/${projectId}/reports/${reportId}`;
        const report = await (await owner.request.get(endpoint)).json();
        expect(JSON.stringify(report)).toContain('/demo/api/question');
        expect(JSON.stringify(report)).toContain('Synthetic Unravel demo error');
        await page.goto(`/app/projects/${projectId}/reports/${reportId}`);
        await expect(page.getByText('Replay ready', { exact: true })).toBeVisible();
        const replay = page.frameLocator('iframe[title="Session replay"]').frameLocator('iframe');
        await expect(replay.getByRole('heading', { name: 'What’s on your mind?' })).toBeVisible();
        await page.reload();
        await expect(page.getByText('Replay ready', { exact: true })).toBeVisible();
        await page.getByRole('tab', { name: 'Reproduction & test plan' }).click();
        await expect(
          page.getByRole('radio', { name: 'Repeat the actions', exact: true }),
        ).toBeVisible();
        const { plan } = await (await owner.request.get(`${endpoint}/plan`)).json();
        expect(plan.initialPath).toBe(`/demo/${framework}`);
        expect(plan.steps.some((step: { action: string }) => step.action === 'fill')).toBe(true);
        if (mode === 'full') {
          await page
            .locator('.generator-action-footer')
            .getByRole('button', { name: 'View code', exact: true })
            .click();
          const download = page.waitForEvent('download');
          await page.getByRole('button', { name: 'Download Playwright', exact: true }).click();
          const path = `../../.cache/demo-proof/${framework}-reproduction.spec.ts`;
          await mkdir('../../.cache/demo-proof', { recursive: true });
          await (await download).saveAs(path);
          const code = await readFile(path, 'utf8');
          expect(code).toContain('@playwright/test');
          expect(code).toContain(`/demo/${framework}`);
        }
        const exit = await owner.newPage();
        await exit.goto(`/demo/${framework}?project=${projectId}`);
        await exit.getByRole('button', { name: 'Report a bug', exact: true }).click();
        await exit.getByRole('button', { name: 'Start recording' }).click();
        await exit.getByRole('link', { name: 'Choose an integration' }).click();
        await expect(exit.getByRole('heading', { name: /Take a bug/ })).toBeVisible();
        await expect(exit.getByRole('button', { name: 'Stop recording', exact: true })).toHaveCount(
          0,
        );
        await exit.close();
      } finally {
        await page.close();
      }
    });
  }

test('React document is standalone; board, layout, modal and anonymous boundaries work', async ({
  browser,
  baseURL,
}) => {
  const anonymous = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 } });
  const page = await anonymous.newPage();
  try {
    const html = await (await anonymous.request.get('/demo/react')).text();
    expect(html).toContain('/demo-assets/react.js');
    expect(html).not.toContain('/_next/');
    await page.goto('/demo');
    await expect(page.getByRole('link', { name: 'Sign in to save reports' })).toBeVisible();
    await page.getByRole('link', { name: /Open the React example/ }).click();
    await expect(page.getByRole('button', { name: 'Report a bug', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Task board', exact: true }).click();
    await page.getByLabel('Search tasks').fill('Account');
    await expect(page.getByText('Mobile checkout', { exact: true })).toHaveCount(0);
    await page.getByLabel('Account settings', { exact: true }).check();
    await page.getByRole('button', { name: 'Open task details' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Close task details' }).click();
    await page.getByRole('button', { name: 'Show notification' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Task notification displayed.' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Layout bug', exact: true }).click();
    await page
      .getByLabel('Preview heading')
      .fill('Synthetic heading that is deliberately far too long to fit in the broken panel');
    expect(
      await page
        .locator('.demo-broken-preview h3')
        .evaluate((el) => el.scrollWidth > el.clientWidth),
    ).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
      false,
    );
    await page.goto(`/demo/next?project=${projectId}`);
    await expect(page.getByRole('status').filter({ hasText: 'Sign in and reopen' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Report a bug', exact: true })).toHaveCount(0);
  } finally {
    await anonymous.close();
  }
});
