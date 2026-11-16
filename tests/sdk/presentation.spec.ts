import { test, expect, type Page } from '@playwright/test';
import { build } from '../../packages/sdk/node_modules/esbuild/lib/main.js';
import { fileURLToPath } from 'node:url';
import type { Recorder, RecorderOptions } from '../../packages/sdk/src/types';
import type { Recording } from '../../packages/contracts/src/index';
import { validateSubmission } from '../../apps/web/src/server/reports/validation';

type Host = Window & {
  fixtureRecorder: Recorder;
  UnravelSDK: { initialize(options: RecorderOptions): Recorder };
  presentationRecording: Recording;
  presentationPlayer: { pause(offset: number): void; destroy(): void };
  UnravelReplayer: new (
    events: unknown[],
    options: Record<string, unknown>,
  ) => Host['presentationPlayer'];
};
const bundle = fileURLToPath(new URL('../../.cache/presentation-replay.js', import.meta.url));
const projectId = '12345678-1234-4234-8234-123456789012';
const ids = [
  'route',
  'child',
  'hidden',
  'focus',
  'hover',
  'checked',
  'check',
  'animated',
  'responsive',
  'container',
  'private',
];
test.beforeAll(async () => {
  await build({
    stdin: {
      contents:
        "import {Replayer} from '@rrweb/replay'; import '@rrweb/replay/dist/style.css'; window.UnravelReplayer=Replayer;",
      resolveDir: fileURLToPath(new URL('../../apps/web', import.meta.url)),
    },
    outfile: bundle,
    bundle: true,
    platform: 'browser',
    format: 'iife',
  });
});

async function start(
  page: Page,
  html: string,
  css: string,
  mode: 'full' | 'masked-values' = 'full',
  limits?: RecorderOptions['limits'],
) {
  await page.goto('/?debug=1');
  await page.evaluate(
    async ({ html, css, mode, projectId, ids, limits }) => {
      const host = window as unknown as Host;
      host.fixtureRecorder.destroy();
      document.body.innerHTML = `<style>${css}</style><div data-testid="container">${html}</div>`;
      host.fixtureRecorder = host.UnravelSDK.initialize({
        projectId,
        privacy: { mode, testIds: ids },
        limits,
      });
      await host.fixtureRecorder.start();
    },
    { html, css, mode, projectId, ids, limits },
  );
}
async function stopAndReplay(page: Page) {
  const recording = await page.evaluate(() => {
    const host = window as unknown as Host;
    const recording = host.fixtureRecorder.stop()!;
    host.presentationRecording = recording;
    return recording;
  });
  validateSubmission({ version: 1, title: 'Presentation regression', description: '', recording });
  await page.addScriptTag({ path: bundle });
  await page.addStyleTag({ path: bundle.replace(/\.js$/, '.css') });
  await page.evaluate(() => {
    const host = window as unknown as Host;
    const root = document.createElement('div');
    root.id = 'replay-probe';
    document.body.append(root);
    host.presentationPlayer = new host.UnravelReplayer(host.presentationRecording.replay, {
      root,
      showWarning: false,
      mouseTail: false,
    });
    const events = host.presentationRecording.replay;
    // Seek past the final mutation, not exactly onto rrweb's event boundary.
    host.presentationPlayer.pause(
      Math.max(
        host.presentationRecording.startedAt +
          host.presentationRecording.durationMs -
          events[0].timestamp,
        events.at(-1)!.timestamp - events[0].timestamp,
      ) + 1,
    );
  });
  return recording;
}
function replay(page: Page) {
  return page.frameLocator('#replay-probe iframe');
}

for (const mode of ['full', 'masked-values'] as const) {
  test(`CSS fade-up route mounts reach visible state and keep privacy: ${mode}`, async ({
    page,
  }) => {
    await start(
      page,
      '<h1>Initial route</h1>',
      '@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.fade{animation:fadeUp .24s both}',
      mode,
    );
    await page.evaluate(() => {
      history.pushState({}, '', '/recap');
      document.querySelector('[data-testid=container]')!.innerHTML =
        '<main class="fade" data-testid="route"><h2>Recap arrived</h2><input data-testid="private" type="password" value="SYNTHETIC_VALUE"><div style="opacity:0" data-testid="hidden">Keep invisible</div></main>';
    });
    await expect(page.getByTestId('route')).toHaveCSS('opacity', '1');
    await page.waitForTimeout(350);
    const recording = await stopAndReplay(page);
    await expect(replay(page).getByTestId('route')).toHaveCSS('opacity', '1');
    await expect(replay(page).getByText('Recap arrived')).toBeVisible();
    await expect(replay(page).getByTestId('hidden')).toHaveCSS('opacity', '0');
    await expect(replay(page).getByTestId('private')).toHaveValue(
      mode === 'full' ? 'SYNTHETIC_VALUE' : '',
    );
    expect(recording.events.some((e) => e.kind === 'navigation')).toBe(true);
    if (mode === 'masked-values')
      expect(JSON.stringify(recording)).not.toContain('SYNTHETIC_VALUE');
  });
}

test('ancestor classes and stylesheet changes update existing descendants', async ({ page }) => {
  await start(
    page,
    '<section data-testid="route"><p data-testid="child">Inherited theme</p></section>',
    '.night p{color:rgb(220,30,40);display:none}',
  );
  await page.getByTestId('route').evaluate((e) => e.setAttribute('class', 'night'));
  await page.waitForTimeout(400);
  await stopAndReplay(page);
  await expect(replay(page).getByTestId('child')).toHaveCSS('display', 'none');
  await expect(replay(page).getByTestId('child')).toHaveCSS('color', 'rgb(220, 30, 40)');
});

test('editing stylesheet text is reflected without copying executable CSS', async ({ page }) => {
  await start(page, '<p data-testid="child">New stylesheet</p>', 'p{color:rgb(0,0,0)}');
  await page.evaluate(
    () => (document.querySelector('style')!.textContent = 'p{color:rgb(10,120,90)}'),
  );
  await page.waitForTimeout(400);
  await stopAndReplay(page);
  await expect(replay(page).getByTestId('child')).toHaveCSS('color', 'rgb(10, 120, 90)');
});

test('CSS transition completion preserves intentional partial opacity', async ({ page }) => {
  await start(
    page,
    '<section data-testid="route">Transitioned panel</section>',
    'section{opacity:1;transition:opacity .25s}.dim{opacity:.25}',
  );
  await page.waitForTimeout(150);
  await page.getByTestId('route').evaluate((e) => e.setAttribute('class', 'dim'));
  await expect(page.getByTestId('route')).toHaveCSS('opacity', '0.25');
  await page.waitForTimeout(350);
  await stopAndReplay(page);
  await expect(replay(page).getByTestId('route')).toHaveCSS('opacity', '0.25');
});

test('Web Animations fill and cancellation capture final/restored styles', async ({ page }) => {
  await start(page, '<section data-testid="animated">WAAPI target</section>', 'section{opacity:1}');
  await page
    .getByTestId('animated')
    .evaluate((e) =>
      e.animate([{ opacity: 1 }, { opacity: 0.2 }], { duration: 220, fill: 'forwards' }),
    );
  await expect(page.getByTestId('animated')).toHaveCSS('opacity', '0.2');
  await page.waitForTimeout(250);
  await stopAndReplay(page);
  await expect(replay(page).getByTestId('animated')).toHaveCSS('opacity', '0.2');
});

test('animation cancellation does not leave an obsolete hidden state', async ({ page }) => {
  await start(
    page,
    '<section data-testid="animated">Cancelled animation</section>',
    'section{opacity:1}',
  );
  await page
    .getByTestId('animated')
    .evaluate((e) =>
      e.animate([{ opacity: 0 }, { opacity: 0.2 }], { duration: 1000, fill: 'forwards' }),
    );
  await page.waitForTimeout(250);
  await page.evaluate(() => document.getAnimations().forEach((a) => a.cancel()));
  await page.waitForTimeout(350);
  await stopAndReplay(page);
  await expect(replay(page).getByTestId('animated')).toHaveCSS('opacity', '1');
});

test('focus and checkbox-dependent styles update without inventing visibility', async ({
  page,
}) => {
  await start(
    page,
    '<input data-testid="focus"><div data-testid="child">Focus sibling</div><input type="checkbox" data-testid="check"><label data-testid="checked">Checked sibling</label>',
    'input:focus + div{opacity:.4}input:checked + label{opacity:.3}',
  );
  await page.getByTestId('check').check();
  await page.getByTestId('focus').focus();
  await page.waitForTimeout(400);
  await stopAndReplay(page);
  await expect(replay(page).getByTestId('child')).toHaveCSS('opacity', '0.4');
  await expect(replay(page).getByTestId('checked')).toHaveCSS('opacity', '0.3');
});

test('responsive presentation changes survive without external media rules', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 700 });
  await start(
    page,
    '<section data-testid="responsive">Responsive panel</section>',
    '@media(max-width:600px){section{display:none}}',
  );
  await page.setViewportSize({ width: 390, height: 700 });
  await page.waitForTimeout(450);
  await stopAndReplay(page);
  await expect(replay(page).getByTestId('responsive')).toHaveCSS('display', 'none');
});

test('many animated mounts do not starve a late route target', async ({ page }) => {
  await start(
    page,
    '<h1>Large route</h1>',
    '@keyframes show{from{opacity:0}to{opacity:1}}.fade{animation:show .2s both}',
  );
  await page.evaluate(() => {
    document.querySelector('[data-testid=container]')!.innerHTML =
      Array.from({ length: 80 }, () => '<div class="fade">Synthetic tile</div>').join('') +
      '<main class="fade" data-testid="route">Late route</main>';
  });
  await page.waitForTimeout(1600);
  await stopAndReplay(page);
  await expect(replay(page).getByTestId('route')).toHaveCSS('opacity', '1');
});

test('blocked animated content stays excluded and teardown stops style reads', async ({ page }) => {
  await start(
    page,
    '<div data-unravel-block>BLOCKED_SENTINEL</div><p data-testid="child">Safe content</p>',
    'div{animation:fade .2s infinite}@keyframes fade{from{opacity:0}to{opacity:1}}',
  );
  await page.waitForTimeout(300);
  const recording = await stopAndReplay(page);
  expect(JSON.stringify(recording)).not.toContain('BLOCKED_SENTINEL');
  await page.evaluate(() => {
    const original = window.getComputedStyle;
    Object.assign(window, { styleReadCount: 0 });
    window.getComputedStyle = (...args) => {
      (window as unknown as { styleReadCount: number }).styleReadCount++;
      return original(...args);
    };
  });
  await page.waitForTimeout(400);
  expect(
    await page.evaluate(() => (window as unknown as { styleReadCount: number }).styleReadCount),
  ).toBe(0);
});

test('hover-only styling is sampled without class or inline-style changes', async ({ page }) => {
  await start(
    page,
    '<button data-testid="hover">Hover state</button>',
    'button:hover{opacity:.35}',
  );
  await page.getByTestId('hover').hover();
  await page.waitForTimeout(350);
  await stopAndReplay(page);
  await expect(replay(page).getByTestId('hover')).toHaveCSS('opacity', '0.35');
});

test('async text growth updates layout instead of clipping at the initial height', async ({
  page,
}) => {
  await start(
    page,
    '<section data-testid="route"><p data-testid="child">Loading</p></section>',
    'section{width:180px;font:16px/20px monospace}p{margin:0}',
  );
  await page
    .getByTestId('child')
    .evaluate((e) => (e.textContent = 'Synthetic async result '.repeat(30)));
  await page.waitForTimeout(450);
  const sourceHeight = await page
    .getByTestId('route')
    .evaluate((e) => e.getBoundingClientRect().height);
  await stopAndReplay(page);
  const replayHeight = await replay(page)
    .getByTestId('route')
    .evaluate((e) => e.getBoundingClientRect().height);
  expect(replayHeight).toBeGreaterThan(100);
  expect(Math.abs(sourceHeight - replayHeight)).toBeLessThan(3);
});

test('repeated SPA tab mounts and removals retain the latest route content', async ({ page }) => {
  await start(
    page,
    '<p>First route</p>',
    '@keyframes enter{from{opacity:0}to{opacity:1}}main{animation:enter .15s both}',
  );
  for (const name of ['second', 'third', 'final']) {
    await page.evaluate((name) => {
      history.pushState({}, '', '/' + name);
      document.querySelector('[data-testid=container]')!.innerHTML =
        `<main data-testid="route"><h2>${name} route</h2></main>`;
    }, name);
    await page.waitForTimeout(300);
  }
  await stopAndReplay(page);
  await expect(replay(page).getByTestId('route')).toHaveCSS('opacity', '1');
  await expect(replay(page).getByText('final route', { exact: true })).toBeVisible();
  await expect(replay(page).getByText('second route', { exact: true })).toHaveCount(0);
});

test('reduced-motion rules and intentionally hidden siblings remain distinct', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await start(
    page,
    '<main data-testid="route">Reduced motion</main><p data-testid="hidden">Still hidden</p>',
    'main{opacity:0;animation:enter 1s both}@keyframes enter{to{opacity:1}}@media(prefers-reduced-motion:reduce){main{animation:none;opacity:1}}p{visibility:hidden}',
  );
  await page.waitForTimeout(250);
  await stopAndReplay(page);
  await expect(replay(page).getByTestId('route')).toHaveCSS('opacity', '1');
  await expect(replay(page).getByTestId('hidden')).toHaveCSS('visibility', 'hidden');
});

test('presentation sampling obeys the shared event budget and stops capture', async ({ page }) => {
  await start(
    page,
    '<p data-testid="animated">Budgeted animation</p>',
    '@keyframes pulse{from{opacity:.1}to{opacity:.9}}p{animation:pulse .3s linear infinite}',
    'full',
    { maxEvents: 6 },
  );
  await expect
    .poll(() => page.evaluate(() => (window as unknown as Host).fixtureRecorder.getStatus().reason))
    .toBe('event-limit');
  const status = await page.evaluate(() => (window as unknown as Host).fixtureRecorder.getStatus());
  expect(status.eventCount).toBe(6);
  await page.waitForTimeout(300);
  expect(
    await page.evaluate(() => (window as unknown as Host).fixtureRecorder.getStatus().eventCount),
  ).toBe(6);
});

test('color-scheme changes during capture update inherited presentation', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await start(
    page,
    '<p data-testid="child">Theme switch</p>',
    'p{color:rgb(10,20,30)}@media(prefers-color-scheme:dark){p{color:rgb(210,220,230)}}',
  );
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(400);
  await stopAndReplay(page);
  await expect(replay(page).getByTestId('child')).toHaveCSS('color', 'rgb(210, 220, 230)');
});
