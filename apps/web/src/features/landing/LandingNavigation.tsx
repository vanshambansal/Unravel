/* eslint-disable @next/next/no-img-element -- Fixed-size local brand asset. */
'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import './navigation.css';

const sections = [
  ['#study', 'How it works'],
  ['#sequence', 'Example test'],
  ['#integration', 'Integration'],
] as const;

export function LandingNavigation() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const abort = new AbortController();
    const refresh = async () => {
      try {
        const response = await fetch('/api/session', { cache: 'no-store', signal: abort.signal });
        if (!response.ok) return;
        const session: { signedIn: boolean } = await response.json();
        if (typeof session.signedIn === 'boolean') setSignedIn(session.signedIn);
      } catch {
        /* Keep the neutral workspace entry when session lookup is unavailable. */
      }
    };
    let observed = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!observed && entries.some((entry) => entry.isIntersecting)) {
          observed = true;
          void refresh();
        }
      },
      { rootMargin: '200px' },
    );
    if (header.current) observer.observe(header.current);
    const onFocus = () => {
      if (observed) void refresh();
    };
    window.addEventListener('focus', onFocus);
    return () => {
      abort.abort();
      observer.disconnect();
      window.removeEventListener('focus', onFocus);
    };
  }, []);
  useEffect(() => {
    const dismiss = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (open) {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener('keydown', dismiss);
    return () => document.removeEventListener('keydown', dismiss);
  }, [open]);
  return (
    <header className="landing-navigation" ref={header}>
      <div className="landing-navigation-inner">
        <a
          className="landing-navigation-brand"
          href="#journey"
          aria-label="Unravel"
          onClick={() => setOpen(false)}
        >
          <img src="/landing/artwork/unravel-mark.svg" width="26" height="26" alt="" />
          <span>unravel</span>
        </a>
        <nav className="landing-navigation-links" aria-label="Product navigation">
          {sections.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <button id="skip" type="button">
          Skip intro <span aria-hidden="true">&#8599;</span>
        </button>
        <div className="landing-navigation-actions">
          {signedIn === false && (
            <Link className="landing-navigation-signin" href="/sign-in" prefetch={false}>
              Sign in
            </Link>
          )}
          <Link className="landing-navigation-primary" href="/app" prefetch={false}>
            {signedIn === false ? 'Get started' : 'Open workspace'}
            <span className="landing-workspace-arrow" aria-hidden="true">
              &#8599;
            </span>
          </Link>
          <button
            ref={menuButton}
            className="menu-toggle landing-menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-links"
            onClick={() => setOpen(!open)}
          >
            Menu <span aria-hidden="true">{open ? '−' : '+'}</span>
          </button>
        </div>
      </div>
      <nav
        id="mobile-links"
        className="landing-mobile-links"
        aria-label="Mobile product navigation"
        hidden={!open}
        onClick={() => setOpen(false)}
      >
        {sections.map(([href, label]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
        {signedIn === false && (
          <Link href="/sign-in" prefetch={false}>
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
