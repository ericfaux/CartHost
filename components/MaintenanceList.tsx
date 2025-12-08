"use client";

import React, { useState, useTransition } from "react";
import { Search, Filter, Calendar, Check, X, Edit2 } from "lucide-react";
import { updateServiceCost } from "../app/dashboard/maintenance/actions";

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
  { value: "all", label: "All" },
  { value: "tire_rotation", label: "Tire Rotation" },
  { value: "battery_check", label: "Battery Check" },
  { value: "oil_change", label: "Oil Change" },
  { value: "brake_service", label: "Brake Service" },
  { value: "general", label: "General" },
  { value: "repair", label: "Repair" },
];

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
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
        No maintenance records found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Header */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search cart or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Date Input */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Type Select */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-gray-50 py-2 pl-4 pr-8 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {SERVICE_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No records match your filters.
          </div>
        ) : (
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
                  Service Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id || `${log.service_date}-${log.carts?.name}`}
                  className="hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {formatDate(log.service_date ?? undefined)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                    {log.carts?.name || "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {formatType(log.service_type)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                    {editingId === log.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-24 rounded border border-gray-300 px-2 py-1 text-right text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          disabled={isPending}
                        />
                        <button
                          onClick={() => handleSave(log.id!)}
                          disabled={isPending}
                          className="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-50"
                          title="Save"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={isPending}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <span>{formatCost(log.cost ?? undefined)}</span>
                        {log.id && (
                          <button
                            onClick={() => handleStartEdit(log)}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            title="Edit cost"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {log.notes?.length ? log.notes : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
