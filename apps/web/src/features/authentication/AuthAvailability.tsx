'use client';

import { ClerkFailed, ClerkLoading } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

function Connecting() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 12000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="product-notice" role="status">
      <p>
        {slow
          ? 'Sign-in is taking longer than usual. Check your connection and retry.'
          : 'Connecting to secure sign-in...'}
      </p>
      {slow && <Retry />}
    </div>
  );
}
function Retry() {
  return (
    <button type="button" className="product-button secondary" onClick={() => location.reload()}>
      Retry sign-in
    </button>
  );
}

/** SDK script loading is not React Suspense; never leave an empty auth panel. */
export function AuthAvailability() {
  return (
    <>
      <ClerkLoading>
        <Connecting />
      </ClerkLoading>
      <ClerkFailed>
        <div className="product-notice" role="alert">
          <h2>Secure sign-in could not load</h2>
          <p>Check your connection and try again. Your saved workspace is unchanged.</p>
          <Retry />
        </div>
      </ClerkFailed>
    </>
  );
}
