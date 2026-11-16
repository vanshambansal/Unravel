'use client';
import { IntentLink as Link } from '@/features/workspace/IntentLink';
import { usePathname } from 'next/navigation';

export function ProjectTabs() {
  const pathname = usePathname();
  const match = pathname.match(
    /^\/app\/projects\/([0-9a-f-]{36})\/(reports|setup|settings)(?:\/|$)/,
  );
  if (!match) return null;
  return (
    <nav
      className={`project-tabs${match[2] === 'settings' ? ' project-tabs--contained' : ''}`}
      aria-label="Project"
    >
      {[
        ['reports', 'Reports'],
        ['setup', 'SDK setup'],
        ['settings', 'Settings'],
      ].map(([path, label]) => (
        <Link
          key={path}
          href={`/app/projects/${match[1]}/${path}`}
          aria-current={match[2] === path ? 'page' : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
