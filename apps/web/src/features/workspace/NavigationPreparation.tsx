'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const Preparation = createContext<{ routes: readonly string[]; prepare(href: string): void }>({
  routes: [],
  prepare() {},
});

/** Retain bounded intent across page changes; Next owns payloads and request deduplication. */
export function NavigationPreparation({ children }: { children: React.ReactNode }) {
  const [routes, setRoutes] = useState<string[]>([]);
  const prepare = useCallback((href: string) => {
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection;
    if (
      document.hidden ||
      connection?.saveData ||
      /(^|-)2g$/.test(connection?.effectiveType ?? '') ||
      !href.startsWith('/app/') ||
      href.startsWith('//')
    )
      return;
    setRoutes((previous) => (previous.includes(href) ? previous : [...previous.slice(-23), href]));
  }, []);
  const value = useMemo(() => ({ routes, prepare }), [routes, prepare]);
  return <Preparation value={value}>{children}</Preparation>;
}

export function useNavigationPreparation() {
  return useContext(Preparation);
}
