"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, Filter, Check, X, Edit2, Loader2 } from "lucide-react";
import { updateRentalRevenue } from "../app/dashboard/history/actions";

const revenueFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isPending, startTransition] = useTransition();

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

  const handleSave = (rentalId: string) => {
    startTransition(async () => {
      const result = await updateRentalRevenue(rentalId, parseFloat(editValue));
      if (result.error) {
        alert(result.error);
      } else {
        setEditingId(null);
      }
    });
  };

  const handleStartEdit = (rental: Rental) => {
    setEditingId(rental.id);
    setEditValue(rental.revenue?.toString() || "0");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  // Filter rentals based on searchTerm and statusFilter
  const filteredRentals = rentals.filter((rental) => {
    const guestName = rental.guest_name?.toLowerCase() || "";
    const cartName = rental.carts?.name?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    const matchesSearch = guestName.includes(search) || cartName.includes(search);

    const rentalStatus = rental.status?.toLowerCase() || "completed";
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && rentalStatus === "active") ||
      (statusFilter === "completed" && rentalStatus !== "active");

    return matchesSearch && matchesStatus;
  });

  const renderRevenue = (rental: Rental) => {
    const isEditing = editingId === rental.id;

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            step="0.01"
            min="0"
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => handleSave(rental.id)}
            disabled={isPending}
            className="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-50"
            title="Save"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={handleCancelEdit}
            disabled={isPending}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        {typeof rental.revenue === "number" && rental.revenue > 0 ? (
          <span className="text-emerald-600 font-medium">
            +{revenueFormatter.format(rental.revenue)}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
        <button
          type="button"
          onClick={() => handleStartEdit(rental)}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          title="Edit revenue"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
      </div>
    );
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

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search guest or cart..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "completed")}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
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
            {filteredRentals.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                  No rentals match your filters.
                </td>
              </tr>
            ) : (
              filteredRentals.map((rental) => (
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
                    {renderRevenue(rental)}
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
