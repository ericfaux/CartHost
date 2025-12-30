import type { ReactNode, HTMLAttributes } from "react";

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevated?: boolean;
  noPadding?: boolean;
}

export function Panel({
  children,
  elevated = false,
  noPadding = false,
  className = "",
  ...props
}: PanelProps) {
  return (
    <div
      className={`
        bg-surface rounded-dossier-surface border border-rule
        ${elevated ? "shadow-dossier-elevated" : "shadow-dossier-surface"}
        ${noPadding ? "" : "p-6"}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

// Page header strip component
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  caseLabel?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  caseLabel,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`
        flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between
        pb-6 border-b border-rule mb-6
        ${className}
      `.trim()}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-dossier-title text-ink">{title}</h1>
          {caseLabel && (
            <span className="font-mono text-dossier-mono text-ink-subtle uppercase tracking-wider px-2 py-1 bg-paper rounded-dossier-sm border border-rule">
              {caseLabel}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-dossier-caption text-ink-subtle">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

// Section header for content sections
export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  actions,
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`
        flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between
        mb-4
        ${className}
      `.trim()}
    >
      <div>
        <h2 className="font-heading text-dossier-subtitle text-ink">{title}</h2>
        {subtitle && (
          <p className="text-dossier-caption text-ink-subtle">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// Dossier section divider
export function SectionDivider({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  if (!label) {
    return <hr className={`border-rule my-6 ${className}`} />;
  }

  return (
    <div className={`flex items-center gap-4 my-6 ${className}`}>
      <div className="flex-1 h-px bg-rule" />
      <span className="text-dossier-label uppercase text-ink-muted">{label}</span>
      <div className="flex-1 h-px bg-rule" />
    </div>
  );
}
