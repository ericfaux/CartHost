"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Search,
  Calendar,
  Check,
  X,
  Edit2,
  Loader2,
} from "lucide-react";
import { updateRentalRevenue, updateDepositStatus } from "../app/dashboard/history/actions";
import { forceEndRental } from "../app/dashboard/actions";

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
  closure_source?: string | null;
  revenue?: number | null;
  deposit_amount?: number | null;
  deposit_status?: string | null;
  carts?: {
    name?: string | null;
  } | null;
};

type StatusFilter = "all" | "open" | "active" | "needs_review" | "completed";

export default function HistoryList({ rentals }: { rentals: Rental[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");

  const initialFilter = (searchParams.get("filter") || "all").toLowerCase();
  const normalizeFilter = (raw: string): StatusFilter => {
    if (raw === "open") return "open";
    if (raw === "active") return "active";
    if (raw === "needs_review") return "needs_review";
    if (raw === "completed") return "completed";
    return "all";
  };

  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() =>
    normalizeFilter(initialFilter)
  );
  const [dateFilter, setDateFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [updatingDepositId, setUpdatingDepositId] = useState<string | null>(null);
  const [isDepositPending, startDepositTransition] = useTransition();
  const [closingId, setClosingId] = useState<string | null>(null);
  const [isClosingPending, startCloseTransition] = useTransition();

  const initialTab = useMemo<StatusFilter>(
    () => normalizeFilter((searchParams.get("filter") || "all").toLowerCase()),
    [searchParams]
  );

  useEffect(() => {
    setStatusFilter(initialTab);
  }, [initialTab]);

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

  const renderStatus = (rental: Rental) => {
    const normalized = (rental.status || "").toLowerCase();

    if (normalized === "active") {
      return (
        <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-100">
          Active
        </span>
      );
    }

    if (normalized === "needs_review") {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-100">
          Needs Review
        </span>
      );
    }

    const closure = (rental.closure_source || "").toLowerCase();
    if (closure === "host") {
      return (
        <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
          Host Override
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-100">
        Completed
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

  const handleTabClick = (tab: StatusFilter) => {
    setStatusFilter(tab);
    if (tab === "all") {
      router.push("/dashboard/history");
      return;
    }
    router.push(`/dashboard/history?filter=${tab}`);
  };

  const handleClose = (rentalId: string) => {
    const ok = confirm("Close this session? This will mark it as completed by host.");
    if (!ok) return;

    setClosingId(rentalId);
    startCloseTransition(async () => {
      try {
        const result = await forceEndRental(rentalId);
        if (result?.error) {
          alert(result.error);
          return;
        }
        router.refresh();
      } catch {
        alert("Something went wrong while closing the session.");
      } finally {
        setClosingId(null);
      }
    });
  };

  // Filter rentals based on searchTerm, statusTab, and dateFilter
  const filteredRentals = rentals.filter((rental) => {
    const guestName = rental.guest_name?.toLowerCase() || "";
    const cartName = rental.carts?.name?.toLowerCase() || "";
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      search.length === 0 ||
      guestName.includes(search) ||
      cartName.includes(search);

    const rentalStatus = (rental.status || "completed").toLowerCase();
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "open" &&
        (rentalStatus === "active" || rentalStatus === "needs_review")) ||
      (statusFilter === "active" && rentalStatus === "active") ||
      (statusFilter === "needs_review" && rentalStatus === "needs_review") ||
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

  const handleDepositChange = (rentalId: string, newStatus: string) => {
    setUpdatingDepositId(rentalId);
    
    startDepositTransition(async () => {
      try {
        const result = await updateDepositStatus(rentalId, newStatus);
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

  const renderDepositActions = (rental: Rental) => {
    // Condition 1: No deposit or deposit <= 0
    if (!rental.deposit_amount || rental.deposit_amount <= 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
          Not Required
        </span>
      );
    }

    // Condition 2: Has a deposit - render dropdown
    const status = rental.deposit_status?.toLowerCase() || 'pending';
    const isUpdating = isDepositPending && updatingDepositId === rental.id;

    // Color logic based on status
    let bgColor = '';
    let textColor = '';

    switch (status) {
      case 'pending':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-700';
        break;
      case 'collected':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-700';
        break;
      case 'refunded':
        bgColor = 'bg-green-100';
        textColor = 'text-green-700';
        break;
      case 'withheld':
        bgColor = 'bg-red-100';
        textColor = 'text-red-700';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-700';
    }

    return (
      <div className="inline-flex items-center gap-1.5">
        <select
          value={rental.deposit_status || 'pending'}
          onChange={(e) => handleDepositChange(rental.id, e.target.value)}
          disabled={isUpdating}
          className={`cursor-pointer appearance-none rounded-full border-0 px-3 py-1 pr-6 text-xs font-semibold ${bgColor} ${textColor} focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50`}
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.25rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
        >
          <option value="pending">Pending</option>
          <option value="collected">Collected</option>
          <option value="refunded">Refunded</option>
          <option value="withheld">Applied to Damage</option>
        </select>
        {isUpdating && <Loader2 className="h-3 w-3 animate-spin text-gray-500" />}
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

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { key: "all", label: "All" },
            { key: "open", label: "Open" },
            { key: "completed", label: "Completed" },
          ] as const
        ).map((tab) => {
          const isActive =
            statusFilter === tab.key ||
            (tab.key === "open" &&
              (statusFilter === "active" || statusFilter === "needs_review"));
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabClick(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
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
                    {renderDepositActions(rental)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {renderStatus(rental)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      {(rental.status || "").toLowerCase() === "needs_review" && (
                        <button
                          type="button"
                          onClick={() => handleClose(rental.id)}
                          disabled={isClosingPending && closingId === rental.id}
                          className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
                        >
                          {isClosingPending && closingId === rental.id ? "Closing..." : "Close"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => router.push(`/dashboard/history/${rental.id}`)}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                      >
                        View
                      </button>
                    </div>
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
