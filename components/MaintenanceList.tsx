import React from "react";

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

export default function MaintenanceList({ logs }: MaintenanceListProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
        No maintenance records found.
      </div>
    );
  }

  return (
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
          {logs.map((log) => (
            <tr key={log.id || `${log.service_date}-${log.carts?.name}`} className="hover:bg-gray-50">
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
                {formatCost(log.cost ?? undefined)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {log.notes?.length ? log.notes : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
