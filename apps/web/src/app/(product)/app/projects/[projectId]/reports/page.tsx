import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requirePageDeveloper } from '@/server/auth';
import { projectServices } from '@/server/projects';
import { reportServices } from '@/server/reports';
import { ApplicationError } from '@/server/errors';
import { EmptyState, PageContent, PageHeader, ResourceCollection, ResourceItem } from '@/features/workspace/compositions';
export default async function ReportsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const owner = await requirePageDeveloper(), { projectId } = await params;
  const project = await projectServices().get(owner, projectId).catch(error => { if (error instanceof ApplicationError && error.status === 404) notFound(); throw error; });
  const reports = await reportServices().list(owner, projectId);
  return <PageContent><PageHeader title="Bug reports" context={project.name} description={project.origin} actions={<Link className="product-button secondary" href={`/app/projects/${projectId}/setup`}>SDK setup</Link>} />
    {reports.length ? <ResourceCollection label="Latest reports" count={reports.length} footer="Showing up to 100 reports. Recordings load only when opened.">
      {reports.map(report => <li key={report.id}><Link className="ui-resource-link project-card-link" href={`/app/projects/${projectId}/reports/${report.id}`}><ResourceItem title={report.title} description={<>{new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(report.createdAt)} IST · {(report.recording.durationMs / 1000).toFixed(1)}s · {report.eventCount} events</>} actions={<span className="product-small">Investigate →</span>} /></Link></li>)}
    </ResourceCollection> : <EmptyState title="Record the sequence behind a failure." description="Integrate the SDK into your registered website. Visitors can explicitly record and submit without an Unravel account." actions={<Link className="product-button" href={`/app/projects/${projectId}/setup`}>View integration instructions</Link>} />}
    <p className="product-small product-privacy">Private to your account. Local-development ingestion only; no automatic report expiry.</p>
  </PageContent>;
}
