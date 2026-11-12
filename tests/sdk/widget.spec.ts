import {writeFile} from 'node:fs/promises';
import { test, expect } from '@playwright/test';
import type { ReportingWidget, WidgetOptions } from '../../packages/sdk/dist/index';
import type { ReportSubmission } from '../../packages/contracts/src/index';

declare global { interface Window { fixtureWidget: ReportingWidget; } }
const id='12345678-1234-4234-8234-123456789012';
const receipt={reportId:'22345678-1234-4234-8234-123456789012',duplicate:true};
async function openFixture(page: import('@playwright/test').Page){await page.goto(`/?projectId=${id}&applicationOrigin=${encodeURIComponent('http://127.0.0.1:4183')}`);await expect(page.getByRole('button',{name:'Report a bug',exact:true})).toBeVisible();}

test('developer-configured fixture shows the widget on its bare URL and ignores visitor configuration', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => { if(request.url().includes('/api/ingest/')) requests.push(request.url()); });
  await page.goto('http://127.0.0.1:4186/');
  await expect(page.getByRole('button',{name:'Report a bug',exact:true})).toBeVisible();
  await expect(page.locator('#widget-configuration')).toHaveCount(0);
  await expect(page.locator('#fixture-debug')).toBeHidden();
  await page.goto('http://127.0.0.1:4186/?projectId=invalid&applicationOrigin=https://wrong.example&debug=1');
  await expect(page.getByRole('button',{name:'Report a bug',exact:true})).toBeVisible();
  await expect(page.locator('#fixture-debug')).toBeHidden();
  expect(requests).toEqual([]);
});

test('compact widget supports real drag, keyboard movement, reset, viewport changes and draft retention', async ({ page }) => {
  await page.setViewportSize({width:1280,height:800}); await openFixture(page);
  const launcher = page.getByRole('button',{name:'Report a bug',exact:true});
  const initial = (await launcher.boundingBox())!;
  await page.mouse.move(initial.x+initial.width/2,initial.y+initial.height/2);await page.mouse.down();
  await page.mouse.move(250,200,{steps:12});await page.mouse.up();
  await expect(page.getByRole('dialog',{name:'Report a bug'})).toHaveCount(0);
  const moved = (await launcher.boundingBox())!;
  expect(moved.x).toBeLessThan(initial.x-100);
  await launcher.focus();await page.keyboard.press('ArrowRight');
  expect((await launcher.boundingBox())!.x).toBeCloseTo(moved.x+10,0);
  await launcher.click();const panel=page.getByRole('dialog',{name:'Report a bug'});
  expect((await panel.boundingBox())!.width).toBeLessThanOrEqual(380);
  expect((await panel.boundingBox())!.height).toBeLessThan(350);
  const handle=page.getByRole('button',{name:'Move bug reporter',exact:true});
  await handle.focus();const beforeKeyboard=(await panel.boundingBox())!;await page.keyboard.press('Shift+ArrowRight');
  expect((await panel.boundingBox())!.x).toBeCloseTo(beforeKeyboard.x+40,0);
  const grip=(await handle.boundingBox())!;await page.mouse.move(grip.x+10,grip.y+10);await page.mouse.down();await page.mouse.move(3000,2000,{steps:10});await page.mouse.up();
  const clamped=(await panel.boundingBox())!;expect(clamped.x).toBeGreaterThanOrEqual(16);expect(clamped.y).toBeGreaterThanOrEqual(16);expect(clamped.x+clamped.width).toBeLessThanOrEqual(1280);expect(clamped.y+clamped.height).toBeLessThanOrEqual(800);
  await page.getByRole('button',{name:'Start recording',exact:true}).click();await expect(page.getByText('RECORDING',{exact:true})).toBeVisible();
  await handle.focus();await page.keyboard.press('ArrowLeft');await expect(page.getByText('RECORDING',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Minimize bug reporter'}).click();const dock=page.getByRole('button',{name:'Open recording controls'});await dock.focus();await page.keyboard.press('ArrowLeft');await dock.click();await expect(page.getByText('RECORDING',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Stop recording',exact:true}).click();
  const title=page.getByLabel('Report title',{exact:true});await title.fill('Movable widget draft');
  const beforeInput=(await panel.boundingBox())!;await title.selectText();expect((await panel.boundingBox())!.x).toBe(beforeInput.x);
  await expect(page.getByLabel('What happened / expected?',{exact:false})).toBeHidden();
  await page.getByText('Add details (optional)',{exact:true}).click();await page.getByLabel('What happened / expected?',{exact:false}).fill('Keep this description while moving.');
  await page.getByRole('button',{name:'Minimize bug reporter'}).click();
  const beforeReload=(await launcher.boundingBox())!;await page.reload();await expect(launcher).toBeVisible();
  expect((await launcher.boundingBox())!.x).toBeCloseTo(beforeReload.x,0);
  // Reload clears recordings by design; verify same-tab draft preservation on a new recording.
  await launcher.click();await page.getByRole('button',{name:'Start recording',exact:true}).click();await expect(page.getByText('RECORDING',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Stop recording',exact:true}).click();await title.fill('Retained after moving');
  await page.getByRole('button',{name:'Minimize bug reporter'}).click();await launcher.click();await expect(title).toHaveValue('Retained after moving');
  for(const viewport of [{width:390,height:844},{width:320,height:400}]){await page.setViewportSize(viewport);await expect.poll(async()=>{const bounds=(await panel.boundingBox())!;return bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=viewport.width&&bounds.y+bounds.height<=viewport.height;}).toBe(true);await expect(title).toHaveValue('Retained after moving');}
  await page.getByRole('button',{name:'Reset reporter position'}).click();
  await page.getByRole('button',{name:'Minimize bug reporter'}).click();await launcher.focus();await page.keyboard.press('Home');
  await page.evaluate(()=>window.fixtureWidget.destroy());await expect(page.locator('[data-unravel-widget]')).toHaveCount(0);
});

test('touch dragging a launcher moves it without opening or recording', async ({ browser, baseURL, browserName }, testInfo) => {
  test.skip(browserName!=='chromium','CDP touch injection is Chromium-only; real-phone behavior needs separate verification.');
  const context=await browser.newContext({baseURL,viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  try{const page=await context.newPage();await openFixture(page);const launcher=page.getByRole('button',{name:'Report a bug',exact:true});const box=(await launcher.boundingBox())!;const session=await context.newCDPSession(page);
    await page.evaluate(()=>{const log: unknown[]=[];Reflect.set(window,'positionQA',log);for(const type of ['pointerdown','pointerup','pointercancel','lostpointercapture','click'])window.addEventListener(type,input=>{const event=input as PointerEvent;const target=event.composedPath()[0] as Element;log.push({type,id:event.pointerId,x:event.clientX,y:event.clientY,tag:target.tagName,action:target.closest?.('[data-action]')?.getAttribute('data-action'),prevented:event.defaultPrevented});},true);});
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+30,y:box.y+20}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:150,y:500}]});await page.evaluate(()=>new Promise(requestAnimationFrame));
    await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:100,y:300}]});await page.evaluate(()=>new Promise(requestAnimationFrame));
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await expect(page.getByRole('dialog',{name:'Report a bug'})).toHaveCount(0);expect((await launcher.boundingBox())!.y).toBeLessThan(box.y-100);
    await launcher.tap();
    try { await expect(page.getByRole('button',{name:'Start recording',exact:true})).toBeVisible(); }
    catch(error) { const path=testInfo.outputPath('touch-events.json');await writeFile(path,JSON.stringify(await page.evaluate(()=>Reflect.get(window,'positionQA'))));await testInfo.attach('touch-events',{path,contentType:'application/json'});throw error; }
  }finally{await context.close();}
});

test('widget morph is interruptible, keeps one surface, respects reduced motion and never starts capture', async ({ page }) => {
  await openFixture(page);
  const uploads: string[] = [];
  page.on('request', request => { if(request.url().includes('/api/ingest/')) uploads.push(request.url()); });
  await page.evaluate(() => { for(let i=0;i<12;i++){window.fixtureWidget.open();window.fixtureWidget.close();} window.fixtureWidget.open(); });
  await expect(page.getByRole('button',{name:'Start recording',exact:false})).toBeVisible();
  expect(await page.locator('[data-unravel-widget] .surface').count()).toBe(1);
  const identity = await page.locator('[data-unravel-widget] .surface-material').evaluate(element => { element.setAttribute('data-qa-identity','same-surface'); return element.getAnimations().length; });
  expect(identity).toBeLessThanOrEqual(1);
  await page.getByRole('button',{name:'Minimize bug reporter'}).click();
  await page.getByRole('button',{name:'Report a bug',exact:true}).click();
  await expect(page.locator('[data-qa-identity="same-surface"]')).toHaveCount(1);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(() => { window.fixtureWidget.close(); window.fixtureWidget.open(); });
  expect(await page.locator('[data-unravel-widget] .surface-material').evaluate(element => element.getAnimations().length)).toBe(0);
  await expect(page.locator('[data-unravel-widget] .surface')).toHaveAttribute('data-motion','off');
  expect(uploads).toEqual([]);
  await page.evaluate(() => window.fixtureWidget.destroy());
  await expect(page.locator('[data-unravel-widget]')).toHaveCount(0);
});

test('widget supplies the complete visitor flow, excludes itself, isolates CSS and retries identical content',async({page})=>{
  const bodies:string[]=[];
  await page.route('**/api/ingest/*',async route=>{bodies.push(route.request().postData()!);if(bodies.length===1)await route.abort('failed');else await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(receipt)});});
  await openFixture(page);
  await page.addStyleTag({content:'button{font-size:2px!important;color:lime!important}'});
  const launcher=page.getByRole('button',{name:'Report a bug',exact:true});expect(await launcher.evaluate(n=>getComputedStyle(n).fontSize)).toBe('15px');
  await launcher.click();await expect(page.getByText('You control the recording')).toBeVisible();expect(bodies).toHaveLength(0);
  await page.getByRole('button',{name:'Start recording',exact:false}).click();await expect(page.getByText('RECORDING',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Minimize bug reporter'}).click();await expect(page.getByRole('button',{name:'Open recording controls'})).toBeVisible();
  await page.locator('#question').fill('Synthetic widget question');await page.locator('#private-value').fill('WIDGET_PASSWORD_SENTINEL');await page.locator('#submit-question').click();await expect(page.locator('#feedback')).toContainText('could not submit');
  await page.getByRole('button',{name:'Stop recording',exact:true}).click();await page.getByRole('button',{name:'Report a bug',exact:true}).click();
  await page.getByLabel('Report title',{exact:true}).fill('Widget report title');await page.getByText('Add details (optional)', {exact:true}).click();await page.getByLabel('What happened / expected?',{exact:false}).fill('Synthetic report context');
  await page.getByRole('button',{name:'Send bug report',exact:false}).click();await expect(page.getByRole('button',{name:'Retry submission'})).toBeVisible();
  await page.getByRole('button',{name:'Retry submission'}).click();await expect(page.getByRole('heading',{name:'Thanks for helping us fix it.'})).toBeVisible();
  expect(bodies).toHaveLength(2);expect(bodies[0]).toBe(bodies[1]);const body=JSON.parse(bodies[0]) as ReportSubmission;
  expect(body.recording.events).toContainEqual(expect.objectContaining({kind:'network',status:500}));
  const recording=JSON.stringify(body.recording);for(const sentinel of ['WIDGET_PASSWORD_SENTINEL','Widget report title','Synthetic report context','unravel-title','Show us what went wrong'])expect(recording).not.toContain(sentinel);
  await page.getByRole('button',{name:'Done',exact:true}).click();await launcher.click();await page.getByRole('button',{name:'Start recording',exact:false}).click();await expect(page.getByText('RECORDING',{exact:true})).toBeVisible();
  await page.evaluate(()=>window.fixtureWidget.destroy());await expect(page.locator('[data-unravel-widget]')).toHaveCount(0);
});

test('widget supports mobile keyboard close/reopen, discard confirmation and reduced motion',async({page})=>{
  await page.setViewportSize({width:390,height:700});await page.emulateMedia({reducedMotion:'reduce'});await openFixture(page);
  await page.getByRole('button',{name:'Report a bug',exact:true}).click();const panel=page.getByRole('dialog',{name:'Report a bug'});expect(await panel.evaluate(n=>getComputedStyle(n).animationName)).toBe('none');
  await page.getByRole('button',{name:'Start recording',exact:false}).click();await expect(page.getByText('RECORDING',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Stop recording',exact:false}).click();
  await page.getByLabel('Report title',{exact:true}).fill('Retain title');await page.getByLabel('Report title',{exact:true}).press('Escape');await page.getByRole('button',{name:'Report a bug',exact:true}).click();await expect(page.getByLabel('Report title',{exact:true})).toHaveValue('Retain title');
  await expect(page.getByRole('button',{name:'Send bug report',exact:false})).toBeInViewport();expect(await panel.evaluate(n=>n.getBoundingClientRect().width)).toBeLessThanOrEqual(358);
  await page.screenshot({path:'.playwright-mcp/v2-widget-mobile.png'});
  await page.getByRole('button',{name:'Discard recording',exact:true}).click();await page.getByRole('button',{name:'Keep this report'}).click();await expect(page.getByLabel('Report title',{exact:true})).toHaveValue('Retain title');
  await page.getByRole('button',{name:'Discard recording',exact:true}).click();await page.getByRole('button',{name:'Discard unsent report'}).click();await expect(page.getByRole('button',{name:'Start recording',exact:false})).toBeVisible();
  await page.evaluate(()=>window.fixtureWidget.destroy());
});

test('widget initialization is capture-free, duplicate mounts are rejected and teardown permits remount',async({page})=>{
  await openFixture(page);const result=await page.evaluate(async()=>{const mod=window.UnravelSDK as typeof window.UnravelSDK & {mountWidget(options:WidgetOptions):ReportingWidget};let blocked=false;try{mod.mountWidget({projectId:'12345678-1234-4234-8234-123456789012',applicationOrigin:location.origin});}catch{blocked=true;}window.fixtureWidget.destroy();const next=mod.mountWidget({projectId:'12345678-1234-4234-8234-123456789012',applicationOrigin:location.origin});next.destroy();next.destroy();return blocked;});expect(result).toBe(true);await expect(page.locator('[data-unravel-widget]')).toHaveCount(0);
});

test('out-of-box widget mounts and tears down in React Strict Mode and Next.js',async({page})=>{
  for(const url of ['http://127.0.0.1:4183/react-smoke?widget=1',`${process.env.SDK_LAB_BASE_URL??'http://localhost:3013'}/sdk-lab?widget=1`]){
    await page.goto(url);await expect(page.locator('[data-unravel-widget]')).toHaveCount(1);await page.getByRole('button',{name:'Report a bug',exact:true}).click();await page.getByRole('button',{name:'Start recording',exact:false}).click();await expect(page.getByText('RECORDING',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Toggle widget',exact:true}).click();await expect(page.locator('[data-unravel-widget]')).toHaveCount(0);await page.getByRole('button',{name:'Toggle widget',exact:true}).click();await expect(page.locator('[data-unravel-widget]')).toHaveCount(1);await page.getByRole('button',{name:'Report a bug',exact:true}).click();await expect(page.getByRole('button',{name:'Start recording',exact:false})).toBeVisible();
  }
});
