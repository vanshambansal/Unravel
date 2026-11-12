'use client';
import Image from 'next/image';
import { IntentLink as Link } from '@/features/workspace/IntentLink';
import { useId, useRef, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
export function ProjectNavigation({ projects }: { projects: { id: string; name: string }[] }) {
  const pathname = usePathname();
  const current = pathname.match(/^\/app\/projects\/([^/]+)/)?.[1];
  const selected = projects.find(project => project.id === current);
  const id = useId(), trigger = useRef<HTMLButtonElement>(null), popup = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => { popup.current?.hidePopover(); }, [pathname]);
  useEffect(() => {
    const panel = popup.current, button = trigger.current;
    if (!open || !panel || !button) return;
    const position = () => {
      const rect = button.getBoundingClientRect();
      const width = Math.min(320, innerWidth - 24);
      panel.style.left = `${Math.max(12, Math.min(rect.left, innerWidth - width - 12))}px`;
      panel.style.top = `${rect.bottom + 10}px`;
      panel.style.width = `${width}px`;
    };
    position();
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    return () => { window.removeEventListener('resize', position); window.removeEventListener('scroll', position, true); };
  }, [open]);
  return <div className="workspace-project-switcher">
    <button ref={trigger} type="button" className="workspace-project-trigger" aria-label="Switch project" aria-expanded={open} popoverTarget={id}>
      <Image src="/product/globe.svg" width={20} height={20} alt="" /><span>{selected?.name ?? 'All projects'}</span><Image className="workspace-switcher-chevron" src="/product/down.svg" width={16} height={16} alt="" />
    </button>
    <div ref={popup} id={id} popover="auto" className="workspace-project-popover" onToggle={event => setOpen(event.newState === 'open')}>
      <p className="workspace-popover-label">Switch project</p>
      <nav aria-label="Choose project"><Link href="/app/projects" aria-current={!selected ? 'page' : undefined}>All projects</Link>
        {projects.map(project => <Link key={project.id} href={`/app/projects/${project.id}/reports`} aria-current={current === project.id ? 'page' : undefined}>{project.name}</Link>)}
      </nav>
      <Link className="workspace-create-project" href="/app/projects/new">Create project</Link>
    </div>
  </div>;
}
