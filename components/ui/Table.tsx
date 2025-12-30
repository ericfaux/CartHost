import type { ReactNode, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

// Table wrapper component
export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

export function Table({ children, className = "", ...props }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-dossier-surface border border-rule bg-surface shadow-dossier-surface">
      <table className={`ledger-table ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

// Table Head
export function TableHead({
  children,
  className = "",
  ...props
}: TableHTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={`bg-paper sticky top-0 z-10 ${className}`} {...props}>
      {children}
    </thead>
  );
}

// Table Body
export function TableBody({
  children,
  className = "",
  ...props
}: TableHTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={`divide-y divide-rule ${className}`} {...props}>
      {children}
    </tbody>
  );
}

// Table Row
export interface TableRowProps extends TableHTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  hoverable?: boolean;
  onClick?: () => void;
}

export function TableRow({
  children,
  hoverable = true,
  onClick,
  className = "",
  ...props
}: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`
        border-b border-rule transition-colors
        ${hoverable ? "hover:bg-amber-50/30 highlighter-hover" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </tr>
  );
}

// Table Header Cell
export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  sorted?: "asc" | "desc" | null;
  onSort?: () => void;
}

export function TableHeaderCell({
  children,
  align = "left",
  sortable = false,
  sorted,
  onSort,
  className = "",
  ...props
}: TableHeaderCellProps) {
  const alignClass = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

  return (
    <th
      onClick={sortable ? onSort : undefined}
      className={`
        px-4 py-3 text-dossier-label uppercase text-ink-subtle font-sans border-b-2 border-rule
        ${alignClass}
        ${sortable ? "cursor-pointer hover:text-ink select-none" : ""}
        ${className}
      `.trim()}
      {...props}
    >
      <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : ""}`}>
        {children}
        {sortable && sorted === "asc" && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        )}
        {sortable && sorted === "desc" && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    </th>
  );
}

// Table Data Cell
export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  align?: "left" | "center" | "right";
  mono?: boolean;
  bold?: boolean;
  muted?: boolean;
}

export function TableCell({
  children,
  align = "left",
  mono = false,
  bold = false,
  muted = false,
  className = "",
  ...props
}: TableCellProps) {
  const alignClass = align === "right" ? "text-right tabular-nums" : align === "center" ? "text-center" : "text-left";

  return (
    <td
      className={`
        px-4 py-3 text-sm
        ${alignClass}
        ${mono ? "font-mono text-xs text-ink-subtle" : "text-ink"}
        ${bold ? "font-semibold" : ""}
        ${muted ? "text-ink-muted" : ""}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </td>
  );
}

// Empty state for tables
export function TableEmpty({
  message = "No data found",
  description,
  action,
  colSpan = 1,
}: {
  message?: string;
  description?: string;
  action?: ReactNode;
  colSpan?: number;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-16 text-center">
        <div className="flex flex-col items-center">
          <p className="text-sm font-semibold text-ink">{message}</p>
          {description && (
            <p className="mt-1 text-sm text-ink-subtle">{description}</p>
          )}
          {action && <div className="mt-4">{action}</div>}
        </div>
      </td>
    </tr>
  );
}
