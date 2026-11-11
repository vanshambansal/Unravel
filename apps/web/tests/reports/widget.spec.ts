import { test, expect } from '@playwright/test';
import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { mkdir } from 'node:fs/promises';

test.beforeAll(async()=>{if(!process.env.CLERK_SECRET_KEY?.startsWith('sk_test_')||!process.env.E2E_CLERK_USER_EMAIL)throw new Error('Use the configured development app and existing synthetic user.');await clerkSetup();});

test('visitor widget → real persisted report → V2 investigation, filters, resize and mobile replay',async({browser,baseURL})=>{
  const developer=await browser.newContext({baseURL,viewport:{width:1440,height:1000}}),visitor=await browser.newContext({viewport:{width:1440,height:1000}});
  try{
    const owner=await developer.newPage();await owner.goto('/sign-in');await clerk.signIn({page:owner,emailAddress:process.env.E2E_CLERK_USER_EMAIL!});await owner.goto('/app/projects');await expect(owner.getByRole('heading',{name:'Your projects'})).toBeVisible();
    const origin=new URL(baseURL!).origin,fixture='http://127.0.0.1:4185';
    const created=await developer.request.post('/api/projects',{headers:{origin},data:{name:'Question desk · widget verification',websiteUrl:fixture}});
    const project=created.status()===409?(await(await developer.request.get('/api/projects')).json()).projects.find((p:{origin:string})=>p.origin===fixture):(await created.json()).project;expect(project).toBeTruthy();
    const page=await visitor.newPage();await page.goto(`${fixture}/?projectId=${project.id}&applicationOrigin=${encodeURIComponent(origin)}`);
    await expect(page.locator('#fixture-debug')).toBeHidden();await page.getByRole('button',{name:'Report a bug',exact:true}).click();await page.getByRole('button',{name:'Start recording',exact:false}).click();await expect(page.getByText('RECORDING',{exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Minimize bug reporter'}).click();await page.locator('#question').fill('Synthetic widget-to-dashboard question');await page.locator('#category').selectOption('technical');await page.locator('#private-value').fill('V2_WIDGET_PASSWORD_SENTINEL');
    await page.locator('#submit-question').click();await expect(page.locator('#feedback')).toContainText('could not submit');await page.getByText('Additional diagnostic check',{exact:true}).click();await page.locator('#trigger-error').click();
    await page.getByRole('button',{name:'Stop recording',exact:true}).click();await page.getByRole('button',{name:'Report a bug',exact:true}).click();await page.getByLabel('Report title',{exact:true}).fill('Question submission fails · V2 widget');await page.getByText('Add details (optional)', {exact:true}).click();await page.getByLabel('What happened / expected?',{exact:false}).fill('Synthetic test: expected a successful question submission.');
    await mkdir('../../.playwright-mcp',{recursive:true});await page.screenshot({path:'../../.playwright-mcp/v2-widget-desktop.png',fullPage:true});
    const bodies:string[]=[];let reportId='';
    await page.route('**/api/ingest/*',async route=>{if(route.request().method()!=='POST'){await route.continue();return;}bodies.push(route.request().postData()!);expect(route.request().headers().cookie).toBeUndefined();if(bodies.length===1){const response=await route.fetch();expect(response.status()).toBe(201);reportId=(await response.json()).reportId;await route.abort('failed');}else await route.continue();});
    await page.getByRole('button',{name:'Send bug report',exact:false}).click();await page.getByRole('button',{name:'Retry submission'}).click();await expect(page.getByRole('heading',{name:'Thanks for helping us fix it.'})).toBeVisible();expect(bodies).toHaveLength(2);expect(bodies[0]).toBe(bodies[1]);expect(JSON.stringify(JSON.parse(bodies[0]).recording)).not.toContain('V2_WIDGET_PASSWORD_SENTINEL');
    const reports=(await(await developer.request.get(`/api/projects/${project.id}/reports`)).json()).reports;expect(reports.filter((r:{id:string})=>r.id===reportId)).toHaveLength(1);
    await owner.goto(`/app/projects/${project.id}/reports/${reportId}`);await expect(owner.getByText('Replay ready',{exact:true})).toBeVisible();await expect(owner.getByRole('heading',{name:'Question submission fails · V2 widget'})).toBeVisible();
    const divider=owner.getByRole('separator',{name:'Resize replay panel'});await divider.focus();await divider.press('ArrowLeft');await expect(divider).toHaveAttribute('aria-valuenow','64');await divider.press('ArrowRight');
    await owner.getByRole('button',{name:'Network',exact:true}).click();const network=owner.getByRole('button',{name:/network.*POST.*500/});await expect(network).toBeVisible();await network.click();await expect(owner.locator('.report-event-details')).toContainText('500');await expect(owner.locator('.report-event-details')).toContainText('fetch');
    await owner.getByLabel('Replay position').focus();await owner.getByLabel('Replay position').press('End');const replay=owner.frameLocator('iframe[title="Session replay"]').frameLocator('iframe');await expect(replay.locator('textarea')).toHaveValue('Synthetic widget-to-dashboard question');await expect(replay.locator('body')).toContainText('could not submit');
    await owner.evaluate(()=>scrollTo(0,0));await owner.screenshot({path:'../../.playwright-mcp/v2-investigation-desktop.png',fullPage:true});
    await owner.getByRole('button',{name:'Errors',exact:true}).click();await expect(owner.getByRole('button',{name:/error.*intentional JavaScript error/})).toBeVisible();await owner.getByRole('button',{name:'All',exact:true}).click();
    await owner.setViewportSize({width:390,height:844});expect(await owner.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(divider).toBeHidden();await owner.getByRole('button',{name:'100% size',exact:true}).click();await owner.getByRole('button',{name:'Fit recording',exact:true}).click();await expect(replay.locator('textarea')).toBeInViewport();await owner.evaluate(()=>scrollTo(0,0));await owner.screenshot({path:'../../.playwright-mcp/v2-investigation-mobile.png',fullPage:true});
    await owner.reload();await expect(owner.getByText('Replay ready',{exact:true})).toBeVisible();
    await owner.goto(`/app/projects/${project.id}/setup`);await owner.getByRole('tab',{name:'React',exact:true}).click();await expect(owner.getByRole('tabpanel')).toContainText('mountWidget');await expect(owner.getByText('Report received — open Reports to investigate')).toBeVisible();await owner.screenshot({path:'../../.playwright-mcp/v2-setup-mobile.png',fullPage:true});
    await owner.setViewportSize({width:1440,height:1000});await owner.goto('/app/projects');await expect(owner.getByRole('heading',{name:'Your projects'})).toBeVisible();await owner.screenshot({path:'../../.playwright-mcp/v2-projects-desktop.png',fullPage:true});
    // Retain only this clearly labelled synthetic report for manual inspection; no unrelated data touched.
  }finally{await visitor.close();await developer.close();}
});
