"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Search,
  Filter,
  Calendar,
  Check,
  X,
  Edit2,
  Loader2,
} from "lucide-react";
import { updateRentalRevenue, updateDepositStatus } from "../app/dashboard/history/actions";

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
  deposit_amount?: number | null;
  deposit_status?: string | null;
  carts?: {
    name?: string | null;
  } | null;
};

const getNextStatus = (current: string): string => {
  switch (current) {
    case 'pending':
      return 'collected';
    case 'collected':
      return 'refunded';
    case 'refunded':
      return 'collected';
    case 'withheld':
      return 'collected';
    default:
      return 'collected';
  }
};

export default function HistoryList({ rentals }: { rentals: Rental[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "completed">("all");
  const [dateFilter, setDateFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [updatingDepositId, setUpdatingDepositId] = useState<string | null>(null);
  const [isDepositPending, startDepositTransition] = useTransition();

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
    const parsedValue = parseFloat(editValue || "0");
    if (Number.isNaN(parsedValue)) {
      alert("Enter a valid revenue amount.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateRentalRevenue(rentalId, parsedValue);
        if (result?.error) {
          alert(result.error);
          return;
        }
        setEditingId(null);
      } catch (error) {
        alert("Something went wrong while saving revenue.");
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

  // Filter rentals based on searchTerm, statusFilter, and dateFilter
  const filteredRentals = rentals.filter((rental) => {
    const guestName = rental.guest_name?.toLowerCase() || "";
    const cartName = rental.carts?.name?.toLowerCase() || "";
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      search.length === 0 ||
      guestName.includes(search) ||
      cartName.includes(search);

    const rentalStatus = rental.status?.toLowerCase() || "completed";
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && rentalStatus === "active") ||
      (statusFilter === "completed" && rentalStatus === "completed");

    const matchesDate =
      !dateFilter ||
      rental.created_at.startsWith(dateFilter) ||
      new Date(rental.created_at).toISOString().startsWith(dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
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
          <span className="font-medium text-emerald-600">
            +{revenueFormatter.format(rental.revenue)}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
        <button
          type="button"
          onClick={() => handleStartEdit(rental)}
          className="rounded p-1 text-gray-400 opacity-0 transition hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100"
          title="Edit revenue"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  };

  const handleDepositClick = (rental: Rental) => {
    const currentStatus = rental.deposit_status || 'pending';
    const nextStatus = getNextStatus(currentStatus);
    setUpdatingDepositId(rental.id);
    
    startDepositTransition(async () => {
      try {
        const result = await updateDepositStatus(rental.id, nextStatus);
        if (result?.error) {
          alert(result.error);
        }
      } catch (error) {
        alert("Something went wrong while updating deposit status.");
      } finally {
        setUpdatingDepositId(null);
      }
    });
  };

  const renderDepositBadge = (rental: Rental) => {
    const status = rental.deposit_status?.toLowerCase() || 'pending';
    const amount = rental.deposit_amount || 0;
    const isUpdating = updatingDepositId === rental.id && isDepositPending;

    let bgColor = '';
    let textColor = '';
    let label = '';

    switch (status) {
      case 'pending':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-700';
        label = 'Pending';
        break;
      case 'collected':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-700';
        label = `Held: $${amount}`;
        break;
      case 'refunded':
        bgColor = 'bg-green-100';
        textColor = 'text-green-700';
        label = 'Refunded';
        break;
      case 'withheld':
        bgColor = 'bg-red-100';
        textColor = 'text-red-700';
        label = 'Withheld';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-700';
        label = 'Pending';
    }

    return (
      <button
        type="button"
        onClick={() => handleDepositClick(rental)}
        disabled={isUpdating}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${bgColor} ${textColor} transition hover:opacity-80 disabled:cursor-not-allowed`}
      >
        {isUpdating && <Loader2 className="h-3 w-3 animate-spin" />}
        {label}
      </button>
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
      <div className="mb-6 flex flex-col gap-4 lg:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search guest or cart..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="relative w-full lg:w-56">
          <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "completed")
            }
            className="h-full bg-transparent text-sm focus:outline-none"
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
                Deposit
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
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                  No rentals match your filters.
                </td>
              </tr>
            ) : (
              filteredRentals.map((rental) => (
                <tr key={rental.id} className="group hover:bg-gray-50">
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
                    {renderDepositBadge(rental)}
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
