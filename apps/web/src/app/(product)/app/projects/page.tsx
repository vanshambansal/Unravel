import Link from 'next/link';
import { requirePageDeveloper } from '@/server/auth';
import { projectServices } from '@/server/projects';
import { Workflow } from '@/features/workspace/Workflow';

export default async function ProjectsPage() {
  const owner = await requirePageDeveloper();
  const projects = await projectServices().list(owner);
  return <>
    <header className="product-page-heading"><div><h1>Your projects</h1><p>Connect a website. Keep every bug report in context.</p></div><Link className="product-button" href="/app/projects/new">Create project</Link></header>
    {projects.length ? <ul className="project-list">{projects.map(project => <li key={project.id}><Link href={`/app/projects/${project.id}/setup`} className="project-card"><span className="project-monogram" aria-hidden="true">{project.name.slice(0, 1).toUpperCase()}</span><div><h2>{project.name}</h2><p>{project.origin}</p></div><span className="product-small">SDK setup →</span></Link></li>)}</ul> : <section className="product-panel product-empty"><p className="product-eyebrow accent">01 / START WITH YOUR WEBSITE</p><h2>A home for your next investigation.</h2><p>Create a project and register the website where you want to collect bug reports.</p><Link className="product-button" href="/app/projects/new">Create your first project</Link><Workflow /></section>}
    <p className="product-small product-privacy">Projects are private to your account.</p>
  </>;
}
