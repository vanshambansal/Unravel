import { useEffect } from 'react';
import { mountWidget } from '@vansham/unravel-sdk';

export function UnravelReporter() {
  useEffect(() => {
    const widget = mountWidget({
      projectId: '13fc2e43-866c-437a-bd19-e7509f208986',
      applicationOrigin: 'http://localhost:3033',
    });
    return () => widget.destroy();
  }, []);
  return null;
}
