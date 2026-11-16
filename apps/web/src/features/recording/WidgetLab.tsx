'use client';
import { useEffect, useState } from 'react';
import { mountWidget } from '@vansham/unravel-sdk';

function Reporter() {
  useEffect(() => {
    const widget = mountWidget({
      projectId: '12345678-1234-4234-8234-123456789012',
      applicationOrigin: location.origin,
    });
    return () => widget.destroy();
  }, []);
  return null;
}
/** Development-only integration probe; also exercised under plain React Strict Mode. */
export function WidgetLab() {
  const [mounted, setMounted] = useState(true);
  return (
    <main>
      <h1>Widget integration lab</h1>
      <button data-unravel-block onClick={() => setMounted((value) => !value)}>
        Toggle widget
      </button>
      {mounted && <Reporter />}
      <label htmlFor="widget-question">Synthetic question</label>
      <textarea id="widget-question" />
      <a href="/sdk-lab-exit">Unmount lab</a>
    </main>
  );
}
