import type { ReactNode } from "react";
import { Camera, FileText, Clock, Hash, Tag } from "lucide-react";

export type EvidenceKind = "photo" | "waiver" | "log" | "proof";

export interface EvidenceTagProps {
  kind?: EvidenceKind;
  label?: string;
  children?: ReactNode;
  timestamp?: string;
  hash?: string;
  status?: "verified" | "pending" | "missing";
  className?: string;
}

const kindConfig: Record<EvidenceKind, { label: string; icon: ReactNode }> = {
  photo: { label: "PHOTO", icon: <Camera className="h-3 w-3" /> },
  waiver: { label: "WAIVER", icon: <FileText className="h-3 w-3" /> },
  log: { label: "LOG", icon: <Clock className="h-3 w-3" /> },
  proof: { label: "PROOF", icon: <Camera className="h-3 w-3" /> },
};

export function EvidenceTag({
  kind,
  label,
  children,
  timestamp,
  hash,
  status = "verified",
  className = "",
}: EvidenceTagProps) {
  // Support simple label/children usage without kind
  const content = label ?? children;
  if (!kind && content) {
    return (
      <span
        className={`
          inline-flex items-center gap-1 px-2 py-1
          bg-ink/80 text-white text-xs font-semibold uppercase tracking-wider
          rounded-dossier-chip backdrop-blur-sm
          ${className}
        `.trim()}
      >
        <Tag className="h-3 w-3" />
        {content}
      </span>
    );
  }

  // Original kind-based usage
  if (!kind) return null;

  const config = kindConfig[kind];

  const statusClass =
    status === "verified"
      ? "border-accent-ops/30"
      : status === "pending"
      ? "border-accent-warning/30"
      : "border-accent-legal/30";

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-2
        bg-paper border rounded-dossier-control
        ${statusClass}
        ${className}
      `.trim()}
    >
      {/* Kind chip */}
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-surface text-ink font-semibold uppercase text-[10px] tracking-wider rounded">
        {config.icon}
        {config.label}
      </span>

      {/* Timestamp */}
      {timestamp && (
        <span className="font-mono text-xs text-ink-subtle flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timestamp}
        </span>
      )}

      {/* Hash */}
      {hash && (
        <span className="font-mono text-xs text-ink-muted flex items-center gap-1">
          <Hash className="h-3 w-3" />
          {hash}
        </span>
      )}

      {/* Status indicator */}
      {status === "verified" && (
        <span className="h-2 w-2 rounded-full bg-accent-ops" title="Verified" />
      )}
      {status === "pending" && (
        <span className="h-2 w-2 rounded-full bg-accent-warning animate-pulse" title="Pending" />
      )}
      {status === "missing" && (
        <span className="h-2 w-2 rounded-full bg-accent-legal" title="Missing" />
      )}
    </div>
  );
}

// Chain of Custody panel
export interface CustodyRecord {
  label: string;
  value: string;
}

export interface ChainOfCustodyProps {
  title?: string;
  records: CustodyRecord[];
  className?: string;
}

export function ChainOfCustody({
  title = "Digital Chain of Custody",
  records,
  className = "",
}: ChainOfCustodyProps) {
  return (
    <div className={`custody-panel ${className}`}>
      <p className="custody-panel-title">{title}</p>
      <div className="space-y-0.5">
        {records.map((record, index) => (
          <div key={index} className="custody-row">
            <span className="custody-row-label">{record.label}:</span>
            <span className="custody-row-value truncate max-w-[200px]" title={record.value}>
              {record.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Forensic banner for evidence pages
export interface ForensicBannerProps {
  rentalId?: string;
  signedBy?: string;
  timestamp?: string;
  ip?: string;
  userAgent?: string;
  hash?: string;
  className?: string;
}

export function ForensicBanner({
  rentalId,
  signedBy,
  timestamp,
  ip,
  userAgent,
  hash,
  className = "",
}: ForensicBannerProps) {
  // Format timestamp if provided
  const formattedTimestamp = timestamp
    ? new Date(timestamp).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  // Build display items
  const items = [
    rentalId && `Case #${rentalId.slice(0, 8).toUpperCase()}`,
    signedBy && `Signed by ${signedBy}`,
    formattedTimestamp,
    ip && `IP: ${ip}`,
    hash && `#${hash.slice(0, 8)}`,
  ].filter(Boolean);

  if (items.length === 0 && !userAgent) return null;

  return (
    <div
      className={`
        flex flex-wrap items-center gap-x-3 gap-y-1
        px-4 py-2 bg-paper border border-rule rounded-dossier-sm
        font-mono text-xs text-ink-subtle
        ${className}
      `.trim()}
    >
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          {index > 0 && <span className="text-rule">|</span>}
          {item}
        </span>
      ))}
      {userAgent && (
        <span
          className="text-ink-muted truncate max-w-[200px]"
          title={userAgent}
        >
          | {userAgent}
        </span>
      )}
    </div>
  );
}
