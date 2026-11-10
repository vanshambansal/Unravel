import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { WorkspaceProvider } from '@/features/workspace/Provider';
import { AccountMenu } from '@/features/workspace/AccountMenu';
import { requireDeveloper } from '@/server/auth';
import { ApplicationError } from '@/server/errors';
export const dynamic = 'force-dynamic';

async function ProtectedWorkspace({ children }: { children: React.ReactNode }) {
  try { await requireDeveloper(); }
  catch (error) { if (error instanceof ApplicationError && [401, 503].includes(error.status)) redirect('/sign-in'); throw error; }
  return <WorkspaceProvider><div className="product-layout">
    <a href="#workspace-content" className="product-skip">Skip to content</a>
    <aside className="product-sidebar"><Link className="product-brand" href="/" prefetch={false}>unravel</Link><nav aria-label="Workspace"><Link className="product-nav-item" href="/app/projects">Projects</Link></nav><div className="product-sidebar-description"><p className="product-eyebrow">DEVELOPER WORKSPACE</p><p className="product-small">Your websites and their bug reports, together.</p></div><AccountMenu /></aside>
    <main id="workspace-content" className="product-main" tabIndex={-1}><p className="product-eyebrow product-breadcrumb">WORKSPACE / PROJECTS</p>{children}</main>
  </div></WorkspaceProvider>;
}
export default function ProductLayout({ children }: { children: React.ReactNode }) { return <Suspense><ProtectedWorkspace>{children}</ProtectedWorkspace></Suspense>; }
