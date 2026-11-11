import { test, expect } from '@playwright/test';
import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import type { Recorder } from '@unravel/sdk';
declare global { interface Window { fixtureRecorder: Recorder } }

test.beforeAll(async () => {
  if (!process.env.CLERK_SECRET_KEY?.startsWith('sk_test_') || !process.env.E2E_CLERK_USER_EMAIL || !process.env.E2E_CLERK_OTHER_EMAIL) throw new Error('Configure the existing development Clerk app and its two synthetic test users.');
  await clerkSetup();
});

test('record → response-loss retry → private persisted replay → seek → owner deletion', async ({ browser, baseURL }) => {
  const a = await browser.newContext({ baseURL, viewport: { width: 1440, height: 1000 } });
  const b = await browser.newContext({ baseURL });
  const visitor = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  try {
    const owner = await a.newPage(), other = await b.newPage();
    for (const [page, email] of [[owner, process.env.E2E_CLERK_USER_EMAIL!], [other, process.env.E2E_CLERK_OTHER_EMAIL!]] as const) {
      await page.goto('/sign-in'); await clerk.signIn({ page, emailAddress: email });
      await page.goto('/app/projects'); await expect(page.getByRole('heading', { name: 'Your projects' })).toBeVisible();
    }
    const origin = new URL(baseURL!).origin, fixtureOrigin = 'http://127.0.0.1:4185';
    const created = await a.request.post('/api/projects', { headers: { origin }, data: { name: `E2E reports ${randomUUID()}`, websiteUrl: fixtureOrigin } });
    let project;
    if (created.status() === 409) { const list = await (await a.request.get('/api/projects')).json(); project = list.projects.find((p: { origin: string }) => p.origin === fixtureOrigin); }
    else { expect(created.status()).toBe(201); project = (await created.json()).project; }
    expect(project).toBeTruthy();
    const page = await visitor.newPage(); await page.goto(fixtureOrigin + "/?debug=1");
    await page.getByText('Connect a registered project', { exact: true }).click();
    await page.locator('#sdk-project').fill(project.id); await page.locator('#sdk-origin').fill(origin);
    await page.locator('#record-configure').click(); await expect(page.locator('#submission-status')).toContainText('Project configured');
    await page.locator('#record-start').click(); await expect(page.locator('#record-status')).toContainText('recording —');
    await page.locator('#question').fill('Synthetic replay question'); await page.locator('#category').selectOption('technical');
    await page.locator('#private-value').fill('PRIVATE_REPORT_PASSWORD_SENTINEL');
    // Deliberate fixture dwell gives playback a measurable interval, rather than an instantaneous recording.
    await page.waitForTimeout(700);
    await page.locator('#submit-question').click(); await expect(page.locator('#feedback')).toContainText('could not submit');
    await page.getByText('Additional diagnostic check', { exact: true }).click(); await page.locator('#trigger-error').click();
    await page.locator('#record-stop').click();
    const title = `Synthetic HTTP failure ${randomUUID()}`; await page.locator('#report-title').fill(title);
    let lost = false;
    await page.route('**/api/ingest/*', async route => {
      if (route.request().method() !== 'POST' || lost) { await route.continue(); return; }
      expect(route.request().headers().cookie).toBeUndefined();
      const response = await route.fetch(); expect(response.status()).toBe(201); lost = true; await route.abort('failed');
    });
    await page.locator('#report-submit').click(); await expect(page.locator('#submission-status')).toContainText('Retry');
    await page.locator('#report-submit').click(); await expect(page.locator('#submission-status')).toContainText('Report saved:');
    const receipt = await page.evaluate(() => window.fixtureRecorder.getSubmissionStatus());
    const reportId = receipt.reportId; expect(reportId).toMatch(/^[0-9a-f-]{36}$/);
    const listResponse = await a.request.get(`/api/projects/${project.id}/reports`); expect(listResponse.status()).toBe(200);
    const list = await listResponse.json(); expect(list.reports.filter((r: { title: string }) => r.title === title)).toHaveLength(1);
    expect(JSON.stringify(list)).not.toContain('childNodes'); expect(JSON.stringify(list)).not.toContain('PRIVATE_REPORT');
    const reportPath = `/api/projects/${project.id}/reports/${reportId}`;
    for (const suffix of ['', '/replay']) {
      expect((await b.request.get(reportPath + suffix)).status()).toBe(404);
      expect((await visitor.request.get(origin + reportPath + suffix)).status()).toBe(401);
    }
    expect((await b.request.delete(reportPath, { headers: { origin } })).status()).toBe(404);
    expect((await a.request.delete(reportPath, { headers: { origin: 'https://foreign.example' } })).status()).toBe(403);
    const recording = await page.evaluate(() => window.fixtureRecorder.getRecording());
    const ingest = `/api/ingest/${project.id}`;
    const body = { version: 1, title, description: '', recording };
    expect((await a.request.post(ingest, { headers: { origin: fixtureOrigin }, data: body })).status()).toBe(200);
    expect((await a.request.post(ingest, { headers: { origin: fixtureOrigin }, data: { ...body, title: 'Changed title' } })).status()).toBe(409);
    expect((await a.request.post(ingest, { headers: { origin: 'https://wrong.example' }, data: body })).status()).toBe(403);
    expect((await a.request.post(`/api/ingest/${randomUUID()}`, { headers: { origin: fixtureOrigin }, data: body })).status()).toBe(403);
    expect((await a.request.post(ingest, { headers: { origin: fixtureOrigin }, data: { ...body, recording: {} } })).status()).toBe(422);
    expect((await a.request.post(ingest, { headers: { origin: fixtureOrigin, 'Content-Type': 'application/json' }, data: JSON.stringify({ ...body, extra: 'x'.repeat(5_000_001) }) })).status()).toBe(413);
    const detail = await (await a.request.get(reportPath)).json();
    const network = detail.events.find((event: { kind: string; status?: number }) => event.kind === 'network' && event.status === 500); expect(network).toBeTruthy();
    const replay = await (await a.request.get(reportPath + '/replay')).json();
    expect(JSON.stringify(replay)).not.toContain('PRIVATE_REPORT'); expect(JSON.stringify(replay)).not.toContain('styles.css');
    const external: string[] = [];
    owner.on('request', request => { if (request.url().startsWith(fixtureOrigin) || request.url().includes('external-replay-test.example')) external.push(request.url()); });
    await owner.goto(`/app/projects/${project.id}/reports/${reportId}`);
    await expect(owner.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await expect(owner.getByText('Replay ready', { exact: true })).toBeVisible();
    const frame = owner.frameLocator('iframe[title="Session replay"]');
    await expect(frame.frameLocator('iframe').locator('body')).toContainText('Submit question');
    // Measure the actual input-to-player acknowledgement, not Playwright polling/transport overhead.
    await owner.evaluate(() => {
      const measure = {started: 0, elapsed: -1};
      Object.assign(window, {seekMeasurement: measure});
      document.addEventListener('click', () => {measure.started=performance.now();}, {once:true,capture:true});
      const receive=(event:MessageEvent)=>{if(event.origin==='http://127.0.0.1:4191'&&event.data?.type==='seeked'&&measure.started){measure.elapsed=performance.now()-measure.started;window.removeEventListener('message',receive);}};
      window.addEventListener('message',receive);
    });
    await owner.getByRole('button', { name: /network.*POST.*api\/questions.*500/ }).click();
    await expect.poll(async () => Math.abs(Number(await owner.locator('.report-player').getAttribute('data-replay-time')) - network.at)).toBeLessThanOrEqual(500);
    await expect.poll(()=>owner.evaluate(()=>(window as unknown as {seekMeasurement:{elapsed:number}}).seekMeasurement.elapsed)).toBeGreaterThanOrEqual(0);
    expect(await owner.evaluate(()=>(window as unknown as {seekMeasurement:{elapsed:number}}).seekMeasurement.elapsed)).toBeLessThanOrEqual(500);
    // Fetch resolves before application feedback mutates. Inspect the end state separately.
    await owner.getByLabel('Replay position').focus(); await owner.getByLabel('Replay position').press('End');
    await expect(frame.frameLocator('iframe').locator('body')).toContainText('could not submit');
    await expect(frame.frameLocator('iframe').locator('textarea')).toHaveValue('Synthetic replay question');
    await owner.getByLabel('Replay position').press('Home');
    await owner.getByRole('button', { name: 'Play replay', exact: true }).click();
    await expect.poll(async () => parseFloat((await owner.getByTestId('replay-time').textContent())!)).toBeGreaterThan(0.1);
    await owner.getByRole('button', { name: 'Pause replay', exact: true }).click();
    expect(external).toEqual([]);
    expect(await owner.locator('iframe[title="Session replay"]').getAttribute('sandbox')).toBe('allow-scripts allow-same-origin');
    expect(new URL((await owner.locator('iframe[title="Session replay"]').getAttribute('src'))!).origin).not.toBe(origin);
    expect(await frame.locator('iframe').getAttribute('sandbox')).toBe('allow-same-origin');
    await mkdir('../../.playwright-mcp', { recursive: true });
    await owner.evaluate(() => window.scrollTo(0,0));
    await owner.screenshot({ path: '../../.playwright-mcp/m4-report-desktop.png', fullPage: true });
    await owner.setViewportSize({ width: 390, height: 844 }); expect(await owner.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await owner.getByRole('button', { name: '100% size', exact: true }).click();
    const playerAddress = await owner.locator('iframe[title="Session replay"]').getAttribute('src');
    const hostFrame = owner.frames().find(item => item.url() === playerAddress)!;
    await expect.poll(() => hostFrame.evaluate(() => document.documentElement.style.overflow)).toBe('auto');
    await owner.getByRole('button', { name: 'Fit recording', exact: true }).click();
    await expect.poll(() => hostFrame.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
    await expect.poll(() => hostFrame.evaluate(() => scrollX + scrollY)).toBe(0);
    await expect(frame.frameLocator('iframe').locator('textarea')).toBeInViewport();
    await owner.evaluate(() => window.scrollTo(0,0));
    await owner.screenshot({ path: '../../.playwright-mcp/m4-report-mobile.png', fullPage: true });
    await owner.reload(); await expect(owner.getByText('Replay ready', { exact: true })).toBeVisible();
    // Retain one clearly labelled synthetic report for an actual server-restart proof.
    const retainedBody = structuredClone(body) as { title: string; recording: { id: string } }; retainedBody.title = `E2E restart proof ${randomUUID()}`; retainedBody.recording.id = randomUUID();
    const retained = await a.request.post(ingest, { headers: { origin: fixtureOrigin }, data: retainedBody }); expect(retained.status()).toBe(201);
    await mkdir('../../.cache', { recursive: true }); await writeFile('../../.cache/m4-restart-proof.json', JSON.stringify({ projectId: project.id, reportId: (await retained.json()).reportId, title: retainedBody.title }));
    await owner.getByRole('button', { name: 'Delete report', exact: true }).click(); await owner.getByRole('button', { name: 'Confirm delete', exact: true }).click();
    await expect(owner.getByRole('heading', { name: 'Bug reports', exact: true })).toBeVisible();
    expect((await a.request.get(reportPath)).status()).toBe(404); expect((await a.request.get(reportPath + '/replay')).status()).toBe(404);
  } finally { await visitor.close(); await b.close(); await a.close(); }
});
