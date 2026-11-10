'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { validateProject, type ProjectFields } from './validation';

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
  return <form className="product-panel project-form" onSubmit={submit} noValidate aria-busy={pending}>
    <div className="product-field"><label htmlFor="project-name">Project name</label><input id="project-name" name="name" maxLength={80} required autoComplete="off" placeholder="e.g. Question Submission" value={name} onChange={e => setName(e.target.value)} aria-invalid={!!fields.name} aria-describedby={fields.name ? 'name-error' : undefined} />{fields.name && <p className="product-field-error" id="name-error">{fields.name}</p>}</div>
    <div className="product-field"><label htmlFor="website-url">Website address</label><input id="website-url" name="websiteUrl" type="text" inputMode="url" autoCapitalize="none" spellCheck={false} required maxLength={2048} autoComplete="url" placeholder="https://example.com" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} aria-invalid={!!fields.websiteUrl} aria-describedby={`website-help${fields.websiteUrl ? ' website-error' : ''}`} />
      <p id="website-help" className="product-small">Paste a page URL or enter your domain. We save only the website origin—the protocol, hostname and optional port. Paths and query strings are removed. Use <code>http://localhost:4173</code> for the local test site.</p>
      {fields.websiteUrl && <p id="website-error" className="product-field-error">{fields.websiteUrl}</p>}
      {parsed && <p className="origin-preview" aria-live="polite">Website to register: <strong>{parsed.origin}</strong></p>}
    </div>
    {error && <p className="product-notice product-field-error" role="alert">{error}</p>}
    <div className="product-actions"><button className="product-button" type="submit" disabled={pending}>{pending ? 'Creating project…' : 'Create project'}</button><Link className="product-button secondary" href="/app/projects">Cancel</Link></div>
    <p className="product-small">Only your account can access this project. Registering a URL does not verify domain ownership.</p>
  </form>;
}
