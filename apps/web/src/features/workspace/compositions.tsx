import type { ReactNode, Ref, ComponentPropsWithoutRef } from 'react';
import { ResourceSurface } from './ProductMotion';

export function InvestigationSurface({
  className = '',
  ...props
}: ComponentPropsWithoutRef<'div'> & { ref?: Ref<HTMLDivElement> }) {
  return <div {...props} className={`ui-investigation-surface ${className}`} />;
}

export function PanelHeading({ title, status }: { title: string; status?: ReactNode }) {
  return (
    <div className="ui-panel-heading">
      <h2>{title}</h2>
      {status}
    </div>
  );
}

/** Page compositions, not business logic. See docs/INTERNAL_UI.md before adding a new page. */
export function PageContent({
  children,
  width = 'wide',
}: {
  children: ReactNode;
  width?: 'wide' | 'settings' | 'form';
}) {
  return <div className={`ui-page ui-page--${width}`}>{children}</div>;
}

export function PageHeader({
  title,
  description,
  context,
  actions,
}: {
  title: string;
  description: ReactNode;
  context?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="ui-page-header">
      <div>
        {context &&
          (typeof context === 'string' ? (
            <p className="ui-context">{context}</p>
          ) : (
            <div className="ui-context">{context}</div>
          ))}
        <h1>{title}</h1>
        {typeof description === 'string' ? <p>{description}</p> : <div>{description}</div>}
      </div>
      {actions && <div className="ui-page-actions">{actions}</div>}
    </header>
  );
}

export function SettingsGroup({
  title,
  description,
  icon,
  children,
  footer,
}: {
  title: string;
  description: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="ui-settings-group">
      <header className="ui-group-heading">
        {icon && (
          <span className="ui-group-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </header>
      <div className="ui-settings-body">{children}</div>
      {footer}
    </section>
  );
}

export function SettingRow({
  label,
  description,
  htmlFor,
  children,
}: {
  label: string;
  description?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="ui-setting-row">
      <div className="ui-setting-label">
        {htmlFor ? <label htmlFor={htmlFor}>{label}</label> : <span>{label}</span>}
        {description && <p>{description}</p>}
      </div>
      <div className="ui-setting-control">{children}</div>
    </div>
  );
}

export function ActionBar({ children, status }: { children: ReactNode; status: ReactNode }) {
  return (
    <footer className="ui-action-bar">
      <div className="ui-action-status">{status}</div>
      <div className="product-actions">{children}</div>
    </footer>
  );
}

export function ResourceCollection({
  label,
  count,
  children,
  footer,
}: {
  label: string;
  count?: number;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="ui-resource-collection" aria-label={label}>
      <header className="ui-collection-heading">
        <h2>{label}</h2>
        {count !== undefined && <span className="ui-count">{count}</span>}
      </header>
      <ul>{children}</ul>
      {footer && <footer className="ui-collection-footer">{footer}</footer>}
    </section>
  );
}

export function ResourceItem({
  icon,
  title,
  description,
  actions,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <ResourceSurface hasIcon={!!icon}>
      {icon && (
        <span className="ui-resource-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="ui-resource-identity">
        <h2>{title}</h2>
        <div className="ui-resource-description">{description}</div>
      </div>
      {actions && <div className="ui-resource-actions">{actions}</div>}
    </ResourceSurface>
  );
}

export function EmptyState({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: ReactNode;
  actions: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="ui-empty">
      <div className="ui-empty-symbol" aria-hidden="true">
        ↗
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="product-actions">{actions}</div>
      {children}
    </section>
  );
}

export function ProductDialog({
  titleId,
  title,
  descriptionId,
  description,
  children,
  actions,
  dialogRef,
  ...props
}: {
  titleId: string;
  title: string;
  descriptionId: string;
  description: ReactNode;
  children?: ReactNode;
  actions: ReactNode;
  dialogRef: Ref<HTMLDialogElement>;
} & Omit<ComponentPropsWithoutRef<'dialog'>, 'title' | 'children'>) {
  return (
    <dialog
      {...props}
      ref={dialogRef}
      className="ui-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="ui-dialog-body">
        <span className="ui-dialog-eyebrow">UNRAVEL / PROJECT</span>
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>{description}</p>
        {children}
      </div>
      <footer className="ui-dialog-actions product-actions">{actions}</footer>
    </dialog>
  );
}
