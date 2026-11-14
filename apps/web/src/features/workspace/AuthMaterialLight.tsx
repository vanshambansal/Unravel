'use client';
import { useRef, useEffect, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react';
import { useAmbientMotion } from './WorkspaceMotion';

/** A bounded material light, not a second renderer. Springs don't rerender the React tree. */
export function MaterialLight({ atmosphere = false }: { atmosphere?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { active } = useAmbientMotion();
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
