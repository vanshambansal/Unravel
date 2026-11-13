import { Replayer } from '@rrweb/replay';
import '@rrweb/replay/dist/style.css';
import type { eventWithTime } from '@rrweb/types';

let player: Replayer | null = null, channel: string | null = null, duration = 0;
const allowedParents = (document.querySelector('meta[name="unravel-parent-origins"]')?.getAttribute('content') ?? '').split(' ').filter(Boolean);
let parentOrigin: string | null = null;
let fitted = true;
let fittedKey = '', lastTime = -1;
let clock: ReturnType<typeof setTimeout> | undefined;
let replayPlaying = false;
let viewportObserver: ResizeObserver | undefined;
function stopClock() { clearTimeout(clock); clock = undefined; replayPlaying = false; }
function tick() {
  if (!player || !replayPlaying) return;
  fit(); const offset = Math.min(duration, player.getCurrentTime());
  if (offset !== lastTime) { lastTime = offset; post('time', { offset }); }
  clock = setTimeout(tick, 100);
}
const root = document.getElementById('replay')!;
function post(type: string, values: Record<string, unknown> = {}) { if (parentOrigin) parent.postMessage({ type, channel, ...values }, parentOrigin); }
function fit() {
  if (!player) return;
  const frame = player.iframe, width = Number(frame.width) || 1280, height = Number(frame.height) || 720;
  // The embedded viewport can have fractional CSS dimensions. Leave a pixel
  // for layout rounding so the recorded viewport stays wholly inside the host.
  const availableWidth = Math.max(0, Math.min(innerWidth, visualViewport?.width ?? innerWidth) - 1);
  const availableHeight = Math.max(0, Math.min(innerHeight, visualViewport?.height ?? innerHeight) - 1);
  const key = `${width}:${height}:${availableWidth}:${availableHeight}:${fitted}`;
  if (key === fittedKey) return;
  fittedKey = key;
  const scale = fitted ? Math.min(availableWidth / width, availableHeight / height, 1) : 1;
  document.documentElement.style.overflow = fitted ? 'hidden' : 'auto'; document.body.style.overflow = fitted ? 'hidden' : 'auto';
  player.wrapper.style.transformOrigin = 'top left'; player.wrapper.style.transform = `scale(${scale})`;
  player.wrapper.style.margin = '0 auto';
  root.style.width = `${width * scale}px`; root.style.height = `${height * scale}px`;
  if (fitted) window.scrollTo(0,0);
}
window.addEventListener('message', event => {
  if (event.source !== parent || !allowedParents.includes(event.origin) || !event.data || typeof event.data !== 'object') return;
  parentOrigin = event.origin;
  const message = event.data;
  if (message.type === 'ping') { post('ready'); return; }
  try {
    if (message.type === 'initialize' && typeof message.channel === 'string' && !player && Array.isArray(message.events)) {
      channel = message.channel; duration = Number(message.durationMs) || 0;
      player = new Replayer(message.events as eventWithTime[], { root, showWarning: false, showDebug: false, blockClass: 'unravel-replay-block', UNSAFE_replayCanvas: false, mouseTail: false, skipInactive: false, loadTimeout: 0 });
      player.iframe.setAttribute('sandbox', 'allow-same-origin'); // Recorded scripts/forms stay disabled.
      player.iframe.title = 'Masked recorded page';
      player.iframe.style.border = '0';
      player.on('finish', () => { stopClock(); post('finished'); });
      viewportObserver = new ResizeObserver(fit);
      viewportObserver.observe(player.iframe);
      player.pause(0); fit(); post('initialized');
    } else if (message.channel === channel && player) {
      const offset = Math.max(0, Math.min(duration, Number(message.offset) || 0));
      if (message.type === 'play') { stopClock(); replayPlaying = true; player.play(offset); tick(); }
      else if (message.type === 'pause' || message.type === 'seek') { stopClock(); player.pause(offset); fit(); post('seeked', { offset: player.getCurrentTime() }); }
      else if (message.type === 'actual' || message.type === 'fit') { fitted = message.type === 'fit'; fit(); }
    }
  } catch (error) { post('failure', { reason: error instanceof Error ? error.name : 'Unknown replay failure' }); }
});
window.addEventListener('resize', fit);
visualViewport?.addEventListener('resize', fit);
window.addEventListener('pagehide', () => { viewportObserver?.disconnect(); player?.destroy(); player = null; });
window.addEventListener('pagehide', stopClock, { once: true });
