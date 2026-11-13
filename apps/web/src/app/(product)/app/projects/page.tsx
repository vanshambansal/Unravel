import { IntentLink as Link } from '@/features/workspace/IntentLink';
import { requirePageDeveloper } from '@/server/auth';
import { projectServices } from '@/server/projects';
import { Workflow } from '@/features/workspace/Workflow';
import { EmptyState, PageContent, PageHeader, ResourceCollection, ResourceItem } from '@/features/workspace/compositions';

export default async function ProjectsPage() {
  const owner = await requirePageDeveloper();
  const projects = await projectServices().list(owner);
  return <PageContent>
    <PageHeader title="Your projects" description="Connect a website. Keep every bug report in context." actions={<Link className="product-button" href="/app/projects/new">Create project</Link>} />
    {projects.length ? <ResourceCollection label="Websites" count={projects.length} footer="Private to your account. Each project has its own website origin and reports.">
      {projects.map((project, index) => <li key={project.id}><ResourceItem icon={project.name.slice(0, 1).toUpperCase()} title={project.name} description={<code>{project.origin}</code>} actions={<><Link className="product-button secondary" href={`/app/projects/${project.id}/reports`} prepareOnIdle={index === 0}>Open reports <span aria-hidden="true">&#8594;</span></Link><Link className="product-text-link" href={`/app/projects/${project.id}/setup`}>SDK setup</Link><Link className="product-text-link" href={`/app/projects/${project.id}/settings`}>Settings</Link></>} /></li>)}
    </ResourceCollection> : <EmptyState title="Your first investigation starts with a website." description="Register your website, add the widget, then receive a report." actions={<Link className="product-button" href="/app/projects/new">Create your first project</Link>}><Workflow /></EmptyState>}
  </PageContent>;
}
