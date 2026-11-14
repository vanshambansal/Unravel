'use client';

import Link, { useLinkStatus } from 'next/link';
import { useEffect, useRef, type ComponentProps } from 'react';
import { useNavigationPreparation } from './NavigationPreparation';

function Pending() {
  const { pending } = useLinkStatus();
  return <span aria-hidden="true" className="workspace-link-pending" data-pending={pending} />;
}

/** Do not fan out private database-backed routes merely because links are visible. */
export function IntentLink({ children, onPointerEnter, onPointerLeave, onPointerDown, onFocus, onBlur, onClick, className = '', prepareOnIdle = false, ...props }: ComponentProps<typeof Link> & { prepareOnIdle?: boolean }) {
  const { routes, prepare: prepareRoute } = useNavigationPreparation();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  function cancel() { clearTimeout(timer.current); timer.current = undefined; }
  useEffect(() => () => clearTimeout(timer.current), []);
  function prepare() {
    if (props.prefetch === false || props.prefetch === true) return;
    const href = typeof props.href === 'string' ? props.href : undefined;
    if (!href?.startsWith('/')) return;
    prepareRoute(href);
  }
  function schedule() { if (!timer.current) timer.current = setTimeout(() => { timer.current = undefined; prepare(); }, 50); }
  const href = typeof props.href === 'string' ? props.href : undefined;
  useEffect(() => {
    if (!prepareOnIdle || !href || props.prefetch === false || props.prefetch === true) return;
    if (!window.requestIdleCallback) {
      const idle = setTimeout(() => { prepareRoute(href); }, 350);
      return () => clearTimeout(idle);
    }
    const idle = window.requestIdleCallback(() => { prepareRoute(href); }, { timeout: 1500 });
    return () => window.cancelIdleCallback(idle);
  }, [href, prepareOnIdle, prepareRoute, props.prefetch]);
  return <Link {...props} prefetch={props.prefetch === true || props.prefetch !== false && !!href && routes.includes(href)} className={`workspace-intent-link ${className}`}
    onPointerEnter={event => { onPointerEnter?.(event); if (event.pointerType === 'mouse') schedule(); }}
    onPointerLeave={event => { cancel(); onPointerLeave?.(event); }}
    onPointerDown={event => { cancel(); onPointerDown?.(event); if (!event.defaultPrevented && event.button === 0) prepare(); }}
    onFocus={event => { onFocus?.(event); prepare(); }}
    onBlur={event => { cancel(); onBlur?.(event); }}
    onClick={event => { cancel(); onClick?.(event); }}>
    {children}<Pending />
  </Link>;
}
