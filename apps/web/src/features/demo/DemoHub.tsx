'use client';
import { useEffect, useState } from 'react';
import { useDemoSession } from './useDemoSession';
import Link from 'next/link';
import { DemoChrome } from './DemoChrome';

type DemoProject = { id: string; name: string; origin: string };

/** Reuse an owner-authorized project for this origin; never expose a shared report inbox. */
export function DemoHub() {
  const sessionReady = useDemoSession();
  const [project, setProject] = useState<DemoProject | null>(null);
  const [state, setState] = useState<
    'loading' | 'unconfigured' | 'signed-out' | 'idle' | 'creating' | 'error'
  >('loading');
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!sessionReady) return;
    const controller = new AbortController();
    void fetch('/api/projects', { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (response.status === 503 && data.error === 'Developer sign-in is not configured yet.') {
          setState('unconfigured');
          return;
        }
        if (response.status === 401) {
          setState('signed-out');
          return;
        }
        if (!response.ok) throw Error('Could not check your demo project. Reload to try again.');
        setProject(
          data.projects.find((item: DemoProject) => item.origin === location.origin) ?? null,
        );
        setState('idle');
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setMessage(error.message);
          setState('error');
        }
      });
    return () => controller.abort();
  }, [sessionReady]);
  async function prepare() {
    setState('creating');
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Interview demo', websiteUrl: location.origin }),
      });
      const data = await response.json();
      if (!response.ok)
        throw Error(
          (typeof data.error === 'string' ? data.error : undefined) ??
            'Could not create your demo project. Reload to check whether it already exists.',
        );
      setProject(data.project);
      setState('idle');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not prepare the demo.');
      setState('error');
    }
  }
  const query = project ? `?project=${encodeURIComponent(project.id)}` : '';
  return (
    <DemoChrome>
      <section className="demo-intro">
        <h1>
          Take a bug from
          <br />
          “it broke” to reproducible.
        </h1>
        <p>
          Choose a real integration, record an intentional failure, then follow its evidence in your
          workspace.
        </p>
      </section>
      <section className="demo-connect" aria-labelledby="demo-connect-title">
        <div>
          <h2 id="demo-connect-title">Your recording destination</h2>
          <p>
            {project
              ? `Reports go to ${project.name}. Only your account can read them.`
              : 'Explore either example now. Sign in and prepare a project to save recordings.'}
          </p>
        </div>
        <div className="demo-connect-action">
          {state === 'loading' && <p role="status">Checking your project…</p>}
          {state === 'unconfigured' && (
            <p role="status">
              Saving reports needs your own Clerk and PostgreSQL configuration. You can explore both
              examples.
            </p>
          )}
          {state === 'signed-out' && (
            <Link className="demo-button" href="/sign-in?redirect_url=%2Fdemo">
              Sign in to save reports
            </Link>
          )}
          {state === 'idle' && !project && (
            <button className="demo-button" onClick={prepare}>
              Prepare my demo project
            </button>
          )}
          {state === 'creating' && (
            <button className="demo-button" disabled>
              Preparing project…
            </button>
          )}
          {project && (
            <a className="demo-button" href={`/app/projects/${project.id}/reports`}>
              View my reports ↗
            </a>
          )}
          {state === 'error' && <p role="alert">{message}</p>}
        </div>
      </section>
      <div className="demo-integrations">
        {[
          {
            name: 'Next.js',
            path: 'next',
            description: 'A Next.js route with server-rendered HTML and client interactions.',
          },
          {
            name: 'React',
            path: 'react',
            description: 'A standalone React bundle. No Next.js runtime in the example.',
          },
        ].map((item) => (
          <a className="demo-integration" href={`/demo/${item.path}${query}`} key={item.path}>
            <span className="demo-framework">{item.name}</span>
            <h2>
              Open the {item.name} example <span aria-hidden="true">↗</span>
            </h2>
            <p>{item.description}</p>
            <span className="demo-link-label">Try the example</span>
          </a>
        ))}
      </div>
      <section className="demo-walkthrough" aria-labelledby="walkthrough-title">
        <h2 id="walkthrough-title">A short path through the product.</h2>
        <ol>
          <li>
            <strong>Record the failure.</strong>
            <span>
              Open Report a bug, choose a mode and start. Submit a question or reproduce the clipped
              heading.
            </span>
          </li>
          <li>
            <strong>Inspect the evidence.</strong>
            <span>
              Stop and submit. Open your reports to review replay, readable actions, the failed
              request and errors.
            </span>
          </li>
          <li>
            <strong>Make it reproducible.</strong>
            <span>
              Review the generated steps, supply safe field values and confirm the expected result
              before exporting Playwright.
            </span>
          </li>
        </ol>
      </section>
    </DemoChrome>
  );
}
