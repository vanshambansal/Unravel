'use client';
import Link from 'next/link';
import { PageContent, PageHeader, EmptyState } from '@/features/workspace/compositions';
export default function WorkspaceError({ reset }: { reset: () => void }) {
  return (
    <PageContent width="form">
      <PageHeader
        title="We couldn’t load your workspace."
        description="Your saved data has not been changed."
      />
      <div role="alert">
        <EmptyState
          title="Try loading it again"
          description="Check that project storage is configured and available, then retry."
          actions={
            <>
              <button className="product-button" onClick={reset}>
                Try again
              </button>
              <Link className="product-button secondary" href="/" prefetch={false}>
                Return to Unravel
              </Link>
            </>
          }
        />
      </div>
    </PageContent>
  );
}
