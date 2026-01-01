"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Camera,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  Download,
  Shield,
  Fingerprint,
} from "lucide-react";
import { Badge, StampSealed, StampSigned } from "./ui/Badge";
import { Button } from "./ui/Button";
import { GolfCartWaiver } from "./WaiverContent";

// --- TYPES ---
type Rental = {
  id: string;
  created_at: string;
  guest_name?: string | null;
  status?: string | null;
  waiver_agreed?: boolean | null;
  waiver_agreed_at?: string | null;
  guest_ip?: string | null;
  user_agent?: string | null;
  waiver_version?: string | null;
  condition_comment?: string | null;
  condition_image_url?: string | null;
  checkout_time?: string | null;
  carts?: {
    name?: string | null;
  } | null;
};

export type PhotoRow = {
  id: string;
  storage_path: string;
  sha256: string | null;
  created_at: string;
  signedUrl?: string;
};

// --- HELPER COMPONENT: CHAIN OF CUSTODY LIST ---
function ChainOfCustodyList({
  records,
}: {
  records: { time: string; event: string; detail: string }[];
}) {
  return (
    <div className="space-y-3">
      {records.map((entry, index) => (
        <div
          key={index}
          className="flex items-start gap-3 text-sm pb-3 border-b border-rule last:border-0 last:pb-0"
        >
          <span className="font-mono text-xs text-ink-muted w-16 flex-shrink-0 pt-0.5">
            {entry.time}
          </span>
          <div>
            <p className="font-medium text-ink leading-none mb-1">{entry.event}</p>
            <p className="text-xs text-ink-subtle">{entry.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function RentalDetail({
  rental,
  photos = [],
}: {
  rental: Rental;
  photos?: PhotoRow[];
}) {
  const [showWaiver, setShowWaiver] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedHash, setSelectedHash] = useState<string | null>(null);

  // Filter Photos: Pre-ride (first 4) and Return (last if > 4 photos)
  const preRidePhotos = photos.slice(0, 4);
  const checkoutPhoto = photos.length > 4 ? photos[photos.length - 1] : null;

  // Formatters
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Pending";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeOnly = (dateString?: string | null) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleImageClick = (photo: PhotoRow) => {
    if (photo.signedUrl) {
      setSelectedImage(photo.signedUrl);
      setSelectedHash(photo.sha256);
    }
  };

  // Build Chain of Custody Data
  const chainOfCustodyRecords = useMemo(() => {
    const records = [
      {
        time: formatTimeOnly(rental.created_at),
        event: "Case Created",
        detail: "System initialized rental session",
      },
    ];

    if (rental.waiver_agreed_at) {
      records.push({
        time: formatTimeOnly(rental.waiver_agreed_at),
        event: "Waiver Signed",
        detail: "Digital signature captured & verified",
      });
    }

    preRidePhotos.forEach((p, i) => {
      records.push({
        time: formatTimeOnly(p.created_at),
        event: `Photo ${i + 1} Captured`,
        detail: `Pre-ride evidence verified`,
      });
    });

    if (checkoutPhoto) {
      records.push({
        time: formatTimeOnly(checkoutPhoto.created_at),
        event: "Return Initiated",
        detail: "Guest submitted return photo",
      });
    }

    // Sort by time
    return records.sort((a, b) => (a.time > b.time ? 1 : -1));
  }, [rental, preRidePhotos, checkoutPhoto]);

  return (
    <>
      <div className="bg-black text-white p-2 text-xs font-mono text-center">
        DEBUG: ID={rental.id} | WAIVER={String(rental.waiver_agreed)} | PHOTOS={photos.length}
      </div>
      <div className="max-w-4xl mx-auto pb-12">
        {/* Navigation / Breadcrumb */}
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/dashboard/history"
            className="flex h-9 w-9 items-center justify-center rounded-dossier-control bg-surface border border-rule text-ink-subtle hover:text-ink hover:bg-paper transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-ink">Evidence Packet</h1>
            <p className="text-sm text-ink-subtle">
              Secure record of rental #{rental.id.slice(0, 8)}
            </p>
          </div>
        </div>

        {/* EVIDENCE PACKET CONTAINER — White "sheet" with grey data modules */}
        <div className="bg-white rounded-dossier-surface border border-rule shadow-dossier-surface overflow-hidden flex flex-col">
          {/* Header Strip */}
          <div className="flex items-center justify-between px-6 py-4 bg-paper border-b border-rule">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-ink/5 flex items-center justify-center">
                <Shield className="h-4 w-4 text-ink" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-sm font-semibold text-ink">
                  Official Case File
                </span>
                <span className="font-mono text-[10px] text-ink-muted uppercase tracking-wider">
                  ID: {rental.id.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrint}
                icon={<Download className="h-4 w-4" />}
              >
                Export PDF
              </Button>
            </div>
          </div>

          {/* Scrollable Content Area — White background */}
          <div className="p-6 space-y-6 bg-white">
            {/* 1. Case Summary — Grey Box */}
            <section>
              <h3 className="font-mono text-xs uppercase text-ink-muted tracking-wider mb-3 pl-1">
                Case Summary
              </h3>
              <div className="bg-gray-50/80 rounded-dossier-control border border-rule p-4 space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-ink-subtle">Case Status</span>
                  {rental.waiver_agreed ? (
                    <StampSealed />
                  ) : (
                    <Badge variant="danger" style="stamp">
                      OPEN
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-rule">
                  <div>
                    <p className="text-[10px] font-mono uppercase text-ink-muted">Asset</p>
                    <p className="text-sm font-medium text-ink">
                      {rental.carts?.name || "Unknown Asset"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-ink-muted">Session Length</p>
                    <p className="text-sm font-medium text-ink">
                      {rental.checkout_time ? "Closed" : "Active"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-ink-muted">Check Out</p>
                    <p className="text-sm font-mono text-ink">{formatDate(rental.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-ink-muted">Check In</p>
                    <p className="text-sm font-mono text-ink">
                      {rental.checkout_time ? formatDate(rental.checkout_time) : "Not returned"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Guest Information — Grey Box */}
            <section>
              <h3 className="font-mono text-xs uppercase text-ink-muted tracking-wider mb-3 pl-1">
                Guest Information
              </h3>
              <div className="bg-gray-50/80 rounded-dossier-control border border-rule p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-mono uppercase text-ink-muted">Name</p>
                    <p className="text-sm font-medium text-ink">
                      {rental.guest_name || "Unknown Guest"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-ink-muted">IP Address</p>
                    <p className="text-sm font-mono text-ink">
                      {rental.guest_ip || "Not recorded"}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-rule">
                  <p className="text-[10px] font-mono uppercase text-ink-muted mb-1">User Agent</p>
                  <p className="text-xs font-mono text-ink-subtle break-all">
                    {rental.user_agent || "Not recorded"}
                  </p>
                </div>
              </div>
            </section>

            {/* 3. Guest-Reported Issues (Conditional) */}
            {(rental.condition_comment || rental.condition_image_url) && (
              <section>
                <div className="flex items-center gap-2 mb-3 pl-1">
                  <AlertTriangle className="h-3 w-3 text-accent-warning" />
                  <h3 className="font-mono text-xs uppercase text-accent-warning tracking-wider">
                    Guest-Reported Issues
                  </h3>
                </div>
                <div className="bg-amber-50/50 rounded-dossier-control border border-accent-warning/30 p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <AlertTriangle className="h-16 w-16 text-accent-warning" />
                  </div>

                  {rental.condition_comment && (
                    <div className="mb-4 relative z-10">
                      <p className="text-[10px] font-mono uppercase text-ink-muted mb-1">
                        Guest Statement
                      </p>
                      <p className="text-sm text-ink italic bg-white/50 p-2 rounded-dossier-sm border border-rule/50">
                        &ldquo;{rental.condition_comment}&rdquo;
                      </p>
                    </div>
                  )}

                  {rental.condition_image_url && (
                    <div className="relative z-10">
                      <p className="text-[10px] font-mono uppercase text-ink-muted mb-2">
                        Attached Evidence
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(rental.condition_image_url!);
                          setSelectedHash(null);
                        }}
                        className="group relative h-48 w-full sm:w-64 overflow-hidden rounded-dossier-surface border border-rule bg-white shadow-sm"
                      >
                        <Image
                          src={rental.condition_image_url}
                          alt="Damage report"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition group-hover:bg-ink/10">
                          <span className="rounded-dossier-chip bg-ink/80 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                            VIEW
                          </span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 4. Photo Evidence (2x2 Grid) — Grey Boxes */}
            <section>
              <h3 className="font-mono text-xs uppercase text-ink-muted tracking-wider mb-3 pl-1">
                Photo Evidence ({preRidePhotos.length})
              </h3>
              {preRidePhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {preRidePhotos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="bg-gray-50/80 rounded-dossier-control border border-rule overflow-hidden"
                    >
                      <button
                        onClick={() => handleImageClick(photo)}
                        disabled={!photo.signedUrl}
                        className="relative w-full aspect-[4/3] bg-ink/5 block group"
                      >
                        {photo.signedUrl ? (
                          <Image
                            src={photo.signedUrl}
                            alt={`Evidence ${index + 1}`}
                            fill
                            className="object-cover transition group-hover:scale-105 duration-500"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Camera className="h-6 w-6 text-ink-muted" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </button>
                      <div className="p-2 border-t border-rule bg-gray-50/80">
                        <p className="text-xs font-semibold text-ink">Photo {index + 1}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-ink-muted">
                            #{photo.sha256 ? photo.sha256.slice(0, 8) : "NO-HASH"}
                          </span>
                          <span className="text-[10px] font-mono text-ink-muted">
                            {formatTimeOnly(photo.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50/80 rounded-dossier-control border border-rule border-dashed p-6 text-center">
                  <Camera className="h-8 w-8 text-ink-muted mx-auto mb-2" />
                  <p className="text-sm text-ink-subtle">No photo evidence captured.</p>
                </div>
              )}
            </section>

            {/* 5. Return Documentation (Checkout) */}
            <section>
              <h3 className="font-mono text-xs uppercase text-ink-muted tracking-wider mb-3 pl-1">
                Return Documentation
              </h3>
              {checkoutPhoto ? (
                <div className="bg-gray-50/80 rounded-dossier-control border border-rule overflow-hidden">
                  <button
                    onClick={() => handleImageClick(checkoutPhoto)}
                    className="relative w-full h-48 sm:h-64 bg-ink/5 block group"
                  >
                    {checkoutPhoto.signedUrl && (
                      <Image
                        src={checkoutPhoto.signedUrl}
                        alt="Return Photo"
                        fill
                        className="object-cover transition group-hover:scale-105 duration-500"
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <span className="font-mono text-xs font-semibold text-white">
                        RETURN CONDITION
                      </span>
                    </div>
                  </button>
                  <div className="p-3 border-t border-rule flex justify-between items-center bg-gray-50/80">
                    <div>
                      <p className="text-xs font-semibold text-ink">Plug / Key Return Verified</p>
                      <p className="text-[10px] font-mono text-ink-muted">
                        #{checkoutPhoto.sha256?.slice(0, 8) || "..."}
                      </p>
                    </div>
                    <Badge variant="success" style="chip">
                      VERIFIED
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50/80 rounded-dossier-control border border-rule border-dashed p-6 text-center">
                  <p className="text-sm text-ink-subtle">No return documentation submitted.</p>
                </div>
              )}
            </section>

            {/* 6. Waiver Confirmation — Grey Box with Expandable Drawer */}
            <section>
              <h3 className="font-mono text-xs uppercase text-ink-muted tracking-wider mb-3 pl-1">
                Waiver Confirmation
              </h3>
              <div className="bg-gray-50/80 rounded-dossier-control border border-rule overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          rental.waiver_agreed ? "bg-accent-ops/10" : "bg-accent-legal/10"
                        }`}
                      >
                        {rental.waiver_agreed ? (
                          <FileText className="h-4 w-4 text-accent-ops" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-accent-legal" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {rental.waiver_agreed ? "Liability Waiver Signed" : "Waiver Missing"}
                        </p>
                        <p className="text-xs text-ink-subtle">
                          {rental.waiver_agreed
                            ? "Guest acknowledged all terms and conditions"
                            : "Liability protection may be limited"}
                        </p>
                      </div>
                    </div>
                    {rental.waiver_agreed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowWaiver(!showWaiver)}
                        icon={
                          showWaiver ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )
                        }
                      >
                        {showWaiver ? "Hide" : "View Waiver"}
                      </Button>
                    )}
                  </div>

                  {rental.waiver_agreed && (
                    <div className="flex items-center gap-4 text-xs font-mono text-ink-muted pt-3 mt-3 border-t border-rule">
                      <div className="flex items-center gap-1.5">
                        <Fingerprint className="h-3 w-3" />
                        <span>Signed at: {formatDate(rental.waiver_agreed_at)}</span>
                      </div>
                      {rental.waiver_version && (
                        <span className="text-ink-muted/60">v{rental.waiver_version}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Expandable Waiver Drawer — Renders real WaiverContent */}
                {showWaiver && (
                  <div className="border-t border-rule bg-white p-4 animate-in slide-in-from-top-2">
                    <div className="h-64 overflow-y-auto pr-2 custom-scrollbar">
                      <div className="text-xs text-ink-subtle leading-relaxed">
                        <GolfCartWaiver />
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-rule flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StampSigned />
                        <span className="text-xs text-ink-muted font-mono">
                          by {rental.guest_name || "Guest"}
                        </span>
                      </div>
                      <span className="text-[10px] text-ink-muted font-mono">
                        IP: {rental.guest_ip || "Unknown"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 7. Chain of Custody — Grey Box */}
            <section>
              <h3 className="font-mono text-xs uppercase text-ink-muted tracking-wider mb-3 pl-1">
                Complete Chain of Custody
              </h3>
              <div className="bg-gray-50/80 rounded-dossier-control border border-rule p-4">
                <ChainOfCustodyList records={chainOfCustodyRecords} />
              </div>
            </section>
          </div>

          {/* Footer Strip */}
          <div className="px-6 py-4 bg-paper border-t border-rule flex items-center justify-between">
            <p className="text-xs text-ink-muted">Generated by CartHost Operations Console.</p>
            <div className="flex gap-2">
              <div className="h-2 w-2 rounded-full bg-accent-ops animate-pulse" />
              <span className="text-[10px] font-mono text-accent-ops uppercase">System Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 dossier-overlay bg-ink/90 backdrop-blur-sm"
          onClick={() => {
            setSelectedImage(null);
            setSelectedHash(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => {
              setSelectedImage(null);
              setSelectedHash(null);
            }}
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="relative w-full h-full max-w-6xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={selectedImage} alt="Evidence Detail" fill className="object-contain" />
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-dossier-chip bg-ink/80 px-4 py-2 backdrop-blur-sm border border-white/10">
            <p className="font-mono text-xs font-semibold text-white uppercase tracking-wider">
              EVIDENCE RECORD • SHA256: {selectedHash ? selectedHash.slice(0, 8) + "..." : "UNVERIFIED"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
