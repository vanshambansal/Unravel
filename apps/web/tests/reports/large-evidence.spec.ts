import { test, expect } from '@playwright/test';
import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { randomUUID } from 'node:crypto';
import { syntheticSubmission } from '../../../../tests/fixtures/submission';

test('large evidence remains bounded, selectable and recoverable across filters and mobile', async ({ browser, baseURL }) => {
  test.setTimeout(180000);
  await clerkSetup();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  const origin = new URL(baseURL!).origin, website = 'http://127.0.0.1:55778', name = `Large evidence ${randomUUID()}`;
  let project: { id: string; name: string; origin: string } | undefined;
  try {
    await page.goto('/sign-in'); await clerk.signIn({ page, emailAddress: process.env.E2E_CLERK_USER_EMAIL! });
    const created = await context.request.post('/api/projects', { headers: { origin }, data: { name, websiteUrl: website } });
    expect(created.status()).toBe(201); project = (await created.json()).project;
    const body = syntheticSubmission(project!.id, website);
    body.recording.durationMs = 200000;
    body.recording.events = Array.from({ length: 17000 }, (_, index) => ({ kind: 'navigation' as const, source: 'push' as const, at: index * 10, url: { origin: website, path: '/' } }));
    body.recording.replay.push({ type: 3, timestamp: body.recording.startedAt + 200000, data: { source: 0, texts: [{ id: 4, value: 'Synthetic end' }], attributes: [], removes: [], adds: [] } });
    const submitted = await context.request.post(`/api/ingest/${project!.id}`, { headers: { origin: website }, data: body });
    expect(submitted.status()).toBe(201); const id = (await submitted.json()).reportId;
    await page.goto(`/app/projects/${project!.id}/reports/${id}`);
    await expect(page.getByText('Replay ready', { exact: true })).toBeVisible();
    const timeline = page.getByRole('list', { name: 'Event timeline' });
    await expect(timeline.getByRole('listitem')).toHaveCount(100);
    await page.getByRole('combobox', { name: 'Event page', exact: true }).selectOption('170');
    await timeline.getByRole('button').last().click();
    await expect(page.getByTestId('replay-time')).toContainText('169.99s');
    await expect(page.getByRole('button', { name: 'Next events', exact: true })).toBeDisabled();
    const filters = page.getByRole('group', { name: 'Filter evidence' });
    await filters.getByRole('button', { name: 'Network', exact: true }).click();
    await expect(timeline.getByRole('listitem')).toHaveCount(0);
    await filters.getByRole('button', { name: 'All', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Event page', exact: true })).toHaveValue('170');
    await page.setViewportSize({ width: 390, height: 844 });
    const cdp = await context.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
    await page.getByRole('combobox', { name: 'Event page', exact: true }).selectOption('1');
    await page.getByRole('button', { name: 'Next events', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Event page', exact: true })).toHaveValue('2');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally {
    if (project) expect((await context.request.delete(`/api/projects/${project.id}`, { headers: { origin }, data: { confirmation: name, expected: { name: project.name, origin: project.origin } } })).ok()).toBe(true);
    await context.close();
  }
});
