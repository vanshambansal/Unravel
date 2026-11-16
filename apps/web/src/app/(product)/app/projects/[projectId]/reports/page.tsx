import { IntentLink as Link } from '@/features/workspace/IntentLink';
import { notFound } from 'next/navigation';
import { requirePageDeveloper } from '@/server/auth';
import { projectServices } from '@/server/projects';
import { reportServices } from '@/server/reports';
import { ApplicationError } from '@/server/errors';
import {
  EmptyState,
  PageContent,
  PageHeader,
  ResourceCollection,
  ResourceItem,
} from '@/features/workspace/compositions';
import { reportQuery, reportSearch } from '@/features/reports/management';
import { ReportSearchForm } from '@/features/reports/ReportSearchForm';
import '@/features/reports/report-management.css';
export default async function ReportsPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const owner = await requirePageDeveloper(),
    { projectId } = await params;
  let query,
    validation = '';
  try {
    query = reportQuery(await searchParams);
  } catch (error) {
    query = reportQuery({});
    validation = (error as Error).message;
  }
  const [project, result] = await Promise.all([
    projectServices().get(owner, projectId),
    reportServices().list(owner, projectId, query),
  ]).catch((error) => {
    if (error instanceof ApplicationError && error.status === 404) notFound();
    throw error;
  });
  const base = `/app/projects/${projectId}/reports`;
  return (
    <PageContent>
      <PageHeader
        title="Bug reports"
        context={project.name}
        description={project.origin}
        actions={
          <Link className="product-button secondary" href={`/app/projects/${projectId}/setup`}>
            SDK setup
          </Link>
        }
      />
      <ReportSearchForm base={base} query={query} />
      {validation && (
        <p role="alert" className="product-field-error">
          {validation}
        </p>
      )}
      {result.total ? (
        <ResourceCollection
          label="Reports"
          count={result.total}
          footer={
            <nav className="report-pagination" aria-label="Report pages">
              <span>
                Page {result.page} of {result.pages} &middot; {result.total} report
                {result.total === 1 ? '' : 's'}
              </span>
              <div className="product-actions">
                {result.page > 1 ? (
                  <Link
                    rel="prev"
                    className="product-button secondary"
                    href={base + reportSearch(query, result.page - 1)}
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="product-small" aria-disabled="true">
                    Previous
                  </span>
                )}
                {result.page < result.pages ? (
                  <Link
                    rel="next"
                    className="product-button secondary"
                    href={base + reportSearch(query, result.page + 1)}
                  >
                    Next
                  </Link>
                ) : (
                  <span className="product-small" aria-disabled="true">
                    Next
                  </span>
                )}
              </div>
            </nav>
          }
        >
          {result.reports.map((report) => (
            <li key={report.id}>
              <Link
                className="ui-resource-link project-card-link"
                href={`${base}/${report.id}${reportSearch(query, result.page)}`}
              >
                <ResourceItem
                  title={report.title}
                  description={
                    <>
                      {new Intl.DateTimeFormat('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                        timeZone: 'Asia/Kolkata',
                      }).format(report.createdAt)}{' '}
                      IST &middot; {(report.recording.durationMs / 1000).toFixed(1)}s &middot;{' '}
                      {report.eventCount} events
                    </>
                  }
                  actions={
                    <span className={`report-status report-status--${report.status}`}>
                      {report.status === 'open' ? 'Open' : 'Resolved'}
                    </span>
                  }
                />
              </Link>
            </li>
          ))}
        </ResourceCollection>
      ) : (
        <EmptyState
          title={
            query.q || query.status !== 'all'
              ? 'No matching reports.'
              : 'Record the sequence behind a failure.'
          }
          description={
            query.q || query.status !== 'all'
              ? 'Try another search or clear the filters to see all reports.'
              : 'Integrate the SDK into your website. Visitors can explicitly record and submit without an Unravel account.'
          }
          actions={
            <Link
              className="product-button"
              href={query.q || query.status !== 'all' ? base : `/app/projects/${projectId}/setup`}
            >
              {query.q || query.status !== 'all'
                ? 'Clear filters'
                : 'View integration instructions'}
            </Link>
          }
        />
      )}
      <p className="product-small product-privacy">
        Private to your account. Reports remain until you delete them; recorded evidence cannot be
        edited.
      </p>
    </PageContent>
  );
}
