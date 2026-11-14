import {test,expect} from '@playwright/test';

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
