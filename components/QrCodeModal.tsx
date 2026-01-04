"use client";

import QRCode from "react-qr-code";
import { Download, Printer, X, Monitor, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Host branding interface for customized asset tags
interface HostBranding {
  propertyName: string;
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

/**
 * Generates a short asset identifier from the vehicle ID
 * @param vehicleId - Full vehicle/asset ID
 * @returns Formatted asset ID like "UNIT-A1B2"
 */
function generateAssetId(vehicleId: string): string {
  const shortId = vehicleId.slice(0, 4).toUpperCase();
  return `UNIT-${shortId}`;
}

/**
 * AssetTagPrintable - The 4x6 asset tag component using CSS classes
 * Used both for screen preview (scaled via wrapper) and print (full size)
 */
function AssetTagPrintable({
  rentalUrl,
  assetId,
  hostBranding,
}: {
  rentalUrl: string;
  assetId: string;
  hostBranding?: HostBranding;
}) {
  const shortId = generateAssetId(assetId);
  const propertyName = hostBranding?.propertyName || "Property Manager";
  const phone = hostBranding?.phone;

  return (
    <article
      className="asset-tag-printable"
      aria-label="Vehicle Asset Tag"
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
          <QRCode
            value={rentalUrl}
            size={160}
            level="H"
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
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
          {shortId}
          {phone && ` | Support: ${phone}`}
        </p>
      </footer>
    </article>
  );
}

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
  const printContainerRef = useRef<HTMLDivElement>(null);

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

  const rentalUrl = `${origin}/rental/${assetId}`;

  /**
   * Handles printing the asset tag with proper body class management
   * 1. Adds print-mode class to body
   * 2. Hides modal backdrop
   * 3. Shows only printable tag
   * 4. Triggers window.print()
   * 5. Restores normal view after print dialog closes
   */
  const handlePrint = useCallback(() => {
    // Wait for fonts if not loaded
    if (!fontsLoaded) {
      console.warn("Fonts not yet loaded, waiting...");
      document.fonts?.ready.then(() => {
        handlePrint();
      });
      return;
    }

    // Add print-mode class to body
    document.body.classList.add("print-mode");

    // Small delay to ensure styles apply before printing
    requestAnimationFrame(() => {
      window.print();

      // Listen for after print to restore normal view
      const afterPrint = () => {
        document.body.classList.remove("print-mode");
        window.removeEventListener("afterprint", afterPrint);
      };

      window.addEventListener("afterprint", afterPrint);

      // Fallback: remove class after a timeout if afterprint doesn't fire
      setTimeout(() => {
        document.body.classList.remove("print-mode");
      }, 1000);
    });
  }, [fontsLoaded]);

  /**
   * Generates and downloads a PDF of the asset tag at 4x6 inch dimensions
   * Uses html2canvas to capture the element and jsPDF for PDF generation
   */
  const handleDownloadPDF = useCallback(async () => {
    setIsGeneratingPDF(true);

    try {
      // Wait for fonts to load before capturing
      if (typeof document !== "undefined" && document.fonts) {
        await document.fonts.ready;
      }

      // Find the printable asset tag element
      const printableElement = printContainerRef.current?.querySelector(
        ".asset-tag-printable"
      ) as HTMLElement | null;

      if (!printableElement) {
        throw new Error("Asset tag element not found");
      }

      // PDF dimensions: 4x6 inches at 300 DPI for high quality
      const DPI = 300;
      const PDF_WIDTH_INCHES = 4;
      const PDF_HEIGHT_INCHES = 6;
      const PDF_WIDTH_PX = PDF_WIDTH_INCHES * DPI;
      const PDF_HEIGHT_PX = PDF_HEIGHT_INCHES * DPI;

      // Capture the asset tag element as canvas with high resolution
      const canvas = await html2canvas(printableElement, {
        scale: DPI / 96, // Scale up from screen DPI (96) to print DPI (300)
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#FFFFFF",
        logging: false,
        // Ensure QR code renders clearly
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Ensure cloned element has proper sizing for capture
          const clonedElement = clonedDoc.querySelector(
            ".asset-tag-printable"
          ) as HTMLElement | null;
          if (clonedElement) {
            clonedElement.style.transform = "none";
            clonedElement.style.width = "4in";
            clonedElement.style.height = "6in";
          }
        },
      });

      // Create PDF with exact 4x6 inch dimensions
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: [PDF_WIDTH_INCHES, PDF_HEIGHT_INCHES],
        compress: true,
      });

      // Convert canvas to image and add to PDF
      const imgData = canvas.toDataURL("image/jpeg", 0.85); // Medium quality JPEG for smaller file size

      // Add image to fill the entire PDF page
      pdf.addImage(imgData, "JPEG", 0, 0, PDF_WIDTH_INCHES, PDF_HEIGHT_INCHES);

      // Generate filename with sanitized vehicle name and short ID
      const shortId = generateAssetId(assetId).replace("UNIT-", "");
      const sanitizedName = assetName
        .replace(/[^a-zA-Z0-9\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .toLowerCase()
        .slice(0, 30); // Truncate long names
      const filename = `asset-tag-${sanitizedName}-${shortId}.pdf`;

      // Trigger download
      pdf.save(filename);
    } catch (error) {
      console.error("PDF generation failed:", error);

      // User-friendly error message
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Failed to generate PDF: ${errorMessage}\n\nPlease try again or use the Print option instead.`);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [assetId, assetName]);

  if (!isOpen) return null;

  return (
    <>
      {/* Modal backdrop */}
      <div
        className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print-hide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl print-hide">
          {/* Close button */}
          <button
            type="button"
            className="absolute right-4 top-4 p-1 text-slate-400 transition hover:text-slate-600 rounded-full hover:bg-slate-100"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <header className="px-6 pt-6 pb-4 border-b border-slate-100">
            <h2
              id="modal-title"
              className="text-xl font-bold text-slate-900"
            >
              Print Vehicle Asset Tag
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Print this tag on 4×6 label paper and affix to your golf cart
            </p>
            <p className="mt-2 text-xs text-slate-400 font-mono">
              {assetName}
            </p>
          </header>

          {/* Mobile print warning */}
          <div className="mobile-print-warning mx-6 mt-4">
            <span className="mobile-print-warning-icon">
              <Monitor className="inline h-4 w-4" />
            </span>
            Best printed from a desktop computer for accurate 4×6 sizing
          </div>

          {/* Preview area with scaled wrapper */}
          <div className="asset-tag-preview-container mx-6 my-4" ref={printContainerRef}>
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
              disabled={!fontsLoaded}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="h-4 w-4" />
              {fontsLoaded ? "Print Asset Tag" : "Loading fonts..."}
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF || !fontsLoaded}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isGeneratingPDF ? "Generating..." : "Download PDF"}
            </button>
          </footer>
        </div>
      </div>
    </>
  );
}
