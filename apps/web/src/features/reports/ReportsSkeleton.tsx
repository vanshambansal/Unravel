import { PageContent, PageHeader } from '@/features/workspace/compositions';

/** Available for an initial report surface, not a per-navigation boundary. */
export default function ReportsSkeleton() {
  return (
    <PageContent>
      <PageHeader
        title="Bug reports"
        description={<span className="ui-skeleton" style={{ display: 'inline-block', width: 180, height: 16 }} />}
        context={<span className="ui-skeleton" style={{ display: 'inline-block', width: 90, height: 14 }} />}
        actions={<span className="ui-skeleton" style={{ display: 'inline-block', width: 100, height: 38, borderRadius: 8 }} />}
      />
      <div className="report-search-container" aria-hidden="true" style={{ pointerEvents: 'none' }}>
        <div className="report-search-bar">
          <div className="ui-skeleton" style={{ flex: 1, height: 40, borderRadius: 8 }} />
          <div className="ui-skeleton" style={{ width: 130, height: 40, borderRadius: 8 }} />
          <div className="ui-skeleton" style={{ width: 75, height: 40, borderRadius: 8 }} />
        </div>
      </div>
      <section className="ui-resource-collection" aria-label="Loading reports" aria-busy="true">
        <header className="ui-collection-heading">
          <div className="ui-skeleton" style={{ width: 80, height: 16 }} />
        </header>
        <ul>
          {[1, 2, 3].map((idx) => (
            <li key={idx} style={{ borderTop: idx > 1 ? '1px solid rgba(255,255,255,0.06)' : undefined }}>
              <div className="ui-resource-row" style={{ pointerEvents: 'none' }}>
                <div className="ui-resource-identity" style={{ display: 'grid', gap: 6 }}>
                  <div className="ui-skeleton" style={{ width: 260, height: 18 }} />
                  <div className="ui-skeleton" style={{ width: 340, height: 13 }} />
                </div>
                <div className="ui-resource-actions">
                  <div className="ui-skeleton" style={{ width: 64, height: 24, borderRadius: 6 }} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </PageContent>
  );
}

