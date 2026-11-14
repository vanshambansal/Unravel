import { IntentLink as Link } from '@/features/workspace/IntentLink';
import { notFound } from 'next/navigation';
import { requirePageDeveloper } from '@/server/auth';
import { reportServices } from '@/server/reports';
import { ApplicationError } from '@/server/errors';
import {ReportHeader} from '@/features/reports/ReportHeader';
import {reportQuery,reportSearch} from '@/features/reports/management';
import '@/features/reports/report-management.css';
import { ReportWorkspace } from '@/features/reports/ReportWorkspace';
export default async function ReportPage({ params,searchParams }: { params: Promise<{ projectId: string; reportId: string }>;searchParams:Promise<Record<string,string|string[]|undefined>> }) {
  const owner = await requirePageDeveloper(), { projectId, reportId } = await params;
  const { report, events } = await reportServices().detail(owner, projectId, reportId).catch(error => { if (error instanceof ApplicationError && error.status === 404) notFound(); throw error; });
  let query;try{query=reportQuery(await searchParams);}catch{query=reportQuery({});}
  return <><p className="report-context"><Link href={`/app/projects/${projectId}/reports${reportSearch(query)}`}>&larr; All reports</Link><span>REPORT / {report.id.slice(0,8)}</span></p><ReportHeader key={`details-${reportId}`} initial={{id:report.id,title:report.title,description:report.description,status:report.status,revision:report.revision}} projectId={projectId} created={report.createdAt.toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})} bytes={report.bytes} duration={report.recording.durationMs}/>
    {report.recording.truncated && <p role="note" className="product-notice">Partial recording: {report.recording.stopReason}. Some activity may be missing.</p>}
    <p className="product-small" data-testid="recording-mode">{report.recording.captureMode==='full'?'Full-content recording: entered and sensitive field values may be included.':report.recording.captureMode==='masked-values'?'Masked values: page text is visible; values inside fields were masked.':'Legacy recording: masking follows the original SDK settings.'}</p>
    <ReportWorkspace key={`workspace-${reportId}`} styled={report.recording.presentation === 1} projectId={projectId} reportId={reportId} events={events} durationMs={report.recording.durationMs} startedAt={report.recording.startedAt} replayOrigin={process.env.REPLAY_ORIGIN ?? 'http://127.0.0.1:4192'} />
  </>;
}
