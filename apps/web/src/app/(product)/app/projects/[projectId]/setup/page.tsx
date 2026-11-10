import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requirePageDeveloper } from '@/server/auth';
import { projectServices } from '@/server/projects';
import { ApplicationError } from '@/server/errors';
import { Workflow } from '@/features/workspace/Workflow';

export default async function SetupPage({ params }: { params: Promise<{ projectId: string }> }) {
  const owner = await requirePageDeveloper();
  const { projectId } = await params;
  const project = await projectServices().get(owner, projectId).catch(error => { if (error instanceof ApplicationError && error.status === 404) notFound(); throw error; });
  return <><header className="product-page-heading"><div><p className="product-eyebrow">Projects / SDK setup</p><h1>{project.name}</h1><p>{project.origin}</p></div><Link className="product-button secondary" href="/app/projects">All projects</Link></header>
    <section className="product-panel"><p className="product-eyebrow accent">WEBSITE REGISTERED</p><h2>Your project is ready for integration.</h2><dl className="project-details"><div><dt>Website origin</dt><dd>{project.origin}</dd></div><div><dt>Project identifier</dt><dd><code>{project.id}</code></dd></div></dl><Workflow registered />
      <div className="product-notice"><h3>Recording SDK coming next</h3><p>Your registration is saved. The recording SDK is not available yet, so there is nothing to install or copy at this stage. Integration instructions will appear here when it is ready.</p></div>
    </section></>;
}
