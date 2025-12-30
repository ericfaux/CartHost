"use client";

import { useState } from "react";
import { FileText, Download, X, ExternalLink } from "lucide-react";
import { StampSealed } from "../ui/Badge";
import { Button } from "../ui/Button";
import { ChainOfCustody } from "../ui/EvidenceTag";

interface EvidencePacketPreviewProps {
  className?: string;
}

export function EvidencePacketPreview({
  className = "",
}: EvidencePacketPreviewProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <div
        className={`bg-surface rounded-dossier-surface border border-rule shadow-dossier-surface overflow-hidden ${className}`}
      >
        {/* Header Strip */}
        <div className="bg-paper border-b border-rule px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-ink-subtle" />
            <span className="font-heading text-base font-semibold text-ink">
              Exportable Evidence Packet
            </span>
          </div>
          <StampSealed />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Chain of Custody */}
            <div>
              <ChainOfCustody
                title="Digital Chain of Custody"
                records={[
                  { label: "Rental ID", value: "RTL-2024-0847" },
                  { label: "Asset Serial", value: "CART-001-EZGO" },
                  { label: "Signed At", value: "2024-12-28T14:23:05Z" },
                  { label: "Signed By", value: "John D. Smith" },
                  { label: "IP Address", value: "192.168.1.47" },
                ]}
              />
            </div>

            {/* Technical Metadata */}
            <div className="space-y-4">
              <div className="p-3 bg-paper rounded-dossier-control border border-rule">
                <p className="text-[10px] font-mono uppercase text-ink-muted tracking-wider mb-2">
                  User Agent
                </p>
                <p className="text-xs font-mono text-ink-subtle break-all">
                  Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)...
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-paper rounded-dossier-control border border-rule">
                  <p className="text-[10px] font-mono uppercase text-ink-muted tracking-wider">
                    Photo Count
                  </p>
                  <p className="text-lg font-bold text-ink mt-1">4</p>
                </div>
                <div className="p-3 bg-paper rounded-dossier-control border border-rule">
                  <p className="text-[10px] font-mono uppercase text-ink-muted tracking-wider">
                    Waiver Status
                  </p>
                  <p className="text-lg font-bold text-accent-ops mt-1">
                    Signed
                  </p>
                </div>
              </div>

              <div className="p-3 bg-paper rounded-dossier-control border border-rule">
                <p className="text-[10px] font-mono uppercase text-ink-muted tracking-wider mb-2">
                  Photo Hashes (SHA-256)
                </p>
                <div className="space-y-1">
                  <p className="text-xs font-mono text-ink-subtle">
                    3f7d9a2b...c4e8
                  </p>
                  <p className="text-xs font-mono text-ink-subtle">
                    8a1b3c4d...f2a9
                  </p>
                  <p className="text-xs font-mono text-ink-muted">
                    +2 more hashes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 pt-6 border-t border-rule flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-ink-subtle">
              Each rental generates a complete evidence package ready for export
              or legal review.
            </p>
            <Button
              variant="secondary"
              size="sm"
              icon={<ExternalLink className="h-4 w-4" />}
              onClick={() => setIsDrawerOpen(true)}
            >
              View Sample Packet
            </Button>
          </div>
        </div>
      </div>

      {/* Sample Packet Drawer */}
      <EvidencePacketDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}

interface EvidencePacketDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function EvidencePacketDrawer({ isOpen, onClose }: EvidencePacketDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-surface shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-paper border-b border-rule">
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-lg font-semibold text-ink">
              Evidence Packet
            </h2>
            <span className="font-mono text-xs text-ink-muted px-2 py-0.5 bg-surface rounded-dossier-sm border border-rule">
              RTL-2024-0847
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={<Download className="h-4 w-4" />}>
              Export PDF
            </Button>
            <button
              onClick={onClose}
              className="p-2 text-ink-subtle hover:text-ink hover:bg-paper rounded-dossier-control transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Case Summary */}
          <section>
            <h3 className="font-mono text-xs uppercase text-ink-muted tracking-wider mb-3">
              Case Summary
            </h3>
            <div className="bg-paper rounded-dossier-control border border-rule p-4 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-ink-subtle">Case Status</span>
                <StampSealed />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-rule">
                <div>
                  <p className="text-[10px] font-mono uppercase text-ink-muted">
                    Asset
                  </p>
                  <p className="text-sm font-medium text-ink">
                    EZGO Golf Cart #001
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase text-ink-muted">
                    Duration
                  </p>
                  <p className="text-sm font-medium text-ink">4h 22m</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase text-ink-muted">
                    Check Out
                  </p>
                  <p className="text-sm font-mono text-ink">
                    Dec 28, 2024 14:23
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase text-ink-muted">
                    Check In
                  </p>
                  <p className="text-sm font-mono text-ink">
                    Dec 28, 2024 18:45
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Guest Information */}
          <section>
            <h3 className="font-mono text-xs uppercase text-ink-muted tracking-wider mb-3">
              Guest Information
            </h3>
            <div className="bg-paper rounded-dossier-control border border-rule p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-mono uppercase text-ink-muted">
                    Name
                  </p>
                  <p className="text-sm font-medium text-ink">John D. Smith</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase text-ink-muted">
                    IP Address
                  </p>
                  <p className="text-sm font-mono text-ink">192.168.1.47</p>
                </div>
              </div>
              <div className="pt-3 border-t border-rule">
                <p className="text-[10px] font-mono uppercase text-ink-muted mb-1">
                  User Agent
                </p>
                <p className="text-xs font-mono text-ink-subtle break-all">
                  Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)
                  AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0
                  Mobile/15E148 Safari/604.1
                </p>
              </div>
            </div>
          </section>

          {/* Photo Evidence */}
          <section>
            <h3 className="font-mono text-xs uppercase text-ink-muted tracking-wider mb-3">
              Photo Evidence (4)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Front View", hash: "3f7d9a2b", time: "14:24:01" },
                { label: "Right Side", hash: "8a1b3c4d", time: "14:24:18" },
                { label: "Left Side", hash: "c2d4e5f6", time: "14:24:35" },
                { label: "Rear View", hash: "a9b8c7d6", time: "14:24:52" },
              ].map((photo) => (
                <div
                  key={photo.label}
                  className="bg-paper rounded-dossier-control border border-rule overflow-hidden"
                >
                  <div className="aspect-[4/3] bg-ink/5 flex items-center justify-center">
                    <span className="text-xs text-ink-muted">
                      [Photo Preview]
                    </span>
                  </div>
                  <div className="p-2 border-t border-rule">
                    <p className="text-xs font-semibold text-ink">
                      {photo.label}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-ink-muted">
                        #{photo.hash}
                      </span>
                      <span className="text-[10px] font-mono text-ink-muted">
                        {photo.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Waiver Confirmation */}
          <section>
            <h3 className="font-mono text-xs uppercase text-ink-muted tracking-wider mb-3">
              Waiver Confirmation
            </h3>
            <div className="bg-paper rounded-dossier-control border border-rule p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-accent-ops/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-accent-ops" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Liability Waiver Signed
                  </p>
                  <p className="text-xs text-ink-subtle">
                    Guest acknowledged all terms and conditions
                  </p>
                </div>
              </div>
              <div className="text-xs font-mono text-ink-muted pt-3 border-t border-rule">
                Signed at: 2024-12-28T14:23:05.847Z
              </div>
            </div>
          </section>

          {/* Chain of Custody */}
          <section>
            <h3 className="font-mono text-xs uppercase text-ink-muted tracking-wider mb-3">
              Complete Chain of Custody
            </h3>
            <div className="bg-paper rounded-dossier-control border border-rule p-4">
              <div className="space-y-3">
                {[
                  {
                    event: "Case Created",
                    time: "14:20:03",
                    detail: "System initialized rental session",
                  },
                  {
                    event: "Waiver Signed",
                    time: "14:23:05",
                    detail: "Digital signature captured",
                  },
                  {
                    event: "Photo 1 Captured",
                    time: "14:24:01",
                    detail: "Front view verified",
                  },
                  {
                    event: "Photo 2 Captured",
                    time: "14:24:18",
                    detail: "Right side verified",
                  },
                  {
                    event: "Photo 3 Captured",
                    time: "14:24:35",
                    detail: "Left side verified",
                  },
                  {
                    event: "Photo 4 Captured",
                    time: "14:24:52",
                    detail: "Rear view verified",
                  },
                  {
                    event: "Keys Released",
                    time: "14:26:00",
                    detail: "Unlock code displayed",
                  },
                  {
                    event: "Return Initiated",
                    time: "18:45:00",
                    detail: "Guest started return flow",
                  },
                  {
                    event: "Plug Photo Captured",
                    time: "18:45:33",
                    detail: "Charge verified",
                  },
                  {
                    event: "Case Sealed",
                    time: "18:46:00",
                    detail: "Evidence package finalized",
                  },
                ].map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 text-sm pb-3 border-b border-rule last:border-0 last:pb-0"
                  >
                    <span className="font-mono text-xs text-ink-muted w-16 flex-shrink-0">
                      {entry.time}
                    </span>
                    <div>
                      <p className="font-medium text-ink">{entry.event}</p>
                      <p className="text-xs text-ink-subtle">{entry.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-paper border-t border-rule flex items-center justify-between">
          <p className="text-xs text-ink-muted">
            This is a sample evidence packet for demonstration purposes.
          </p>
          <Button variant="ops" size="sm" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
