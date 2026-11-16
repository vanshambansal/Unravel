'use client';
import { useEffect, useRef, useState } from 'react';
import { FeedbackTransition } from '../workspace/ProductMotion';

/** Copyable integration instructions; derive the service origin after hydration for correct SSR markup. */
export function SdkSetup({
  projectId,
  websiteOrigin,
}: {
  projectId: string;
  websiteOrigin: string;
}) {
  const [framework, setFramework] = useState('Next.js'),
    [origin, setOrigin] = useState(''),
    [copied, setCopied] = useState('');
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    setOrigin(location.origin);
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);
  const install = 'npm install @vansham/unravel-sdk@0.1.0';
  const code = `${framework === 'Next.js' ? "'use client';\n\n" : ''}import { useEffect } from 'react';
import { mountWidget } from '@vansham/unravel-sdk';

export function UnravelReporter() {
  useEffect(() => {
    const widget = mountWidget({
      projectId: '${projectId}',
      applicationOrigin: ${JSON.stringify(origin || 'YOUR_UNRAVEL_ORIGIN')},
      limits: { maxBytes: 3_000_000 },
    });
    return () => widget.destroy();
  }, []);
  return null;
}`;
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied('Copied');
    } catch {
      setCopied('Copy unavailable. Select the code to copy manually.');
    }
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(''), 3500);
  }
  return (
    <div className="setup-steps">
      <section className="setup-step">
        <h3>1. Install the SDK</h3>
        <p>
          Install the published package in your website project. React and Next.js use the same SDK.
          After installation, add the component below and restart your website.
        </p>
        <div className="setup-code">
          <header>
            <span>React / Next.js - npm</span>
            <button className="product-text-link" onClick={() => void copy(install)}>
              Copy install command
            </button>
          </header>
          <pre tabIndex={0}>
            <code>{install}</code>
          </pre>
        </div>
      </section>
      <section className="setup-step">
        <h3>2. Mount the reporting widget</h3>
        <p>
          Add this component once near your application root. It supplies the launcher, recording
          controls, report form and submission workflow. It starts no recording until the visitor
          chooses Start.
        </p>
        <div className="setup-frameworks" role="tablist" aria-label="Integration framework">
          {['Next.js', 'React'].map((name) => (
            <button
              key={name}
              id={`framework-${name.replace('.', '')}`}
              role="tab"
              aria-selected={framework === name}
              aria-controls="integration-code"
              tabIndex={framework === name ? 0 : -1}
              onClick={() => setFramework(name)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                  event.preventDefault();
                  setFramework(name === 'React' ? 'Next.js' : 'React');
                  (
                    event.currentTarget.parentElement?.querySelector(
                      `[aria-selected="false"]`,
                    ) as HTMLElement
                  )?.focus();
                }
              }}
            >
              {framework === name && <span className="framework-selection" />}
              <span>{name}</span>
            </button>
          ))}
        </div>
        <div
          className="setup-code"
          id="integration-code"
          role="tabpanel"
          aria-labelledby={`framework-${framework.replace('.', '')}`}
        >
          <header>
            <span>UnravelReporter.tsx</span>
            <button
              className="product-text-link"
              disabled={!origin}
              onClick={() => void copy(code)}
            >
              Copy code
            </button>
          </header>
          <pre tabIndex={0}>
            <code>{code}</code>
          </pre>
        </div>
        <FeedbackTransition identity={copied}>
          <p role="status" className="product-small">
            {copied || 'Mount <UnravelReporter /> once in your root layout or app component.'}
          </p>
        </FeedbackTransition>
      </section>
      <section className="setup-step">
        <h3>3. Choose a recording mode</h3>
        <p>
          The reporter asks the visitor before Start. Page text and layout remain visible in both
          modes.
        </p>
        <ul>
          <li>
            <strong>Mask entered values</strong> (default): values in fields are masked. Text the
            page displays outside fields stays visible, including names and echoed input.
          </li>
          <li>
            <strong>Full-content recording:</strong> entered and sensitive field values are included
            when the visitor explicitly selects this mode.
          </li>
        </ul>
        <p className="product-small">
          No text allowlist is required for the widget. Use <code>data-unravel-block</code> to
          exclude a section entirely. Existing redacted reports cannot be unmasked; record a new
          report after upgrading the SDK.
        </p>
      </section>
      <section className="setup-step">
        <h3>4. Send your first report</h3>
        <p>
          Open <code>{websiteOrigin}</code>, click Report a bug, record a synthetic interaction,
          stop and submit. Return to Reports to investigate. The host, protocol and port must match
          exactly.
        </p>
        <details className="setup-boundaries">
          <summary>Privacy and supported integrations</summary>
          <p className="product-small">
            Page text, error messages and URL paths are visible in both recording modes. Field
            values follow the visitor’s choice. Network bodies, headers, cookies, URL queries and
            fragments are not captured. Use your running Unravel service as the application origin.
          </p>
        </details>
      </section>
    </div>
  );
}
