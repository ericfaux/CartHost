import Link from "next/link";
import { AlertCircle, FileCheck, ShieldCheck, UserCog } from "lucide-react";
import type { ReactNode } from "react";

export type ProtectionOverviewProps = {
  protectedCount: number;
  activeCount: number;
  reviewCount: number;
  documentedRate: number;
  documentedTotal: number;
  manualCount: number;
};

export default function ProtectionOverview({
  protectedCount,
  activeCount,
  reviewCount,
  documentedRate,
  documentedTotal,
  manualCount,
}: ProtectionOverviewProps) {
  const openCount = Math.max(0, activeCount) + Math.max(0, reviewCount);
  const isOpenRisk = openCount > 0;
  const hasManualClosures = manualCount > 0;

  const safeRate = Number.isFinite(documentedRate)
    ? Math.max(0, Math.min(100, documentedRate))
    : 0;

  const guestCompleted =
    documentedTotal > 0 ? Math.round((safeRate / 100) * documentedTotal) : 0;

  const CardShell = ({
    children,
    className = "",
  }: {
    children: ReactNode;
    className?: string;
  }) => (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md ${className}`}
    >
      {children}
    </div>
  );

  const CardHeader = ({
    icon,
    title,
  }: {
    icon: ReactNode;
    title: string;
  }) => (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-inset ring-gray-200">
        {icon}
      </div>
    </div>
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <CardShell>
        <CardHeader
          title="Protected Rides"
          icon={<ShieldCheck className="h-5 w-5 text-green-600" />}
        />
        <p className="mt-4 text-3xl font-black text-gray-900">
          {protectedCount}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Sessions started behind the digital gate in the last 30 days.
        </p>
      </CardShell>

      <Link
        href="/dashboard/history?filter=open"
        className="block focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded-2xl"
      >
        <CardShell className="h-full">
          <CardHeader
            title="Open Sessions"
            icon={
              <AlertCircle
                className={`h-5 w-5 ${
                  isOpenRisk ? "text-amber-600" : "text-gray-400"
                }`}
              />
            }
          />
          <p className="mt-4 text-xl font-extrabold text-gray-900">
            {activeCount} Active · {reviewCount} Review
          </p>
          <p className="mt-2 text-sm font-medium text-blue-600">
            Click to view details
          </p>
        </CardShell>
      </Link>

      <CardShell>
        <CardHeader
          title="Fully Documented"
          icon={<FileCheck className="h-5 w-5 text-blue-600" />}
        />
        <p className="mt-4 text-3xl font-black text-gray-900">{safeRate}%</p>
        <p className="mt-2 text-sm text-gray-500">
          {guestCompleted} of {documentedTotal} completed rides have full return
          evidence.
        </p>
      </CardShell>

      <CardShell>
        <CardHeader
          title="Manual Closures"
          icon={
            <UserCog
              className={`h-5 w-5 ${
                hasManualClosures ? "text-orange-600" : "text-gray-400"
              }`}
            />
          }
        />
        <p className="mt-4 text-3xl font-black text-gray-900">{manualCount}</p>
        <p className="mt-2 text-sm text-gray-500">
          Trips closed manually without full guest return flow.
        </p>
      </CardShell>
    </div>
  );
}
