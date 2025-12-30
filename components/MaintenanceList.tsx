"use client";

import React, { useState, useTransition } from "react";
import { Search, Calendar, Check, X, Edit2, Wrench } from "lucide-react";
import { updateServiceCost } from "../app/dashboard/maintenance/actions";
import { SearchInput, Select } from "./ui/Input";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "./ui/Table";
import { Badge } from "./ui/Badge";
import { IconButton } from "./ui/Button";
import { EmptyState } from "./ui/EmptyState";

type ServiceLog = {
  id?: string;
  service_date?: string | null;
  service_type?: string | null;
  cost?: number | null;
  notes?: string | null;
  carts?: {
    name?: string | null;
  } | null;
};

type MaintenanceListProps = {
  logs: ServiceLog[];
};

function formatDate(dateString?: string | null) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatType(type?: string | null) {
  if (!type) return "-";
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatCost(cost?: number | null) {
  if (cost === null || cost === undefined || Number.isNaN(cost)) {
    return "-";
  }
  return `$${cost.toFixed(2)}`;
}

const SERVICE_TYPES = [
  { value: "all", label: "All Types" },
  { value: "tire_rotation", label: "Tire Rotation" },
  { value: "battery_check", label: "Battery Check" },
  { value: "oil_change", label: "Oil Change" },
  { value: "brake_service", label: "Brake Service" },
  { value: "general", label: "General" },
  { value: "repair", label: "Repair" },
];

const getServiceTypeBadge = (type?: string | null) => {
  switch (type) {
    case "repair":
      return <Badge variant="danger">{formatType(type)}</Badge>;
    case "battery_check":
      return <Badge variant="warning">{formatType(type)}</Badge>;
    case "general":
      return <Badge variant="neutral">{formatType(type)}</Badge>;
    default:
      return <Badge variant="active">{formatType(type)}</Badge>;
  }
};

export default function MaintenanceList({ logs }: MaintenanceListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredLogs = logs.filter((log) => {
    // Search filter: matches cart name or notes (case-insensitive)
    const searchLower = searchTerm.toLowerCase();
    const cartName = log.carts?.name?.toLowerCase() || "";
    const notes = log.notes?.toLowerCase() || "";
    const matchesSearch =
      !searchTerm || cartName.includes(searchLower) || notes.includes(searchLower);

    // Type filter
    const matchesType =
      typeFilter === "all" || log.service_type === typeFilter;

    // Date filter
    const matchesDate = !dateFilter || log.service_date === dateFilter;

    return matchesSearch && matchesType && matchesDate;
  });

  const handleSave = (logId: string) => {
    startTransition(async () => {
      const result = await updateServiceCost(logId, parseFloat(editValue));
      if (result.success) {
        setEditingId(null);
      }
    });
  };

  const handleStartEdit = (log: ServiceLog) => {
    if (log.id) {
      setEditingId(log.id);
      setEditValue(log.cost?.toString() || "0");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  if (!logs || logs.length === 0) {
    return (
      <EmptyState
        icon={<Wrench className="h-6 w-6" />}
        title="No maintenance records found"
        description="Start logging service records to track your fleet's maintenance history and costs."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Header */}
      <div className="dossier-panel p-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px]">
            <SearchInput
              placeholder="Search cart or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date Input */}
          <div className="w-auto">
            <label className="dossier-label">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted pointer-events-none" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="dossier-input pl-10 w-auto"
              />
            </div>
          </div>

          {/* Type Select */}
          <div className="w-auto min-w-[160px]">
            <Select
              label="Service Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={SERVICE_TYPES}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredLogs.length === 0 ? (
        <div className="dossier-panel p-8 text-center">
          <p className="text-sm text-ink-subtle">No records match your filters.</p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Asset</TableHeaderCell>
              <TableHeaderCell>Service Type</TableHeaderCell>
              <TableHeaderCell align="right">Cost</TableHeaderCell>
              <TableHeaderCell>Notes</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id || `${log.service_date}-${log.carts?.name}`}>
                <TableCell mono>
                  {formatDate(log.service_date ?? undefined)}
                </TableCell>
                <TableCell bold>
                  {log.carts?.name || "-"}
                </TableCell>
                <TableCell>
                  {getServiceTypeBadge(log.service_type)}
                </TableCell>
                <TableCell align="right">
                  {editingId === log.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-24 dossier-input text-right py-1"
                        disabled={isPending}
                      />
                      <IconButton
                        icon={<Check className="h-4 w-4" />}
                        label="Save"
                        onClick={() => handleSave(log.id!)}
                        disabled={isPending}
                      />
                      <IconButton
                        icon={<X className="h-4 w-4" />}
                        label="Cancel"
                        onClick={handleCancelEdit}
                        disabled={isPending}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-mono font-semibold">{formatCost(log.cost ?? undefined)}</span>
                      {log.id && (
                        <IconButton
                          icon={<Edit2 className="h-3.5 w-3.5" />}
                          label="Edit cost"
                          size="sm"
                          onClick={() => handleStartEdit(log)}
                        />
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell muted>
                  {log.notes?.length ? (
                    <span className="line-clamp-2">{log.notes}</span>
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
