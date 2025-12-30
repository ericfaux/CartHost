import type { ReactNode } from "react";

export type BadgeVariant =
  | "neutral"
  | "active"
  | "verified"
  | "warning"
  | "danger"
  | "success";

export type BadgeStyle = "chip" | "stamp";

export interface BadgeProps {
  variant?: BadgeVariant;
  style?: BadgeStyle;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  pulse?: boolean;
}

const chipVariantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-ink/5 text-ink-subtle border-rule",
  active: "bg-accent-info/10 text-accent-info border-accent-info/30",
  verified: "bg-accent-ops/10 text-accent-ops border-accent-ops/30",
  warning: "bg-accent-warning/10 text-accent-warning border-accent-warning/30",
  danger: "bg-accent-legal/10 text-accent-legal border-accent-legal/30",
  success: "bg-accent-success/10 text-accent-success border-accent-success/30",
};

const stampVariantClasses: Record<BadgeVariant, string> = {
  neutral: "border-ink-subtle text-ink-subtle bg-paper",
  active: "border-accent-info text-accent-info bg-blue-50",
  verified: "border-accent-ops text-accent-ops bg-teal-50",
  warning: "border-accent-warning text-accent-warning bg-amber-50",
  danger: "border-accent-legal text-accent-legal bg-red-50",
  success: "border-accent-success text-accent-success bg-green-50",
};

export function Badge({
  variant = "neutral",
  style = "chip",
  children,
  className = "",
  icon,
  pulse = false,
}: BadgeProps) {
  if (style === "stamp") {
    return (
      <span
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5
          font-mono text-xs font-bold uppercase tracking-widest
          border-2 rounded-dossier-sm
          animate-stamp-in
          ${stampVariantClasses[variant]}
          ${className}
        `.trim()}
      >
        {icon}
        {children}
      </span>
    );
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5
        text-xs font-semibold
        rounded-dossier-chip border
        ${chipVariantClasses[variant]}
        ${className}
      `.trim()}
    >
      {pulse && (
        <span
          className={`
            inline-block h-1.5 w-1.5 rounded-full animate-pulse
            ${variant === "active" ? "bg-accent-info" : ""}
            ${variant === "verified" ? "bg-accent-ops" : ""}
            ${variant === "warning" ? "bg-accent-warning" : ""}
            ${variant === "danger" ? "bg-accent-legal" : ""}
            ${variant === "success" ? "bg-accent-success" : ""}
            ${variant === "neutral" ? "bg-ink-subtle" : ""}
          `.trim()}
        />
      )}
      {icon}
      {children}
    </span>
  );
}

// Specialized stamp badges
export function StampSigned({ className = "" }: { className?: string }) {
  return (
    <Badge variant="danger" style="stamp" className={className}>
      SIGNED
    </Badge>
  );
}

export function StampSealed({ className = "" }: { className?: string }) {
  return (
    <Badge variant="verified" style="stamp" className={className}>
      SEALED
    </Badge>
  );
}

export function StampVerified({ className = "" }: { className?: string }) {
  return (
    <Badge variant="verified" style="stamp" className={className}>
      VERIFIED
    </Badge>
  );
}

// Status badge for fleet/rentals
export type StatusType = "active" | "in_use" | "inactive" | "completed" | "needs_review";

export function StatusBadge({
  status,
  className = "",
}: {
  status: StatusType;
  className?: string;
}) {
  const config: Record<StatusType, { variant: BadgeVariant; label: string; pulse: boolean }> = {
    active: { variant: "success", label: "Active", pulse: false },
    in_use: { variant: "active", label: "In Use", pulse: true },
    inactive: { variant: "neutral", label: "Inactive", pulse: false },
    completed: { variant: "success", label: "Completed", pulse: false },
    needs_review: { variant: "warning", label: "Needs Review", pulse: true },
  };

  const { variant, label, pulse } = config[status] || config.inactive;

  return (
    <Badge variant={variant} pulse={pulse} className={className}>
      {label}
    </Badge>
  );
}
