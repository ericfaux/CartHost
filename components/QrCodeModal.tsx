"use client";

import QRCode from "react-qr-code";
import { Download, Printer, X } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

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
 * AssetTagPreview - The printable 4x6 asset tag component
 * Used both for screen preview (scaled) and print view (full size)
 */
function AssetTagPreview({
  rentalUrl,
  assetId,
  hostBranding,
  isPreview = false,
}: {
  rentalUrl: string;
  assetId: string;
  hostBranding?: HostBranding;
  isPreview?: boolean;
}) {
  const shortId = generateAssetId(assetId);
  const propertyName = hostBranding?.propertyName || "Property Manager";
  const phone = hostBranding?.phone;

  return (
    <article
      className={`
        flex flex-col bg-white border-2 border-black rounded-lg overflow-hidden
        ${isPreview ? "w-[3in] h-[4.5in]" : "w-[4in] h-[6in]"}
      `}
      style={{
        // Ensure exact dimensions for print
        minWidth: isPreview ? "3in" : "4in",
        minHeight: isPreview ? "4.5in" : "6in",
      }}
      aria-label="Vehicle Asset Tag"
    >
      {/* TOP BAR - 15% height */}
      <header
        className="flex items-center justify-between px-4 bg-[#1a1a1a]"
        style={{ height: "15%" }}
      >
        <span
          className="font-mono text-white uppercase tracking-wider"
          style={{ fontSize: isPreview ? "8px" : "11px" }}
        >
          Operational Asset
        </span>
        <span
          className="font-heading font-bold text-white"
          style={{ fontSize: isPreview ? "12px" : "16px" }}
        >
          CartHost
        </span>
      </header>

      {/* HERO SECTION - QR Code - 50% height */}
      <section
        className="flex items-center justify-center bg-white"
        style={{ height: "50%" }}
        aria-label="QR Code"
      >
        <div className="p-2 bg-white">
          <QRCode
            value={rentalUrl}
            size={isPreview ? 120 : 160}
            level="H"
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </div>
      </section>

      {/* CTA SECTION - 15% height */}
      <section
        className="flex items-center justify-center bg-white"
        style={{ height: "15%" }}
        aria-label="Call to action"
      >
        <h2
          className="font-heading font-bold text-[#0F766E] uppercase tracking-wide"
          style={{ fontSize: isPreview ? "18px" : "24px" }}
        >
          Scan to Start
        </h2>
      </section>

      {/* FOOTER - 20% height */}
      <footer
        className="flex flex-col items-center justify-center bg-[#f5f5f5] px-4"
        style={{ height: "20%" }}
      >
        <p
          className="font-sans text-gray-700 text-center"
          style={{ fontSize: isPreview ? "8px" : "11px" }}
        >
          Managed by: {propertyName}
        </p>
        <p
          className="font-sans text-gray-500 text-center mt-1"
          style={{ fontSize: isPreview ? "8px" : "11px" }}
        >
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
  const [isPrintView, setIsPrintView] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Reset print view when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsPrintView(false);
    }
  }, [isOpen]);

  const rentalUrl = `${origin}/rental/${assetId}`;

  /**
   * Handles printing the asset tag
   * Sets print view mode, triggers browser print, then resets
   */
  const handlePrint = useCallback(() => {
    setIsPrintView(true);
    // Small delay to ensure print view renders before printing
    setTimeout(() => {
      window.print();
      // Reset after print dialog closes
      setTimeout(() => {
        setIsPrintView(false);
      }, 100);
    }, 100);
  }, []);

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

  // PRINT VIEW - Full screen, print-optimized layout
  if (isPrintView) {
    return (
      <>
        {/* Print-specific styles */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-asset-tag,
            #print-asset-tag * {
              visibility: visible;
            }
            #print-asset-tag {
              position: absolute;
              left: 0;
              top: 0;
              width: 4in;
              height: 6in;
            }
            @page {
              size: 4in 6in;
              margin: 0;
            }
          }
        `}</style>
        <div
          id="print-asset-tag"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white print:bg-transparent"
        >
          <AssetTagPreview
            rentalUrl={rentalUrl}
            assetId={assetId}
            hostBranding={hostBranding}
            isPreview={false}
          />
        </div>
      </>
    );
  }

  // SCREEN VIEW - Modal with preview and controls
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">
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

        {/* Preview area */}
        <div className="px-6 py-6 flex justify-center bg-slate-50">
          <div className="transform scale-75 origin-center">
            <AssetTagPreview
              rentalUrl={rentalUrl}
              assetId={assetId}
              hostBranding={hostBranding}
              isPreview={true}
            />
          </div>
        </div>

        {/* Action buttons */}
        <footer className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <Printer className="h-4 w-4" />
            Print Asset Tag
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
  );
}
