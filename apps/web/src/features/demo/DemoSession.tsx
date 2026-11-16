'use client';
import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';

export function DemoSession() {
  const { isLoaded, getToken } = useAuth();
  useEffect(() => {
    let disposed = false;
    if (isLoaded)
      void getToken().then(() => {
        if (!disposed && parent !== window)
          parent.postMessage({ type: 'unravel-demo-session-ready' }, location.origin);
      });
    return () => {
      disposed = true;
    };
  }, [isLoaded, getToken]);
  return null;
}

export function DemoSessionUnavailable() {
  useEffect(() => {
    if (parent !== window)
      parent.postMessage({ type: 'unravel-demo-session-ready' }, location.origin);
  }, []);
  return null;
}
