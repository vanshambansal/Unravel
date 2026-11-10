async (page) => {
  const results = [];
  for (const [name, width, height] of [['desktop', 1440, 900], ['wide', 1280, 720], ['mobile', 390, 844]]) {
    const context = await page.context().browser().newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    await context.route('**/src/scene.ts*', async route => { await gate; await route.continue(); });
    const p = await context.newPage();
    try {
      await p.goto('http://127.0.0.1:4174/', { waitUntil: 'domcontentloaded' });
      await p.waitForFunction(() => !!window.__unravelStudy);
      await p.evaluate(async () => {
        await document.fonts.ready;
        const image = new Image();
        image.src = innerWidth <= 700 ? '/artwork/scene-start-mobile.png' : '/artwork/scene-start-desktop.png';
        await image.decode();
        await new Promise(requestAnimationFrame);
      });
      // Freeze through the handoff for a deterministic time-zero comparison.
      await p.getByRole('button', { name: 'Pause motion' }).click();
      // Isolate environmental pixels: Chromium changes text antialiasing when an opaque
      // accelerated canvas is composited below it, even when the environment matches.
      const mask = await p.addStyleTag({ content: '.navigation,.entrance,.hero,.hero-rays,.workflow,.scene-caption,.status{visibility:hidden!important}' });
      await p.screenshot({ path: `.playwright-mcp/handoff-${name}-before.png` });
      // A delayed download must not start a timer-based switch to a different world.
      await p.waitForTimeout(1200);
      release();
      await p.waitForFunction(() => document.documentElement.classList.contains('rendering'));
      await p.screenshot({ path: `.playwright-mcp/handoff-${name}-after.png` });
      await mask.evaluate(node => node.remove());
      const frame = await p.evaluate(() => ({ progress: window.__unravelStudy().progress, time: window.__unravelStudy().scene?.ambientTime, transition: getComputedStyle(document.querySelector('canvas')).transitionDuration }));
      if (frame.progress !== 0 || frame.time !== 0 || frame.transition !== '0s') throw new Error(`Unstable first frame: ${name}`);
      await p.getByRole('button', { name: 'Resume motion' }).click();
      const opening = await p.evaluate(() => window.__unravelStudy().scene);
      await p.waitForTimeout(600);
      const movingOpening = await p.evaluate(() => window.__unravelStudy().scene);
      if (movingOpening.ambientTime <= opening.ambientTime || JSON.stringify(opening.camera) !== JSON.stringify(movingOpening.camera)) throw new Error('Opening must animate without camera drift before scrolling');
      await p.getByRole('button', { name: 'Skip Intro' }).click();
      const first = await p.evaluate(() => window.__unravelStudy().scene);
      await p.waitForTimeout(1200);
      const later = await p.evaluate(() => window.__unravelStudy().scene);
      if (JSON.stringify(first.camera) !== JSON.stringify(later.camera)) throw new Error('Ambient camera drift');
      if (first.environment.crimsonIntensity === later.environment.crimsonIntensity || first.environment.edgeIntensity === later.environment.edgeIntensity || first.environment.hazeOffset === later.environment.hazeOffset) throw new Error('Ambient environment did not change');
      await p.getByRole('button', { name: 'Pause motion' }).click();
      const frozen = await p.evaluate(() => window.__unravelStudy().scene.environment);
      await p.waitForTimeout(250);
      if (JSON.stringify(frozen) !== JSON.stringify(await p.evaluate(() => window.__unravelStudy().scene.environment))) throw new Error('Ambient pause failed');
      await p.screenshot({ path: `.playwright-mcp/revised-hero-${name}.png` });
      results.push({ name, firstFrame: frame, openingMovesBeforeScroll: true, ambientChanges: true, pausedCorrectly: true });
    } finally { release(); await context.close(); }
  }
  return results;
}
