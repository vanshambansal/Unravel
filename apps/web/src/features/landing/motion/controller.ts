import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { choreography, journeyTiming, journeyViewports } from './choreography';
import { initializeHeroRays } from './hero-rays';
import { PerformanceGuard } from './quality';
import type { ArchitecturalScene, SceneMetrics } from './scene';

gsap.registerPlugin(ScrollTrigger);
export interface LandingSnapshot {
  progress: number; paused: boolean; reduced: boolean; fallback: boolean; visible: boolean;
  frameTimes: number[]; scene?: SceneMetrics;
  heroRays?: { time: number; aim: number; focus: number; opening: boolean };
}
type LandingRoot = HTMLElement & { __unravelStudy?: () => LandingSnapshot };
declare global { interface Window { __unravelStudy?: () => LandingSnapshot } }

/** Owns only this mounted landing instance. Safe to import; no DOM work at module scope. */
export function mountLandingMotion(host: HTMLElement): () => void {
  const root = host as LandingRoot;
  const initialClass = root.className;
  const initialAttributes = [root, ...root.querySelectorAll<HTMLElement>('*')].map(node => ({
    node, values: Object.fromEntries(['style', 'hidden', 'inert', 'aria-pressed', 'disabled'].map(name => [name, node.getAttribute(name)])),
  }));
  root.style.setProperty('--journey-height', `${journeyViewports * 100}svh`);
  const element = <T extends HTMLElement>(id: string) => root.querySelector<T>(`[id="${id}"]`)!;
  const stage = element('stage'), journey = element('journey'), hero = element('hero');
  const title = element('hero-title'), entrance = element('entrance'), skip = element<HTMLButtonElement>('skip');
  const ambientButton = element<HTMLButtonElement>('ambient'), status = element('status');
  const replayButton = element<HTMLButtonElement>('replay');
  const canvas = element<HTMLCanvasElement>('scene');
  let heroRays: ReturnType<typeof initializeHeroRays>;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const performanceGuard = new PerformanceGuard();
  let scene: ArchitecturalScene | undefined, trigger: ScrollTrigger | undefined;
  let progress = 0, paused = false, visible = true, fallback = false, reduced = media.matches;
  let generation = 0, raf = 0, previous = 0, disposed = false;
  let pendingSkip = false;
  const frameTimes: number[] = [];

  function reveal(id: string, value: number, translate = true) {
    const node = element(id);
    node.style.opacity = String(value);
    node.style.visibility = value > .001 ? 'visible' : 'hidden';
    if (translate) node.style.transform = `translateY(${12 * (1 - value)}px)`;
    node.inert = value < .99;
  }
  function present(p: number) {
    progress = p;
    const frame = choreography(p);
    root.style.setProperty('--hero-shade', String(frame.title));
    stage.style.setProperty('--hero-rays', String(Math.max(frame.entrance, frame.title)));
    stage.classList.toggle('opening-rays', frame.entrance > .001);
    heroRays?.opening(frame.entrance > .001);
    entrance.style.opacity = String(frame.entrance);
    entrance.style.visibility = frame.entrance > .001 ? 'visible' : 'hidden';
    reveal('hero-eyebrow', frame.eyebrow);
    reveal('hero-title', frame.title);
    reveal('hero-description', frame.description);
    reveal('hero-actions', frame.actions);
    reveal('workflow', frame.actions, false);
    hero.inert = p < .75;
    skip.hidden = frame.actions === 1;
    scene?.updateProgress(p);
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; previous = 0; performanceGuard.reset(); }
  function render(now: number) {
    raf = 0;
    if (!scene || disposed || document.hidden || !visible) return;
    const delta = previous ? Math.min((now - previous) / 1000, .25) : 1 / 60;
    previous = now;
    try { scene.render(delta); } catch { activateFallback('The architectural preview could not render. Static hero shown.'); return; }
    if (choreography(progress).entrance > .001 || progress >= .73) heroRays?.render(delta, paused);
    if (frameTimes.length < 1200) frameTimes.push(delta * 1000);
    if (!paused && performanceGuard.push(delta * 1000)) {
      if (scene.reduceQuality()) {
        performanceGuard.reset(); status.textContent = 'Lighter rendering active';
      } else { activateFallback('A lighter static view is active for smooth browsing.'); return; }
    }
    if (!paused) raf = requestAnimationFrame(render);
  }
  function wake() {
    if (!raf && scene && !document.hidden && visible && !disposed) raf = requestAnimationFrame(render);
  }
  function activateFallback(message: string) {
    fallback = true; generation++; stop(); trigger?.kill(); trigger = undefined;
    scene?.dispose(); scene = undefined; heroRays?.dispose(); heroRays = undefined;
    root.classList.remove('rendering');
    root.classList.add('static');
    present(1); ambientButton.disabled = true; status.textContent = message;
  }
  async function setup() {
    const ticket = ++generation;
    stop(); trigger?.kill(); trigger = undefined; scene?.dispose(); scene = undefined; heroRays?.dispose(); heroRays = undefined;
    root.classList.remove('rendering');
    reduced = media.matches;
    if (reduced || fallback) { activateFallback(reduced ? 'Reduced motion Â· static architectural view' : status.textContent ?? 'Static architectural view'); return; }
    root.classList.remove('static');
    ambientButton.disabled = false; status.textContent = '';
    // HTML/poster remain useful if the renderer chunk cannot load.
    try {
      const { initializeScene } = await import('./scene');
      if (ticket !== generation || disposed) return;
      const initialized = await initializeScene(canvas, innerWidth <= 700 ? 'mobile' : 'desktop');
      if (ticket !== generation || disposed) { initialized.dispose(); return; }
      scene = initialized; positionEntranceLight();
      heroRays = initializeHeroRays(element<HTMLCanvasElement>('hero-rays'));
      scene.resize(stage.clientWidth, stage.clientHeight); scene.pauseAmbient(paused);
      trigger = ScrollTrigger.create({ trigger: journey, start: 'top top', end: () => `+=${innerHeight * journeyTiming.cameraViewports}`, onUpdate: self => { present(self.progress); wake(); }, invalidateOnRefresh: true });
      // Same progress and time-zero state used by capture.html. Never reveal an unrendered canvas.
      present(pendingSkip ? 1 : trigger.progress); scene.render(0); heroRays?.render(0, true);
      root.classList.add('rendering');
      if (pendingSkip) { pendingSkip = false; skipIntro(); }
      wake();
    } catch { if (ticket === generation) activateFallback('3D is unavailable Â· static architectural view'); }
  }
  function skipIntro() {
    if (!scene && !fallback) pendingSkip = true;
    root.classList.add('preview-hero');
    if (trigger) window.scrollTo({ top: trigger.end, behavior: 'instant' });
    present(1); wake(); title.focus({ preventScroll: true });
  }
  function toggleAmbient() {
    paused = !paused; scene?.pauseAmbient(paused);
    ambientButton.setAttribute('aria-pressed', String(paused));
    ambientButton.textContent = paused ? 'Resume motion' : 'Pause motion';
    if (paused) stop(); wake();
  }
  function positionEntranceLight() {
    if (disposed) return;
    const heading = entrance.querySelector<HTMLElement>('.entrance-title')!;
    const description = entrance.querySelector<HTMLElement>('.muted')!;
    const a = heading.getBoundingClientRect(), b = description.getBoundingClientRect(), host = stage.getBoundingClientRect();
    stage.style.setProperty('--entrance-light-left', `${Math.max(0, a.left - host.left - 80)}px`);
    stage.style.setProperty('--entrance-light-right', `${Math.min(host.width, a.right - host.left + 100)}px`);
    stage.style.setProperty('--entrance-light-bottom', `${b.bottom - host.top + 40}px`);
  }
  function resize() {
    positionEntranceLight(); scene?.resize(stage.clientWidth, stage.clientHeight); ScrollTrigger.refresh(); wake();
  }
  function pointer(event: PointerEvent) {
    if (!scene || paused || reduced || !visible || document.hidden || event.pointerType === 'touch') return;
    const rect = stage.getBoundingClientRect();
    const active = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    heroRays?.pointer((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height, active); wake();
  }
  function pointerLeave() { heroRays?.pointer(.5, .5, false); if (!paused) wake(); }
  function visibility() { if (document.hidden) stop(); else wake(); }
  function preference() { if (disposed) return; fallback = false; void setup(); }
  function contextLost(event: Event) { event.preventDefault(); activateFallback('Graphics context lost Â· static architectural view'); }
  function replay() {
    if (reduced || fallback) { title.focus({ preventScroll: false }); return; }
    pendingSkip = false; root.classList.remove('preview-hero');
    window.scrollTo({ top: 0, behavior: 'instant' }); present(0); wake(); skip.focus({ preventScroll: true });
  }
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].intersectionRatio >= .01; if (visible) wake(); else stop();
  }, { threshold: [0, .01] }); observer.observe(stage);
  skip.addEventListener('click', skipIntro);
  ambientButton.addEventListener('click', toggleAmbient);
  replayButton.addEventListener('click', replay);
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', pointer, { passive: true });
  document.documentElement.addEventListener('pointerleave', pointerLeave);
  document.addEventListener('visibilitychange', visibility);
  media.addEventListener('change', preference);
  canvas.addEventListener('webglcontextlost', contextLost);
  function pageHide(event: PageTransitionEvent) { if (!event.persisted) dispose(); }
  window.addEventListener('pagehide', pageHide);
  function dispose() {
    if (disposed) return;
    disposed = true; generation++; stop(); trigger?.kill(); scene?.dispose(); heroRays?.dispose(); observer.disconnect();
    skip.removeEventListener('click', skipIntro); ambientButton.removeEventListener('click', toggleAmbient);
    replayButton.removeEventListener('click', replay); window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', pointer);
    document.documentElement.removeEventListener('pointerleave', pointerLeave);
    document.removeEventListener('visibilitychange', visibility); media.removeEventListener('change', preference);
    canvas.removeEventListener('webglcontextlost', contextLost);
    window.removeEventListener('pagehide', pageHide);
    root.className = initialClass;
    for (const { node, values } of initialAttributes) for (const [name, value] of Object.entries(values)) {
      if (value === null) node.removeAttribute(name); else node.setAttribute(name, value);
    }
    if (root.__unravelStudy === snapshot) delete root.__unravelStudy;
    if (window.__unravelStudy === snapshot) delete window.__unravelStudy;
  }
  // Read-only measurements; the global bridge is development/test-only and removed on cleanup.
  const snapshot = (): LandingSnapshot => ({ progress, paused, reduced, fallback, visible, frameTimes: [...frameTimes], scene: scene?.metrics(), heroRays: heroRays?.metrics() });
  root.__unravelStudy = snapshot;
  if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_MOTION_DIAGNOSTICS === '1') window.__unravelStudy = snapshot;
  void document.fonts.ready.then(positionEntranceLight);
  void setup();
  return dispose;
}
