async (page) => {
  const context = await page.context().browser().newContext({ deviceScaleFactor: 1, reducedMotion: 'no-preference' });
  const capture = await context.newPage();
  const outputs = [];
  try {
    for (const [device, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
      await capture.setViewportSize({ width, height });
      for (const frame of ['start', 'hero']) {
        await capture.goto(`http://127.0.0.1:4174/capture.html?frame=${frame}`);
        await capture.waitForFunction(() => document.documentElement.dataset.captureReady === 'true');
        const path = `prototypes/landing-motion/public/artwork/scene-${frame}-${device}.png`;
        await capture.screenshot({ path, scale: 'css' });
        outputs.push({ path, width, height });
      }
    }
    return { outputs, browser: context.browser().version() };
  } finally { await context.close(); }
}
