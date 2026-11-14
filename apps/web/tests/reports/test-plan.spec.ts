import { test, expect } from '@playwright/test';
import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import type { TestPlan } from '@unravel/test-plan';

test.use({actionTimeout:15000,navigationTimeout:30000});

test.beforeAll(async () => { if (!process.env.CLERK_SECRET_KEY?.startsWith('sk_test_') || !process.env.E2E_CLERK_USER_EMAIL || !process.env.E2E_CLERK_OTHER_EMAIL) throw new Error('Use existing development credentials and the two approved synthetic users.'); await clerkSetup(); });

test('fresh styled recording → reviewed persisted plan → standalone Playwright export', async ({ browser, baseURL }) => {
  // This walkthrough covers edits, downloads, failed saves, conflicts and recovery.
  // Keep individual action/expect deadlines; allow the complete journey enough time.
  test.setTimeout(300000);
  const developer = await browser.newContext({ baseURL, viewport: { width: 1440, height: 1000 } }), other = await browser.newContext({ baseURL }), visitor = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  let review:import('@playwright/test').BrowserContext|undefined;
  let reviewPage:import('@playwright/test').Page|undefined;
  try {
    let page = await developer.newPage(); const b = await other.newPage();
    for (const [p, email] of [[page, process.env.E2E_CLERK_USER_EMAIL!], [b, process.env.E2E_CLERK_OTHER_EMAIL!]] as const) { await p.goto('/sign-in', { waitUntil: 'domcontentloaded' }); await clerk.signIn({ page: p, emailAddress: email }); }
    console.log('[generator] authenticated');
    const origin = new URL(baseURL!).origin, fixture = 'http://127.0.0.1:4185';
    const creation = await developer.request.post('/api/projects', { headers: { origin }, data: { name: 'E2E regression pipeline', websiteUrl: fixture } });
    const project = creation.status() === 409 ? (await (await developer.request.get('/api/projects')).json()).projects.find((p: { origin: string }) => p.origin === fixture) : (await creation.json()).project;
    const site = await visitor.newPage(); await site.goto(`${fixture}/?projectId=${project.id}&applicationOrigin=${encodeURIComponent(origin)}`, { waitUntil: 'domcontentloaded' });
    await site.locator('#private-value').evaluate(element => { element.style.width = '123.12345px'; });
    await site.getByRole('button', { name: 'Report a bug', exact: true }).click(); await site.getByRole('button', { name: 'Start recording', exact: false }).click(); await expect(site.getByText('RECORDING', { exact: true })).toBeVisible();
    await site.getByRole('button', { name: 'Minimize bug reporter' }).click(); await site.locator('#question').fill('Synthetic regression question'); await site.locator('#category').selectOption('technical'); await site.locator('#private-value').fill('PLAN_PRIVATE_SENTINEL');
    await site.locator('#submit-question').click(); await expect(site.locator('#feedback')).toContainText('could not submit'); await site.locator('details').filter({has:site.locator('#trigger-error')}).locator('summary').click(); await site.locator('#trigger-error').click(); await site.getByRole('button', { name: 'Stop recording', exact: true }).click(); await expect(site.getByLabel('Report title', { exact: true })).toBeVisible(); await site.getByLabel('Report title', { exact: true }).fill('E2E styled replay and regression plan');
    const submitted = site.waitForResponse(r => r.url().includes('/api/ingest/') && r.request().method() === 'POST'); await site.getByRole('button', { name: 'Send bug report', exact: false }).click(); const receipt = await submitted; expect(receipt.status()).toBe(201); const reportId = (await receipt.json()).reportId;
    console.log('[generator] submitted');
    const endpoint = `/api/projects/${project.id}/reports/${reportId}`;
    // Optional video records only authenticated product review, after sign-in.
    review=await browser.newContext({baseURL,storageState:await developer.storageState(),viewport:{width:1440,height:1000},recordVideo:process.env.GENERATOR_VIDEO==='1'?{dir:'../../.playwright-mcp/generator-demo',size:{width:1280,height:900}}:undefined});await page.close();page=await review.newPage();reviewPage=page;
    await page.goto(`/app/projects/${project.id}/reports/${reportId}`, { waitUntil: 'domcontentloaded' }); await expect(page.getByText('Replay ready', { exact: true })).toBeVisible();
    await page.getByLabel('Replay position').focus(); await page.getByLabel('Replay position').press('End');
    const replay = page.frameLocator('iframe[title="Session replay"]').frameLocator('iframe');
    await expect(replay.locator('main')).toHaveCSS('max-width', '680px'); await expect(replay.locator('section').first()).toHaveCSS('border-radius', '12px'); await expect(replay.locator('#feedback')).toHaveCount(0); // arbitrary original IDs stay omitted
    await expect(replay.getByRole('heading', { name: 'Question desk', exact: true })).toBeVisible(); await expect(replay.getByRole('textbox').first()).toHaveValue('[redacted]');
    await expect(replay.locator('html')).toHaveCSS('background-color', 'rgb(243, 245, 247)');
    const payload = await (await review.request.get(`${endpoint}/replay`)).text(); expect(payload).not.toContain('PLAN_PRIVATE_SENTINEL'); expect(payload).not.toContain('background-image');
    await mkdir('../../.playwright-mcp', { recursive: true }); await page.evaluate(() => scrollTo(0,0)); await page.screenshot({ path: '../../.playwright-mcp/styled-replay-desktop.png', fullPage: true });
    expect((await other.request.get(`${endpoint}/plan`)).status()).toBe(404); expect((await other.request.get(`${endpoint}/export`)).status()).toBe(404); expect((await visitor.request.get(`${endpoint}/plan`)).status()).toBe(401);
    console.log('[generator] replay and isolation inspected');
    const draftResponse = await review.request.get(`${endpoint}/plan`); expect(draftResponse.status(), await draftResponse.text()).toBe(200); const draft = await draftResponse.json(); expect(draft.revision).toBe(0); expect(draft.plan.assertions).toHaveLength(0); expect(draft.plan.expectedBehaviorConfirmed).toBe(false);
    expect((await other.request.put(`${endpoint}/plan`, { headers: { origin }, data: { plan: draft.plan, revision: 0 } })).status()).toBe(404);
    expect((await review.request.get(`${endpoint}/export`)).status()).toBe(422);
    expect((await review.request.put(`${endpoint}/plan`, { headers: { origin: 'https://foreign.example' }, data: { plan: draft.plan, revision: 0 } })).status()).toBe(403);
    expect((await review.request.put(`${endpoint}/plan`, { headers: { origin }, data: { plan: { ...draft.plan, arbitraryJavaScript: 'alert(1)' }, revision: 0 } })).status()).toBe(422);
    await page.getByRole('tab',{name:'Reproduction & test plan'}).click();
    await expect(page.getByText('Steps generated from the recording',{exact:true})).toBeVisible();
    await expect(page.getByRole('region',{name:'Expected results'})).toHaveCount(0);
    console.log('[generator] private plan API verified');
    const plan=draft.plan as TestPlan, fillIndex=plan.steps.findIndex(step=>step.action==='fill');expect(fillIndex).toBeGreaterThanOrEqual(0);
    // Diagnostic controls were recorded too. Remove only these from the test, retain original evidence.
    const diagnosticSteps=plan.steps.map((step,index)=>({step,index})).filter(({step})=>step.locator.kind==='css');
    expect(diagnosticSteps.length).toBeGreaterThanOrEqual(2);
    for(const {index} of diagnosticSteps)await page.getByRole('button',{name:`Remove step ${index+1}`,exact:true}).click();
    await page.getByText(`Removed actions (${diagnosticSteps.length})`,{exact:true}).click();
    const removed=page.locator('.generator-excluded');await expect(removed.getByRole('button',{name:'Restore',exact:true})).toHaveCount(diagnosticSteps.length);
    await removed.getByRole('button',{name:'Restore',exact:true}).first().click();await page.getByRole('button',{name:'Undo',exact:true}).click();
    await page.getByRole('button',{name:'Redo',exact:true}).click();await page.getByRole('button',{name:`Remove step ${diagnosticSteps[0].index+1}`,exact:true}).click();
    // Masked recordings require developer-supplied safe selection values too.
    for (const [index, step] of plan.steps.entries()) {
      if (step.action !== 'select') continue;
      await page.getByRole('button', { name: `Edit step ${index+1}`, exact: true }).click();
      await page.getByLabel(`Step ${index+1} safe value`, { exact: true }).fill('technical');
      await page.getByRole('button', { name: 'Apply changes', exact: true }).click();
    }
    // New rows and edits are staged. Cancel is a real cancellation.
    const rowCount=await page.locator('.generator-step').count();await page.getByRole('button',{name:'Add action',exact:true}).click();await page.getByRole('button',{name:'Cancel',exact:true}).click();expect(await page.locator('.generator-step').count()).toBe(rowCount);
    await page.getByRole('button',{name:`Edit step ${fillIndex+1}`,exact:true}).click();await page.getByLabel(`Step ${fillIndex+1} safe value`,{exact:true}).fill('CANCEL THIS VALUE');await page.getByRole('button',{name:'Cancel',exact:true}).click();await expect(page.locator('.generator-step-list')).not.toContainText('CANCEL THIS VALUE');
    await page.getByRole('button',{name:`Edit step ${fillIndex+1}`,exact:true}).click();await page.getByLabel(`Step ${fillIndex+1} safe value`,{exact:true}).fill('Safe edited regression question');await page.getByRole('button',{name:'Apply changes',exact:true}).click();
    // Dirty in-app navigation is stopped; Keep editing retains the current plan.
    await page.getByRole('link',{name:'All reports',exact:false}).click();const leave=page.getByRole('dialog');await expect(leave).toContainText('Keep your changes before leaving');await leave.getByRole('button',{name:'Keep editing',exact:true}).click();await expect(page).toHaveURL(new RegExp(reportId));
    let warned=false;const dismiss=async(dialog:import('@playwright/test').Dialog)=>{warned=dialog.type()==='beforeunload';await dialog.dismiss();};page.on('dialog',dismiss);await page.reload({timeout:5000}).catch(()=>{});page.off('dialog',dismiss);expect(warned).toBe(true);await expect(page.locator('.generator-step-list')).toContainText('Safe edited regression question');
    // Undo and reset remain reversible.
    await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(page.locator('.generator-step-list')).not.toContainText('Safe edited regression question');await page.getByRole('button',{name:'Redo',exact:true}).click();
    const viewCode=()=>page.getByRole('group',{name:'Test workspace view'}).getByRole('button',{name:'View code',exact:true});await viewCode().click();const preview=page.getByRole('textbox',{name:'Playwright preview',exact:true});await expect(preview).toHaveAttribute('contenteditable','false');await expect(page.locator('.cm-lineNumbers')).toBeVisible();
    const repro=page.waitForEvent('download');await page.getByRole('button',{name:'Download Playwright',exact:true}).click();const reproduction=await repro;const code=await readFile((await reproduction.path())!,'utf8');expect(code).toContain('Reproduction only');expect(code).not.toContain('toHaveText');
    await mkdir('../../.cache/regression-proof',{recursive:true});await writeFile('../../.cache/regression-proof/reproduction.spec.ts',code);await expect(page.getByRole('heading',{name:'Your file is ready. Run it in your website project.'})).toBeVisible();await expect(page.getByLabel('Website to test',{exact:true})).toHaveValue(fixture);
    const saved=await(await review.request.get(`${endpoint}/plan`)).json();expect(saved.revision).toBe(1);for(const {index}of diagnosticSteps)expect(saved.plan.steps[index].included).toBe(false);
    expect((await review.request.put(`${endpoint}/plan`,{headers:{origin},data:{plan:draft.plan,revision:0}})).status()).toBe(409);
    expect((await review.request.get(`${endpoint}/export?mode=invalid`)).status()).toBe(422);expect((await other.request.get(`${endpoint}/export?mode=reproduction`)).status()).toBe(404);
    // Malformed CSS is rejected in the UI and by direct export, not labelled ready.
    await page.getByRole('button',{name:'Review steps',exact:true}).click();await page.getByRole('button',{name:`Edit step ${fillIndex+1}`,exact:true}).click();await page.getByLabel(`Step ${fillIndex+1} locator type`,{exact:true}).selectOption('css');await page.getByLabel(`Step ${fillIndex+1} locator`,{exact:true}).fill('[');await page.getByRole('button',{name:'Apply changes',exact:true}).click();await viewCode().click();await expect(page.getByRole('button',{name:'Download Playwright',exact:true})).toBeDisabled();await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(preview).toBeVisible();
    // One code workspace; editable JSON is applied explicitly, generated Playwright is read-only.
    await page.getByRole('button',{name:'JSON',exact:true}).click();const json=page.getByRole('textbox',{name:'JSON test plan',exact:true});await json.click();await json.press('Control+A');await json.pressSequentially('{invalid');await page.getByRole('button',{name:'Apply JSON',exact:true}).click();await expect(page.locator('.test-generator').getByRole('alert')).toContainText('JSON is invalid');await page.getByRole('button',{name:'Discard JSON edits',exact:true}).click();await page.getByRole('button',{name:'Playwright',exact:true}).click();
    await page.getByRole('radio',{name:'Verify a fix',exact:true}).check();await page.getByLabel('Add expected result',{exact:true}).selectOption('text');await page.getByLabel('Expected result 1 expected text',{exact:true}).fill('Your question was submitted successfully.');await page.getByText('Choose a specific element',{exact:true}).click();await page.getByLabel('Expected result 1 locator type',{exact:true}).selectOption('css');await page.getByLabel('Expected result 1 locator',{exact:true}).fill('#feedback');await page.getByRole('button',{name:'Apply changes',exact:true}).click();await page.getByLabel('I confirm these checks describe the intended correct behavior.').check();
    const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Download Playwright',exact:true}).click();await(await downloaded).saveAs('../../.cache/regression-proof/generated.spec.ts');const immutable=await(await review.request.get(`${endpoint}/replay`)).text();expect(immutable).toBe(payload);
    await page.reload();await page.getByRole('tab',{name:'Reproduction & test plan'}).click();await expect(page.getByText('Saved draft loaded',{exact:true})).toBeVisible();await expect(page.getByLabel('I confirm these checks describe the intended correct behavior.')).toBeChecked();
    await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'../../.playwright-mcp/generator-finished-desktop.png',fullPage:true});for(const size of [{width:390,height:844},{width:320,height:640}]){await page.setViewportSize(size);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.getByRole('button',{name:'View code',exact:true}).last()).toBeInViewport();await page.getByRole('button',{name:`Edit step ${fillIndex+1}`,exact:true}).click();await expect(page.getByRole('button',{name:'Apply changes',exact:true})).toBeInViewport();await page.getByRole('dialog').evaluate(async element=>{await Promise.all(element.getAnimations().map(animation=>animation.finished));});await page.screenshot({path:`../../.playwright-mcp/generator-finished-inspector-${size.width}.png`});await page.getByRole('button',{name:'Cancel',exact:true}).click();}
    await page.screenshot({path:'../../.playwright-mcp/generator-finished-mobile.png',fullPage:true});
    console.log('[generator] edit/download/mobile verified');
    // Failed save retains the applied draft; optimistic conflicts require a deliberate reload.
    await page.getByRole('button',{name:`Edit step ${fillIndex+1}`,exact:true}).click();await page.getByLabel(`Step ${fillIndex+1} safe value`,{exact:true}).fill('Retained after failure');await page.getByRole('button',{name:'Apply changes',exact:true}).click();await page.route(`**${endpoint}/plan`,r=>r.request().method()==='PUT'?r.abort():r.continue());await page.getByRole('button',{name:'Save draft',exact:true}).click();await expect(page.locator('.test-generator').getByRole('alert')).toBeVisible();await page.unroute(`**${endpoint}/plan`);await expect(page.locator('.generator-step-list')).toContainText('Retained after failure');
    const current=await(await review.request.get(`${endpoint}/plan`)).json();expect((await review.request.put(`${endpoint}/plan`,{headers:{origin},data:{plan:current.plan,revision:current.revision}})).status()).toBe(200);await page.getByRole('button',{name:'Save draft',exact:true}).click();await expect(page.locator('.test-generator').getByRole('alert')).toContainText('another tab');await page.getByRole('button',{name:'Reload saved draft',exact:true}).click();await page.getByRole('button',{name:'Discard local edits and reload',exact:true}).click();await expect(page.getByText('Saved draft loaded',{exact:true})).toBeVisible();
    console.log('[generator] failed save/conflict verified');
    // Leaving the feature tab retains a dirty draft in memory, without browser storage.
    await page.getByRole('button',{name:`Edit step ${fillIndex+1}`,exact:true}).click();await page.getByLabel(`Step ${fillIndex+1} safe value`,{exact:true}).fill('RECOVER THIS DRAFT');await page.getByRole('button',{name:'Apply changes',exact:true}).click();await page.getByRole('tab',{name:'Investigation',exact:true}).click();await page.getByRole('tab',{name:'Reproduction & test plan'}).click();await expect(page.locator('.generator-step-list')).toContainText('RECOVER THIS DRAFT');
    await page.getByText('Reset',{exact:true}).click();await page.getByRole('button',{name:'Reset to saved draft',exact:true}).click();await expect(page.locator('.generator-step-list')).not.toContainText('RECOVER THIS DRAFT');await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(page.locator('.generator-step-list')).toContainText('RECOVER THIS DRAFT');await page.getByRole('button',{name:'Reset to saved draft',exact:true}).click();await page.getByText('Reset',{exact:true}).click();
    console.log('[generator] tab reset/undo verified');
    // Native SPA Back can unmount the editor. Returning recovers the authorized in-memory draft.
    await page.getByRole('link',{name:'All reports',exact:false}).click();await page.locator(`a[href="/app/projects/${project.id}/reports/${reportId}"]`).click();await page.getByRole('tab',{name:'Reproduction & test plan'}).click();await expect(page.getByText('Saved draft loaded',{exact:true})).toBeVisible();await page.getByRole('button',{name:`Edit step ${fillIndex+1}`,exact:true}).click();await page.getByLabel(`Step ${fillIndex+1} safe value`,{exact:true}).fill('RECOVER AFTER BACK');await page.getByRole('button',{name:'Apply changes',exact:true}).click();await page.goBack();await page.locator(`a[href="/app/projects/${project.id}/reports/${reportId}"]`).click();await page.getByRole('tab',{name:'Reproduction & test plan'}).click();await expect(page.locator('.generator-action-footer').getByRole('status').filter({hasText:'Recovered unsaved draft in this tab'})).toBeVisible();await expect(page.locator('.generator-step-list')).toContainText('RECOVER AFTER BACK');await page.getByText('Reset',{exact:true}).click();await page.getByRole('button',{name:'Reset to saved draft',exact:true}).click();await page.getByText('Reset',{exact:true}).click();
    console.log('[generator] native Back recovery verified');
    await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:`Edit step ${fillIndex+1}`,exact:true}).click();await expect(page.getByRole('dialog')).toHaveCSS('animation-name','none');await page.getByRole('button',{name:'Cancel',exact:true}).click();
    console.log('[generator] workflow complete');
  } finally {console.log('[generator] closing review');const video=reviewPage?.video();await reviewPage?.close({runBeforeUnload:false});console.log('[generator] review page closed');await review?.close();console.log('[generator] review closed');if(video)await video.saveAs('../../.playwright-mcp/generator-workflow.webm').catch(()=>{});console.log('[generator] optional video step complete');await developer.close(); await other.close(); await visitor.close();console.log('[generator] cleanup complete'); }
});
