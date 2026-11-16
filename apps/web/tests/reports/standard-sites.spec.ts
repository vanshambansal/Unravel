import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { planIssues, type TestPlan } from '@unravel/test-plan';
const completed = new Set<string>();
let owner: BrowserContext;
let sessionPage: Page;
const root = fileURLToPath(new URL('../../../../', import.meta.url));
test.beforeAll(async ({ browser, baseURL }) => {
  test.setTimeout(120000);
  if (!process.env.E2E_CLERK_USER_EMAIL)
    throw Error('Use the approved synthetic development user.');
  await clerkSetup();
  await mkdir(`${root}.cache/standard-proof`, { recursive: true });
  owner = await browser.newContext({ baseURL });
  const page = await owner.newPage();
  sessionPage = page;
  await page.goto('/sign-in', { waitUntil: 'domcontentloaded' });
  await clerk.signIn({ page, emailAddress: process.env.E2E_CLERK_USER_EMAIL! });
  await page.goto('/app/projects', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Your projects' })).toBeVisible();
});
test.afterAll(async () => {
  await owner?.close();
});
for (const host of ['react', 'next'] as const)
  for (const scenario of ['navigation-button', 'form-click', 'form-enter', 'multi-icon'] as const)
    test(`${host}: default SDK ${scenario}`, async ({ browser, baseURL }) => {
      const visitor = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      try {
        const page = await owner.newPage();
        const siteOrigin = host === 'react' ? 'http://127.0.0.1:4194' : 'http://127.0.0.1:3017',
          appOrigin = new URL(baseURL!).origin;
        const response = await owner.request.post('/api/projects', {
          headers: { origin: appOrigin },
          data: { name: `E2E standard ${host}`, websiteUrl: siteOrigin },
        });
        const project =
          response.status() === 409
            ? (await (await owner.request.get('/api/projects')).json()).projects.find(
                (item: { origin: string }) => item.origin === siteOrigin,
              )
            : (await response.json()).project;
        expect(project?.id).toBeTruthy();
        await writeFile(
          `${root}.cache/standard-${host}-config.json`,
          JSON.stringify({ projectId: project.id, applicationOrigin: appOrigin, fixed: false }),
        );
        // Warm the Next route's compilation; no capture/SDK settings are altered.
        if (host === 'next')
          expect((await visitor.request.get(`${siteOrigin}/account`)).ok()).toBe(true);
        const site = await visitor.newPage();
        await site.goto(siteOrigin);
        await site.getByRole('button', { name: 'Report a bug', exact: true }).click();
        await site.getByRole('button', { name: 'Start recording', exact: false }).click();
        await expect(site.getByText('RECORDING', { exact: true })).toBeVisible();
        await site.getByRole('button', { name: 'Minimize bug reporter' }).click();
        if (scenario === 'navigation-button') {
          await site.getByRole('link', { name: 'Open account', exact: true }).click();
          await expect(
            site.getByRole('heading', { name: 'Account overview', exact: true }),
          ).toBeVisible();
          await site.getByRole('button', { name: 'Show details', exact: true }).click();
          await expect(site.locator('main').getByRole('status')).toContainText(
            'Details are unavailable.',
          );
        } else if (scenario === 'multi-icon') {
          await site.getByLabel('Notification channels').selectOption(['alpha', 'beta']);
          await site.getByRole('button', { name: 'Apply preferences' }).locator('svg').click();
          await expect(site.locator('main').getByRole('status')).toHaveText(
            'Preferences unavailable.',
          );
        } else {
          await site.getByLabel('Question', { exact: true }).click();
          await site
            .getByLabel('Question', { exact: true })
            .fill('STANDARD_PRIVATE_QUESTION_SENTINEL');
          await site
            .getByLabel('Private password', { exact: true })
            .fill('STANDARD_PASSWORD_SENTINEL');
          if (scenario === 'form-enter')
            await site.getByLabel('Question', { exact: true }).press('Enter');
          else await site.getByRole('button', { name: 'Send question', exact: true }).click();
          await expect(site.locator('main').getByRole('status')).toContainText(
            'Question could not be sent.',
          );
        }
        await site.getByRole('button', { name: 'Stop recording', exact: true }).click();
        await expect(site.getByLabel('Report title', { exact: true })).toBeVisible();
        await site.getByLabel('Report title', { exact: true }).fill(`E2E ${host} ${scenario}`);
        const receipt = site.waitForResponse(
          (r) => r.url().includes('/api/ingest/') && r.request().method() === 'POST',
        );
        await site.getByRole('button', { name: 'Send bug report', exact: false }).click();
        const received = await receipt;
        if (received.status() !== 201)
          await writeFile(
            `${root}.cache/standard-proof/rejected-${host}-${scenario}.json`,
            received.request().postData()!,
          );
        expect(received.status(), await received.text()).toBe(201);
        const reportId = (await received.json()).reportId;
        const envelope = received.request().postData()!;
        for (const marker of ['STANDARD_PRIVATE_QUESTION_SENTINEL', 'STANDARD_PASSWORD_SENTINEL'])
          expect(envelope).not.toContain(marker);
        const endpoint = `/api/projects/${project.id}/reports/${reportId}`;
        const draft = await (await owner.request.get(`${endpoint}/plan`)).json();
        let plan = draft.plan as TestPlan;
        expect(plan.initialPath).toBe('/');
        expect(plan.steps.every((step) => step.locator.kind !== 'unresolved')).toBe(true);
        expect(plan.steps.map((step) => step.action)).toEqual(
          scenario === 'navigation-button'
            ? ['click', 'click']
            : scenario === 'multi-icon'
              ? ['select', 'click']
              : ['fill', 'fill', 'click'],
        );
        let manualSafeValues = 0;
        await page.goto(`/app/projects/${project.id}/reports/${reportId}`, {
          waitUntil: 'domcontentloaded',
        });
        await page.getByRole('tab', { name: 'Reproduction & test plan' }).click();
        await page.getByRole('radio', { name: 'Repeat the actions', exact: true }).check();
        if (scenario === 'multi-icon') {
          manualSafeValues = 2;
          expect(plan.steps[0].values).toBeNull();
          await page.getByRole('button', { name: 'Edit step 1', exact: true }).click();
          await page.getByLabel('Step 1 selected values', { exact: true }).fill('alpha\nbeta');
          await page.getByRole('button', { name: 'Apply changes', exact: true }).click();
        } else if (scenario !== 'navigation-button') {
          for (const [index, step] of plan.steps.entries()) {
            if (step.action !== 'fill') continue;
            manualSafeValues++;
            expect(step.value).toBeNull();
            await page.getByRole('button', { name: `Edit step ${index + 1}`, exact: true }).click();
            await page
              .getByLabel(`Step ${index + 1} safe value`, { exact: true })
              .fill(index === 0 ? 'Safe synthetic question' : 'Safe synthetic password');
            await page.getByRole('button', { name: 'Apply changes', exact: true }).click();
          }
        }
        await page
          .getByRole('group', { name: 'Test workspace view' })
          .getByRole('button', { name: 'View code', exact: true })
          .click();
        await expect(
          page.getByRole('textbox', { name: 'Playwright preview', exact: true }),
        ).toBeVisible();
        const reproduction = page.waitForEvent('download');
        await page.getByRole('button', { name: 'Download Playwright', exact: true }).click();
        await (
          await reproduction
        ).saveAs(`${root}.cache/standard-proof/${host}-${scenario}-reproduction.spec.ts`);
        await expect(
          page.getByRole('heading', {
            name: 'Your file is ready. Run it in your website project.',
          }),
        ).toBeVisible();
        await page.getByRole('radio', { name: 'Verify a fix', exact: true }).check();
        await page.getByLabel('Add expected result', { exact: true }).selectOption('text');
        const label = 'Expected result 1';
        const correct =
          scenario === 'navigation-button'
            ? 'Details are ready.'
            : scenario === 'multi-icon'
              ? 'Preferences saved.'
              : 'Question received.';
        await page.getByLabel(`${label} expected text`, { exact: true }).fill(correct);
        await page.getByRole('button', { name: 'Apply changes', exact: true }).click();
        await page
          .getByLabel('I confirm these checks describe the intended correct behavior.')
          .check();
        const regression = page.waitForEvent('download');
        await page.getByRole('button', { name: 'Download Playwright', exact: true }).click();
        await (
          await regression
        ).saveAs(`${root}.cache/standard-proof/${host}-${scenario}-regression.spec.ts`);
        const saved = await (await owner.request.get(`${endpoint}/plan`)).json();
        plan = saved.plan;
        expect(planIssues(plan)).toEqual([]);
        expect(
          await readFile(
            `${root}.cache/standard-proof/${host}-${scenario}-regression.spec.ts`,
            'utf8',
          ),
        ).not.toContain('STANDARD_PRIVATE');
        await writeFile(
          `${root}.cache/standard-proof/${host}-${scenario}.json`,
          JSON.stringify({
            host,
            scenario,
            origin: siteOrigin,
            reportId,
            projectId: project.id,
            sdkDistribution:
              process.env.STANDARD_PACKED_CONSUMER === 'true'
                ? process.env.STANDARD_SDK_REGISTRY === 'true'
                  ? 'npm registry @vansham/unravel-sdk@0.1.0'
                  : 'independently installed local tarball'
                : host === 'react' && process.env.SDK_ENTRY_OVERRIDE
                  ? 'npm-installed local tarball'
                  : 'workspace package',
            manualLocatorCorrections: 0,
            manualSafeValues,
            expectedOutcomeSupplied: true,
            actions: plan.steps.map((step) => step.action),
          }),
        );
        completed.add(`${host}-${scenario}`);
      } finally {
        for (const page of owner.pages()) if (page !== sessionPage) await page.close();
        await visitor.close();
      }
    });

for (const host of ['react', 'next'] as const) {
  test(`${host}: full-content installed SDK persists values, diagnostics and replay structure`, async ({
    browser,
    baseURL,
  }) => {
    const visitor = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const review = await owner.newPage();
    try {
      const siteOrigin = host === 'react' ? 'http://127.0.0.1:4194' : 'http://127.0.0.1:3017';
      const project = (await (await owner.request.get('/api/projects')).json()).projects.find(
        (item: { origin: string }) => item.origin === siteOrigin,
      );
      expect(project?.id).toBeTruthy();
      await writeFile(
        `${root}.cache/standard-${host}-config.json`,
        JSON.stringify({
          projectId: project.id,
          applicationOrigin: new URL(baseURL!).origin,
          fixed: false,
        }),
      );
      const site = await visitor.newPage();
      await site.goto(siteOrigin);
      await site.getByRole('button', { name: 'Report a bug', exact: true }).click();
      await site.getByRole('radio', { name: /Full-content recording/ }).check();
      await site.getByRole('button', { name: 'Start recording', exact: true }).click();
      await expect(site.getByText('RECORDING', { exact: true })).toBeVisible();
      await site.getByRole('button', { name: 'Minimize bug reporter' }).click();
      await site.getByLabel('Question', { exact: true }).fill('Full-mode synthetic question');
      await site
        .getByLabel('Private password', { exact: true })
        .fill('Full-mode synthetic password');
      await site.getByRole('button', { name: 'Send question', exact: true }).click();
      await expect(site.locator('main').getByRole('status')).toHaveText(
        'Question could not be sent.',
      );
      await site.getByRole('button', { name: 'Stop recording', exact: true }).click();
      await site
        .getByLabel('Report title', { exact: true })
        .fill(`E2E ${host} full-content package`);
      const receipt = site.waitForResponse(
        (response) =>
          response.url().includes('/api/ingest/') && response.request().method() === 'POST',
      );
      await site.getByRole('button', { name: 'Send bug report', exact: true }).click();
      const response = await receipt;
      expect(response.status()).toBe(201);
      const recording = response.request().postDataJSON().recording;
      expect(recording.captureMode).toBe('full');
      expect(
        recording.events.some(
          (event: { kind: string; status?: number }) =>
            event.kind === 'network' && event.status === 500,
        ),
      ).toBe(true);
      const reportId = (await response.json()).reportId;
      await review.goto(`/app/projects/${project.id}/reports/${reportId}`);
      await expect(review.getByText('Replay ready', { exact: true })).toBeVisible();
      await review.getByLabel('Replay position').focus();
      await review.getByLabel('Replay position').press('End');
      const replay = review.frameLocator('iframe[title="Session replay"]').frameLocator('iframe');
      await expect(replay.getByRole('heading', { name: 'Support desk' })).toBeVisible();
      await expect(replay.getByLabel('Question', { exact: true })).toHaveValue(
        'Full-mode synthetic question',
      );
      await expect(replay.getByLabel('Private password', { exact: true })).toHaveValue(
        'Full-mode synthetic password',
      );
      await expect(replay.getByText('Question could not be sent.', { exact: true })).toBeVisible();
      await review.reload();
      await expect(review.getByText('Replay ready', { exact: true })).toBeVisible();
    } finally {
      await visitor.close();
      await review.close();
    }
  });
}

test('run the downloaded scripts unchanged against buggy and fixed standard websites', async () => {
  test.setTimeout(180000);
  expect(completed.size).toBe(8);
  const { stdout } = await promisify(execFile)(
    process.execPath,
    [`${root}scripts/verify-standard-generated.mjs`],
    { cwd: root, timeout: 170000 },
  );
  await test
    .info()
    .attach('actual-export-results', { body: stdout, contentType: 'application/json' });
  console.log(stdout);
});
