import Link from "next/link";
import { AlertCircle, FileCheck, ShieldCheck, UserCog } from "lucide-react";

export type ProtectionOverviewProps = {
  protectedCount: number;
  activeCount: number;
  reviewCount: number;
  documentedRate: number;
  documentedTotal: number;
  documentedGuest: number;
  manualCount: number;
};

export default function ProtectionOverview({
  protectedCount,
  activeCount,
  reviewCount,
  documentedRate,
  documentedTotal,
  documentedGuest,
  manualCount,
}: ProtectionOverviewProps) {
  const safeRate = Number.isFinite(documentedRate)
    ? Math.round(Math.max(0, Math.min(100, documentedRate)))
    : 0;

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900">
        Protection Overview
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Protected Rides</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">
                {protectedCount}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <ShieldCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Sessions started in the last 30 days.
          </p>
        </div>

        <Link
          href="/dashboard/history?filter=open"
          className="block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Open Sessions</p>
              <div className="mt-2 flex items-baseline gap-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {activeCount}
                </span>
                <span className="text-sm font-medium text-gray-500">Active</span>
                <span className="text-gray-300">|</span>
                <span className="text-2xl font-bold text-amber-600">
                  {reviewCount}
                </span>
                <span className="text-sm font-medium text-amber-600">
                  Review
                </span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">Click to view details.</p>
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Fully Documented
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">
                {safeRate}%
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <FileCheck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {documentedGuest} of {documentedTotal} completed rides have evidence.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Manual Closures</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">
                {manualCount}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
              <UserCog className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Trips force-closed by host (Last 30d).
          </p>
        </div>
      </div>
    </section>
  );
}
