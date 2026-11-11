import { expect, test } from '@playwright/test';
import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';

test.beforeAll(async () => {
  if (!process.env.CLERK_SECRET_KEY?.startsWith('sk_test_') || !process.env.E2E_CLERK_USER_EMAIL || !process.env.E2E_CLERK_OTHER_EMAIL) throw new Error('Use the existing development app and two approved synthetic users.');
  await clerkSetup();
});

test('project lifecycle: real widget submission, settings, origins, stale edits and confirmed cascade deletion', async ({ browser, baseURL }, testInfo) => {
  const owner = await browser.newContext({ baseURL, viewport: { width: 1440, height: 1000 } });
  const other = await browser.newContext({ baseURL });
  const visitor = await browser.newContext();
  const ids: string[] = [], origin = new URL(baseURL!).origin;
  try {
    const page = await owner.newPage(), foreign = await other.newPage();
    for (const [p, email] of [[page, process.env.E2E_CLERK_USER_EMAIL!], [foreign, process.env.E2E_CLERK_OTHER_EMAIL!]] as const) {
      await p.goto('/sign-in'); await clerk.signIn({ page: p, emailAddress: email });
    }
    // A fresh project/owner-origin is needed; leave existing fixture registrations intact.
    const site = `http://127.0.0.1:4187`, name = `E2E management ${randomUUID().slice(0, 8)}`;
    await page.goto('/app/projects/new');
    await page.getByLabel('Project name').fill(name); await page.getByLabel('Website address').fill(site);
    await page.getByRole('button', { name: 'Create project', exact: true }).click();
    await expect(page).toHaveURL(/\/setup$/); const id = page.url().split('/').at(-2)!; ids.push(id);
    await mkdir('../../.playwright-mcp', { recursive: true });
    await page.goto(`/app/projects/${id}/reports`);
    await expect(page.getByRole('heading', { name: 'Record the sequence behind a failure.' })).toBeVisible();
    await page.screenshot({ path: '../../.playwright-mcp/composition-empty-reports.png', fullPage: true });
    await page.goto('/app/projects');
    await expect(page.getByRole('heading', { name: 'Your projects' })).toBeVisible();
    await page.screenshot({ path: '../../.playwright-mcp/composition-projects.png', fullPage: true });
    await page.goto(`/app/projects/${id}/setup`);
    // Use a temporary fixture on its own origin, not the retained 4185 registration.
    const target = await visitor.newPage();
    await target.goto('http://127.0.0.1:4187');
    // Explicit harness override; real visitors get developer-side configuration.
    await expect(target.locator('#widget-configuration')).toHaveCount(0);
    await target.goto(`http://127.0.0.1:4187/?projectId=${id}&applicationOrigin=${encodeURIComponent(origin)}`);
    await target.getByRole('button', { name: 'Report a bug', exact: true }).click();
    await target.getByRole('button', { name: 'Start recording', exact: false }).click();
    await expect(target.getByText('RECORDING', { exact: true })).toBeVisible();
    await target.getByRole('button', { name: 'Minimize bug reporter' }).click();
    await target.locator('#question').fill('Synthetic project lifecycle question'); await target.locator('#submit-question').click();
    await expect(target.locator('#feedback')).toContainText('could not submit');
    await target.getByRole('button', { name: 'Stop recording', exact: true }).click();
    await target.getByRole('button', { name: 'Report a bug', exact: true }).click();
    await target.getByLabel('Report title', { exact: true }).fill('E2E management report');
    const submitted = target.waitForResponse(r => r.url().includes('/api/ingest/') && r.request().method() === 'POST');
    await target.getByRole('button', { name: 'Send bug report', exact: false }).click();
    const receipt = await submitted; expect(receipt.status()).toBe(201); const reportId = (await receipt.json()).reportId;
    const body = receipt.request().postDataJSON();
    await page.reload(); await expect(page.locator('#workspace-content').getByText('Report received — open Reports to investigate')).toBeVisible();
    await page.getByRole('navigation', { name: 'Workspace', exact: true }).getByRole('link', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Project settings' })).toBeVisible();
    // Real composed layout: ordinary laptop, desktop and narrow phone; no fake settings data.
    await mkdir('../../.playwright-mcp', { recursive: true });
    for (const viewport of [{ width: 1366, height: 768 }, { width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 640 }]) {
      await page.setViewportSize(viewport);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page.locator('.product-account button').first()).toBeVisible();
      await page.screenshot({ path: `../../.playwright-mcp/composition-settings-${viewport.width}.png`, fullPage: true });
    }
    await page.getByRole('button', { name: 'Delete project', exact: true }).click();
    const deletion = page.getByRole('dialog');
    await expect(deletion.getByRole('button', { name: 'Permanently delete project' })).toBeDisabled();
    await expect(deletion.getByRole('button', { name: 'Cancel' })).toBeInViewport();
    await page.screenshot({ path: '../../.playwright-mcp/composition-delete-mobile.png' });
    await page.keyboard.press('Escape'); await expect(deletion).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete project', exact: true })).toBeFocused();
    await page.setViewportSize({ width: 1440, height: 900 });
    const saved = (await (await owner.request.get(`/api/projects/${id}`)).json()).project;
    const expected = { name: saved.name, origin: saved.origin }, api = `/api/projects/${id}`;
    for (const method of ['PATCH', 'DELETE']) {
      expect((await other.request.fetch(api, { method, headers: { origin }, data: { name: 'Denied', websiteUrl: site, expected, confirmation: name } })).status()).toBe(404);
      expect((await owner.request.fetch(api, { method, headers: { origin: 'https://foreign.example' }, data: { expected, confirmation: name } })).status()).toBe(403);
    }
    expect((await owner.request.delete(api, { headers: { origin }, data: { expected, confirmation: 'wrong' } })).status()).toBe(422);
    await foreign.goto(`/app/projects/${id}/settings`); await expect(foreign.getByRole('heading', { name: 'Project not found' })).toBeVisible();
    await page.getByLabel('Project name', { exact: true }).fill(`${name} renamed`);
    await page.route(`**/api/projects/${id}`, r => r.request().method() === 'PATCH' ? r.abort() : r.continue());
    await page.getByRole('button', { name: 'Save changes' }).click(); await expect(page.locator('.project-settings [role=alert]')).toContainText('Could not reach');
    await expect(page.getByLabel('Project name', { exact: true })).toHaveValue(`${name} renamed`); await page.unroute(`**/api/projects/${id}`);
    await page.getByRole('button', { name: 'Save changes' }).click(); await expect(page.locator('.settings-message')).toHaveText('Project settings saved.');
    await page.reload(); await expect(page.getByLabel('Project name', { exact: true })).toHaveValue(`${name} renamed`);
    await page.getByLabel('Website address').fill('localhost:4188/questions'); await page.getByRole('button', { name: 'Save changes' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click(); expect((await (await owner.request.get(api)).json()).project.origin).toBe(site);
    await page.getByRole('button', { name: 'Save changes' }).click(); await page.getByRole('button', { name: 'Confirm origin change' }).click(); await expect(page.locator('.settings-message')).toHaveText('Project settings saved.');
    expect((await owner.request.post(`/api/ingest/${id}`, { headers: { origin: site }, data: body })).status()).toBe(403);
    const newOrigin = 'http://localhost:4188'; body.recording.id = randomUUID(); body.recording.initialUrl.origin = newOrigin;
    expect((await owner.request.post(`/api/ingest/${id}`, { headers: { origin: newOrigin }, data: body })).status()).toBe(201);
    const detail = await (await owner.request.get(`${api}/reports/${reportId}`)).json();
    expect(detail.report.recording.initialUrl.origin).toBe(site);
    await page.setViewportSize({ width: 390, height: 844 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await mkdir('../../.playwright-mcp', { recursive: true }); await page.screenshot({ path: '../../.playwright-mcp/project-settings-mobile.png', fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1000 }); await page.screenshot({ path: '../../.playwright-mcp/project-settings-desktop.png', fullPage: true });
    // Concurrent editor must not overwrite a newer name.
    const latest = (await (await owner.request.get(api)).json()).project;
    const renamed = `${name} newest`;
    expect((await owner.request.patch(api, { headers: { origin }, data: { name: renamed, websiteUrl: latest.origin, expected: { name: latest.name, origin: latest.origin } } })).status()).toBe(200);
    await page.getByLabel('Project name', { exact: true }).fill('Stale overwrite'); await page.getByRole('button', { name: 'Save changes' }).click(); await expect(page.locator('.project-settings [role=alert]')).toContainText('changed');
    await page.getByRole('button', { name: 'Reload latest settings' }).click(); await expect(page.getByLabel('Project name', { exact: true })).toHaveValue(renamed);
    await page.getByRole('button', { name: 'Delete project', exact: true }).click(); await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click(); expect((await owner.request.get(api)).status()).toBe(200);
    await page.getByRole('button', { name: 'Delete project', exact: true }).click(); const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('button', { name: 'Permanently delete project' })).toBeDisabled(); await dialog.getByLabel(`Type ${renamed} to confirm`).fill(renamed);
    await page.route(`**/api/projects/${id}`, r => r.request().method() === 'DELETE' ? r.abort() : r.continue());
    await dialog.getByRole('button', { name: 'Permanently delete project' }).click(); await expect(page.locator('.project-settings [role=alert]')).toContainText('Could not reach'); await page.unroute(`**/api/projects/${id}`);
    expect((await owner.request.get(api)).status()).toBe(200);
    await page.getByRole('button', { name: 'Delete project', exact: true }).click(); await dialog.getByLabel(`Type ${renamed} to confirm`).fill(renamed); await dialog.getByRole('button', { name: 'Permanently delete project' }).click();
    await expect(page).toHaveURL(/\/app\/projects$/); expect((await owner.request.get(api)).status()).toBe(404);
    expect((await owner.request.get(`${api}/reports/${reportId}/replay`)).status()).toBe(404);
    expect((await owner.request.delete(api, { headers: { origin }, data: { expected: { name: renamed, origin: newOrigin }, confirmation: renamed } })).status()).toBe(404);
    const anonymous = await visitor.request.patch(api, { headers: { origin }, data: {} }); expect(anonymous.status()).toBe(401);
  } finally {
    testInfo.setTimeout(testInfo.timeout + 15000);
    for (const id of ids) {
      const response = await owner.request.get(`/api/projects/${id}`);
      if (response.ok()) { const { project } = await response.json(); const deleted = await owner.request.delete(`/api/projects/${id}`, { headers: { origin }, data: { expected: { name: project.name, origin: project.origin }, confirmation: project.name } }); expect(deleted.status()).toBe(204); }
    }
    await owner.close(); await other.close(); await visitor.close();
  }
});

test('missing configuration and SDK failures stay developer diagnostics, never visitor setup', async ({ page }) => {
  const diagnostics: string[] = []; page.on('console', message => diagnostics.push(message.text()));
  await page.route('**/unravel.js', route => route.abort());
  await page.goto('http://127.0.0.1:4187');
  await expect(page.locator('#widget-configuration')).toHaveCount(0);
  await expect(page.getByLabel('Your question', {exact:true})).toBeVisible();
  await expect.poll(() => diagnostics.some(message => message.includes('SDK did not load'))).toBe(true);
  await page.unroute('**/unravel.js'); await page.goto('http://127.0.0.1:4187/?projectId=invalid&applicationOrigin=http%3A%2F%2Flocalhost%3A3000');
  await expect.poll(() => diagnostics.some(message => message.includes('invalid public project ID'))).toBe(true);
  await expect(page.locator('[data-unravel-widget]')).toHaveCount(0);
  await expect(page.locator('#fixture-setup')).toHaveCount(0);
});
