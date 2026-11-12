import { expect, test, type Page } from '@playwright/test';
import type { LandingSnapshot } from '../../apps/web/src/features/landing/motion/controller';

declare global { interface Window { __landingPendingFrames?: () => number } }

async function state(page: Page): Promise<LandingSnapshot> {
  return page.evaluate(() => {
    // The global bridge is intentionally stripped from normal production builds.
    // Read the controller-owned bridge on its mounted root in every build mode.
    const root=document.querySelector('[data-landing-root]') as (HTMLElement & {__unravelStudy?:()=>LandingSnapshot})|null;
    const read = root?.__unravelStudy;
    if (!read) throw new Error('Landing is not mounted');
    return read();
  });
}
async function ready(page: Page) {
  await expect(page.locator('[data-landing-root]')).toHaveClass(/rendering/);
}
async function scroll(page: Page, progress: number) {
  await page.evaluate(p => window.scrollTo(0, innerHeight * 2 * p), progress);
  await expect.poll(async () => (await state(page)).progress).toBeCloseTo(progress, 2);
}

test('server HTML, scene-before-text ordering and keyboard skip', async ({ page, request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain('Every bug'); expect(html).toContain('scene-hero-desktop.png');
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/'); await ready(page);
  expect((await state(page)).heroRays?.opening).toBe(true);
  await scroll(page, .7);
  await expect(page.locator('#hero-title')).toHaveCSS('opacity', '0');
  await scroll(page, .84);
  expect(Number(await page.locator('#hero-title').evaluate(el => getComputedStyle(el).opacity))).toBeGreaterThan(0);
  await expect(page.locator('#hero-actions')).toHaveCSS('visibility', 'hidden');
  await scroll(page, 0);
  await page.getByRole('button', { name: 'Skip Intro' }).focus(); await page.keyboard.press('Enter');
  await expect(page.locator('#hero-title')).toBeFocused();
  await expect.poll(async () => (await state(page)).progress).toBe(1);
  expect(errors).toEqual([]);
});

test('hero ambient pointer response, pause and reverse scrolling', async ({ page }) => {
  // Many renderer checkpoints take multi-second calls under Windows software WebGL.
  // This is a behavior check, not a frame-rate benchmark; keep every assertion.
  test.setTimeout(240000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/'); await ready(page);
  await page.getByRole('button', { name: 'Skip Intro' }).click();
  await expect.poll(async () => (await state(page)).progress).toBe(1);
  const before = await state(page);
  await page.waitForTimeout(250);
  const after = await state(page);
  expect(after.scene?.ambientTime).toBeGreaterThan(before.scene!.ambientTime);
  expect(after.scene?.camera).toEqual(before.scene?.camera);
  await page.mouse.move(250, 300); await page.waitForTimeout(250);
  const left = (await state(page)).heroRays!.aim;
  await page.mouse.move(1150, 600); await page.waitForTimeout(250);
  expect(Math.abs((await state(page)).heroRays!.aim - left)).toBeGreaterThan(.01);
  await page.getByRole('button', { name: 'Pause motion' }).click();
  const frozen = await state(page); await page.waitForTimeout(150);
  expect((await state(page)).scene?.ambientTime).toBe(frozen.scene?.ambientTime);
  expect((await state(page)).heroRays).toEqual(frozen.heroRays);
  await scroll(page, .3); await expect(page.locator('#hero-title')).toHaveCSS('visibility', 'hidden');
  await page.getByRole('button', { name: 'Resume motion' }).click();
  for (const p of [.9, .1, 1, 0]) await scroll(page, p);
  expect(errors).toEqual([]);
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 1440, height: 700 }, { width: 390, height: 844 }]) {
  test(`native hero hold, resize and normal exit at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport); await page.goto('/'); await ready(page);
    await page.evaluate(() => scrollTo(0, innerHeight * 1.85));
    await expect(page.locator('#hero-actions')).toHaveCSS('opacity', '1');
    await page.mouse.wheel(0, Math.round(viewport.height * .5));
    await page.waitForFunction(() => Math.abs(scrollY - innerHeight * 2.35) <= 2);
    const held = await page.evaluate(() => ({
      top: document.querySelector('#stage')!.getBoundingClientRect().top,
      bottom: document.querySelector('#hero-actions')!.getBoundingClientRect().bottom,
      strip: document.querySelector('#workflow')!.getBoundingClientRect().top,
      overflow: document.documentElement.scrollWidth > innerWidth, y: scrollY,
    }));
    expect(Math.abs(held.top)).toBeLessThan(1); expect(held.bottom).toBeLessThan(held.strip); expect(held.overflow).toBe(false);
    await page.waitForTimeout(200); expect(await page.evaluate(() => scrollY)).toBe(held.y);
    await page.mouse.wheel(0, Math.round(viewport.height * .5));
    await expect.poll(() => page.locator('#stage').evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(-50);
    await page.getByRole('link', { name: 'See the workflow' }).click({ noWaitAfter: true });
    await expect.poll(async () => (await state(page)).visible).toBe(false);
    const stopped = (await state(page)).scene!.ambientTime; await page.waitForTimeout(200);
    expect((await state(page)).scene!.ambientTime).toBe(stopped);
  });
}

test('reduced motion bypasses the intro and reacts to preference changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/');
  await expect(page.locator('[data-landing-root]')).toHaveClass(/static/);
  await expect(page.locator('#hero-title')).toBeVisible();
  expect(await page.locator('#journey').evaluate(el => el.getBoundingClientRect().height)).toBeLessThanOrEqual(901);
  await expect(page.locator('#hero-rays')).toHaveCSS('opacity', '0');
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await ready(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(async () => (await state(page)).reduced).toBe(true);
});

test('failed model and context loss retain usable static content', async ({ page }) => {
  await page.route('**/landing/architecture/atrium.glb', route => route.abort());
  await page.goto('/'); await expect(page.locator('[data-landing-root]')).toHaveClass(/static/);
  await expect(page.locator('#hero-title')).toBeVisible();
  await expect(page.getByRole('link', { name: 'See the workflow' })).toBeVisible();
  await page.unroute('**/landing/architecture/atrium.glb'); await page.reload(); await ready(page);
  await page.locator('#scene').evaluate(canvas => (canvas as HTMLCanvasElement).getContext('webgl2')!.getExtension('WEBGL_lose_context')!.loseContext());
  await expect(page.locator('[data-landing-root]')).toHaveClass(/static/);
  await expect(page.locator('#hero-title')).toBeVisible();
});

test('unsupported WebGL and JavaScript-disabled clients retain readable hero', async ({ browser, baseURL }) => {
  const unavailable = await browser.newContext({ baseURL });
  await unavailable.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      return type.startsWith('webgl') ? null : Reflect.apply(get, this, [type, ...args]);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  const p = await unavailable.newPage(); await p.goto('/');
  await expect(p.locator('[data-landing-root]')).toHaveClass(/static/); await expect(p.locator('#hero-title')).toBeVisible(); await unavailable.close();
  const noJs = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const plain = await noJs.newPage(); await plain.goto('/');
  await expect(plain.locator('#hero-title')).toHaveCSS('visibility', 'visible');
  await expect(plain.locator('#skip')).toBeHidden(); await noJs.close();
});

test('client navigation repeatedly cleans up render loops and scoped state', async ({ page }) => {
  await page.addInitScript(() => {
    const raf = window.requestAnimationFrame.bind(window), cancel = window.cancelAnimationFrame.bind(window);
    const pending = new Set<number>();
    window.requestAnimationFrame = callback => {
      let id = 0;
      id = raf(time => { pending.delete(id); callback(time); });
      if (callback.name === 'render') pending.add(id);
      return id;
    };
    window.cancelAnimationFrame = id => { pending.delete(id); cancel(id); };
    Object.defineProperty(window, '__landingPendingFrames', { value: () => pending.size });
  });
  await page.goto('/'); await ready(page);
  for (let i = 0; i < 3; i++) {
    await page.getByRole('link', { name: 'Open workspace' }).click();
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.locator('[data-landing-root]')).toHaveCount(0);
    expect(await page.evaluate(() => typeof window.__unravelStudy)).toBe('undefined');
    expect(await page.evaluate(() => window.__landingPendingFrames!())).toBe(0);
    expect(await page.evaluate(() => document.documentElement.style.getPropertyValue('--hero-shade'))).toBe('');
    await expect(page.getByLabel('Email address', { exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Return to Unravel' }).click(); await ready(page);
    expect(await page.evaluate(() => window.__landingPendingFrames!())).toBeLessThanOrEqual(1);
  }
});

test('cold application route downloads no landing scene resources', async ({ page }) => {
  const assets: string[] = []; page.on('request', req => {
    const path=new URL(req.url()).pathname;
    // The shared 26px brand mark is deliberately reused by authentication.
    if (/\/landing\/(architecture|artwork)\//.test(path)&&path!=='/landing/artwork/unravel-mark.svg') assets.push(path);
  });
  await page.goto('/app'); await expect(page.getByLabel('Email address', { exact: true })).toBeVisible();
  expect(assets).toEqual([]); expect(await page.locator('canvas').count()).toBe(0);
});

test('navigation during pending initialization disposes the stale mount', async ({ page }) => {
  let release!: () => void; const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/landing/architecture/atrium.glb', async route => { await gate; await route.continue(); });
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!(document.querySelector('[data-landing-root]') as HTMLElement & {__unravelStudy?:unknown})?.__unravelStudy);
    await page.getByRole('link', { name: 'Open workspace' }).click(); await expect(page).toHaveURL(/\/sign-in/);
    release(); await page.waitForTimeout(300);
    expect(await page.evaluate(() => typeof window.__unravelStudy)).toBe('undefined');
    await page.unroute('**/landing/architecture/atrium.glb');
    await page.getByRole('link', { name: 'Return to Unravel' }).click(); await ready(page);
    expect((await state(page)).fallback).toBe(false);
  } finally { release(); }
});
