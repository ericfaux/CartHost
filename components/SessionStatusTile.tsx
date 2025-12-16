"use client";

import Link from "next/link";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export default function SessionStatusTile({
  activeCount,
  reviewCount,
}: {
  activeCount: number;
  reviewCount: number;
}) {
  const href =
    reviewCount > 0
      ? "/dashboard/history?filter=needs_review"
      : "/dashboard/history?filter=active";

  const Icon = reviewCount > 0 ? ShieldAlert : ShieldCheck;

  return (
    <Link
      href={href}
      className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Open Sessions
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            <span className="text-green-600">{activeCount} Active</span>
            <span className="text-gray-400"> · </span>
            <span className="text-amber-600">{reviewCount} Need Review</span>
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-700 ring-1 ring-gray-200">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Link>
  );
}

