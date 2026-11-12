import {test,expect} from '@playwright/test';

test('product examples, navigation and code are real controls without recording visitors',async({page})=>{
 const writes:string[]=[];
 page.on('request',request=>{if(request.method()==='POST'&&/\/api\/(ingest|projects)/.test(request.url()))writes.push(request.url());});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await page.getByRole('link',{name:'See the workflow',exact:true}).click();
 await expect(page.locator('#record-story-title')).toBeInViewport();
 await page.getByRole('button',{name:'Play recording example',exact:true}).click();
 await expect(page.getByRole('button',{name:'Replay example',exact:true})).toBeVisible({timeout:10000});
 await page.getByRole('button',{name:'Reset',exact:true}).click();
 await expect(page.getByRole('button',{name:'Play recording example',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Preview question entered',exact:true}).click();
 await expect(page.getByRole('button',{name:'Preview question entered',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Errors',exact:true}).click();
 await expect(page.locator('.story-request-detail')).toContainText('not a JavaScript exception');
 await page.getByRole('button',{name:'Inspect the generated test',exact:true}).click();
 await expect(page.getByLabel('Example Playwright test',{exact:true})).toContainText('test(');
 await page.getByRole('button',{name:'JSON plan',exact:true}).click();
 const plan=JSON.parse(await page.getByLabel('Example JSON plan',{exact:true}).innerText());
 expect(plan.steps.map((step:{action:string})=>step.action)).toEqual(['fill','click']);
 await page.getByRole('group',{name:'Landing integration framework'}).getByRole('button',{name:'React',exact:true}).click();
 await expect(page.getByLabel('React SDK integration example')).toContainText('mountWidget');
 await expect(page.getByLabel('React SDK integration example')).not.toContainText("'use client'");
 await page.getByText('Is session replay a video?',{exact:true}).click();
 await expect(page.locator('details[open]')).toContainText('reconstructs recorded DOM');
 expect(writes).toEqual([]);
});

test('same diagnostic element zooms forward and reverses; responsive modes release it',async({page})=>{
 await page.route('**/landing/architecture/atrium.glb',route=>route.abort());
 await page.goto('/',{waitUntil:'domcontentloaded'});
 const section=page.locator('#diagnostics'),panel=page.locator('[data-diagnostic-panel]');
 await expect(page.locator('[data-landing-root]')).toHaveClass(/static/);
 await expect(section).toHaveAttribute('data-zoom','on');
 async function progress(value:number){await section.evaluate((element,p)=>scrollTo(0,element.getBoundingClientRect().top+scrollY+(element.clientHeight-innerHeight)*p),value);await expect.poll(async()=>Number(await section.getAttribute('data-progress'))).toBeCloseTo(value,2);}
 await progress(0);
 await expect(panel).not.toHaveAttribute('inert');
 const identity=await page.locator('[data-status-anchor]').evaluate(element=>{element.dataset.testIdentity='same';return element.textContent;});
 expect(identity).toBe('500');
 await progress(.65);
 await expect(panel).toHaveAttribute('inert');
 expect(await panel.evaluate(element=>new DOMMatrix(getComputedStyle(element).transform).a)).toBeGreaterThan(10);
 await progress(1);
 await expect(page.locator('[data-diagnostic-reveal]')).toHaveCSS('opacity','1');
 await progress(0);
 await expect(panel).not.toHaveAttribute('inert');
 await expect(page.locator('[data-status-anchor]')).toHaveAttribute('data-test-identity','same');
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(section).not.toHaveAttribute('data-zoom');
 await expect(panel).not.toHaveAttribute('inert');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await expect(section).toHaveAttribute('data-zoom','on');
 await page.setViewportSize({width:390,height:844});
 await expect(section).not.toHaveAttribute('data-zoom');
 await expect(page.locator('#sequence')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});

for(const width of [390,320])test(`mobile ${width}: content, controls and code stay usable`,async({page})=>{
 await page.setViewportSize({width,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'Play recording example',exact:true}).click();
 await page.getByRole('button',{name:'Pause preview',exact:true}).click();
 await page.getByRole('button',{name:'Playwright',exact:true}).click();
 await expect(page.getByLabel('Example Playwright test')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await page.getByRole('link',{name:'Unravel hero',exact:true}).click();
 await expect(page.locator('#hero-title')).toBeInViewport();
});
