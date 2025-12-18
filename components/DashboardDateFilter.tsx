"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function DashboardDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = (searchParams.get("period") as string | null) || "30d";

  const handleFilterChange = (period: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", period);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => handleFilterChange("30d")}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
          currentPeriod === "30d"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-900"
        }`}
      >
        Last 30 days
      </button>
      <button
        onClick={() => handleFilterChange("90d")}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
          currentPeriod === "90d"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-900"
        }`}
      >
        Last 3 months
      </button>
      <button
        onClick={() => handleFilterChange("ytd")}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
          currentPeriod === "ytd"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-900"
        }`}
      >
        Year to Date
      </button>
    </div>
  );
}
