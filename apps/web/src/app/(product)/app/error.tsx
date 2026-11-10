'use client';
import Link from 'next/link';
export default function WorkspaceError({ reset }: { reset: () => void }) {
  return <section role="alert" className="product-panel"><h1>We couldn’t load your workspace.</h1><p>Check that project storage is configured and available, then try again.</p><div className="product-actions"><button className="product-button" onClick={reset}>Try again</button><Link className="product-button secondary" href="/" prefetch={false}>Return to Unravel</Link></div></section>;
}
