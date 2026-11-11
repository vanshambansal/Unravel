'use client';

import { createContext, useContext, useRef, useEffect, useState, useSyncExternalStore } from 'react';
import { MotionConfig, motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react';

const MotionContext = createContext({ active: false, paused: false, reduced: true, toggle: () => {} });
const subscribeVisibility = (notify: () => void) => {
  document.addEventListener('visibilitychange', notify);
  return () => document.removeEventListener('visibilitychange', notify);
};
const subscribeReducedMotion = (notify: () => void) => {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
};

/** One motion policy for product chrome. Recorded evidence has its own playback clock. */
export function WorkspaceMotion({ children }: { children: React.ReactNode }) {
  const reduced = useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia('(prefers-reduced-motion: reduce)').matches, () => false);
  const visible = useSyncExternalStore(subscribeVisibility, () => !document.hidden, () => false);
  const [paused, setPaused] = useState(false);
  return <MotionContext value={{ active: visible && !paused && !reduced, paused, reduced, toggle: () => setPaused(value => !value) }}>
    <MotionConfig reducedMotion="user" transition={{ duration: .26, ease: [.16, 1, .3, 1] }}>
      <div className="workspace-motion" data-motion={visible && !paused && !reduced ? 'on' : 'off'}>{children}</div>
    </MotionConfig>
  </MotionContext>;
}

export function AmbientMotionControl() {
  const { paused, reduced, toggle } = useContext(MotionContext);
  return <button type="button" className="workspace-motion-control" aria-label={reduced ? 'Ambient motion disabled by system preference' : paused ? 'Resume ambient motion' : 'Pause ambient motion'} aria-pressed={paused || reduced} disabled={reduced} onClick={toggle}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">{paused || reduced ? <path d="m6 4 6 4-6 4V4Z" stroke="currentColor" strokeLinejoin="round" /> : <path d="M6 4v8m4-8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}</svg>
    <span>{reduced ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion'}</span>
  </button>;
}

/** A bounded material light, not a second renderer. Springs don't rerender the React tree. */
export function MaterialLight({ atmosphere = false }: { atmosphere?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { active } = useContext(MotionContext);
  const x = useMotionValue(68), y = useMotionValue(24);
  const sx = useSpring(x, { stiffness: 65, damping: 26 }), sy = useSpring(y, { stiffness: 65, damping: 26 });
  const background = useMotionTemplate`radial-gradient(ellipse at ${sx}% ${sy}%, rgba(219, 76, 94, .16), transparent 52%)`;
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent || !active || !inView) return;
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const rect = parent.getBoundingClientRect();
      x.set(Math.min(100, Math.max(0, (event.clientX - rect.left) / rect.width * 100)));
      y.set(Math.min(100, Math.max(0, (event.clientY - rect.top) / rect.height * 100)));
    };
    const reset = () => { x.set(68); y.set(24); };
    parent.addEventListener('pointermove', move);
    parent.addEventListener('pointerleave', reset);
    return () => { parent.removeEventListener('pointermove', move); parent.removeEventListener('pointerleave', reset); };
  }, [active, inView, x, y]);
  return <div ref={ref} className={`workspace-material-light${atmosphere ? ' workspace-material-light--atmosphere' : ''}`} aria-hidden="true" data-active={active && inView}>
    <motion.div className="workspace-pointer-light" style={{ background, opacity: active && inView ? 1 : 0 }} />
    {atmosphere && <><div className="auth-light-shaft auth-light-shaft--near" /><div className="auth-light-shaft auth-light-shaft--far" /><div className="auth-floor-light" /></>}
  </div>;
}
