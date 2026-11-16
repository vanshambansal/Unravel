'use client';
import { useEffect, useRef, useState } from 'react';
import { initialize, type Recorder } from '@vansham/unravel-sdk';

/** Development harness, also mounted by the plain React smoke fixture. */
export function SdkLab() {
  const recorder = useRef<Recorder | null>(null);
  const [status, setStatus] = useState('idle');
  const [ready, setReady] = useState(false);
  const [summary, setSummary] = useState('No recording yet.');
  useEffect(() => {
    let active = true;
    const instance = initialize({
      projectId: '12345678-1234-4234-8234-123456789012',
      privacy: {
        allowValueSelectors: ['[data-testid="lab-question"]'],
        testIds: ['lab-question', 'lab-submit'],
      },
      onStateChange: (value) =>
        active && setStatus(`${value.state}${value.reason ? ` (${value.reason})` : ''}`),
    });
    recorder.current = instance;
    setStatus('idle');
    setReady(true);
    return () => {
      active = false;
      setReady(false);
      recorder.current = null;
      instance.destroy();
    };
  }, []);
  return (
    <main
      style={{
        maxWidth: 680,
        margin: '3rem auto',
        padding: '1.5rem',
        fontFamily: 'Arial,sans-serif',
        lineHeight: 1.7,
      }}
    >
      <h1>SDK integration lab</h1>
      <p>Development-only harness. Synthetic content, local memory, no upload.</p>
      <div data-unravel-block>
        <button
          disabled={!ready}
          onClick={() => void recorder.current?.start().catch(() => setStatus('Could not start'))}
        >
          Start recording
        </button>{' '}
        <button
          disabled={!ready}
          onClick={() => {
            const result = recorder.current?.stop();
            setSummary(
              result
                ? `${result.events.filter((event) => event.kind === 'action').length} actions; full snapshot: ${result.hasFullSnapshot}`
                : 'No recording',
            );
          }}
        >
          Stop recording
        </button>
        <p role="status">{status}</p>
        <p data-testid="lab-summary">{summary}</p>
      </div>
      <form onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="lab-question">Synthetic question</label>
        <br />
        <textarea id="lab-question" data-testid="lab-question" />
        <br />
        <button data-testid="lab-submit">Submit locally</button>
      </form>
      <p>
        This form tests framework integration only. Use Question desk for real HTTP failure capture.
      </p>
      <a href="/sdk-lab-exit">Unmount lab</a>
    </main>
  );
}
