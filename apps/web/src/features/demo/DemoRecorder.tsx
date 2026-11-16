'use client';
import { useEffect, useState } from 'react';
import { mountWidget } from '@vansham/unravel-sdk';
import { useDemoSession } from './useDemoSession';

/** The owner-only hosted demo uses the workspace SDK's authenticated delivery option. */
export function DemoRecorder() {
  const sessionReady = useDemoSession();
  const [message, setMessage] = useState('Checking recording setup…');
  const [projectId, setProjectId] = useState<string | null>(null);
  useEffect(() => {
    if (!sessionReady) return;
    const controller = new AbortController();
    let widget: ReturnType<typeof mountWidget> | undefined;
    let disposed = false;
    const id = new URLSearchParams(location.search).get('project');
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      setMessage(
        'Explore the example, or return to the demo guide to connect your recording project.',
      );
      return;
    }
    // A public ID alone must not disclose project details or choose another owner's inbox.
    void fetch(`/api/projects/${id}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok)
          throw Error('Sign in and reopen this example from the demo guide to record.');
        const { project } = await response.json();
        if (project.origin !== location.origin)
          throw Error(
            'This project belongs to a different website. Prepare a project from the demo guide.',
          );
        if (disposed) return;
        widget = mountWidget({
          projectId: id,
          applicationOrigin: location.origin,
          authenticatedDemo: true,
          // Keep capture below the hosted envelope limit, including its JSON metadata.
          limits: { maxBytes: 3_000_000 },
        });
        setProjectId(id);
        setMessage('Ready. Open Report a bug at the bottom right to start.');
      })
      .catch((error) => {
        if (!controller.signal.aborted) setMessage(error.message);
      });
    const cleanup = () => {
      disposed = true;
      controller.abort();
      widget?.destroy();
    };
    // Full navigation/page exit must discard local capture rather than record the workspace.
    window.addEventListener('pagehide', cleanup);
    const restore = (event: PageTransitionEvent) => {
      if (event.persisted) location.reload();
    };
    window.addEventListener('pageshow', restore);
    return () => {
      window.removeEventListener('pagehide', cleanup);
      window.removeEventListener('pageshow', restore);
      cleanup();
    };
  }, [sessionReady]);
  return (
    <aside className="demo-recording" data-unravel-block>
      <p role="status">{message}</p>
      {projectId && (
        <a href={`/app/projects/${projectId}/reports`} target="_blank" rel="noreferrer">
          Open my reports ↗
        </a>
      )}
    </aside>
  );
}
