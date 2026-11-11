type Anchor = { x: number; y: number };
type PositionOptions = { host: HTMLElement; shadow: ShadowRoot; projectId: string; signal: AbortSignal; cancelMotion(): void; announce(message: string): void };

/** Local presentation preference only. No recording data is stored here. */
export function widgetPosition({ host, shadow, projectId, signal, cancelMotion, announce }: PositionOptions) {
  const key = `unravel.widget-position.${projectId}`;
  let preferred: Anchor | null = null;
  let drag: { id: number; startX: number; startY: number; left: number; top: number; original: Anchor | null; active: boolean } | null = null;
  let suppressClickUntil = 0;
  let suppressedPointer: number | null = null;
  try {
    const value = JSON.parse(sessionStorage.getItem(key) ?? 'null');
    if (value && Number.isFinite(value.x) && Number.isFinite(value.y) && value.x >= 0 && value.x <= 1 && value.y >= 0 && value.y <= 1) preferred = { x: value.x, y: value.y };
  } catch { /* A host's storage policy must not prevent bug reporting. */ }
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, Math.max(min, max)));
  function viewport() {
    const view = window.visualViewport;
    return { left: view?.offsetLeft ?? 0, top: view?.offsetTop ?? 0, width: view?.width ?? document.documentElement.clientWidth, height: view?.height ?? innerHeight };
  }
  function reconcile() {
    const view = viewport(), margin = view.width <= 520 ? 16 : 24;
    host.style.setProperty('--unravel-max-width', `${Math.max(1, view.width - 2 * margin)}px`);
    host.style.setProperty('--unravel-max-height', `${Math.max(1, view.height - 2 * margin)}px`);
    const bounds = host.getBoundingClientRect();
    const anchor = preferred ?? { x: 1, y: 1 };
    const left = clamp(view.left + view.width * anchor.x - bounds.width, view.left + margin, view.left + view.width - margin - bounds.width);
    const top = clamp(view.top + view.height * anchor.y - bounds.height, view.top + margin, view.top + view.height - margin - bounds.height);
    host.style.setProperty('--unravel-right', `${Math.max(0, document.documentElement.clientWidth - left - bounds.width)}px`);
    host.style.setProperty('--unravel-bottom', `${Math.max(0, innerHeight - top - bounds.height)}px`);
  }
  function remember() {
    try { if (preferred) sessionStorage.setItem(key, JSON.stringify(preferred)); else sessionStorage.removeItem(key); } catch { /* In-memory movement still works. */ }
  }
  function place(left: number, top: number) {
    const view = viewport(), bounds = host.getBoundingClientRect();
    preferred = { x: clamp((left + bounds.width - view.left) / view.width, 0, 1), y: clamp((top + bounds.height - view.top) / view.height, 0, 1) };
    reconcile();
  }
  function reset() { cancelMotion(); preferred = null; reconcile(); remember(); announce('Bug reporter returned to the bottom right.'); }
  function release() {
    const pointer = drag; drag = null; delete host.dataset.dragging;
    if (pointer && host.hasPointerCapture(pointer.id)) host.releasePointerCapture(pointer.id);
  }
  function cancelled() { if (drag?.active) { preferred = drag.original; reconcile(); } release(); }
  shadow.addEventListener('pointerdown', input => {
    const event = input as PointerEvent;
    suppressClickUntil = 0; suppressedPointer = null;
    if (!event.isPrimary || event.button !== 0 || !(event.target instanceof Element)) return;
    const handle = event.target.closest<HTMLElement>('[data-widget-drag]');
    const control = event.target.closest('button,input,textarea,select,a,summary');
    if (!handle || (control && control !== handle)) return;
    const bounds = host.getBoundingClientRect();
    drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, left: bounds.left, top: bounds.top, original: preferred, active: false };
  }, { signal });
  window.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.startX, dy = event.clientY - drag.startY;
    if (!drag.active && Math.hypot(dx, dy) < 5) return;
    if (!drag.active) { cancelMotion(); drag.active = true; host.dataset.dragging = 'true'; host.setPointerCapture(event.pointerId); }
    event.preventDefault(); place(drag.left + dx, drag.top + dy);
  }, { signal, passive: false });
  window.addEventListener('pointerup', event => {
    if (!drag || drag.id !== event.pointerId) return;
    if (drag.active) { suppressClickUntil = performance.now() + 350; suppressedPointer = event.pointerId; remember(); announce('Bug reporter moved. Use Home on its move control to reset.'); }
    release();
  }, { signal });
  window.addEventListener('pointercancel', event => { if(event.pointerId === drag?.id) cancelled(); }, { signal });
  // Touch starts with implicit capture on the inner SVG/button. Transferring it
  // to the persistent host must not be mistaken for losing our own capture.
  host.addEventListener('lostpointercapture', event => { if(event.composedPath()[0] === host && event.pointerId === drag?.id) cancelled(); }, { signal });
  host.addEventListener('click', event => {
    if (performance.now() < suppressClickUntil && (!(event instanceof PointerEvent) || event.pointerId === suppressedPointer)) { event.preventDefault(); event.stopImmediatePropagation(); suppressClickUntil = 0; suppressedPointer = null; }
  }, { signal, capture: true });
  shadow.addEventListener('keydown', event => {
    const keyEvent = event as KeyboardEvent;
    suppressClickUntil = 0;
    if (keyEvent.key === 'Escape' && drag) { event.preventDefault(); event.stopImmediatePropagation(); cancelled(); announce('Movement cancelled.'); return; }
    if (!(event.target instanceof HTMLElement) || !event.target.matches('[data-widget-drag]')) return;
    if (keyEvent.key === 'Home') { event.preventDefault(); reset(); return; }
    const step = keyEvent.shiftKey ? 40 : 10;
    const delta: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const change = delta[keyEvent.key];
    if (!change) return;
    event.preventDefault(); cancelMotion();
    const bounds = host.getBoundingClientRect(); place(bounds.left + change[0], bounds.top + change[1]); remember();
  }, { signal });
  function resized() {
    cancelMotion(); release(); reconcile();
    const focused = shadow.activeElement;
    if (focused instanceof HTMLElement && focused.matches('input,textarea')) focused.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
  }
  window.addEventListener('resize', resized, { signal });
  window.visualViewport?.addEventListener('resize', resized, { signal });
  window.visualViewport?.addEventListener('scroll', resized, { signal });
  const observer = new ResizeObserver(reconcile); observer.observe(host);
  signal.addEventListener('abort', () => { release(); observer.disconnect(); }, { once: true });
  return { reconcile, reset };
}
