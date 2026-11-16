'use client';

import { useEffect } from 'react';
import { mountWidget } from '@vansham/unravel-sdk';

export function UnravelReporter() {
  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_UNRAVEL_PROJECT_ID;
    const applicationOrigin = process.env.NEXT_PUBLIC_UNRAVEL_APPLICATION_ORIGIN;
    if (!projectId || !applicationOrigin) return;
    const widget = mountWidget({
      projectId,
      applicationOrigin,
      limits: { maxBytes: 3_000_000 },
    });
    return () => widget.destroy();
  }, []);
  return null;
}
