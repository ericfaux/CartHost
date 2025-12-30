import type { ReactNode } from "react";
import Link from "next/link";

export type StatTileVariant = "default" | "warning" | "success" | "danger" | "info";

export interface StatTileProps {
  label: string;
  value: string | number;
  subValue?: string | number;
  subLabel?: string;
  footer?: string;
  icon?: ReactNode;
  iconBg?: string;
  iconColor?: string;
  href?: string;
  variant?: StatTileVariant;
  className?: string;
}

const variantStyles: Record<StatTileVariant, { bg: string; border: string; valueTint: string }> = {
  default: { bg: "bg-surface", border: "border-rule", valueTint: "text-ink" },
  warning: { bg: "bg-amber-50", border: "border-amber-200", valueTint: "text-amber-900" },
  success: { bg: "bg-green-50", border: "border-green-200", valueTint: "text-green-900" },
  danger: { bg: "bg-red-50", border: "border-red-200", valueTint: "text-red-900" },
  info: { bg: "bg-blue-50", border: "border-blue-200", valueTint: "text-blue-900" },
};

export function StatTile({
  label,
  value,
  subValue,
  subLabel,
  footer,
  icon,
  iconBg = "bg-paper",
  iconColor = "text-ink-subtle",
  href,
  variant = "default",
  className = "",
}: StatTileProps) {
  const { bg, border, valueTint } = variantStyles[variant];

  const content = (
    <>
      <div className="stat-tile-header">
        <div>
          <p className="stat-tile-label">{label}</p>
          <div className="mt-2 flex items-baseline gap-x-2">
            <span className={`stat-tile-value ${valueTint}`}>{value}</span>
            {subValue !== undefined && subLabel && (
              <>
                <span className="text-rule">|</span>
                <span className={`text-2xl font-bold ${valueTint}`}>{subValue}</span>
                <span className="text-sm font-medium text-ink-subtle">{subLabel}</span>
              </>
            )}
          </div>
        </div>
        {icon && (
          <div className={`stat-tile-icon ${iconBg} ${iconColor}`}>
            {icon}
          </div>
        )}
      </div>
      {footer && <p className="stat-tile-footer">{footer}</p>}
    </>
  );

  const tileClasses = `
    stat-tile ${bg} ${border}
    ${href ? "transition-all hover:-translate-y-0.5 hover:shadow-dossier-elevated cursor-pointer" : ""}
    ${className}
  `.trim();

  if (href) {
    return (
      <Link href={href} className={tileClasses}>
        {content}
      </Link>
    );
  }

  return <div className={tileClasses}>{content}</div>;
}

// Compact stat for inline display
export interface CompactStatProps {
  label: string;
  value: string | number;
  variant?: StatTileVariant;
  className?: string;
}

export function CompactStat({
  label,
  value,
  variant = "default",
  className = "",
}: CompactStatProps) {
  const colorClass =
    variant === "warning"
      ? "text-accent-warning"
      : variant === "success"
      ? "text-accent-success"
      : variant === "danger"
      ? "text-accent-legal"
      : variant === "info"
      ? "text-accent-info"
      : "text-ink";

  return (
    <div className={`text-center ${className}`}>
      <p className={`text-2xl font-bold tabular-nums ${colorClass}`}>{value}</p>
      <p className="text-xs text-ink-muted uppercase tracking-wide">{label}</p>
    </div>
  );
}
