import {test,expect} from '@playwright/test';

test('entrance brand does not skip intro; brand becomes hero link afterward',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');
 await expect.poll(()=>page.locator('[data-landing-root]').evaluate(n=>typeof(n as HTMLElement & {__unravelStudy?:unknown}).__unravelStudy)).toBe('function');
 const brand=page.locator('.landing-navigation-brand');await expect(brand).toHaveAttribute('href','#journey');
 await brand.click();await expect(page.locator('#skip')).toBeVisible();
 expect(await page.locator('[data-landing-root]').evaluate(n=>(n as HTMLElement & {__unravelStudy:()=>{progress:number}}).__unravelStudy().progress)).toBe(0);
 await page.locator('#skip').click();await expect(brand).toHaveAttribute('href','#hero');
 await page.locator('#study').scrollIntoViewIfNeeded();await brand.click();
 await expect(page.locator('#hero-title')).toBeVisible();await expect(page.locator('#skip')).toBeHidden();
});

for(const reducedMotion of ['no-preference','reduce'] as const)test(`hero deep link survives refresh (${reducedMotion})`,async({page})=>{
 await page.emulateMedia({reducedMotion});
 for(let attempt=0;attempt<2;attempt++){
  if(attempt===0)await page.goto('/#hero');else await page.reload();
  await expect(page.locator('#hero-title')).toBeInViewport();
  await expect(page.locator('#hero-title')).toBeVisible();
  await expect.poll(()=>page.locator('[data-landing-root]').evaluate(n=>(n as HTMLElement & {__unravelStudy:()=>{progress:number}}).__unravelStudy?.().progress)).toBe(1);
  await expect(page.locator('#skip')).toBeHidden();
  await page.evaluate(()=>document.fonts.ready);await expect(page.locator('#hero-title')).toBeInViewport();
 }
});

for(const width of [1440,390,320])test(`demo widget straddles website edge at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await expect.poll(()=>page.locator('#demo-start').evaluate(n=>typeof(n as HTMLButtonElement).onclick)).toBe('function');
 await page.locator('#demo-start').click();await page.locator('#question').fill('Overlay placement');await page.locator('#sample-submit').click();await page.locator('#demo-start').click();
 await expect(page.locator('#finished')).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>{const browser=document.querySelector('.capture-exhibit .browser')!,widget=document.querySelector('.capture-exhibit .recorder')!,submit=document.querySelector('#sample-submit')!,caption=document.querySelector('.sample-caption')!;const a=browser.getBoundingClientRect(),b=widget.getBoundingClientRect(),c=submit.getBoundingClientRect();return widget.parentElement===browser.parentElement&&getComputedStyle(widget).position==='absolute'&&b.left>=a.left&&b.right<=a.right&&Math.abs(a.bottom-(b.top+b.height/2))<2&&c.bottom<b.top&&caption.getBoundingClientRect().top>b.bottom;})).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});

test('demo can start directly and FAQ has one reading column',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 const start=page.locator('#demo-start');await expect(start).toBeVisible();
 await expect.poll(()=>start.evaluate(n=>typeof(n as HTMLButtonElement).onclick)).toBe('function');
 await start.click();await expect(start).toHaveText('Stop demo');
 await page.locator('#question').fill('Direct demo check');await page.locator('#sample-submit').click();
 await start.click();await expect(start).toHaveText('Record another demo');
 await start.click();await expect(start).toHaveText('Stop demo');
 const faq=page.locator('#questions');
 expect(await faq.evaluate(n=>getComputedStyle(n).gridTemplateColumns.split(' ').length)).toBe(1);
 await page.locator('#questions summary').filter({hasText:'Do visitors need an Unravel account?'}).click();
 await expect(page.getByText('No. Visitors can use the reporter on your website without creating an account.',{exact:false})).toBeVisible();
});

test('approved story retains the cinematic controller and interactive workflow',async({page})=>{
 await page.goto('/');
 await expect(page.locator('[data-landing-root]')).toHaveClass(/rendering/);
 await page.locator('#skip').click();
 await expect(page.locator('#hero-title')).toBeInViewport();
 await page.locator('#try').click();await page.locator('#demo-start').click();
 await expect(page.locator('#demo-time')).toHaveText('00:00');
 await page.locator('#question').fill('Synthetic regression');await page.locator('#sample-submit').click();await page.locator('#demo-start').click();
 await page.locator('.inspect-request').click();
 await expect(page.locator('.story-request-selected')).toHaveClass(/request-target/);
 await page.locator('[data-view="json"]').click();
 await expect(page.locator('#json-view')).toBeVisible();
 expect(JSON.parse(await page.locator('#json-plan').innerText()).expectedBehaviorConfirmed).toBe(true);
 await page.locator('#replay').click();
 await expect.poll(()=>page.locator('[data-landing-root]').evaluate(e=>(e as HTMLElement & {__unravelStudy:()=>{progress:number}}).__unravelStudy().progress)).toBe(0);
 await expect(page.locator('[data-landing-root]')).toHaveClass(/rendering/);
});

test('diagnostic zoom reverses and reduced motion releases the panel',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');
 const section=page.locator('#diagnostics'),panel=page.locator('[data-diagnostic-panel]');
 await expect(section).toHaveAttribute('data-zoom','on');
 async function progress(p:number){await section.evaluate((e,p)=>{const stage=e.querySelector('[data-diagnostic-stage]') as HTMLElement;scrollTo(0,e.getBoundingClientRect().top+scrollY+(e.clientHeight-stage.offsetHeight)*p);},p);await expect.poll(async()=>Number(await section.getAttribute('data-progress'))).toBeCloseTo(p,2);}
 await progress(.65);await expect(panel).toHaveAttribute('inert');
 await progress(0);await expect(panel).not.toHaveAttribute('inert');
 await page.emulateMedia({reducedMotion:'reduce'});await expect(section).not.toHaveAttribute('data-zoom');
});
for(const width of [390,320])test(`mobile ${width}: menu and peer views stay contained`,async({page})=>{
 await page.setViewportSize({width,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await page.locator('.menu-toggle').click();await page.locator('#mobile-links a[href="#sequence"]').click();
 await page.locator('[data-view="json"]').click();await expect(page.locator('#json-view')).toBeVisible();
 await page.locator('[data-view="code"]').click();await expect(page.locator('#code-view')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});


test('one header persists from entrance through hero and product content', async ({page}) => {
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');
 await expect.poll(()=>page.locator('[data-landing-root]').evaluate(n=>typeof(n as HTMLElement & {__unravelStudy?:unknown}).__unravelStudy)).toBe('function');
 const header=page.locator('.landing-navigation');await expect(header).toHaveCount(1);
 await expect(page.locator('#skip')).toBeVisible();
 await expect(header.getByRole('navigation',{name:'Product navigation',exact:true})).toBeHidden();
 await page.locator('#skip').click();await expect(page.locator('#hero-title')).toBeInViewport();
 await expect(header.getByRole('link',{name:'Integration',exact:true})).toBeVisible();
 await expect(page.locator('#skip')).toBeHidden();
 await header.getByRole('link',{name:'Integration',exact:true}).click();
 await expect(page.locator('#integration')).toBeInViewport();
 expect(await header.evaluate(e=>Math.round(e.getBoundingClientRect().top))).toBe(0);
 await header.getByRole('link',{name:'Unravel, go to hero'}).click();
 await expect(page.locator('#hero-title')).toBeInViewport();await expect(page.locator('#skip')).toBeHidden();
 await expect(header).toHaveCount(1);
});

test('content navigation never flashes sign in for unresolved or signed-in sessions', async ({page}) => {
 let resolveSession!: () => void;
 const ready=new Promise<void>(resolve=>{resolveSession=resolve;});
 await page.route('**/api/session',async route=>{await ready;await route.fulfill({json:{signedIn:true},headers:{'Cache-Control':'private, no-store'}});});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
 await page.locator('#study').scrollIntoViewIfNeeded();
 const header=page.locator('.landing-navigation');
 await expect(header.getByRole('link',{name:'Sign in',exact:true})).toHaveCount(0);
 resolveSession();
 await expect(header.getByRole('link',{name:'Open workspace'})).toBeVisible();
 await expect(header.getByRole('link',{name:'Sign in',exact:true})).toHaveCount(0);
});
