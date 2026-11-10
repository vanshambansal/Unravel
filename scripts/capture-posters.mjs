import { chromium } from '@playwright/test';
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
const context = await browser.newContext({ deviceScaleFactor: 1 });
const page = await context.newPage();
page.setDefaultTimeout(120_000);
try {
  for (const [device,width,height] of [['desktop',1440,900],['mobile',390,844]]) {
    await page.setViewportSize({ width, height });
    for (const frame of ['start','hero']) {
      const response = await page.goto(`${process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'}/motion-capture?frame=${frame}`);
      if (!response?.ok()) throw new Error(`Capture route returned HTTP ${response?.status()}`);
      await page.waitForFunction(() => !!document.querySelector('canvas')?.getAttribute('data-capture-ready') || !!document.querySelector('canvas')?.getAttribute('data-capture-error'));
      const error = await page.locator('canvas').getAttribute('data-capture-error');
      if (error) throw new Error(error);
      const path = `apps/web/public/landing/artwork/scene-${frame}-${device}.png`;
      await page.screenshot({ path, scale: 'css' }); console.log('Captured ' + path);
    }
  }
} finally { await browser.close(); }
