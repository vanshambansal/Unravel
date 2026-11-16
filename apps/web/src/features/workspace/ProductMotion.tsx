import type { ReactNode } from 'react';

export function ResourceSurface({ children, hasIcon }: { children: ReactNode; hasIcon: boolean }) {
  return (
    <div className="ui-resource-row" data-has-icon={hasIcon}>
      {children}
    </div>
  );
}

export function FeedbackTransition({
  children,
  identity,
}: {
  children: ReactNode;
  identity: string;
}) {
  return <div key={identity}>{children}</div>;
}
