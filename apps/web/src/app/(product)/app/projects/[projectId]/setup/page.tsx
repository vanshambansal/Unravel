import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requirePageDeveloper } from '@/server/auth';
import { projectServices } from '@/server/projects';
import { ApplicationError } from '@/server/errors';
import { SdkSetup } from '@/features/projects/SdkSetup';
import { reportServices } from '@/server/reports';

export default async function SetupPage({ params }: { params: Promise<{ projectId: string }> }) {
  const owner = await requirePageDeveloper();
  const { projectId } = await params;
  const project = await projectServices().get(owner, projectId).catch(error => { if (error instanceof ApplicationError && error.status === 404) notFound(); throw error; });
  const received = (await reportServices().list(owner, projectId)).length > 0;
  return <><header className="product-page-heading"><div><p className="product-eyebrow">Projects / SDK setup</p><h1>{project.name}</h1><p>{project.origin}</p></div><Link className="product-button secondary" href={`/app/projects/${projectId}/reports`}>View bug reports</Link></header>
    <div className="setup-grid"><SdkSetup projectId={project.id} websiteOrigin={project.origin} /><aside className="setup-progress"><h2>Integration checklist</h2><ol><li>Website registered</li><li>Integration instructions available</li><li>{received ? 'Report received — open Reports to investigate' : 'Waiting for your first report'}</li></ol><p className="product-small">Instructions do not confirm installation. A saved report confirms this project's submission workflow; it does not prove the SDK is currently connected or installed on a changed origin.</p><p className="product-small">Public project identifier</p><code>{project.id}</code></aside></div></>;
}
