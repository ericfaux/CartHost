'use client';

import Image from 'next/image';
import { useEffect, useState, type ChangeEvent } from 'react';

import { supabase } from '../lib/supabase';

type GasCheckoutProps = {
  cartId: string;
  userId: string;
  onSuccess: () => void;
};

export default function GasCheckout({ cartId, userId, onSuccess }: GasCheckoutProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
    setError(null);
  };

  const handleCheckout = async () => {
    if (!file) {
      setError('Please capture or upload a photo to continue.');
      return;
    }

    setLoading(true);
    setError(null);

    const path = `${cartId}/${userId}/checkout_gas.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('evidence')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`);
      setLoading(false);
      return;
    }

    onSuccess();
    setLoading(false);
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 space-y-6 border border-gray-100">
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-500">Final Step</p>
        <h2 className="text-xl font-semibold text-gray-900">Park & Photo</h2>
        <p className="text-sm text-gray-600">
          Please park the vehicle safely and take a clear photo to end your rental.
        </p>
      </div>

      <div className="space-y-4">
        <label
          className="flex items-center justify-center w-full h-64 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition"
          htmlFor="gas-photo"
        >
          {previewUrl ? (
            <div className="relative w-full h-full">
              <Image src={previewUrl} alt="Checkout proof preview" fill className="object-cover rounded-lg" />
            </div>
          ) : (
            <div className="text-center text-gray-500 space-y-2">
              <p className="text-lg font-medium">Upload photo</p>
              <p className="text-xs">Tap to capture with your camera</p>
            </div>
          )}
        </label>
        <input
          id="gas-photo"
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex items-center justify-end">
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed min-w-[180px] flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Ending rental...</span>
            </>
          ) : (
            'End Rental'
          )}
        </button>
      </div>
    </div>
  );
}
