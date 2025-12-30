import type { ReactNode } from "react";

// Battery Bar Component
export interface BatteryBarProps {
  percentage: number;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function BatteryBar({
  percentage,
  showLabel = true,
  size = "md",
  className = "",
}: BatteryBarProps) {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  const level: "high" | "medium" | "low" =
    clampedPercentage >= 60 ? "high" : clampedPercentage >= 25 ? "medium" : "low";

  const fillColor =
    level === "high"
      ? "bg-accent-success"
      : level === "medium"
      ? "bg-accent-warning"
      : "bg-accent-legal";

  const heightClass = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`battery-bar ${heightClass} flex-1`}>
        <div
          className={`battery-bar-fill ${fillColor}`}
          style={{ width: `${clampedPercentage}%` }}
          data-level={level}
        />
      </div>
      {showLabel && (
        <span
          className={`
            font-mono text-xs tabular-nums
            ${level === "high" ? "text-accent-success" : ""}
            ${level === "medium" ? "text-accent-warning" : ""}
            ${level === "low" ? "text-accent-legal" : ""}
          `.trim()}
        >
          {clampedPercentage}%
        </span>
      )}
    </div>
  );
}

// Service Meter Component
export interface ServiceMeterProps {
  current: number;
  threshold: number;
  unit?: string;
  showStatus?: boolean;
  className?: string;
}

export function ServiceMeter({
  current,
  threshold,
  unit = "trips",
  showStatus = true,
  className = "",
}: ServiceMeterProps) {
  const percentage = Math.min(100, (current / threshold) * 100);
  const remaining = Math.max(0, threshold - current);

  const status: "healthy" | "due_soon" | "overdue" =
    current >= threshold ? "overdue" : current >= threshold * 0.67 ? "due_soon" : "healthy";

  const fillColor =
    status === "healthy"
      ? "bg-accent-success"
      : status === "due_soon"
      ? "bg-accent-warning"
      : "bg-accent-legal";

  const textColor =
    status === "healthy"
      ? "text-accent-success"
      : status === "due_soon"
      ? "text-accent-warning"
      : "text-accent-legal";

  return (
    <div className={`service-meter ${className}`}>
      <div className="service-meter-track">
        <div
          className={`service-meter-fill ${fillColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`service-meter-label ${textColor}`}>
        {remaining > 0 ? `${remaining} ${unit}` : "Overdue"}
      </span>
      {showStatus && status !== "healthy" && (
        <span
          className={`
            inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded
            ${status === "due_soon" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}
          `}
        >
          {status === "due_soon" ? "Due Soon" : "Overdue"}
        </span>
      )}
    </div>
  );
}

// Health Status Indicator
export type HealthStatus = "healthy" | "due_soon" | "overdue";

export interface HealthIndicatorProps {
  status: HealthStatus;
  label?: string;
  showDot?: boolean;
  className?: string;
}

export function HealthIndicator({
  status,
  label,
  showDot = true,
  className = "",
}: HealthIndicatorProps) {
  const config: Record<HealthStatus, { bg: string; text: string; dot: string; defaultLabel: string }> = {
    healthy: {
      bg: "bg-green-50",
      text: "text-green-800",
      dot: "bg-green-500",
      defaultLabel: "Healthy",
    },
    due_soon: {
      bg: "bg-amber-50",
      text: "text-amber-800",
      dot: "bg-amber-500 animate-pulse",
      defaultLabel: "Due Soon",
    },
    overdue: {
      bg: "bg-red-50",
      text: "text-red-800",
      dot: "bg-red-500",
      defaultLabel: "Overdue",
    },
  };

  const { bg, text, dot, defaultLabel } = config[status];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-1
        text-xs font-semibold rounded-dossier-chip
        ${bg} ${text} ${className}
      `.trim()}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
      {label || defaultLabel}
    </span>
  );
}

// Progress Ring (circular)
export interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: ReactNode;
  className?: string;
}

export function ProgressRing({
  percentage,
  size = 64,
  strokeWidth = 6,
  label,
  className = "",
}: ProgressRingProps) {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedPercentage / 100) * circumference;

  const strokeColor =
    clampedPercentage >= 80
      ? "stroke-accent-success"
      : clampedPercentage >= 50
      ? "stroke-accent-warning"
      : "stroke-accent-legal";

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-rule"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${strokeColor} transition-all duration-500`}
        />
      </svg>
      {label !== undefined && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-ink tabular-nums">{label}</span>
        </div>
      )}
    </div>
  );
}
