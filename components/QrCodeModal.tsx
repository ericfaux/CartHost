"use client";

import QRCode from "react-qr-code";
import { Download, Printer, X, Monitor, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useEffect, useState, useCallback, useRef, useMemo, memo } from "react";

/**
 * TESTING CHECKLIST:
 * - [ ] QR codes scan correctly
 * - [ ] Print works in Chrome, Safari, Firefox
 * - [ ] PDF downloads with correct filename
 * - [ ] Missing data handled gracefully
 * - [ ] Modal closes properly
 * - [ ] No console errors
 */

/** Host branding interface for customized asset tags */
interface HostBranding {
  propertyName?: string;
  phone?: string;
  logoUrl?: string;
}

type QrCodeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
  assetName: string;
  hostBranding?: HostBranding;
};

/** Maximum length for vehicle name display before truncation */
const MAX_VEHICLE_NAME_LENGTH = 25;

/** Default property name when none is provided */
const DEFAULT_PROPERTY_NAME = "CartHost Property";

/** Toast notification duration in milliseconds */
const TOAST_DURATION = 3000;

/** Debounce delay for print button in milliseconds */
const PRINT_DEBOUNCE_MS = 500;

/**
 * Toast notification component for user feedback
 */
function Toast({
  message,
  type,
  onClose
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-all animate-in slide-in-from-bottom-4 ${
        type === "success"
          ? "bg-green-600 text-white"
          : "bg-red-600 text-white"
      }`}
    >
      {type === "success" ? (
        <CheckCircle className="h-5 w-5" aria-hidden="true" />
      ) : (
        <AlertCircle className="h-5 w-5" aria-hidden="true" />
      )}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

/**
 * Generates a short asset identifier from the vehicle ID
 * @param vehicleId - Full vehicle/asset ID
 * @returns Formatted asset ID like "UNIT-A1B2" or empty string if invalid
 */
function generateAssetId(vehicleId: string): string {
  if (!vehicleId || typeof vehicleId !== "string") {
    return "";
  }
  const shortId = vehicleId.slice(0, 4).toUpperCase();
  return `UNIT-${shortId}`;
}

/**
 * Truncates text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text || "";
  }
  return `${text.slice(0, maxLength).trim()}…`;
}

/**
 * Sanitizes text for safe display (removes control characters, trims)
 * @param text - Text to sanitize
 * @returns Sanitized text safe for display
 */
function sanitizeDisplayText(text: string | undefined | null): string {
  if (!text) return "";
  return text
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
    .trim();
}

/**
 * Validates that a URL is properly formatted for QR code generation
 * @param url - URL to validate
 * @returns True if URL is valid
 */
function isValidQrUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * AssetTagPrintable - The 4x6 asset tag component using CSS classes
 * Used both for screen preview (scaled via wrapper) and print (full size)
 * @param rentalUrl - URL encoded in QR code
 * @param assetId - Vehicle/asset ID for display
 * @param hostBranding - Optional branding customization
 */
const AssetTagPrintable = memo(function AssetTagPrintable({
  rentalUrl,
  assetId,
  hostBranding,
}: {
  rentalUrl: string;
  assetId: string;
  hostBranding?: HostBranding;
}) {
  const shortId = generateAssetId(assetId);
  const propertyName = sanitizeDisplayText(hostBranding?.propertyName) || DEFAULT_PROPERTY_NAME;
  const phone = sanitizeDisplayText(hostBranding?.phone);

  // Validate QR data
  const isValidUrl = isValidQrUrl(rentalUrl);

  return (
    <article
      className="asset-tag-printable"
      aria-label="Vehicle Asset Tag"
      role="img"
    >
      {/* TOP BAR - 15% height */}
      <header className="asset-tag-header">
        <span className="asset-tag-header-label">
          Operational Asset
        </span>
        <span className="asset-tag-header-brand">
          CartHost
        </span>
      </header>

      {/* HERO SECTION - QR Code - 50% height */}
      <section className="asset-tag-qr-section" aria-label="QR Code">
        <div className="asset-tag-qr-wrapper">
          {isValidUrl ? (
            <QRCode
              value={rentalUrl}
              size={160}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#000000"
              title={`QR code linking to rental page for ${shortId || "this vehicle"}`}
              aria-label={`Scannable QR code for vehicle ${shortId || assetId}`}
            />
          ) : (
            <div
              className="flex items-center justify-center w-40 h-40 bg-slate-100 rounded-lg"
              role="alert"
              aria-label="QR code unavailable"
            >
              <AlertCircle className="h-8 w-8 text-slate-400" aria-hidden="true" />
            </div>
          )}
        </div>
      </section>

      {/* CTA SECTION - 15% height */}
      <section className="asset-tag-cta" aria-label="Call to action">
        <h2 className="asset-tag-cta-text">
          Scan to Start
        </h2>
      </section>

      {/* FOOTER - 20% height */}
      <footer className="asset-tag-footer">
        <p className="asset-tag-footer-manager">
          Managed by: {propertyName}
        </p>
        <p className="asset-tag-footer-id">
          {shortId || "UNIT-XXXX"}
          {phone && ` | Support: ${phone}`}
        </p>
      </footer>
    </article>
  );
});

/**
 * QrCodeModal - Modal for generating, previewing, printing, and downloading
 * vehicle asset tags with QR codes.
 *
 * Features:
 * - 4x6 inch asset tag preview with scaling
 * - Print functionality with proper CSS handling
 * - PDF download at 300 DPI
 * - Keyboard accessibility (Escape to close)
 * - Error handling and user feedback
 */
export default function QrCodeModal({
  isOpen,
  onClose,
  assetId,
  assetName,
  hostBranding,
}: QrCodeModalProps) {
  const [origin, setOrigin] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isPrintPending, setIsPrintPending] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const printContainerRef = useRef<HTMLDivElement>(null);
  const printDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Set origin on client side
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Check if fonts are loaded before allowing print
  useEffect(() => {
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    } else {
      // Fallback for browsers without font loading API
      setFontsLoaded(true);
    }
  }, []);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap and initial focus
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus the modal for accessibility
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (printDebounceRef.current) {
        clearTimeout(printDebounceRef.current);
      }
    };
  }, []);

  // Validate assetId and generate rental URL
  const rentalUrl = useMemo(() => {
    if (!origin) return "";
    if (!assetId || typeof assetId !== "string") {
      setQrError("Invalid vehicle ID");
      return "";
    }
    return `${origin}/rental/${assetId}`;
  }, [origin, assetId]);

  // Clear error when valid
  useEffect(() => {
    if (rentalUrl && isValidQrUrl(rentalUrl)) {
      setQrError(null);
    }
  }, [rentalUrl]);

  // Memoize truncated asset name for display
  const displayAssetName = useMemo(() => {
    return truncateText(sanitizeDisplayText(assetName), MAX_VEHICLE_NAME_LENGTH);
  }, [assetName]);

  /**
   * Shows a toast notification to the user
   */
  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
  }, []);

  /**
   * Handles printing the asset tag using a new window approach
   * This avoids CSS inheritance issues where visibility:hidden on parent
   * elements prevents children from being visible, even with overrides.
   * Includes debounce to prevent double-clicks.
   */
  const handlePrint = useCallback(() => {
    // Debounce to prevent double-clicks
    if (isPrintPending) return;

    setIsPrintPending(true);

    // Clear any existing debounce timer
    if (printDebounceRef.current) {
      clearTimeout(printDebounceRef.current);
    }

    // Wait for fonts if not loaded
    if (!fontsLoaded) {
      document.fonts?.ready.then(() => {
        handlePrint();
      });
      setIsPrintPending(false);
      return;
    }

    // Get the current values
    const propertyName = hostBranding?.propertyName?.trim() || DEFAULT_PROPERTY_NAME;
    const phone = hostBranding?.phone?.trim() || "";
    const shortId = assetId ? `UNIT-${assetId.slice(0, 4).toUpperCase()}` : "UNIT-XXXX";

    // Find the QR code SVG from the current modal
    const qrWrapper = printContainerRef.current?.querySelector('.asset-tag-qr-wrapper');
    const qrSvg = qrWrapper?.innerHTML || '';

    // Open a new print window with standalone content
    const printWindow = window.open("", "_blank", "width=450,height=650");

    if (!printWindow) {
      showToast("Please allow popups to print", "error");
      setIsPrintPending(false);
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Asset Tag - ${shortId}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

            * { margin: 0; padding: 0; box-sizing: border-box; }

            @page { size: 4in 6in; margin: 0; }

            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color-adjust: exact;
            }

            .asset-tag {
              width: 4in;
              height: 6in;
              background: #ffffff;
              border: 2px solid #000000;
              display: flex;
              flex-direction: column;
              font-family: 'Inter', system-ui, sans-serif;
              overflow: hidden;
            }

            .header {
              height: 15%;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0 1rem;
              background: #1a1a1a;
              color: #ffffff;
            }

            .header-label {
              font-family: 'Space Mono', monospace;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.1em;
            }

            .header-brand {
              font-weight: 700;
              font-size: 16px;
            }

            .qr-section {
              height: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #ffffff;
            }

            .qr-wrapper {
              padding: 0.5rem;
              background: #ffffff;
            }

            .qr-wrapper svg {
              width: 160px;
              height: 160px;
            }

            .cta {
              height: 15%;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #ffffff;
            }

            .cta-text {
              font-weight: 700;
              font-size: 24px;
              color: #0F766E;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }

            .footer {
              height: 20%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 0 1rem;
              background: #f5f5f5;
            }

            .footer-manager {
              font-size: 11px;
              color: #374151;
              text-align: center;
            }

            .footer-id {
              font-size: 11px;
              color: #6b7280;
              text-align: center;
              margin-top: 4px;
            }

            @media print {
              body { margin: 0 !important; }
              .asset-tag { border-radius: 0 !important; }
            }
          </style>
        </head>
        <body>
          <article class="asset-tag">
            <header class="header">
              <span class="header-label">Operational Asset</span>
              <span class="header-brand">CartHost</span>
            </header>
            <section class="qr-section">
              <div class="qr-wrapper">${qrSvg}</div>
            </section>
            <section class="cta">
              <h2 class="cta-text">Scan to Start</h2>
            </section>
            <footer class="footer">
              <p class="footer-manager">Managed by: ${propertyName}</p>
              <p class="footer-id">${shortId}${phone ? ' | Support: ' + phone : ''}</p>
            </footer>
          </article>
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
        setIsPrintPending(false);
      }, 500);
    }, 800);

  }, [fontsLoaded, isPrintPending, assetId, hostBranding, showToast]);

  /**
   * Generates and downloads a PDF of the asset tag at 4x6 inch dimensions
   * Uses dynamic imports for html2canvas and jspdf to reduce initial bundle size
   *
   * CRITICAL: Clones the element to a temporary container OUTSIDE the scaled
   * wrapper to avoid text cutoff from transform: scale(0.75) applied in preview
   */
  const handleDownloadPDF = useCallback(async () => {
    // Validate inputs before proceeding
    if (!assetId) {
      showToast("Cannot generate PDF: Invalid vehicle ID", "error");
      return;
    }

    setIsGeneratingPDF(true);

    try {
      // Dynamic imports for better performance (lazy loading)
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const html2canvas = html2canvasModule.default;
      const { jsPDF } = jsPDFModule;

      // Wait for fonts to load before capturing
      if (typeof document !== "undefined" && document.fonts) {
        await document.fonts.ready;
      }

      // Find the original printable element
      const originalElement = printContainerRef.current?.querySelector(
        ".asset-tag-printable"
      ) as HTMLElement | null;

      if (!originalElement) {
        throw new Error("Asset tag element not found");
      }

      // CRITICAL FIX: Clone the element to a temporary container OUTSIDE the scaled wrapper
      const tempContainer = document.createElement("div");
      tempContainer.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 4in;
        height: 6in;
        background: white;
        z-index: -9999;
        overflow: visible;
      `;
      document.body.appendChild(tempContainer);

      // Clone the asset tag
      const clonedElement = originalElement.cloneNode(true) as HTMLElement;

      // CRITICAL: Remove all transforms and set explicit dimensions
      clonedElement.style.cssText = `
        width: 4in !important;
        height: 6in !important;
        transform: none !important;
        margin: 0 !important;
        padding: 0 !important;
        position: relative !important;
        display: flex !important;
        flex-direction: column !important;
        border: 2px solid #000 !important;
        border-radius: 8px !important;
        overflow: hidden !important;
        background: #ffffff !important;
      `;

      tempContainer.appendChild(clonedElement);

      // Small delay to ensure styles are applied
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      // PDF dimensions: 4x6 inches at 300 DPI for high quality
      const DPI = 300;
      const PDF_WIDTH_INCHES = 4;
      const PDF_HEIGHT_INCHES = 6;

      // Capture from the CLONED element (not the original)
      const canvas = await html2canvas(clonedElement, {
        scale: DPI / 96, // Scale up from screen DPI (96) to print DPI (300)
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#FFFFFF",
        logging: false,
        imageTimeout: 15000,
        width: 4 * 96, // 4 inches at 96 DPI
        height: 6 * 96, // 6 inches at 96 DPI
      });

      // Clean up temporary container
      document.body.removeChild(tempContainer);

      // Create PDF with exact 4x6 inch dimensions
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: [PDF_WIDTH_INCHES, PDF_HEIGHT_INCHES],
        compress: true,
      });

      // Convert canvas to image and add to PDF
      const imgData = canvas.toDataURL("image/jpeg", 0.92);

      // Add image to fill the entire PDF page
      pdf.addImage(imgData, "JPEG", 0, 0, PDF_WIDTH_INCHES, PDF_HEIGHT_INCHES);

      // Generate filename with sanitized vehicle name and short ID
      const shortId = generateAssetId(assetId).replace("UNIT-", "") || "XXXX";
      const sanitizedName = (assetName || "vehicle")
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
        .slice(0, 30) || "asset";
      const filename = `asset-tag-${sanitizedName}-${shortId}.pdf`;

      // Trigger download
      pdf.save(filename);

      // Show success toast
      showToast("PDF downloaded successfully!", "success");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      showToast(`Failed to generate PDF: ${errorMessage}`, "error");
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [assetId, assetName, showToast]);

  // Don't render if not open
  if (!isOpen) return null;

  // Show error state if QR generation failed
  const hasError = Boolean(qrError) || !assetId;

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

      {/* Modal backdrop */}
      <div
        className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print-hide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        onClick={(e) => {
          // Close on backdrop click
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          ref={modalRef}
          className="relative w-full max-w-md rounded-xl bg-white shadow-2xl print-hide"
          tabIndex={-1}
          role="document"
        >
          {/* Close button */}
          <button
            type="button"
            className="absolute right-4 top-4 p-1 text-slate-400 transition hover:text-slate-600 rounded-full hover:bg-slate-100"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Header */}
          <header className="px-6 pt-6 pb-4 border-b border-slate-100">
            <h2
              id="modal-title"
              className="text-xl font-bold text-slate-900"
            >
              Print Vehicle Asset Tag
            </h2>
            <p id="modal-description" className="mt-1 text-sm text-slate-500">
              Print this tag on 4×6 label paper and affix to your golf cart
            </p>
            <p
              className="mt-2 text-xs text-slate-400 font-mono"
              title={assetName || "Unknown vehicle"}
            >
              {displayAssetName || "Unknown Vehicle"}
            </p>
          </header>

          {/* Error state */}
          {hasError && (
            <div
              className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
              role="alert"
            >
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" aria-hidden="true" />
                <p className="text-sm font-medium">
                  {qrError || "Unable to generate QR code: Missing vehicle ID"}
                </p>
              </div>
            </div>
          )}

          {/* Mobile print warning */}
          <div
            className="mobile-print-warning mx-6 mt-4"
            role="note"
            aria-label="Print recommendation"
          >
            <span className="mobile-print-warning-icon" aria-hidden="true">
              <Monitor className="inline h-4 w-4" />
            </span>
            Best printed from a desktop computer for accurate 4×6 sizing
          </div>

          {/* Preview area with scaled wrapper */}
          <div
            className="asset-tag-preview-container mx-6 my-4"
            ref={printContainerRef}
            aria-label="Asset tag preview"
          >
            <div className="asset-tag-preview-wrapper">
              <AssetTagPrintable
                rentalUrl={rentalUrl}
                assetId={assetId}
                hostBranding={hostBranding}
              />
            </div>
          </div>

          {/* Print info */}
          <div className="px-6 pb-2">
            <p className="text-xs text-slate-400 text-center">
              Preview shown at 75% scale • Prints at exact 4″ × 6″
            </p>
          </div>

          {/* Action buttons */}
          <footer className="px-6 py-4 border-t border-slate-100 flex gap-3">
            <button
              type="button"
              onClick={handlePrint}
              disabled={!fontsLoaded || isPrintPending || hasError}
              aria-label={
                !fontsLoaded
                  ? "Loading fonts, please wait"
                  : isPrintPending
                    ? "Print in progress"
                    : "Print asset tag to 4 by 6 inch paper"
              }
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPrintPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Printer className="h-4 w-4" aria-hidden="true" />
              )}
              {!fontsLoaded
                ? "Loading fonts..."
                : isPrintPending
                  ? "Printing..."
                  : "Print Asset Tag"}
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF || !fontsLoaded || hasError}
              aria-label={
                isGeneratingPDF
                  ? "Generating PDF, please wait"
                  : "Download asset tag as PDF file"
              }
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="h-4 w-4" aria-hidden="true" />
              )}
              {isGeneratingPDF ? "Generating..." : "Download PDF"}
            </button>
          </footer>
        </div>
      </div>
    </>
  );
}
