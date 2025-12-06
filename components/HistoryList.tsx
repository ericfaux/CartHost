"use client";

import { useRouter } from "next/navigation";

type Rental = {
  id: string;
  created_at: string;
  guest_name?: string | null;
  status?: string | null;
  revenue?: number | null;
  carts?: {
    name?: string | null;
  } | null;
};

export default function HistoryList({ rentals }: { rentals: Rental[] }) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStatus = (status?: string | null) => {
    const normalized = status?.toLowerCase();
    const isActive = normalized === "active";

    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
          isActive
            ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-100"
            : "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200"
        }`}
      >
        {isActive ? "Active" : "Completed"}
      </span>
    );
  };

  const renderRevenue = (revenue?: number | null) => {
    if (revenue && revenue > 0) {
      const formatter = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      });

      return (
        <span className="text-emerald-600 font-medium">
          +{formatter.format(revenue)}
        </span>
      );
    }

    return <span className="text-gray-400">-</span>;
  };

  if (rentals.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
        No rental history yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rental History</h1>
        <p className="text-sm text-gray-500">Review past and active rentals.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Cart Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Guest Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rentals.map((rental) => (
              <tr key={rental.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {formatDate(rental.created_at)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                  {rental.carts?.name || "-"}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                  {rental.guest_name || "Unknown"}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {renderRevenue(rental.revenue)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {renderStatus(rental.status)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <button
                    type="button"
                    onClick={() => router.push(`/dashboard/history/${rental.id}`)}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
