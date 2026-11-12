'use client';

import Link, { useLinkStatus } from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, type ComponentProps } from 'react';

function Pending() {
  const { pending } = useLinkStatus();
  return <span aria-hidden="true" className="workspace-link-pending" data-pending={pending} />;
}

/** Do not fan out private database-backed routes merely because links are visible. */
export function IntentLink({ children, onPointerEnter, onPointerLeave, onPointerDown, onFocus, onBlur, onClick, className = '', ...props }: ComponentProps<typeof Link>) {
  const router = useRouter(), prefetched = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  function cancel() { clearTimeout(timer.current); timer.current = undefined; }
  useEffect(() => () => clearTimeout(timer.current), []);
  function prepare() {
    if (prefetched.current || props.prefetch === false) return;
    const href = typeof props.href === 'string' ? props.href : undefined;
    if (!href?.startsWith('/')) return;
    prefetched.current = true;
    router.prefetch(href);
  }
  function schedule() { if (!prefetched.current && !timer.current) timer.current = setTimeout(() => { timer.current = undefined; prepare(); }, 150); }
  return <Link {...props} prefetch={false} className={`workspace-intent-link ${className}`}
    onPointerEnter={event => { onPointerEnter?.(event); if (event.pointerType === 'mouse') schedule(); }}
    onPointerLeave={event => { cancel(); onPointerLeave?.(event); }}
    onPointerDown={event => { cancel(); onPointerDown?.(event); }}
    onFocus={event => { onFocus?.(event); schedule(); }}
    onBlur={event => { cancel(); onBlur?.(event); }}
    onClick={event => { cancel(); onClick?.(event); }}>
    {children}<Pending />
  </Link>;
}
