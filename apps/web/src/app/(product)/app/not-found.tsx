import Link from 'next/link';
import { PageContent, PageHeader, EmptyState } from '@/features/workspace/compositions';
export default function ProjectNotFound() { return <PageContent width="form"><PageHeader title="Project not found" description="This project is unavailable in your workspace." /><EmptyState title="Return to your projects" description="It may have been deleted, or it belongs to another account." actions={<Link className="product-button" href="/app/projects">Your projects</Link>} /></PageContent>; }
