"use client";

import { useState, useCallback, useRef, useMemo, memo, useEffect } from "react";
import QRCode from "react-qr-code";
import {
  Printer,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Download,
  FileText,
} from "lucide-react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";

/** Host branding interface for customized asset tags */
interface HostBranding {
  propertyName?: string;
  phone?: string;
  logoUrl?: string;
}

/** Vehicle/Cart type for batch printing */
interface Vehicle {
  id: string;
  name: string;
}

interface BatchAssetTagPrintProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  hostBranding?: HostBranding;
}

/** Maximum vehicles per batch to prevent browser freeze */
const MAX_VEHICLES_PER_BATCH = 50;

/** Number of tags to process at a time */
const BATCH_SIZE = 5;

/** Delay between batches in ms to prevent UI freeze */
const BATCH_DELAY_MS = 100;

/** Default property name when none is provided */
const DEFAULT_PROPERTY_NAME = "CartHost Property";

/** Toast notification duration in milliseconds */
const TOAST_DURATION = 4000;

/**
 * Generates a short asset identifier from the vehicle ID
 */
function generateAssetId(vehicleId: string): string {
  if (!vehicleId || typeof vehicleId !== "string") {
    return "";
  }
  const shortId = vehicleId.slice(0, 4).toUpperCase();
  return `UNIT-${shortId}`;
}

/**
 * Sanitizes text for safe display
 */
function sanitizeDisplayText(text: string | undefined | null): string {
  if (!text) return "";
  return text.replace(/[\x00-\x1F\x7F]/g, "").trim();
}

/**
 * Toast notification component
 */
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "warning";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-600"
      : type === "warning"
        ? "bg-amber-600"
        : "bg-red-600";

  const Icon =
    type === "success"
      ? CheckCircle
      : type === "warning"
        ? AlertTriangle
        : AlertCircle;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white transition-all animate-in slide-in-from-bottom-4 ${bgColor}`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

/**
 * Asset tag component for batch rendering (used for PDF generation)
 */
const AssetTagForPDF = memo(function AssetTagForPDF({
  vehicleId,
  rentalUrl,
  hostBranding,
}: {
  vehicleId: string;
  rentalUrl: string;
  hostBranding?: HostBranding;
}) {
  const shortId = generateAssetId(vehicleId);
  const propertyName =
    sanitizeDisplayText(hostBranding?.propertyName) || DEFAULT_PROPERTY_NAME;
  const phone = sanitizeDisplayText(hostBranding?.phone);

  return (
    <article
      className="asset-tag-printable"
      style={{
        width: "4in",
        height: "6in",
        pageBreakAfter: "always",
        pageBreakInside: "avoid",
      }}
    >
      {/* TOP BAR */}
      <header className="asset-tag-header">
        <span className="asset-tag-header-label">Operational Asset</span>
        <span className="asset-tag-header-brand">CartHost</span>
      </header>

      {/* HERO SECTION - QR Code */}
      <section className="asset-tag-qr-section">
        <div className="asset-tag-qr-wrapper">
          <QRCode
            value={rentalUrl}
            size={160}
            level="H"
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="asset-tag-cta">
        <h2 className="asset-tag-cta-text">Scan to Start</h2>
      </section>

      {/* FOOTER */}
      <footer className="asset-tag-footer">
        <p className="asset-tag-footer-manager">Managed by: {propertyName}</p>
        <p className="asset-tag-footer-id">
          {shortId || "UNIT-XXXX"}
          {phone && ` | Support: ${phone}`}
        </p>
      </footer>
    </article>
  );
});

/**
 * Progress state for batch generation
 */
interface GenerationProgress {
  current: number;
  total: number;
  status: "idle" | "generating" | "complete" | "cancelled" | "error";
  errorMessage?: string;
}

/**
 * BatchAssetTagPrint - Modal for generating and downloading
 * PDF asset tags for multiple vehicles at once.
 */
export default function BatchAssetTagPrint({
  isOpen,
  onClose,
  vehicles,
  hostBranding,
}: BatchAssetTagPrintProps) {
  const [showConfirmation, setShowConfirmation] = useState(true);
  const [progress, setProgress] = useState<GenerationProgress>({
    current: 0,
    total: 0,
    status: "idle",
  });
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "warning";
  } | null>(null);

  const cancelRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setShowConfirmation(true);
      setProgress({ current: 0, total: 0, status: "idle" });
      cancelRef.current = false;
    }
  }, [isOpen]);

  // Get origin for rental URLs
  const origin = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "";
  }, []);

  // Calculate if we're over the limit
  const isOverLimit = vehicles.length > MAX_VEHICLES_PER_BATCH;
  const vehiclesToProcess = isOverLimit
    ? vehicles.slice(0, MAX_VEHICLES_PER_BATCH)
    : vehicles;

  /**
   * Generate batch PDF with progress tracking
   */
  const handleGeneratePDF = useCallback(async () => {
    if (!origin) return;

    setShowConfirmation(false);
    cancelRef.current = false;

    const total = vehiclesToProcess.length;
    setProgress({ current: 0, total, status: "generating" });

    try {
      // Dynamic imports for better performance
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const html2canvas = html2canvasModule.default;
      const { jsPDF } = jsPDFModule;

      // Wait for fonts
      if (typeof document !== "undefined" && document.fonts) {
        await document.fonts.ready;
      }

      // PDF dimensions: 4x6 inches
      const DPI = 300;
      const PDF_WIDTH_INCHES = 4;
      const PDF_HEIGHT_INCHES = 6;

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: [PDF_WIDTH_INCHES, PDF_HEIGHT_INCHES],
        compress: true,
      });

      // Process vehicles in batches
      for (let i = 0; i < total; i++) {
        // Check for cancellation
        if (cancelRef.current) {
          setProgress((prev) => ({ ...prev, status: "cancelled" }));
          return;
        }

        const vehicle = vehiclesToProcess[i];
        const rentalUrl = `${origin}/rental/${vehicle.id}`;

        // Create temporary container for this tag
        const tempContainer = document.createElement("div");
        tempContainer.style.position = "absolute";
        tempContainer.style.left = "-9999px";
        tempContainer.style.top = "0";
        document.body.appendChild(tempContainer);

        // Create React root and render tag
        const { createRoot } = await import("react-dom/client");
        const root = createRoot(tempContainer);

        await new Promise<void>((resolve) => {
          root.render(
            <AssetTagForPDF
              vehicleId={vehicle.id}
              rentalUrl={rentalUrl}
              hostBranding={hostBranding}
            />
          );
          // Wait for render
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        });

        // Find the tag element
        const tagElement = tempContainer.querySelector(
          ".asset-tag-printable"
        ) as HTMLElement;

        if (tagElement) {
          // Capture as canvas
          const canvas = await html2canvas(tagElement, {
            scale: DPI / 96,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#FFFFFF",
            logging: false,
            imageTimeout: 15000,
          });

          // Add page (except for first)
          if (i > 0) {
            pdf.addPage([PDF_WIDTH_INCHES, PDF_HEIGHT_INCHES], "portrait");
          }

          // Add image to PDF
          const imgData = canvas.toDataURL("image/jpeg", 0.85);
          pdf.addImage(imgData, "JPEG", 0, 0, PDF_WIDTH_INCHES, PDF_HEIGHT_INCHES);
        }

        // Cleanup
        root.unmount();
        document.body.removeChild(tempContainer);

        // Update progress
        setProgress({ current: i + 1, total, status: "generating" });

        // Small delay between batches to prevent UI freeze
        if ((i + 1) % BATCH_SIZE === 0 && i < total - 1) {
          await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
        }
      }

      // Check for cancellation one more time
      if (cancelRef.current) {
        setProgress((prev) => ({ ...prev, status: "cancelled" }));
        return;
      }

      // Generate filename
      const propertyName =
        sanitizeDisplayText(hostBranding?.propertyName) || "property";
      const sanitizedPropertyName = propertyName
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
        .slice(0, 20);
      const date = new Date().toISOString().split("T")[0];
      const filename = `asset-tags-all-${sanitizedPropertyName}-${date}.pdf`;

      // Save PDF
      pdf.save(filename);

      setProgress({ current: total, total, status: "complete" });
      setToast({
        message: `Successfully generated ${total} asset tags!`,
        type: "success",
      });

      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setProgress({
        current: 0,
        total,
        status: "error",
        errorMessage,
      });
      setToast({ message: `Failed to generate PDF: ${errorMessage}`, type: "error" });
    }
  }, [origin, vehiclesToProcess, hostBranding, onClose]);

  /**
   * Cancel generation
   */
  const handleCancel = useCallback(() => {
    if (progress.status === "generating") {
      cancelRef.current = true;
      setToast({ message: "Generation cancelled", type: "warning" });
    }
    onClose();
  }, [progress.status, onClose]);

  if (!isOpen) return null;

  const progressPercent =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title="Print All Asset Tags"
        subtitle={`Generate PDF with ${vehiclesToProcess.length} asset tags`}
        size="md"
        closeOnEscape={progress.status !== "generating"}
        closeOnOverlay={progress.status !== "generating"}
        footer={
          showConfirmation ? (
            <>
              <Button variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleGeneratePDF}
                icon={<Download className="h-4 w-4" />}
              >
                Generate PDF
              </Button>
            </>
          ) : progress.status === "generating" ? (
            <Button variant="destructive" onClick={handleCancel}>
              Cancel Generation
            </Button>
          ) : progress.status === "complete" ? (
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          ) : (
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          )
        }
      >
        <div ref={containerRef} className="space-y-6">
          {/* Confirmation View */}
          {showConfirmation && (
            <>
              {/* Warning for over limit */}
              {isOverLimit && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Too many vehicles selected
                    </p>
                    <p className="mt-1 text-sm text-amber-700">
                      Maximum {MAX_VEHICLES_PER_BATCH} vehicles per batch. Only the
                      first {MAX_VEHICLES_PER_BATCH} will be included. You have{" "}
                      {vehicles.length} vehicles total.
                    </p>
                  </div>
                </div>
              )}

              {/* Confirmation message */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <FileText className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Generate asset tags for {vehiclesToProcess.length} vehicles?
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    This will create a multi-page PDF with one 4×6 asset tag per
                    page, ready for printing.
                  </p>
                </div>
              </div>

              {/* Vehicle list preview */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Vehicles to include
                </p>
                <div className="max-h-48 overflow-y-auto border border-rule rounded-lg divide-y divide-rule">
                  {vehiclesToProcess.map((vehicle, index) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center gap-3 px-3 py-2 text-sm"
                    >
                      <span className="text-ink-muted font-mono text-xs w-6">
                        {index + 1}.
                      </span>
                      <span className="font-medium text-ink truncate flex-1">
                        {vehicle.name}
                      </span>
                      <span className="text-ink-muted font-mono text-xs">
                        {generateAssetId(vehicle.id)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Progress View */}
          {!showConfirmation && progress.status === "generating" && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-accent-ops" />
                <div className="text-center">
                  <p className="text-lg font-semibold text-ink">
                    Generating tag {progress.current} of {progress.total}...
                  </p>
                  <p className="text-sm text-ink-muted mt-1">
                    Please wait while we create your PDF
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-ink-muted">
                  <span>Progress</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-ops transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Complete View */}
          {!showConfirmation && progress.status === "complete" && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-ink">
                  PDF Generated Successfully!
                </p>
                <p className="text-sm text-ink-muted mt-1">
                  {progress.total} asset tags have been downloaded
                </p>
              </div>
            </div>
          )}

          {/* Cancelled View */}
          {!showConfirmation && progress.status === "cancelled" && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-amber-100">
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-ink">
                  Generation Cancelled
                </p>
                <p className="text-sm text-ink-muted mt-1">
                  {progress.current} of {progress.total} tags were processed
                </p>
              </div>
            </div>
          )}

          {/* Error View */}
          {!showConfirmation && progress.status === "error" && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-ink">
                  Generation Failed
                </p>
                <p className="text-sm text-red-600 mt-1">
                  {progress.errorMessage || "An unknown error occurred"}
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
