import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requirePageDeveloper } from '@/server/auth';
import { reportServices } from '@/server/reports';
import { ApplicationError } from '@/server/errors';
import { ReportWorkspace } from '@/features/reports/ReportWorkspace';
export default async function ReportPage({ params }: { params: Promise<{ projectId: string; reportId: string }> }) {
  const owner = await requirePageDeveloper(), { projectId, reportId } = await params;
  const { report, events } = await reportServices().detail(owner, projectId, reportId).catch(error => { if (error instanceof ApplicationError && error.status === 404) notFound(); throw error; });
  return <><p className="report-context"><Link href={`/app/projects/${projectId}/reports`}>← All reports</Link><span>REPORT / {report.id.slice(0,8)}</span></p><header className="product-page-heading report-heading"><div><h1>{report.title}</h1><p>{report.createdAt.toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})} IST · {(report.bytes / 1024).toFixed(1)} KiB</p></div><span className="product-small">{(report.recording.durationMs/1000).toFixed(1)}s recording</span></header>
    {report.description && <p className="report-description">{report.description}</p>}
    {report.recording.truncated && <p role="note" className="product-notice">Partial recording: {report.recording.stopReason}. Some activity may be missing.</p>}
    <ReportWorkspace styled={report.recording.presentation === 1} projectId={projectId} reportId={reportId} events={events} durationMs={report.recording.durationMs} startedAt={report.recording.startedAt} replayOrigin={process.env.REPLAY_ORIGIN ?? 'http://127.0.0.1:4192'} />
  </>;
}
