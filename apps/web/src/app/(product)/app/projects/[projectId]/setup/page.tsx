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
      <div className="product-notice"><h3>Local recording SDK ready</h3><p>The SDK is available as the local workspace package <code>@unravel/sdk</code>. It is not published to a package registry. In this repository, build packages with <code>corepack pnpm build:packages</code>, then initialize inside a client effect and destroy on cleanup.</p>
        <pre style={{ overflowX: 'auto', padding: '1rem', background: '#08090b', fontSize: '.8rem', lineHeight: 1.8 }}><code>{`import { initialize } from '@unravel/sdk';

const recorder = initialize({
  projectId: '${project.id}',
});

// Call only after the visitor explicitly chooses to record.
await recorder.start();
const recording = recorder.stop(); // sanitized, in memory
// On component unmount:
recorder.destroy();`}</code></pre>
        <p>Text and input values are masked by default; passwords are always blocked. See <code>docs/SDK.md</code> for reviewed synthetic-content opt-ins and the React lifecycle example. Run the independent Question desk fixture to try recording. Report upload, persistent reports and replay are not available yet.</p>
      </div>
    </section></>;
}
