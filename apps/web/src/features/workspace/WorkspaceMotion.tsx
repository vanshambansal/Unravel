'use client';

import { createContext, useContext, useState, useSyncExternalStore } from 'react';

const MotionContext = createContext({
  active: false,
  paused: false,
  reduced: true,
  toggle: () => {},
});
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
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  );
  const visible = useSyncExternalStore(
    subscribeVisibility,
    () => !document.hidden,
    () => false,
  );
  const [paused, setPaused] = useState(false);
  return (
    <MotionContext
      value={{
        active: visible && !paused && !reduced,
        paused,
        reduced,
        toggle: () => setPaused((value) => !value),
      }}
    >
      <div className="workspace-motion" data-motion={visible && !paused && !reduced ? 'on' : 'off'}>
        {children}
      </div>
    </MotionContext>
  );
}

export function AmbientMotionControl() {
  const { paused, reduced, toggle } = useContext(MotionContext);
  return (
    <button
      type="button"
      className="workspace-motion-control"
      aria-label={
        reduced
          ? 'Ambient motion disabled by system preference'
          : paused
            ? 'Resume ambient motion'
            : 'Pause ambient motion'
      }
      aria-pressed={paused || reduced}
      disabled={reduced}
      onClick={toggle}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        {paused || reduced ? (
          <path d="m6 4 6 4-6 4V4Z" stroke="currentColor" strokeLinejoin="round" />
        ) : (
          <path d="M6 4v8m4-8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        )}
      </svg>
      <span>{reduced ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion'}</span>
    </button>
  );
}

export function useAmbientMotion() {
  return useContext(MotionContext);
}
