import Link from 'next/link';
import Image, { getImageProps } from 'next/image';
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
import { NavigationPreparation } from '@/features/workspace/NavigationPreparation';
export const dynamic = 'force-dynamic';

async function ProtectedWorkspace({ children }: { children: React.ReactNode }) {
  let owner: string;
  try { owner = await requireDeveloper(); }
  catch (error) { if (error instanceof ApplicationError && [401, 503].includes(error.status)) redirect('/sign-in'); throw error; }
  const projects = projectServices().list(owner);
  const artwork=getImageProps({src:'/landing/artwork/hero-atrium.png',alt:'',width:960,height:640}).props.src;
  return <WorkspaceProvider artwork={artwork}><NavigationPreparation key={owner}><div className="workspace-frame">
    <MaterialLight />
    <a href="#workspace-content" className="product-skip">Skip to content</a>
    <header className="workspace-header"><Link className="workspace-brand" href="/" prefetch={false}><Image src="/landing/artwork/unravel-mark.svg" width={26} height={26} alt="" />unravel</Link><Suspense fallback={<div className="workspace-project-placeholder" role="status">Loading projects…</div>}><ProjectSwitcher projects={projects} /></Suspense><div className="workspace-header-actions"><AmbientMotionControl /><AccountMenu /></div></header>
    <div className="workspace-body"><Suspense fallback={<aside className="workspace-sidebar" aria-label="Loading navigation" aria-busy="true"><div className="ui-skeleton workspace-nav-placeholder" /><div className="ui-skeleton workspace-nav-placeholder" /><div className="ui-skeleton workspace-nav-placeholder" /></aside>}><ProjectSidebar projects={projects} /></Suspense><main id="workspace-content" className="workspace-content" tabIndex={-1}>{children}</main></div>
  </div></NavigationPreparation></WorkspaceProvider>;
}
type Projects = ReturnType<ReturnType<typeof projectServices>['list']>;
async function ProjectSwitcher({ projects }: { projects: Projects }) { return <ProjectNavigation projects={(await projects).map(p => ({ id: p.id, name: p.name }))} />; }
async function ProjectSidebar({ projects }: { projects: Projects }) { return <WorkspaceSidebar projects={(await projects).map(p => ({ id: p.id, name: p.name }))} />; }
export default function ProductLayout({ children }: { children: React.ReactNode }) { return <Suspense fallback={<section className="product-panel" aria-busy="true"><p role="status">Loading your workspace...</p></section>}><ProtectedWorkspace>{children}</ProtectedWorkspace></Suspense>; }
