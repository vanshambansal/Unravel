async (page) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:4174/');
  await page.waitForFunction(() => document.documentElement.classList.contains('rendering'));
  await page.evaluate(() => scrollTo(0, 0));
  await page.mouse.move(290, 560);
  await page.waitForTimeout(500);
  const first = await page.evaluate(() => window.__unravelStudy().heroRays);
  if (!first.opening) throw new Error('Opening ray profile missing');
  await page.getByRole('button', { name: 'Pause motion' }).click();
  const frozen = await page.evaluate(() => window.__unravelStudy().heroRays);
  await page.waitForTimeout(200);
  if (JSON.stringify(frozen) !== JSON.stringify(await page.evaluate(() => window.__unravelStudy().heroRays))) throw new Error('Opening pause failed');
  const samples = [];
  // Sample the furthest strip through small camera movements, not just at the hero.
  for (const progress of [0, .005, .01, .015, .02, .03, .06, .12]) {
    await page.evaluate(p => scrollTo(0, innerHeight * 2 * p), progress);
    await page.waitForFunction(p => Math.abs(window.__unravelStudy().progress - p) < .001, progress);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const projected = await page.evaluate(async () => {
      const THREE = await import('/node_modules/.vite/deps/three.js');
      const { choreography } = await import('/src/choreography.ts');
      const study = window.__unravelStudy(), frame = choreography(study.progress);
      const camera = new THREE.PerspectiveCamera(53, 1.6, .15, 180);
      camera.position.fromArray(study.scene.camera); camera.lookAt(frame.look.x, frame.look.y, frame.look.z); camera.updateMatrixWorld();
      const point = new THREE.Vector3(16.095, 10, -49).project(camera);
      const rect = document.querySelector('#scene').getBoundingClientRect(), scale = Math.max(rect.width / 1440, rect.height / 900);
      return { x: rect.left + (point.x + 1) / 2 * 1440 * scale - (1440 * scale - rect.width) / 2, y: rect.top + (1 - point.y) / 2 * 900 * scale - (900 * scale - rect.height) / 2 };
    });
    const data = (await page.screenshot()).toString('base64');
    const redPixels = await page.evaluate(async ({ data, projected }) => {
      const img = new Image(); img.src = `data:image/png;base64,${data}`; await img.decode();
      const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
      const pixels = ctx.getImageData(Math.round(projected.x) - 4, Math.round(projected.y) - 30, 9, 60).data;
      let count = 0;
      for (let i = 0; i < pixels.length; i += 4) if (pixels[i] > 65 && pixels[i] > pixels[i + 1] * 1.7 && pixels[i] > pixels[i + 2] * 1.2) count++;
      return count;
    }, { data, projected });
    if (redPixels < 25) throw new Error(`Distant strip lost coverage at ${progress}: ${redPixels}`);
    samples.push({ progress, redPixels });
  }
  await page.getByRole('button', { name: 'Resume motion' }).click();
  await page.evaluate(() => scrollTo(0, innerHeight * .9));
  await page.waitForFunction(() => getComputedStyle(document.querySelector('#hero-rays')).opacity === '0');
  await page.evaluate(() => scrollTo(0, innerHeight * 2));
  await page.waitForFunction(() => !window.__unravelStudy().heroRays.opening);
  if (await page.locator('#hero-rays').evaluate(el => getComputedStyle(el).opacity) !== '1') throw new Error('Hero rays missing');
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForFunction(() => window.__unravelStudy().heroRays.opening);
  await page.screenshot({ path: '.playwright-mcp/entrance-polish-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.waitForFunction(() => document.documentElement.classList.contains('rendering'));
  await page.screenshot({ path: '.playwright-mcp/entrance-polish-mobile.png' });
  return { openingRays: true, pause: true, distantStripCoverage: samples, transitionClear: true, heroRays: true, reverse: true };
}
