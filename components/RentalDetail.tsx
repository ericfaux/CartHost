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
  Fingerprint,
  Scale,
  Clock,
  Shield,
  Printer,
  ChevronDown,
  ChevronUp,
  X,
  ImageIcon,
} from "lucide-react";
import { PageHeader, SectionHeader } from "./ui/Panel";
import { Badge, StampSigned, StampSealed } from "./ui/Badge";
import { Button, IconButton } from "./ui/Button";
import { EvidenceTag, ChainOfCustody, ForensicBanner } from "./ui/EvidenceTag";
import { EmptyState } from "./ui/EmptyState";

type Rental = {
  id: string;
  created_at: string;
  guest_name?: string | null;
  status?: string | null;
  photos?: string[] | null;
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

const WAIVER_TEXT = `GOLF CART RENTAL AGREEMENT AND WAIVER OF LIABILITY

This Golf Cart Rental Agreement and Waiver of Liability ("Agreement") is between the undersigned guest ("Renter") and the property owner/host ("Host"). CartHost is a technology provider facilitating this process on behalf of the Host.

1. ELIGIBILITY AND DRIVER RESPONSIBILITY
I represent that I am at least 18 years old (or the minimum legal age to operate a motor vehicle in this jurisdiction, if higher) and hold a current, valid driver's license. I agree that only licensed drivers who have been authorized by the Host and who have agreed to this Agreement will operate the golf cart.

2. ASSUMPTION OF RISK
I UNDERSTAND THAT OPERATING A GOLF CART INVOLVES INHERENT RISKS, INCLUDING BUT NOT LIMITED TO COLLISIONS, ROLLOVERS, LOSS OF CONTROL, SERIOUS INJURY, DEATH, AND PROPERTY DAMAGE. I VOLUNTARILY ASSUME ALL SUCH RISKS FOR MYSELF AND ANY MINOR OR GUEST I ALLOW TO RIDE IN OR OPERATE THE CART.

3. RELEASE OF LIABILITY
To the fullest extent permitted by law, I hereby release, waive, and discharge the Host, the property owner, their officers, employees, agents, and the technology provider CartHost from any and all liability, claims, demands, or causes of action arising out of or related to my use or operation of the golf cart, including those arising from ordinary negligence. This release does not apply to any liability that cannot be waived under applicable law, including gross negligence, willful misconduct, or intentional harm.

4. INDEMNIFICATION
I agree to indemnify, defend, and hold harmless the Host and the property owner from any and all claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or related to: (a) my use or operation of the golf cart; (b) any use or operation by a person I allow to drive the cart; or (c) injury to third parties or damage to third-party property in connection with the cart.

5. RESPONSIBILITY FOR DAMAGE AND CHARGES
I agree that I am responsible for any loss of or damage to the golf cart occurring during my rental period, normal wear and tear excepted. I understand that the Host may seek recovery for such damage through any applicable security deposit, damage waiver, or platform resolution process, and, where applicable for direct bookings, I authorize the Host to charge the payment method on file for repair or replacement costs resulting from my use, negligence, or accident.

6. RULES OF OPERATION
I agree to operate the golf cart in a safe and lawful manner and specifically agree that:
- I will obey all local traffic laws, posted signs, and speed limits.
- I will NOT operate the cart while under the influence of alcohol, drugs, or any substance that may impair my ability to drive safely.
- I will NOT allow any underage or unlicensed person to operate the cart.
- I will ensure all passengers are seated properly while the cart is moving.
- I will ensure the cart is plugged in and charging when not in use and at the end of my stay, in accordance with the Host's instructions.

7. CONDITION OF VEHICLE
I acknowledge that I have inspected the golf cart (including by reviewing and/or providing photos through the CartHost app) and accept it in its current condition. I agree to promptly report to the Host any damage or mechanical issues that arise during my rental period.

8. ACKNOWLEDGMENT AND CONSENT
By clicking "I Agree" or otherwise electronically signing below, I acknowledge that I have read this Agreement in full, understand its terms, and voluntarily agree to be bound by it. I understand that by signing this Agreement, I may be waiving certain legal rights, including the right to sue the Host for ordinary negligence, to the fullest extent permitted by law.`;

export default function RentalDetail({ rental }: { rental: Rental }) {
  const [showWaiver, setShowWaiver] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const photos = rental.photos ?? [];
  const preRidePhotos = photos.slice(0, 4);
  const checkoutPhoto = photos[photos.length - 1];

  const formattedDate = useMemo(() => {
    const date = new Date(rental.created_at);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [rental.created_at]);

  const formattedWaiverDate = useMemo(() => {
    if (!rental.waiver_agreed_at) return null;

    const date = new Date(rental.waiver_agreed_at);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [rental.waiver_agreed_at]);

  const handlePrint = () => {
    window.print();
  };

  const chainOfCustody = [
    { label: "Signed By", value: rental.guest_name || "Unknown" },
    { label: "Timestamp", value: formattedWaiverDate || "Not recorded" },
    { label: "IP Address", value: rental.guest_ip || "Not recorded" },
    { label: "Device", value: rental.user_agent || "Not recorded", truncate: true },
    { label: "Waiver Version", value: rental.waiver_version || "1.0" },
  ];

  return (
    <>
      <div className="space-y-8">
        {/* Case File Header */}
        <div className="dossier-panel overflow-hidden">
          <div className="dossier-header-strip">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/history"
                className="flex h-10 w-10 items-center justify-center rounded-dossier-control bg-surface border border-rule text-ink-subtle hover:text-ink hover:bg-paper transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-xl font-bold text-ink">
                    {rental.guest_name || "Guest"}
                  </h1>
                  {rental.waiver_agreed && <StampSigned />}
                </div>
                <p className="text-dossier-caption text-ink-subtle">
                  Case File #{rental.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={handlePrint} icon={<Printer className="h-4 w-4" />}>
                Print
              </Button>
            </div>
          </div>

          {/* Case Summary Strip */}
          <div className="px-6 py-4 bg-paper border-t border-rule">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-dossier-sm bg-accent-info/10">
                  <Clock className="h-4 w-4 text-accent-info" />
                </div>
                <div>
                  <p className="text-dossier-label text-ink-muted">Date</p>
                  <p className="font-mono text-xs text-ink">{formattedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-dossier-sm bg-accent-ops/10">
                  <Shield className="h-4 w-4 text-accent-ops" />
                </div>
                <div>
                  <p className="text-dossier-label text-ink-muted">Asset</p>
                  <p className="text-sm font-semibold text-ink">{rental.carts?.name || "Unknown"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-dossier-sm bg-accent-success/10">
                  <Camera className="h-4 w-4 text-accent-success" />
                </div>
                <div>
                  <p className="text-dossier-label text-ink-muted">Evidence</p>
                  <p className="text-sm font-semibold text-ink">{photos.length} Photos</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-dossier-sm bg-accent-legal/10">
                  <Scale className="h-4 w-4 text-accent-legal" />
                </div>
                <div>
                  <p className="text-dossier-label text-ink-muted">Status</p>
                  {rental.waiver_agreed ? (
                    <Badge variant="success" style="chip">Protected</Badge>
                  ) : (
                    <Badge variant="destructive" style="chip">Unsigned</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {!photos.length && !rental.waiver_agreed ? (
          <EmptyState
            icon={<ImageIcon className="h-6 w-6" />}
            title="No evidence available"
            description="No photos or waiver data available for this rental session."
          />
        ) : (
          <div className="space-y-6">
            {/* Legal Agreement Section */}
            <section className="dossier-panel overflow-hidden">
              <div className="dossier-header-strip">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-dossier-control bg-accent-ops/10">
                    <FileText className="h-5 w-5 text-accent-ops" />
                  </div>
                  <div>
                    <h2 className="font-heading text-lg font-bold text-ink">Liability Waiver</h2>
                    <p className="text-dossier-caption text-ink-subtle">Legal protection documentation</p>
                  </div>
                </div>
                {rental.waiver_agreed && <StampSealed />}
              </div>

              <div className="p-6">
                {rental.waiver_agreed ? (
                  <div className="space-y-4">
                    {/* Waiver Status Card */}
                    <div className="flex flex-col gap-4 rounded-dossier-surface border border-accent-success/30 bg-accent-success/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-success/10">
                          <CheckCircle2 className="h-6 w-6 text-accent-success" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-accent-success">
                            Waiver Executed
                          </p>
                          {formattedWaiverDate && (
                            <p className="font-mono text-xs text-ink-subtle">
                              {formattedWaiverDate}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowWaiver((prev) => !prev)}
                        icon={showWaiver ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      >
                        {showWaiver ? "Hide Terms" : "View Terms"}
                      </Button>
                    </div>

                    {/* Waiver Content */}
                    {showWaiver && (
                      <div className="space-y-4">
                        <div className="max-h-80 overflow-y-auto rounded-dossier-surface border border-rule bg-paper p-4">
                          <p className="whitespace-pre-line font-mono text-xs leading-relaxed text-ink-subtle">
                            {WAIVER_TEXT}
                          </p>
                        </div>

                        {/* Chain of Custody */}
                        <ChainOfCustody entries={chainOfCustody} title="Digital Chain of Custody" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-4 rounded-dossier-surface border-2 border-dashed border-accent-legal/30 bg-red-50/50 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-legal/10">
                      <AlertTriangle className="h-6 w-6 text-accent-legal" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-accent-legal">
                        Waiver Not Signed
                      </p>
                      <p className="text-xs text-ink-subtle">
                        This guest did not complete the liability waiver. Liability protection may be limited.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Guest-Reported Issues */}
            {(rental.condition_comment || rental.condition_image_url) && (
              <section className="dossier-panel overflow-hidden">
                <div className="dossier-header-strip bg-amber-50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-dossier-control bg-accent-warning/10">
                      <AlertTriangle className="h-5 w-5 text-accent-warning" />
                    </div>
                    <div>
                      <h2 className="font-heading text-lg font-bold text-ink">Guest-Reported Issues</h2>
                      <p className="text-dossier-caption text-ink-subtle">Pre-existing conditions documented by guest</p>
                    </div>
                  </div>
                  <Badge variant="warning" style="stamp">PRE-EXISTING</Badge>
                </div>

                <div className="p-6 bg-amber-50/30">
                  {rental.condition_comment && (
                    <div className="mb-4">
                      <p className="text-dossier-label text-ink-muted mb-1">Guest Statement</p>
                      <div className="rounded-dossier-sm border border-amber-200 bg-white p-3">
                        <p className="text-sm text-ink italic">"{rental.condition_comment}"</p>
                      </div>
                    </div>
                  )}

                  {rental.condition_image_url && (
                    <div>
                      <p className="text-dossier-label text-ink-muted mb-2">Attached Evidence</p>
                      <button
                        type="button"
                        onClick={() => setSelectedImage(rental.condition_image_url!)}
                        className="group relative h-48 w-full overflow-hidden rounded-dossier-surface border-2 border-amber-200 bg-white shadow-sm transition hover:border-accent-warning sm:w-64"
                      >
                        <Image
                          src={rental.condition_image_url}
                          alt="Guest reported damage"
                          fill
                          unoptimized
                          sizes="(min-width: 640px) 50vw, 25vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition group-hover:bg-ink/10">
                          <span className="rounded-dossier-chip bg-ink/80 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                            Click to enlarge
                          </span>
                        </div>
                        <EvidenceTag label="Damage Report" className="absolute top-2 left-2" />
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Pre-Ride Evidence */}
            {preRidePhotos.length > 0 && (
              <section className="dossier-panel overflow-hidden">
                <div className="dossier-header-strip">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-dossier-control bg-accent-info/10">
                      <Camera className="h-5 w-5 text-accent-info" />
                    </div>
                    <div>
                      <h2 className="font-heading text-lg font-bold text-ink">Pre-Ride Documentation</h2>
                      <p className="text-dossier-caption text-ink-subtle">Baseline condition photos at checkout</p>
                    </div>
                  </div>
                  <Badge variant="info" style="chip">{preRidePhotos.length} Photos</Badge>
                </div>

                <div className="p-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {preRidePhotos.map((photo, index) => (
                      <button
                        key={`${photo}-${index}`}
                        type="button"
                        onClick={() => setSelectedImage(photo)}
                        className="group relative overflow-hidden rounded-dossier-surface border border-rule bg-surface shadow-dossier-recessed transition hover:border-accent-info hover:shadow-dossier"
                        aria-label={`Open pre-ride photo ${index + 1}`}
                      >
                        <div className="relative h-48 w-full">
                          <Image
                            src={photo}
                            alt={`Pre-ride photo ${index + 1}`}
                            fill
                            unoptimized
                            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition group-hover:bg-ink/10">
                            <span className="rounded-dossier-chip bg-ink/80 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                              Click to enlarge
                            </span>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/60 to-transparent p-3">
                          <span className="font-mono text-xs font-semibold text-white">
                            PRE-{String(index + 1).padStart(2, "0")}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Checkout Evidence */}
            <section className="dossier-panel overflow-hidden">
              <div className="dossier-header-strip">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-dossier-control bg-accent-success/10">
                    <Fingerprint className="h-5 w-5 text-accent-success" />
                  </div>
                  <div>
                    <h2 className="font-heading text-lg font-bold text-ink">Return Documentation</h2>
                    <p className="text-dossier-caption text-ink-subtle">End-of-session condition evidence</p>
                  </div>
                </div>
                {checkoutPhoto && <Badge variant="success" style="chip">Documented</Badge>}
              </div>

              <div className="p-6">
                {checkoutPhoto ? (
                  <button
                    type="button"
                    onClick={() => setSelectedImage(checkoutPhoto)}
                    className="group relative w-full overflow-hidden rounded-dossier-surface border border-rule bg-surface shadow-dossier-recessed transition hover:border-accent-success hover:shadow-dossier"
                    aria-label="Open checkout photo"
                  >
                    <div className="relative h-80 w-full">
                      <Image
                        src={checkoutPhoto}
                        alt="Checkout photo"
                        fill
                        unoptimized
                        sizes="100vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition group-hover:bg-ink/10">
                        <span className="rounded-dossier-chip bg-ink/80 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                          Click to enlarge
                        </span>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/60 to-transparent p-4">
                      <span className="font-mono text-xs font-semibold text-white uppercase tracking-wider">
                        Return Photo
                      </span>
                    </div>
                  </button>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-dossier-surface border-2 border-dashed border-rule bg-paper py-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-muted/10 mb-3">
                      <ImageIcon className="h-6 w-6 text-ink-muted" />
                    </div>
                    <p className="text-sm font-semibold text-ink-subtle">No Return Photo</p>
                    <p className="text-xs text-ink-muted mt-1">Session ended without checkout documentation</p>
                  </div>
                )}
              </div>
            </section>

            {/* Forensic Banner */}
            <ForensicBanner rentalId={rental.id} timestamp={rental.created_at} />
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 dossier-overlay"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Evidence photo viewer"
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="relative w-full h-full max-w-6xl max-h-[90vh]"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Selected evidence photo"
              fill
              unoptimized
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {/* Evidence Label */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-dossier-chip bg-ink/80 px-4 py-2 backdrop-blur-sm">
            <p className="font-mono text-xs font-semibold text-white uppercase tracking-wider">
              Evidence Photo • Case #{rental.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
