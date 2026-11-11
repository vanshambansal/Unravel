import { CreateProjectForm } from '@/features/projects/CreateProjectForm';
import { PageContent, PageHeader } from '@/features/workspace/compositions';
export default function NewProjectPage() {
  return <PageContent width="form"><PageHeader context="Projects / New project" title="Connect your website" description="A project keeps one website and its reports together." /><CreateProjectForm /></PageContent>;
}
