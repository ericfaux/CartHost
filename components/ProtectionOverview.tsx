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
      <h2 className="text-xl font-semibold text-gray-900">
        Protection Overview
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-3xl font-black text-gray-900">
                {protectedCount}
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                Protected Rides
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Sessions started in the last 30 days.
          </p>
        </div>

        <Link
          href="/dashboard/history?filter=open"
          className="block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-3xl font-black text-gray-900">
                {activeCount} Active · {reviewCount} Review
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                Open Sessions
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">Click to view details.</p>
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-3xl font-black text-gray-900">{safeRate}%</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                Fully Documented
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {documentedGuest} of {documentedTotal} completed rides have evidence.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-3xl font-black text-gray-900">{manualCount}</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                Manual Closures
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
              <UserCog className="h-5 w-5" />
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
