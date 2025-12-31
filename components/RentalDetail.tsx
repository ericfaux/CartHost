"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  X,
  ImageIcon,
} from "lucide-react";
import { Badge, StampSealed } from "./ui/Badge";
import { Button } from "./ui/Button";
import { EvidenceTag } from "./ui/EvidenceTag";
import { EmptyState } from "./ui/EmptyState";

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
  carts?: {
    name?: string | null;
  } | null;
  condition_comment?: string | null;
  condition_image_url?: string | null;
};

export type PhotoRow = {
  id: string;
  storage_path: string;
  sha256: string | null;
  created_at: string;
  signedUrl?: string;
};

export default function RentalDetail({
  rental,
  photos = [],
}: {
  rental: Rental;
  photos?: PhotoRow[];
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedHash, setSelectedHash] = useState<string | null>(null);
  const preRidePhotos = photos.slice(0, 4);
  const checkoutPhoto = photos.length > 0 ? photos[photos.length - 1] : null;

  const formattedDate = useMemo(() => {
    const date = new Date(rental.created_at);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [rental.created_at]);

  const formattedWaiverDate = useMemo(() => {
    if (!rental.waiver_agreed_at) return null;

    const date = new Date(rental.waiver_agreed_at);
    return date.toISOString();
  }, [rental.waiver_agreed_at]);

  const handlePrint = () => {
    window.print();
  };

  const handleImageClick = (photo: PhotoRow) => {
    if (photo.signedUrl) {
      setSelectedImage(photo.signedUrl);
      setSelectedHash(photo.sha256);
    }
  };

  const chainOfCustody = useMemo(() => {
    const events: { event: string; time: string; detail: string }[] = [];

    // Case Created
    const createdDate = new Date(rental.created_at);
    events.push({
      event: "Case Created",
      time: createdDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
      detail: "System initialized rental session",
    });

    // Waiver Signed
    if (rental.waiver_agreed_at) {
      const waiverDate = new Date(rental.waiver_agreed_at);
      events.push({
        event: "Waiver Signed",
        time: waiverDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
        detail: `Digital signature captured from ${rental.guest_name || "Guest"}`,
      });
    }

    // Photo captures
    photos.forEach((photo, index) => {
      const photoDate = new Date(photo.created_at);
      const isCheckout = index === photos.length - 1 && photos.length > 1;
      events.push({
        event: isCheckout ? "Return Photo Captured" : `Photo ${index + 1} Captured`,
        time: photoDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
        detail: photo.sha256
          ? `SHA256: ${photo.sha256.slice(0, 8)}...${photo.sha256.slice(-4)}`
          : "Evidence verified",
      });
    });

    // Sort by time
    return events.sort((a, b) => a.time.localeCompare(b.time));
  }, [rental, photos]);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-paper border-b border-rule rounded-t-dossier-surface">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/history"
              className="flex h-9 w-9 items-center justify-center rounded-dossier-control bg-surface border border-rule text-ink-subtle hover:text-ink hover:bg-paper transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-3">
              <h2 className="font-heading text-lg font-semibold text-ink">
                Evidence Packet
              </h2>
              <span className="font-mono text-xs text-ink-muted px-2 py-0.5 bg-surface rounded-dossier-sm border border-rule">
                {rental.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<Download className="h-4 w-4" />}
              onClick={handlePrint}
            >
              Export PDF
            </Button>
          </div>
        </div>

        {!photos.length && !rental.waiver_agreed ? (
          <EmptyState
            icon={<ImageIcon className="h-6 w-6" />}
            title="No evidence available"
            description="No photos or waiver data available for this rental session."
          />
        ) : (
          <div className="space-y-6 px-6 pb-6">
            {/* Case Summary */}
            <section>
              <h3 className="font-mono text-xs uppercase text-ink-muted tracking-wider mb-3">
                Case Summary
              </h3>
              <div className="bg-paper rounded-dossier-control border border-rule p-4 space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-ink-subtle">Case Status</span>
                  {rental.waiver_agreed ? (
                    <StampSealed />
                  ) : (
                    <Badge variant="danger" style="chip">
                      Unsigned
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-rule">
                  <div>
                    <p className="text-[10px] font-mono uppercase text-ink-muted">
                      Asset
                    </p>
                    <p className="text-sm font-medium text-ink">
                      {rental.carts?.name || "Unknown Asset"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-ink-muted">
                      Evidence Count
                    </p>
                    <p className="text-sm font-medium text-ink">
                      {photos.length} Photos
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-ink-muted">
                      Check Out
                    </p>
                    <p className="text-sm font-mono text-ink">{formattedDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-ink-muted">
                      Waiver Status
                    </p>
                    <p className="text-sm font-medium text-ink">
                      {rental.waiver_agreed ? (
                        <span className="text-accent-ops">Signed</span>
                      ) : (
                        <span className="text-accent-legal">Pending</span>
                      )}
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
                    <p className="text-sm font-medium text-ink">
                      {rental.guest_name || "Unknown Guest"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-ink-muted">
                      IP Address
                    </p>
                    <p className="text-sm font-mono text-ink">
                      {rental.guest_ip || "Not recorded"}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-rule">
                  <p className="text-[10px] font-mono uppercase text-ink-muted mb-1">
                    User Agent
                  </p>
                  <p className="text-xs font-mono text-ink-subtle break-all">
                    {rental.user_agent || "Not recorded"}
                  </p>
                </div>
              </div>
            </section>

            {/* Guest-Reported Issues */}
            {(rental.condition_comment || rental.condition_image_url) && (
              <section>
                <h3 className="font-mono text-xs uppercase text-ink-muted tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-accent-warning" />
                  Guest-Reported Issues
                </h3>
                <div className="bg-paper rounded-dossier-control border border-rule overflow-hidden">
                  <div className="px-4 py-2 bg-amber-50/50 border-b border-amber-200/50 flex items-center justify-between">
                    <span className="text-xs font-medium text-amber-700">
                      Pre-existing conditions documented by guest
                    </span>
                    <Badge variant="warning" style="stamp">
                      PRE-EXISTING
                    </Badge>
                  </div>
                  <div className="p-4 space-y-4">
                    {rental.condition_comment && (
                      <div>
                        <p className="text-[10px] font-mono uppercase text-ink-muted mb-2">
                          Guest Statement
                        </p>
                        <div className="rounded-dossier-sm border border-rule bg-surface p-3">
                          <p className="text-sm text-ink italic">
                            "{rental.condition_comment}"
                          </p>
                        </div>
                      </div>
                    )}

                    {rental.condition_image_url && (
                      <div>
                        <p className="text-[10px] font-mono uppercase text-ink-muted mb-2">
                          Attached Evidence
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(rental.condition_image_url!);
                            setSelectedHash(null);
                          }}
                          className="group relative aspect-[4/3] w-full sm:w-64 overflow-hidden rounded-dossier-control border border-rule bg-surface transition hover:border-accent-warning"
                        >
                          <Image
                            src={rental.condition_image_url}
                            alt="Guest reported damage"
                            fill
                            unoptimized
                            sizes="(min-width: 640px) 256px, 100vw"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition group-hover:bg-ink/10">
                            <span className="rounded-dossier-chip bg-ink/80 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                              Click to enlarge
                            </span>
                          </div>
                          <EvidenceTag
                            label="Damage Report"
                            className="absolute top-2 left-2"
                          />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Photo Evidence (Pre-Ride) */}
            {preRidePhotos.length > 0 && (
              <section>
                <h3 className="font-mono text-xs uppercase text-ink-muted tracking-wider mb-3">
                  Photo Evidence ({preRidePhotos.length})
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {preRidePhotos.map((photo, index) => {
                    const photoDate = new Date(photo.created_at);
                    const timeStr = photoDate.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    });

                    return (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => handleImageClick(photo)}
                        disabled={!photo.signedUrl}
                        className="bg-paper rounded-dossier-control border border-rule overflow-hidden text-left transition hover:border-accent-info disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="aspect-[4/3] bg-ink/5 flex items-center justify-center relative">
                          {photo.signedUrl ? (
                            <Image
                              src={photo.signedUrl}
                              alt={`Pre-ride photo ${index + 1}`}
                              fill
                              unoptimized
                              sizes="(min-width: 640px) 50vw, 100vw"
                              className="object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-8 w-8 text-ink-muted" />
                          )}
                        </div>
                        <div className="p-2 border-t border-rule">
                          <p className="text-xs font-semibold text-ink">
                            Pre-Ride {index + 1}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {photo.sha256 && (
                              <span className="text-[10px] font-mono text-ink-muted">
                                #{photo.sha256.slice(0, 8)}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-ink-muted">
                              {timeStr}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Return Documentation (Checkout) */}
            <section>
              <h3 className="font-mono text-xs uppercase text-ink-muted tracking-wider mb-3">
                Return Documentation
              </h3>
              {checkoutPhoto ? (
                <button
                  type="button"
                  onClick={() => handleImageClick(checkoutPhoto)}
                  disabled={!checkoutPhoto.signedUrl}
                  className="w-full bg-paper rounded-dossier-control border-2 border-accent-success/30 overflow-hidden text-left transition hover:border-accent-success disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="aspect-video bg-ink/5 flex items-center justify-center relative">
                    {checkoutPhoto.signedUrl ? (
                      <Image
                        src={checkoutPhoto.signedUrl}
                        alt="Return photo"
                        fill
                        unoptimized
                        sizes="100vw"
                        className="object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-ink-muted" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition hover:bg-ink/10">
                      <span className="rounded-dossier-chip bg-ink/80 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                        Click to enlarge
                      </span>
                    </div>
                  </div>
                  <div className="p-3 border-t border-rule bg-accent-success/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          Return Photo
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {checkoutPhoto.sha256 && (
                            <span className="text-[10px] font-mono text-ink-muted">
                              #{checkoutPhoto.sha256.slice(0, 8)}
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-ink-muted">
                            {new Date(checkoutPhoto.created_at).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: false,
                              }
                            )}
                          </span>
                        </div>
                      </div>
                      <Badge variant="success" style="chip">
                        Documented
                      </Badge>
                    </div>
                  </div>
                </button>
              ) : (
                <div className="bg-paper rounded-dossier-control border border-rule p-6 text-center">
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-ink-muted/10 flex items-center justify-center mb-3">
                      <ImageIcon className="h-6 w-6 text-ink-muted" />
                    </div>
                    <p className="text-sm font-semibold text-ink-subtle">
                      No Return Photo
                    </p>
                    <p className="text-xs text-ink-muted mt-1">
                      Session ended without checkout documentation
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Waiver Confirmation */}
            {rental.waiver_agreed && (
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
                    Signed at: {formattedWaiverDate || "Not recorded"}
                  </div>
                </div>
              </section>
            )}

            {/* Waiver Not Signed Warning */}
            {!rental.waiver_agreed && (
              <section>
                <h3 className="font-mono text-xs uppercase text-ink-muted tracking-wider mb-3">
                  Waiver Status
                </h3>
                <div className="bg-paper rounded-dossier-control border border-accent-legal/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent-legal/10 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-accent-legal" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-accent-legal">
                        Waiver Not Signed
                      </p>
                      <p className="text-xs text-ink-subtle">
                        This guest did not complete the liability waiver. Liability
                        protection may be limited.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Chain of Custody */}
            {chainOfCustody.length > 0 && (
              <section>
                <h3 className="font-mono text-xs uppercase text-ink-muted tracking-wider mb-3">
                  Complete Chain of Custody
                </h3>
                <div className="bg-paper rounded-dossier-control border border-rule p-4">
                  <div className="space-y-3">
                    {chainOfCustody.map((entry, index) => (
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
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
          onClick={() => {
            setSelectedImage(null);
            setSelectedHash(null);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Evidence photo viewer"
        >
          <button
            type="button"
            onClick={() => {
              setSelectedImage(null);
              setSelectedHash(null);
            }}
            className="absolute right-4 top-4 z-10 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-dossier-control transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="absolute inset-0 flex items-center justify-center p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
              <Image
                src={selectedImage}
                alt="Selected evidence photo"
                fill
                unoptimized
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </div>

          {/* Evidence Label */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-dossier-chip bg-ink/80 px-4 py-2 backdrop-blur-sm">
            <p className="font-mono text-xs font-semibold text-white uppercase tracking-wider">
              Evidence Photo • Case #{rental.id.slice(0, 8).toUpperCase()}
              {selectedHash && ` • SHA256: ${selectedHash.slice(0, 12)}...`}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
