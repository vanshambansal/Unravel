import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { WorkspaceProvider } from '@/features/workspace/Provider';
import { AccountMenu } from '@/features/workspace/AccountMenu';
import { requireDeveloper } from '@/server/auth';
import { ApplicationError } from '@/server/errors';
import { projectServices } from '@/server/projects';
import { ProjectNavigation } from '@/features/workspace/ProjectNavigation';
import { WorkspaceSidebar } from '@/features/workspace/WorkspaceSidebar';
import { AmbientMotionControl, MaterialLight } from '@/features/workspace/WorkspaceMotion';
export const dynamic = 'force-dynamic';

async function ProtectedWorkspace({ children }: { children: React.ReactNode }) {
  let owner: string;
  try { owner = await requireDeveloper(); }
  catch (error) { if (error instanceof ApplicationError && [401, 503].includes(error.status)) redirect('/sign-in'); throw error; }
  const projects = await projectServices().list(owner);
  return <WorkspaceProvider><div className="workspace-frame">
    <MaterialLight />
    <a href="#workspace-content" className="product-skip">Skip to content</a>
    <header className="workspace-header"><Link className="workspace-brand" href="/" prefetch={false}><Image src="/landing/artwork/unravel-mark.svg" width={26} height={26} alt="" />unravel</Link><ProjectNavigation projects={projects.map(p=>({id:p.id,name:p.name}))} /><div className="workspace-header-actions"><AmbientMotionControl /><AccountMenu /></div></header>
    <div className="workspace-body"><WorkspaceSidebar projects={projects.map(p=>({id:p.id,name:p.name}))} /><main id="workspace-content" className="workspace-content" tabIndex={-1}>{children}</main></div>
  </div></WorkspaceProvider>;
}
export default function ProductLayout({ children }: { children: React.ReactNode }) { return <Suspense><ProtectedWorkspace>{children}</ProtectedWorkspace></Suspense>; }
