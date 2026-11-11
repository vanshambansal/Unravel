'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGroup, motion } from 'motion/react';

export function WorkspaceSidebar({ projects }: { projects: { id: string; name: string }[] }) {
  const pathname = usePathname();
  const project = projects.find(project => pathname.startsWith(`/app/projects/${project.id}/`));
  const links = [{ href: '/app/projects', label: 'All projects', icon: 'grid', selected: !project }, ...(project ? [
    { href: `/app/projects/${project.id}/reports`, label: 'Reports', icon: 'reports', selected: pathname.includes('/reports') },
    { href: `/app/projects/${project.id}/setup`, label: 'SDK setup', icon: 'code', selected: pathname.endsWith('/setup') },
    { href: `/app/projects/${project.id}/settings`, label: 'Settings', icon: 'settings', selected: pathname.endsWith('/settings') },
  ] : [])];
  return <aside className="workspace-sidebar">
    <nav aria-label="Workspace"><LayoutGroup id="workspace-navigation">
      <p className="workspace-nav-caption">Workspace</p>
      {links.map((link, index) => <div key={link.href}>
        {index === 1 && <p className="workspace-nav-caption workspace-nav-project" title={project?.name}>{project?.name}</p>}
        <Link className="workspace-nav-link" href={link.href} aria-current={link.selected ? 'page' : undefined}>
          {link.selected && <motion.span className="workspace-nav-selection" layoutId="selection" transition={{ type: 'spring', stiffness: 440, damping: 38 }} />}
          <Image src={`/product/${link.icon}.svg`} width={20} height={20} alt="" /><span>{link.label}</span>
        </Link>
      </div>)}
    </LayoutGroup></nav>
    {!project && <p className="workspace-nav-hint">Choose a project above to open its reports and SDK setup.</p>}
    <div className="workspace-sidebar-note"><Image src="/product/shield.svg" width={20} height={20} alt="" /><p>Your workspace.<br />Your evidence.</p></div>
  </aside>;
}
