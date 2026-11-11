/** Presentation only: one persistent material surface, with unscaled interactive content. */
export function widgetMotion(surface: HTMLElement, plate: HTMLElement, content: HTMLElement, signal: AbortSignal) {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let animations: Animation[] = [];
  const finish = () => { for (const animation of animations) animation.cancel(); animations = []; };
  const policy = () => {
    surface.dataset.motion = preference.matches || document.hidden ? 'off' : 'on';
    if (preference.matches || document.hidden) finish();
  };
  preference.addEventListener('change', policy, { signal });
  document.addEventListener('visibilitychange', policy, { signal });
  window.addEventListener('resize', finish, { signal });
  signal.addEventListener('abort', finish, { once: true });
  policy();
  return {
    finish,
    capture: () => plate.getBoundingClientRect(),
    settle(before: DOMRect) {
      finish();
      const after = plate.getBoundingClientRect();
      if (preference.matches || document.hidden || before.width < 1 || after.width < 1 || typeof plate.animate !== 'function') return;
      // Animate the material silhouette, never scale text, controls or the actual recording.
      animations.push(plate.animate([
        { transform: `translate(${before.right - after.right}px,${before.bottom - after.bottom}px) scale(${before.width / after.width},${before.height / after.height})` },
        { transform: 'scale(1,1)' },
      ], { duration: 360, easing: 'cubic-bezier(.16,1,.3,1)' }));
      animations.push(content.animate([
        { opacity: .25, transform: 'translateY(5px)', clipPath: 'inset(6px 0 0 0 round 12px)' },
        { opacity: 1, transform: 'translateY(0)', clipPath: 'inset(0 round 12px)' },
      ], { duration: 240, easing: 'cubic-bezier(.16,1,.3,1)' }));
    },
  };
}
