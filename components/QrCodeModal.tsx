"use client";

import QRCode from "react-qr-code";
import { Download, Printer, X, Monitor } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";

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
   * Placeholder for PDF download functionality
   * TODO: Implement PDF generation using html2canvas + jsPDF or similar
   */
  const handleDownloadPDF = useCallback(async () => {
    setIsGeneratingPDF(true);
    try {
      // TODO: Implement PDF generation
      // 1. Use html2canvas to capture the asset tag
      // 2. Convert to PDF using jsPDF
      // 3. Trigger download
      console.log("PDF download not yet implemented");
      alert("PDF download coming soon!");
    } finally {
      setIsGeneratingPDF(false);
    }
  }, []);

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
              disabled={isGeneratingPDF}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              {isGeneratingPDF ? "Generating..." : "Download PDF"}
            </button>
          </footer>
        </div>
      </div>
    </>
  );
}
