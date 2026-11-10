async (page) => {
  const checks = [];
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1440, height: 700 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('http://127.0.0.1:4174/');
    await page.waitForFunction(() => !!window.__unravelStudy?.().scene);
    await page.evaluate(() => scrollTo(0, innerHeight * 1.85));
    await page.waitForFunction(() => getComputedStyle(document.querySelector('#hero-actions')).opacity === '1');
    await page.mouse.wheel(0, Math.round(viewport.height * .5));
    // Wheel dispatch returns before Chromium finishes applying native input.
    await page.waitForFunction(() => Math.abs(scrollY - innerHeight * 2.35) <= 2);
    const held = await page.evaluate(() => {
      const stage = document.querySelector('#stage').getBoundingClientRect();
      const cta = document.querySelector('#hero-actions').getBoundingClientRect();
      const strip = document.querySelector('#workflow').getBoundingClientRect();
      return { scroll: scrollY, top: stage.top, ctaBottom: cta.bottom, stripTop: strip.top, height: innerHeight };
    });
    if (Math.abs(held.top) > 1 || held.ctaBottom > held.height || held.ctaBottom > held.stripTop) throw new Error(`Hero not readable during hold: ${JSON.stringify(held)}`);
    await page.waitForTimeout(500);
    if (await page.evaluate(y => scrollY !== y, held.scroll)) throw new Error('Unexpected automatic scroll');
    await page.mouse.wheel(0, Math.round(viewport.height * .5));
    await page.waitForFunction(() => document.querySelector('#stage').getBoundingClientRect().top < -50);
    checks.push({ viewport, held, normalExit: true });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:4174/');
  return checks;
}
