'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { validateProject, type ProjectFields } from './validation';
import { ActionBar, SettingRow, SettingsGroup } from '../workspace/compositions';

export function CreateProjectForm() {
  const router = useRouter(); const lock = useRef(false);
  const [name, setName] = useState(''); const [websiteUrl, setWebsiteUrl] = useState('');
  const [fields, setFields] = useState<ProjectFields>({}); const [error, setError] = useState(''); const [pending, setPending] = useState(false);
  const parsed = validateProject({ name: name || 'Preview', websiteUrl }).value;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (lock.current) return;
    const { value, fields: nextFields } = validateProject({ name, websiteUrl });
    setFields(nextFields); setError('');
    if (!value) { document.getElementById(nextFields.name ? 'project-name' : 'website-url')?.focus(); return; }
    lock.current = true; setPending(true);
    try {
      const response = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, websiteUrl }) });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 401) { router.push('/sign-in'); return; }
        setFields(result.fields ?? {}); setError(result.error ?? 'Could not create your project. Please try again.'); return;
      }
      router.push(`/app/projects/${result.project.id}/setup`); router.refresh();
    } catch { setError('We could not reach Unravel. Your details are still here; please try again.'); }
    finally { lock.current = false; setPending(false); }
  }
  return <form onSubmit={submit} noValidate aria-busy={pending}>
    <SettingsGroup title="Website registration" description="One project connects one website to your investigations." icon={<span>&#9671;</span>} footer={<ActionBar status={<span>Private to your account</span>}><Link className="product-button secondary" href="/app/projects">Cancel</Link><button className="product-button" type="submit" disabled={pending}>{pending ? 'Creating project…' : 'Create project'}</button></ActionBar>}>
      <SettingRow label="Project name" htmlFor="project-name" description="A clear name you will recognize in your workspace."><input id="project-name" name="name" maxLength={80} required autoComplete="off" placeholder="e.g. Question Submission" value={name} onChange={e => setName(e.target.value)} aria-invalid={!!fields.name} aria-describedby={fields.name ? 'name-error' : undefined} />{fields.name && <p className="product-field-error" id="name-error">{fields.name}</p>}</SettingRow>
      <SettingRow label="Website address" htmlFor="website-url" description="Use the website where visitors will report bugs."><input id="website-url" name="websiteUrl" type="text" inputMode="url" autoCapitalize="none" spellCheck={false} required maxLength={2048} autoComplete="url" placeholder="https://example.com" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} aria-invalid={!!fields.websiteUrl} aria-describedby={`website-help${fields.websiteUrl ? ' website-error' : ''}`} />
        <p id="website-help" className="ui-field-help">We save protocol, host and port. Paths and queries are removed. Loopback addresses default to HTTP. localhost and 127.0.0.1 are different origins.</p>
        {fields.websiteUrl && <p id="website-error" className="product-field-error">{fields.websiteUrl}</p>}
        {parsed && <p className="ui-origin origin-preview">Website to register <strong>{parsed.origin}</strong></p>}
      </SettingRow>
      {error && <p className="product-notice product-field-error ui-settings-alert" role="alert">{error}</p>}
    </SettingsGroup>
    <p className="ui-form-note">Next, install the SDK and send your first report. Registration does not verify domain ownership.</p>
  </form>;
}
