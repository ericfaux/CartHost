"use client";

import QRCode from "react-qr-code";
import { Copy, Printer, X } from "lucide-react";
import { useEffect, useState } from "react";

type QrCodeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
  assetName: string;
};

export default function QrCodeModal({
  isOpen,
  onClose,
  assetId,
  assetName,
}: QrCodeModalProps) {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!isOpen) return null;

  const rentalUrl = `${origin}/rental/${assetId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rentalUrl);
    } catch (error) {
      console.error("Failed to copy URL", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
        <button
          type="button"
          className="absolute right-4 top-4 text-slate-500 transition hover:text-slate-900"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-xl font-bold uppercase tracking-widest text-slate-900">
            Scan to Unlock
          </h2>
          <button
            type="button"
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            onClick={() => window.print()}
            aria-label="Print"
          >
            <Printer className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            onClick={handleCopy}
            aria-label="Copy URL"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-6 text-sm text-slate-500">{assetName}</p>
        <div className="mx-auto w-fit rounded-xl border-4 border-slate-900 bg-white p-4 shadow-sm">
          <QRCode value={rentalUrl} size={200} />
        </div>
        <p className="mt-4 break-all text-xs text-gray-400">{rentalUrl}</p>
        <button
          type="button"
          className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
