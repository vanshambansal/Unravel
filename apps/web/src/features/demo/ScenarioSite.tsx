'use client';
import { useEffect, useRef, useState } from 'react';
import { DemoChrome } from './DemoChrome';
import { DemoRecorder } from './DemoRecorder';

const initialTasks = [
  { id: 1, title: 'Account settings', done: false },
  { id: 2, title: 'Mobile checkout', done: false },
  { id: 3, title: 'Search results', done: true },
];

/** Deliberate, isolated failures for SDK demonstrations; no production application state. */
export function ScenarioSite({ framework }: { framework: 'React' | 'Next.js' }) {
  const [tab, setTab] = useState('Question desk');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tasks, setTasks] = useState(initialTasks);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [heading, setHeading] = useState('A heading that fits');
  const [notification, setNotification] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(''), 3500);
    return () => clearTimeout(timer);
  }, [notification]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback('');
    try {
      // The dedicated endpoint always returns 500 and never reads/stores submitted values.
      const response = await fetch('/demo/api/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'synthetic-question' }),
      });
      setFeedback(
        response.ok
          ? 'Your question was submitted successfully.'
          : 'We could not submit your question. Please try again.',
      );
    } catch {
      setFeedback('The demo endpoint could not be reached. Try again.');
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <DemoChrome>
      <div className="demo-example-heading">
        <div>
          <h1>{framework} example.</h1>
          <p>A small support desk with intentional bugs. Use synthetic values only.</p>
        </div>
        <a href="/demo">← Choose an integration</a>
      </div>
      <DemoRecorder />
      <div className="demo-browser">
        <div className="demo-browser-bar">
          <span aria-hidden="true">● ● ●</span>
          <span>Example website / {framework}</span>
          <span>Intentionally broken</span>
        </div>
        <div className="demo-site">
          <nav className="demo-tabs" aria-label="Example sections">
            {['Question desk', 'Task board', 'Layout bug'].map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={tab === name}
                onClick={() => setTab(name)}
              >
                {name}
              </button>
            ))}
          </nav>
          {tab === 'Question desk' && (
            <section>
              <h2>What’s on your mind?</h2>
              <p>Submitting this form produces an intentional HTTP 500.</p>
              <form onSubmit={submit}>
                <label>
                  Category
                  <select defaultValue="General">
                    <option>General</option>
                    <option>Technical</option>
                  </select>
                </label>
                <label>
                  Your question
                  <input name="question" required placeholder="Why does the submit button fail?" />
                </label>
                <label>
                  Private test value
                  <input
                    name="private-value"
                    type="password"
                    placeholder="Dummy values only"
                    autoComplete="off"
                  />
                </label>
                <button className="demo-site-primary" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit question'}
                </button>
                <p className="demo-feedback" role="status">
                  {feedback}
                </p>
              </form>
              <details>
                <summary>Test a JavaScript error</summary>
                <p>This uncaught error is separate from the failed request.</p>
                <button
                  type="button"
                  onClick={() =>
                    setTimeout(() => {
                      throw new Error('Synthetic Unravel demo error: question preview failed');
                    }, 0)
                  }
                >
                  Trigger demo error
                </button>
              </details>
              <p className="demo-expected">
                Expected after a fix: “Your question was submitted successfully.”
              </p>
            </section>
          )}
          {tab === 'Task board' && (
            <section>
              <h2>A few things to follow up.</h2>
              <p>Record filtering, toggling tasks and a native dialog.</p>
              <div className="demo-task-controls">
                <label>
                  Search tasks
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by title"
                  />
                </label>
                <label>
                  Status
                  <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                    <option>All</option>
                    <option>Open</option>
                    <option>Done</option>
                  </select>
                </label>
              </div>
              <ul className="demo-tasks">
                {tasks
                  .filter(
                    (task) =>
                      task.title.toLowerCase().includes(query.toLowerCase()) &&
                      (filter === 'All' || task.done === (filter === 'Done')),
                  )
                  .map((task) => (
                    <li key={task.id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() =>
                            setTasks((items) =>
                              items.map((item) =>
                                item.id === task.id ? { ...item, done: !item.done } : item,
                              ),
                            )
                          }
                        />
                        {task.title}
                      </label>
                      <span>{task.done ? 'Done' : 'Open'}</span>
                    </li>
                  ))}
              </ul>
              {!tasks.some(
                (task) =>
                  task.title.toLowerCase().includes(query.toLowerCase()) &&
                  (filter === 'All' || task.done === (filter === 'Done')),
              ) && <p>No tasks match. Try another search or status.</p>}
              <div className="demo-site-actions">
                <button type="button" onClick={() => dialog.current?.showModal()}>
                  Open task details
                </button>
                <button
                  type="button"
                  onClick={() => setNotification('Task notification displayed.')}
                >
                  Show notification
                </button>
              </div>
            </section>
          )}
          {tab === 'Layout bug' && (
            <section>
              <h2>A heading with nowhere to go.</h2>
              <p>
                The preview incorrectly clips long text. Record it using a long synthetic heading.
              </p>
              <label>
                Preview heading
                <input value={heading} onChange={(event) => setHeading(event.target.value)} />
              </label>
              <div className="demo-broken-preview">
                <h3>{heading}</h3>
                <p>This panel should grow to fit the heading.</p>
              </div>
              <p className="demo-expected">
                Expected after a fix: the complete heading stays readable.
              </p>
            </section>
          )}
          <dialog ref={dialog} className="demo-dialog">
            <h2>Account settings task</h2>
            <p>Native dialogs, opening and closing, are part of the supported demo.</p>
            <button type="button" onClick={() => dialog.current?.close()}>
              Close task details
            </button>
          </dialog>
          {notification && (
            <p className="demo-notification" role="status">
              {notification}
            </p>
          )}
        </div>
      </div>
      <p className="demo-example-footnote">
        Stop and submit your recording, then inspect the replay and timeline. Exported tests require
        your review and intended assertions.
      </p>
    </DemoChrome>
  );
}
