import { PageContent, PageHeader } from '@/features/workspace/compositions';

/** First-load placeholder; collection navigation keeps the current screen. */
export default function ProjectsSkeleton() {
  return (
    <PageContent>
      <PageHeader
        title="Your projects"
        description="Connect a website. Keep every bug report in context."
        actions={<div className="ui-skeleton" style={{ width: 130, height: 40, borderRadius: 8 }} />}
      />
      <section className="ui-resource-collection" aria-label="Loading projects" aria-busy="true">
        <header className="ui-collection-heading">
          <div className="ui-skeleton" style={{ width: 70, height: 16 }} />
        </header>
        <ul>
          {[1, 2].map((idx) => (
            <li key={idx} style={{ borderTop: idx > 1 ? '1px solid rgba(255,255,255,0.06)' : undefined }}>
              <div className="ui-resource-row" style={{ pointerEvents: 'none' }}>
                <div className="ui-skeleton" style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0 }} />
                <div className="ui-resource-identity" style={{ display: 'grid', gap: 6 }}>
                  <div className="ui-skeleton" style={{ width: 140, height: 18 }} />
                  <div className="ui-skeleton" style={{ width: 220, height: 13 }} />
                </div>
                <div className="ui-resource-actions" style={{ display: 'flex', gap: 10 }}>
                  <div className="ui-skeleton" style={{ width: 120, height: 36, borderRadius: 8 }} />
                  <div className="ui-skeleton" style={{ width: 75, height: 28, borderRadius: 6 }} />
                  <div className="ui-skeleton" style={{ width: 65, height: 28, borderRadius: 6 }} />
                </div>
              </div>
            </li>
          ))}
        </ul>
        <footer className="ui-collection-footer">
          <div className="ui-skeleton" style={{ width: 320, height: 14 }} />
        </footer>
      </section>
    </PageContent>
  );
}

