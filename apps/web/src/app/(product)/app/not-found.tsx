import Link from 'next/link';
export default function ProjectNotFound() { return <section className="product-panel"><h1>Project not found</h1><p>It may not exist, or it belongs to another account.</p><Link className="product-button" href="/app/projects">Your projects</Link></section>; }
