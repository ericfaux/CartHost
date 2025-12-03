'use client';

import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { supabase } from '../lib/supabase';

type InspectionWizardProps = {
  cartId: string;
  onComplete: () => void;
};

type Step = {
  title: string;
  description: string;
};

const steps: Step[] = [
  { title: 'Front', description: 'Front Bumper' },
  { title: 'Left', description: 'Left Side' },
  { title: 'Right', description: 'Right Side' },
  { title: 'Back', description: 'Back Bumper' },
];

export default function InspectionWizard({ cartId, onComplete }: InspectionWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 1. Fetch Anonymous User ID
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        setError(`Auth Error: ${error.message}`);
        return;
      }
      if (!data.user) {
        setError('User not authenticated (Invisible Login failed).');
        return;
      }
      setUserId(data.user.id);
    };

    fetchUser();
  }, []);

  // 2. Handle Image Preview
  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const stepLabel = useMemo(() => {
    const stepNumber = currentStep + 1;
    const step = steps[currentStep];
    return `Step ${stepNumber} of ${steps.length}: ${step.description}`;
  }, [currentStep]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
    setError(null);
  };

  // 3. The Debugged Upload Function
  const handleNext = async () => {
    if (!file) {
      setError('Please capture or upload a photo to continue.');
      return;
    }

    if (!userId) {
      alert("CRITICAL ERROR: No User ID found. Reload the page.");
      setError('Unable to upload without a user session.');
      return;
    }

    // DEBUG 1: Confirm button click works
    alert(`1. Starting upload... Cart: ${cartId}, User: ${userId}`);

    setUploading(true);
    setError(null);

    const stepNumber = currentStep + 1;
    // Use a timestamp to prevent filename collisions if they retry
    const timestamp = new Date().getTime();
    const path = `${cartId}/${userId}/step${stepNumber}_${timestamp}.jpg`;

    // DEBUG 2: Confirm path
    alert(`2. Path generated: ${path}`);

    try {
      const { error: uploadError } = await supabase.storage
        .from('evidence')
        .upload(path, file, { upsert: true });

      if (uploadError) {
        // DEBUG 3: Catch Supabase Error
        alert(`3. UPLOAD FAILED: ${uploadError.message}`);
        console.error('Upload error:', uploadError);
        setError(`Upload failed: ${uploadError.message}`);
        setUploading(false);
        return;
      }
    } catch (err: any) {
      // DEBUG 4: Catch Network/Crash Error
      alert(`4. APP CRASHED: ${err.message || err}`);
      setUploading(false);
      return;
    }

    // DEBUG 5: Success
    alert("5. SUCCESS! Moving to next step.");

    const isLastStep = currentStep === steps.length - 1;

    if (isLastStep) {
      setUploading(false);
      onComplete();
      return;
    }

    setCurrentStep((prev) => prev + 1);
    setFile(null);
    setPreviewUrl(null);
    setUploading(false);
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 space-y-6 border border-gray-100">
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-500">{steps[currentStep].title} Inspection</p>
        <h2 className="text-xl font-semibold text-gray-900">{stepLabel}</h2>
        <p className="text-sm text-gray-600">
          Please take a clear photo of the {steps[currentStep].description.toLowerCase()} of the cart.
        </p>
      </div>

      <div className="space-y-4">
        <label
          className="flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition"
          htmlFor="inspection-photo"
        >
          {previewUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={previewUrl}
                alt={`${steps[currentStep].description} preview`}
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
          id="inspection-photo"
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{`Step ${currentStep + 1} of ${steps.length}`}</div>
        
        <button
          onClick={handleNext}
          disabled={uploading}
          className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed min-w-[100px] flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            currentStep === steps.length - 1 ? 'Finish' : 'Next'
          )}
        </button>
      </div>
    </div>
  );
}
