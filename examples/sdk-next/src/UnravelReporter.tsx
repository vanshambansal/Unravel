'use client';

import { useEffect } from 'react';
import { mountWidget } from '@unravel/sdk';

export function UnravelReporter() {
  useEffect(() => {
    const widget = mountWidget({
      projectId: 'd2810c9a-75b6-43bd-a9da-30d83d826415',
      applicationOrigin: "http://localhost:3000",
    });
    return () => widget.destroy();
  }, []);
  return null;
}