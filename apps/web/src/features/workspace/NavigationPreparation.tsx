'use client';

import { createContext, useCallback, useContext, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PrefetchKind } from 'next/dist/client/components/router-reducer/router-reducer-types';

const Preparation = createContext<(href: string) => void>(() => {});

/** Route readiness only; Next owns the authenticated payload cache.
 * One provider per authorized workspace, discarded on sign-out. */
export function NavigationPreparation({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const routes = useRef(new Map<string, { at: number }>());
  const prepare = useCallback((href: string) => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (document.hidden || connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? '')) return;
    if (!href.startsWith('/app/') || href.startsWith('//')) return;
    const now = performance.now(), previous = routes.current.get(href);
    if (previous && now - previous.at < 30_000) return;
    const entry = { at: now };
    routes.current.delete(href);
    routes.current.set(href, entry);
    if (routes.current.size > 24) routes.current.delete(routes.current.keys().next().value!);
    router.prefetch(href, { kind: PrefetchKind.FULL, onInvalidate: () => {
      if (routes.current.get(href) === entry) routes.current.delete(href);
    } });
  }, [router]);
  return <Preparation value={prepare}>{children}</Preparation>;
}

export function useNavigationPreparation() { return useContext(Preparation); }
