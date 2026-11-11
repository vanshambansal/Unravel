import { notFound } from 'next/navigation';
import { requirePageDeveloper } from '@/server/auth';
import { projectServices } from '@/server/projects';
import { ApplicationError } from '@/server/errors';
import { ProjectSettings } from '@/features/projects/ProjectSettings';
import { PageContent, PageHeader } from '@/features/workspace/compositions';

export default async function SettingsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const owner = await requirePageDeveloper();
  const project = await projectServices().get(owner, (await params).projectId).catch(error => { if (error instanceof ApplicationError && error.status === 404) notFound(); throw error; });
  return <PageContent width="settings"><PageHeader title="Project settings" description="Manage your website registration and project data." /><ProjectSettings project={{ id: project.id, name: project.name, origin: project.origin }} /></PageContent>;
}
