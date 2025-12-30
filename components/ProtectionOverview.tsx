import Link from "next/link";
import { AlertCircle, FileCheck, Shield, ShieldCheck, UserCog, ArrowRight } from "lucide-react";
import type { DashboardPeriod } from "./DashboardCharts";
import { SectionHeader } from "./ui/Panel";
import { Badge } from "./ui/Badge";
import { ProgressRing } from "./ui/Meters";

export type ProtectionOverviewProps = {
  period: DashboardPeriod;
  protectedCount: number;
  activeCount: number;
  reviewCount: number;
  documentedRate: number;
  documentedTotal: number;
  documentedGuest: number;
  manualCount: number;
  totalDepositsHeld: number;
};

export default function ProtectionOverview({
  period,
  protectedCount,
  activeCount,
  reviewCount,
  documentedRate,
  documentedTotal,
  documentedGuest,
  manualCount,
  totalDepositsHeld,
}: ProtectionOverviewProps) {
  const safeRate = Number.isFinite(documentedRate)
    ? Math.round(Math.max(0, Math.min(100, documentedRate)))
    : 0;

  const hasDepositsHeld = totalDepositsHeld > 0;
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const periodLabel =
    period === "90d"
      ? "Last 3 months"
      : period === "ytd"
        ? "Year to Date"
        : "Last 30 days";

  const hasOpenSessions = activeCount > 0 || reviewCount > 0;

  return (
    <section className="space-y-4">
      <SectionHeader
        title="Protection Overview"
        subtitle="Liability monitoring and compliance status"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Open Sessions Tile */}
        <Link
          href="/dashboard/history?filter=open"
          className={`
            group stat-tile transition-all hover:-translate-y-0.5 hover:shadow-dossier-elevated
            ${hasOpenSessions ? "border-accent-warning/30 bg-amber-50/50" : ""}
          `}
        >
          <div className="stat-tile-header">
            <div>
              <p className="stat-tile-label">Open Sessions</p>
              <div className="mt-2 flex items-baseline gap-x-2">
                <span className="text-2xl font-bold text-ink tabular-nums">
                  {activeCount}
                </span>
                <span className="text-sm font-medium text-ink-subtle">Active</span>
                <span className="text-rule">|</span>
                <span className="text-2xl font-bold text-accent-warning tabular-nums">
                  {reviewCount}
                </span>
                <span className="text-sm font-medium text-accent-warning">
                  Review
                </span>
              </div>
            </div>
            <div className={`stat-tile-icon ${hasOpenSessions ? "bg-amber-100" : "bg-paper"}`}>
              <AlertCircle className={`h-5 w-5 ${hasOpenSessions ? "text-accent-warning" : "text-ink-muted"}`} />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-dossier-caption text-ink-muted group-hover:text-accent-info">
            <span>View details</span>
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>

        {/* Deposits Held Tile */}
        <div
          className={`
            stat-tile
            ${hasDepositsHeld ? "border-accent-warning/30 bg-amber-50/50" : ""}
          `}
        >
          <div className="stat-tile-header">
            <div>
              <p className={`stat-tile-label ${hasDepositsHeld ? "text-amber-800" : ""}`}>
                Deposits Held
              </p>
              <p className={`stat-tile-value ${hasDepositsHeld ? "text-amber-900" : ""}`}>
                {currencyFormatter.format(totalDepositsHeld)}
              </p>
            </div>
            <div className={`stat-tile-icon ${hasDepositsHeld ? "bg-amber-100" : "bg-paper"}`}>
              <Shield className={`h-5 w-5 ${hasDepositsHeld ? "text-amber-700" : "text-ink-muted"}`} />
            </div>
          </div>
          {hasDepositsHeld ? (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="warning">Action Required</Badge>
              <Link
                href="/dashboard/history"
                className="text-xs font-semibold text-accent-warning hover:underline"
              >
                Manage
              </Link>
            </div>
          ) : (
            <p className="stat-tile-footer">No funds currently held.</p>
          )}
        </div>

        {/* Fully Documented Tile */}
        <div className="stat-tile">
          <div className="stat-tile-header">
            <div>
              <p className="stat-tile-label">Fully Documented</p>
              <p className="stat-tile-value">{safeRate}%</p>
            </div>
            <ProgressRing
              percentage={safeRate}
              size={44}
              strokeWidth={4}
              className="flex-shrink-0"
            />
          </div>
          <p className="stat-tile-footer">
            <span className="font-mono text-xs">{documentedGuest}/{documentedTotal}</span> rides ({periodLabel})
          </p>
        </div>

        {/* Protected Rides Tile */}
        <div className="stat-tile">
          <div className="stat-tile-header">
            <div>
              <p className="stat-tile-label">Protected Rides</p>
              <p className="stat-tile-value">{protectedCount}</p>
            </div>
            <div className="stat-tile-icon bg-accent-ops/10">
              <ShieldCheck className="h-5 w-5 text-accent-ops" />
            </div>
          </div>
          <p className="stat-tile-footer">
            Sessions in the {periodLabel.toLowerCase()}.
          </p>
        </div>

        {/* Manual Closures Tile */}
        <div className="stat-tile">
          <div className="stat-tile-header">
            <div>
              <p className="stat-tile-label">Manual Closures</p>
              <p className="stat-tile-value">{manualCount}</p>
            </div>
            <div className="stat-tile-icon bg-paper">
              <UserCog className="h-5 w-5 text-ink-muted" />
            </div>
          </div>
          <p className="stat-tile-footer">
            Force-closed by host ({periodLabel}).
          </p>
        </div>
      </div>
    </section>
  );
}
