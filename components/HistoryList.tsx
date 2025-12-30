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
  FileSearch,
  ExternalLink,
} from "lucide-react";
import { updateRentalRevenue, updateDepositStatus } from "../app/dashboard/history/actions";
import { forceEndRental } from "../app/dashboard/actions";
import { PageHeader } from "./ui/Panel";
import { SearchInput } from "./ui/Input";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "./ui/Table";
import { Badge } from "./ui/Badge";
import { Button, IconButton } from "./ui/Button";
import { EmptyState } from "./ui/EmptyState";

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
      return <Badge variant="active" pulse>Active</Badge>;
    }

    if (normalized === "needs_review") {
      return <Badge variant="warning" pulse>Needs Review</Badge>;
    }

    const closure = (rental.closure_source || "").toLowerCase();
    if (closure === "host") {
      return <Badge variant="neutral">Host Override</Badge>;
    }

    return <Badge variant="success">Completed</Badge>;
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
            className="w-24 dossier-input text-right py-1"
            step="0.01"
            min="0"
            disabled={isPending}
          />
          <IconButton
            icon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            label="Save"
            onClick={() => handleSave(rental.id)}
            disabled={isPending}
          />
          <IconButton
            icon={<X className="h-4 w-4" />}
            label="Cancel"
            onClick={handleCancelEdit}
            disabled={isPending}
          />
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        {typeof rental.revenue === "number" && rental.revenue > 0 ? (
          <span className="font-mono font-semibold text-accent-success">
            +{revenueFormatter.format(rental.revenue)}
          </span>
        ) : (
          <span className="text-ink-muted">-</span>
        )}
        <IconButton
          icon={<Edit2 className="h-3.5 w-3.5" />}
          label="Edit revenue"
          size="sm"
          onClick={() => handleStartEdit(rental)}
          className="opacity-0 group-hover:opacity-100"
        />
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
      return <Badge variant="neutral">Not Required</Badge>;
    }

    // Condition 2: Has a deposit - render dropdown
    const status = rental.deposit_status?.toLowerCase() || "pending";
    const isUpdating = isDepositPending && updatingDepositId === rental.id;

    return (
      <div className="inline-flex items-center gap-1.5">
        <select
          value={rental.deposit_status || "pending"}
          onChange={(e) => handleDepositChange(rental.id, e.target.value)}
          disabled={isUpdating}
          className="dossier-select py-1 pr-8 text-xs font-semibold"
        >
          <option value="pending">Pending</option>
          <option value="collected">Collected</option>
          <option value="refunded">Refunded</option>
          <option value="withheld">Applied to Damage</option>
        </select>
        {isUpdating && <Loader2 className="h-3 w-3 animate-spin text-ink-muted" />}
      </div>
    );
  };

  if (rentals.length === 0) {
    return (
      <EmptyState
        icon={<FileSearch className="h-6 w-6" />}
        title="No rental history yet"
        description="When guests complete rentals, their evidence records will appear here."
      />
    );
  }

  const tabs = [
    { key: "all" as const, label: "All" },
    { key: "open" as const, label: "Open" },
    { key: "completed" as const, label: "Completed" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Evidence Locker"
        subtitle="Review rental evidence, signed waivers, and damage documentation"
      />

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const isActive =
            statusFilter === tab.key ||
            (tab.key === "open" &&
              (statusFilter === "active" || statusFilter === "needs_review"));
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabClick(tab.key)}
              className={`
                px-4 py-2 text-sm font-semibold rounded-dossier-chip transition-colors
                ${isActive
                  ? "bg-ink text-surface"
                  : "bg-surface text-ink border border-rule hover:bg-paper"
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="dossier-panel p-4">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex-1">
            <SearchInput
              placeholder="Search guest or cart..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full lg:w-56">
            <label className="dossier-label">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted pointer-events-none" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="dossier-input pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredRentals.length === 0 ? (
        <div className="dossier-panel p-8 text-center">
          <p className="text-sm text-ink-subtle">No rentals match your filters.</p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Asset</TableHeaderCell>
              <TableHeaderCell>Guest</TableHeaderCell>
              <TableHeaderCell align="right">Revenue</TableHeaderCell>
              <TableHeaderCell>Deposit</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell align="right">Action</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {filteredRentals.map((rental) => (
              <TableRow key={rental.id}>
                <TableCell mono>
                  {formatDate(rental.created_at)}
                </TableCell>
                <TableCell bold>
                  {rental.carts?.name || "-"}
                </TableCell>
                <TableCell>
                  {rental.guest_name || "Unknown"}
                </TableCell>
                <TableCell align="right">
                  {renderRevenue(rental)}
                </TableCell>
                <TableCell>
                  {renderDepositActions(rental)}
                </TableCell>
                <TableCell>
                  {renderStatus(rental)}
                </TableCell>
                <TableCell align="right">
                  <div className="flex items-center justify-end gap-2">
                    {(rental.status || "").toLowerCase() === "needs_review" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleClose(rental.id)}
                        disabled={isClosingPending && closingId === rental.id}
                        loading={isClosingPending && closingId === rental.id}
                      >
                        Close
                      </Button>
                    )}
                    <Button
                      variant="ops"
                      size="sm"
                      onClick={() => router.push(`/dashboard/history/${rental.id}`)}
                      icon={<ExternalLink className="h-3.5 w-3.5" />}
                    >
                      View Evidence
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
