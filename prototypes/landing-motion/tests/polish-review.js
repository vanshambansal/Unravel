async (page) => {
  // Keep only one active scene while recording; recording is not a GPU benchmark.
  await page.evaluate(() => {
    const button = document.getElementById('ambient');
    if (button?.textContent === 'Pause motion') button.click();
  });
  const context = await page.context().browser().newContext({
    viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
    recordVideo: { dir: '.playwright-mcp/polish-recording', size: { width: 960, height: 540 } },
  });
  const p = await context.newPage();
  const errors = [];
  p.on('pageerror', error => errors.push(error.message));
  p.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  let result;
  try {
    await p.goto('http://127.0.0.1:4174/');
    await p.waitForFunction(() => document.documentElement.classList.contains('rendering'));
    const opening = await p.evaluate(() => window.__unravelStudy().scene);
    await p.screenshot({ path: '.playwright-mcp/polish-opening-final.png' });
    await p.waitForTimeout(3000);
    const alive = await p.evaluate(() => window.__unravelStudy().scene);
    if (alive.ambientTime <= opening.ambientTime || JSON.stringify(alive.camera) !== JSON.stringify(opening.camera)) throw new Error('Opening motion/camera regression');
    await p.screenshot({ path: '.playwright-mcp/polish-opening-moving.png' });
    const travel = async (from, to, duration) => p.evaluate(async ({ from, to, duration }) => {
      const start = performance.now();
      while (true) {
        const elapsed = Math.min(1, (performance.now() - start) / duration);
        scrollTo(0, innerHeight * 2 * (from + (to - from) * elapsed));
        if (elapsed === 1) break;
        await new Promise(requestAnimationFrame);
      }
    }, { from, to, duration });
    await travel(0, .5, 2200);
    await p.screenshot({ path: '.playwright-mcp/polish-crossing-final.png' });
    await travel(.5, 1, 2200);
    await p.waitForTimeout(3000);
    await p.screenshot({ path: '.playwright-mcp/polish-hero-final.png' });
    await p.getByRole('button', { name: 'Pause motion' }).click();
    const frozen = await p.evaluate(() => window.__unravelStudy().scene);
    await p.waitForTimeout(500);
    const paused = await p.evaluate(() => window.__unravelStudy().scene);
    if (JSON.stringify(frozen.environment) !== JSON.stringify(paused.environment)) throw new Error('Pause failed');
    const state = await p.evaluate(() => window.__unravelStudy());
    if (state.fallback || state.progress !== 1 || state.scene.quality === 'low' || errors.length) throw new Error(JSON.stringify({ errors, fallback: state.fallback, quality: state.scene?.quality }));
    result = { openingAliveBeforeScroll: true, cameraStableAtIdle: true, pause: true, fullHero: true, errors, quality: state.scene.quality };
  } finally { await context.close(); }
  await p.video().saveAs('.playwright-mcp/unravel-final-polish.webm');
  return { ...result, video: '.playwright-mcp/unravel-final-polish.webm' };
}
