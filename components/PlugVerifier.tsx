'use client';

import Image from 'next/image';
import { useEffect, useState, type ChangeEvent } from 'react';

import { supabase } from '../lib/supabase';

type PlugVerifierProps = {
  cartId: string;
  userId: string;
  rentalId: string;
  onSuccess: () => void;
};

export default function PlugVerifier({ cartId, userId, rentalId, onSuccess }: PlugVerifierProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ingestionError, setIngestionError] = useState<string | null>(null);

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
    setIngestionError(null);
  };

  const handleVerify = async () => {
    if (!file) {
      setError('Please capture or upload a photo to continue.');
      return;
    }

    setLoading(true);
    setError(null);
    setIngestionError(null);

    // Unique path to prevent collisions: include rentalId and timestamp
    const timestamp = Date.now();
    const path = `${cartId}/${userId}/${rentalId}/return_${timestamp}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('evidence')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`);
      setLoading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('evidence').getPublicUrl(path);
    const imageUrl = publicUrlData.publicUrl;

    // Fetch the session token for API authorization
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Failed to get session:', sessionError);
    }

    const accessToken = sessionData?.session?.access_token;

    // Register the uploaded photo in the database immediately after upload success
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      const ingestionResponse = await fetch('/api/photos/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          rentalId,
          cartId,
          storagePath: path,
          fileName: `return_${timestamp}.jpg`,
          kind: 'return_proof',
        }),
      });

      // Check if ingestion failed and show visible error feedback
      if (!ingestionResponse.ok) {
        const errorData = await ingestionResponse.json().catch(() => ({}));
        const errorMsg = errorData.error || `Photo registration failed (${ingestionResponse.status})`;
        console.error('Photo ingestion failed:', errorMsg);
        setIngestionError(errorMsg);
        // Note: We continue with verification even if ingestion fails
        // The photo is already in storage, just not tracked in DB
      } else {
        const result = await ingestionResponse.json();
        console.log('Photo ingestion successful:', result);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Photo registration failed';
      console.error('Photo ingestion crashed:', err);
      setIngestionError(errorMsg);
      // Continue with verification even if ingestion fails
    }

    try {
      const response = await fetch('/api/verify-plug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl, rentalId }),
      });

      if (!response.ok) {
        throw new Error('Verification request failed.');
      }

      const result = await response.json();

      if (result.is_plugged_in) {
        onSuccess();
        return;
      }

      setError(result.error ?? result.message ?? 'We cannot see the plug.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error occurred.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 space-y-6 border border-gray-100">
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-500">Final Step</p>
        <h2 className="text-xl font-semibold text-gray-900">Proof of Charging</h2>
        <p className="text-sm text-gray-600">
          Please plug the charger into the wall and take a clear photo.
        </p>
      </div>

      <div className="space-y-4">
        <label
          className="flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition"
          htmlFor="plug-photo"
        >
          {previewUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={previewUrl}
                alt="Charger proof preview"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          ) : (
            <div className="text-center text-gray-500 space-y-2">
              <p className="text-lg font-medium">Upload photo</p>
              <p className="text-xs">Tap to capture with your camera</p>
            </div>
          )}
        </label>
        <input
          id="plug-photo"
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Visible error feedback for photo ingestion failure */}
      {ingestionError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          <p className="font-medium">Warning: Photo tracking issue</p>
          <p className="text-xs mt-1">{ingestionError}</p>
          <p className="text-xs mt-1 text-amber-600">Your photo was uploaded but may not appear in the dashboard.</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end">
        <button
          onClick={handleVerify}
          disabled={loading}
          className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed min-w-[180px] flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            'Verify & End Rental'
          )}
        </button>
      </div>
    </div>
  );
}
