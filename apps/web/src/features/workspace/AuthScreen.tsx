import Link from 'next/link';
import Image from 'next/image';
import { SignIn, SignUp } from '@clerk/nextjs';
import { Suspense } from 'react';
import { authConfigured } from '@/server/auth';
import { AmbientMotionControl } from './WorkspaceMotion';
import { MaterialLight } from './AuthMaterialLight';
import { AuthAvailability } from '../authentication/AuthAvailability';

export function AuthScreen({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  return <main className="auth-layout">
    <Image className="auth-architecture" src="/landing/artwork/hero-atrium.png" alt="" fill sizes="100vw" priority />
    <div className="auth-shade" aria-hidden="true" /><MaterialLight atmosphere />
    <header className="auth-header"><Link className="workspace-brand" href="/" prefetch={false} aria-label="Unravel home"><Image src="/landing/artwork/unravel-mark.svg" width={26} height={26} alt="" />unravel</Link><AmbientMotionControl /></header>
    <section className="auth-story" aria-label="About Unravel">
      <div className="auth-story-copy"><h1>Follow the failure.<br />Find the sequence.</h1><p>From a visitor report to a regression<br className="auth-desktop-break" /> test you can review and run.</p>
        <ul className="auth-workflow" aria-label="Investigation workflow">{[['play', 'Replay'], ['reports', 'Evidence'], ['code', 'Test plan']].map(([icon, label]) => <li key={label}><Image src={`/product/${icon}.svg`} width={20} height={20} alt="" />{label}</li>)}</ul>
      </div>
    </section>
    <section className="auth-form-section" aria-label="Developer authentication">
      <div className="auth-form-container">
        {authConfigured() ? <Suspense fallback={<p role="status">Loading secure sign-in...</p>}>
          <AuthAvailability />
          {mode === 'sign-in' ? <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" /> : <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />}
        </Suspense> : <div className="product-notice" role="status"><h2>Sign-in setup is pending</h2><p>Developer access is not available on this installation yet. No account is required to explore the landing page.</p></div>}
        <p className="auth-privacy"><Image src="/product/shield.svg" width={16} height={16} alt="" />Secure sign-in. Visitors report without an account.</p>
        <footer className="auth-footer"><Link href="/" prefetch={false}>Return to Unravel</Link><span>Development preview</span></footer>
      </div>
    </section>
  </main>;
}
