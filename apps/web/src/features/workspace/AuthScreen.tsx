import Link from 'next/link';
import { SignIn, SignUp } from '@clerk/nextjs';
import { Suspense } from 'react';
import { authConfigured } from '@/server/auth';

export function AuthScreen({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  return <main className="auth-layout">
    <section className="auth-story" aria-label="About Unravel">
      <Link className="product-brand" href="/" prefetch={false} aria-label="Unravel home">unravel</Link>
      <div className="auth-story-copy"><p className="product-eyebrow">FROM THE MOMENT IT BREAKS</p><h1>Every bug<br />has a story.</h1><p>Give yours a path to a fix.</p>
        <div className="auth-thread" aria-hidden="true"><span /><span /><span /><span /></div>
        <p className="product-eyebrow">RECORD / REPLAY / REVIEW / EXPORT</p><p className="product-small">Developer workspace.<br />Visitors report without an account.</p>
      </div><p className="product-small auth-footnote">Unravel · Development preview</p>
    </section>
    <section className="auth-form-section" aria-label="Developer authentication">
      <div className="auth-form-container">
        <h2>Welcome to Unravel</h2><p>Sign in or create your developer account.</p>
        {authConfigured() ? <Suspense fallback={<p role="status">Loading secure sign-in…</p>}>
          {mode === 'sign-in' ? <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" /> : <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />}
        </Suspense> : <div className="product-notice" role="status"><h3>Sign-in setup is pending</h3><p>Developer access is not available on this installation yet. No account is required to explore the landing page.</p></div>}
        <Link className="product-text-link" href="/" prefetch={false}>Return to Unravel</Link>
      </div>
    </section>
  </main>;
}
