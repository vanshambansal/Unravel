'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { validateProject, type ProjectFields } from './validation';
import { ActionBar, ProductDialog, SettingRow, SettingsGroup } from '../workspace/compositions';
import { FeedbackTransition } from '../workspace/ProductMotion';

type Project = { id: string; name: string; origin: string };
export function ProjectSettings({ project }: { project: Project }) {
  const router = useRouter();
  const [saved, setSaved] = useState(project);
  const [name, setName] = useState(project.name),
    [websiteUrl, setWebsiteUrl] = useState(project.origin);
  const [fields, setFields] = useState<ProjectFields>({}),
    [error, setError] = useState('');
  const [message, setMessage] = useState(''),
    [pending, setPending] = useState(false),
    [stale, setStale] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const originDialog = useRef<HTMLDialogElement>(null),
    deleteDialog = useRef<HTMLDialogElement>(null);
  const lock = useRef(false);
  const parsed = validateProject({ name, websiteUrl });
  const changed = name !== saved.name || websiteUrl !== saved.origin;
  async function write(method: 'PATCH' | 'DELETE') {
    if (lock.current || stale) return;
    lock.current = true;
    setPending(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`/api/projects/${saved.id}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          websiteUrl,
          expected: { name: saved.name, origin: saved.origin },
          ...(method === 'DELETE' ? { confirmation } : {}),
        }),
      });
      if (!response.ok) {
        const result = await response.json();
        setFields(result.fields ?? {});
        setError(
          response.status === 401
            ? 'Your session expired. Sign in again before continuing.'
            : (result.error ?? 'Could not save this change. Please retry.'),
        );
        if (response.status === 404 || (response.status === 409 && !result.fields)) setStale(true);
        return;
      }
      if (method === 'DELETE') {
        router.replace('/app/projects');
        router.refresh();
        return;
      }
      const { project: updated } = await response.json();
      setSaved(updated);
      setName(updated.name);
      setWebsiteUrl(updated.origin);
      setFields({});
      setMessage('Project settings saved.');
      router.refresh();
    } catch {
      setError('Could not reach Unravel. Your changes are still here; retry when connected.');
    } finally {
      lock.current = false;
      setPending(false);
      originDialog.current?.close();
      deleteDialog.current?.close();
    }
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    setFields(parsed.fields);
    if (!parsed.value) {
      document.getElementById(parsed.fields.name ? 'settings-name' : 'settings-origin')?.focus();
      return;
    }
    if (parsed.value.origin !== saved.origin) originDialog.current?.showModal();
    else void write('PATCH');
  }
  return (
    <div className="project-settings">
      <form onSubmit={submit} noValidate aria-busy={pending}>
        <SettingsGroup
          title="General"
          description="Your project identity and website registration."
          icon={<span>&#9671;</span>}
          footer={
            <ActionBar
              status={
                <FeedbackTransition
                  identity={pending ? 'saving' : changed ? 'dirty' : message || 'idle'}
                >
                  <p
                    role="status"
                    className="settings-message"
                    data-state={message && !changed ? 'saved' : 'idle'}
                  >
                    {pending
                      ? 'Saving changes…'
                      : changed
                        ? 'You have unsaved changes'
                        : message || 'No unsaved changes'}
                  </p>
                </FeedbackTransition>
              }
            >
              <button
                type="button"
                className="product-button secondary"
                disabled={pending || stale || !changed}
                onClick={() => {
                  setName(saved.name);
                  setWebsiteUrl(saved.origin);
                  setFields({});
                  setError('');
                }}
              >
                Reset changes
              </button>
              <button className="product-button" disabled={pending || stale || !changed}>
                {pending ? 'Saving…' : 'Save changes'}
              </button>
            </ActionBar>
          }
        >
          <SettingRow
            label="Project name"
            htmlFor="settings-name"
            description="Shown in your workspace."
          >
            <input
              id="settings-name"
              required
              maxLength={80}
              value={name}
              disabled={pending || stale}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={!!fields.name}
              aria-describedby={fields.name ? 'settings-name-error' : undefined}
            />
            {fields.name && (
              <p id="settings-name-error" className="product-field-error">
                {fields.name}
              </p>
            )}
          </SettingRow>
          <SettingRow
            label="Website address"
            htmlFor="settings-origin"
            description="Origin allowed to submit reports."
          >
            <input
              id="settings-origin"
              required
              maxLength={2048}
              value={websiteUrl}
              disabled={pending || stale}
              onChange={(event) => setWebsiteUrl(event.target.value)}
              inputMode="url"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={!!fields.websiteUrl}
              aria-describedby="settings-origin-help settings-origin-error"
            />
            <p id="settings-origin-help" className="ui-field-help">
              Match protocol, host and port. Paths are removed. Bare loopback addresses use HTTP;
              public domains use HTTPS.
            </p>
            {parsed.value && (
              <p className="ui-origin">
                Submission origin <code>{parsed.value.origin}</code>
              </p>
            )}
            <p id="settings-origin-error" className="product-field-error">
              {fields.websiteUrl}
            </p>
          </SettingRow>
          <SettingRow label="Project ID" description="Used by the recording SDK.">
            <div className="ui-identifier">
              <code>{saved.id}</code>
              <span className="ui-badge">Read only</span>
            </div>
            <p className="ui-field-help">
              Stays the same when you rename the project or change its origin.
            </p>
          </SettingRow>
          {error && (
            <div role="alert" className="product-notice product-field-error ui-settings-alert">
              <p>{error}</p>
              {stale && (
                <button
                  type="button"
                  className="product-button secondary"
                  onClick={() => location.reload()}
                >
                  Reload latest settings
                </button>
              )}
              <Link href="/app/projects">Back to projects</Link>
            </div>
          )}
        </SettingsGroup>
      </form>
      <section className="ui-danger-section">
        <div className="ui-danger-copy">
          <span className="ui-group-icon ui-danger-icon" aria-hidden="true">
            !
          </span>
          <div>
            <h2>Delete project</h2>
            <p>
              Permanently delete this project and all its reports, recordings and timelines. This
              cannot be undone.
            </p>
            <p className="ui-field-help">Provider backups follow their own retention policy.</p>
          </div>
        </div>
        <button
          className="product-button"
          disabled={pending || stale}
          onClick={() => {
            setConfirmation('');
            setError('');
            deleteDialog.current?.showModal();
          }}
        >
          Delete project
        </button>
      </section>
      <ProductDialog
        dialogRef={originDialog}
        titleId="origin-change-heading"
        title="Change the submission origin?"
        descriptionId="origin-change-description"
        description="Only the new origin can submit after saving. The project ID stays the same; existing reports and their recorded origins are preserved."
        onCancel={(event) => {
          if (pending) event.preventDefault();
        }}
        actions={
          <>
            <button
              autoFocus
              className="product-button secondary"
              disabled={pending}
              onClick={() => originDialog.current?.close()}
            >
              Cancel
            </button>
            <button
              className="product-button"
              disabled={pending}
              onClick={() => void write('PATCH')}
            >
              {pending ? 'Saving…' : 'Confirm origin change'}
            </button>
          </>
        }
      >
        <dl>
          <dt>Current</dt>
          <dd>{saved.origin}</dd>
          <dt>New</dt>
          <dd>{parsed.value?.origin}</dd>
        </dl>
      </ProductDialog>
      <ProductDialog
        dialogRef={deleteDialog}
        titleId="delete-project-heading"
        title="Permanently delete this project?"
        descriptionId="delete-project-description"
        description={
          <>
            All reports, recordings and timelines in <strong>{saved.name}</strong> will be deleted.
            This cannot be undone.
          </>
        }
        onCancel={(event) => {
          if (pending) event.preventDefault();
        }}
        actions={
          <>
            <button
              className="product-button secondary"
              disabled={pending}
              onClick={() => deleteDialog.current?.close()}
            >
              Cancel
            </button>
            <button
              className="product-button danger"
              disabled={pending || confirmation !== saved.name}
              onClick={() => void write('DELETE')}
            >
              {pending ? 'Deleting…' : 'Permanently delete project'}
            </button>
          </>
        }
      >
        <div className="product-field">
          <label htmlFor="delete-project-confirmation">Type {saved.name} to confirm</label>
          <input
            autoFocus
            id="delete-project-confirmation"
            autoComplete="off"
            value={confirmation}
            disabled={pending}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </div>
      </ProductDialog>
    </div>
  );
}
