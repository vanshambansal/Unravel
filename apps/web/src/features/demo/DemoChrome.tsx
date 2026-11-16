import type { ReactNode } from 'react';
/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element -- Shared with standalone React; native full navigations dispose capture. The mark is a fixed-size SVG. */

/** Shared presentational shell; usable by Next and the independent React bundle. */
export function DemoChrome({ children }: { children: ReactNode }) {
  return (
    <div className="demo-shell">
      <header className="demo-nav">
        <a className="demo-brand" href="/#hero">
          <img src="/landing/artwork/unravel-mark.svg" width="26" height="26" alt="" />
          unravel
        </a>
        <nav aria-label="Demo navigation">
          <a href="/demo">Demo guide</a>
          <a href="/app/projects">
            Open workspace <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>
      <main className="demo-main">{children}</main>
      <footer className="demo-footer">Synthetic examples. Real recordings. Private reports.</footer>
    </div>
  );
}
