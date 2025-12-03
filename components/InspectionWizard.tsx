'use client';

import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { supabase } from '../lib/supabase';

type InspectionWizardProps = {
  cartId: string;
  onComplete: (rentalId: string) => void;
};

type Step = {
  title: string;
  description: string;
};

const steps: Step[] = [
  { title: 'Guest', description: 'Guest Information' },
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
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  // 1. Fetch Anonymous User ID
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Auth Error:", error);
        setError(`Auth Error: ${error.message}`);
        return;
      }
      if (!data.user) {
        console.error("No user found in session");
        setError('User not authenticated (Invisible Login failed).');
        return;
      }
      console.log("User authenticated:", data.user.id);
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

  const isGuestStep = currentStep === 0;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
    setError(null);
  };

  // 3. The Debugged Upload Function (with Console Logs)
  const handleNext = async () => {
    setError(null);

    if (isGuestStep) {
      if (!guestName.trim() || !guestPhone.trim()) {
        setError('Please enter your full name and phone number.');
        return;
      }
      setCurrentStep((prev) => prev + 1);
      return;
    }

    console.log("-----> TEST: The 'Next' button was clicked!");

    if (!file) {
      console.log("Error: No file selected.");
      setError('Please capture or upload a photo to continue.');
      return;
    }

    if (!userId) {
      console.log("Error: No userId found.");
      alert("CRITICAL ERROR: No User ID found. Reload the page.");
      setError('Unable to upload without a user session.');
      return;
    }

    console.log(`1. Starting upload... Cart: ${cartId}, User: ${userId}`);
    alert(`1. Starting upload... Cart: ${cartId}, User: ${userId}`);

    setUploading(true);

    const stepNumber = currentStep + 1;
    const timestamp = new Date().getTime();
    const path = `${cartId}/${userId}/step${stepNumber}_${timestamp}.jpg`;

    console.log(`2. Path generated: ${path}`);
    alert(`2. Path generated: ${path}`);

    try {
      console.log("Attempting Supabase upload...");
      const { error: uploadError } = await supabase.storage
        .from('evidence')
        .upload(path, file, { upsert: true });

      if (uploadError) {
        console.error('3. UPLOAD FAILED:', uploadError);
        alert(`3. UPLOAD FAILED: ${uploadError.message}`);
        setError(`Upload failed: ${uploadError.message}`);
        setUploading(false);
        return;
      }
    } catch (err: any) {
      console.error('4. APP CRASHED:', err);
      alert(`4. APP CRASHED: ${err.message || err}`);
      setUploading(false);
      return;
    }

    console.log("5. SUCCESS! File uploaded. Moving to next step.");
    alert("5. SUCCESS! Moving to next step.");

    const { data: publicUrlData } = supabase.storage
      .from('evidence')
      .getPublicUrl(path);

    if (!publicUrlData?.publicUrl) {
      console.error('Failed to retrieve public URL');
      setError('Failed to retrieve public URL for uploaded file.');
      setUploading(false);
      return;
    }

    const updatedPhotoUrls = [...photoUrls, publicUrlData.publicUrl];
    setPhotoUrls(updatedPhotoUrls);

    const isLastStep = currentStep === steps.length - 1;

    if (isLastStep) {
      const { data, error: rentalError } = await supabase
        .from('rentals')
        .insert({
          cart_id: cartId,
          guest_id: userId,
          guest_name: guestName,
          guest_phone: guestPhone,
          status: 'active',
          photos: updatedPhotoUrls,
        })
        .select()
        .single();

      setUploading(false);

      if (rentalError) {
        console.error('Failed to save rental:', rentalError);
        setError(`Failed to save rental: ${rentalError.message}`);
        return;
      }

      onComplete(data.id);
      return;
    }

    setCurrentStep((prev) => prev + 1);
    setFile(null);
    setPreviewUrl(null);
    setUploading(false);
  };

  // --- THIS IS THE PART YOU WERE MISSING ---
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 space-y-6 border border-gray-100">
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-500">{steps[currentStep].title} Inspection</p>
        <h2 className="text-xl font-semibold text-gray-900">{stepLabel}</h2>
        {isGuestStep ? (
          <p className="text-sm text-gray-600">Please provide the guest information before starting the inspection.</p>
        ) : (
          <p className="text-sm text-gray-600">
            Please take a clear photo of the {steps[currentStep].description.toLowerCase()} of the cart.
          </p>
        )}
      </div>

      {isGuestStep ? (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="guest-name">
              Full Name
            </label>
            <input
              id="guest-name"
              type="text"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
              placeholder="Enter full name"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="guest-phone">
              Phone Number
            </label>
            <input
              id="guest-phone"
              type="tel"
              value={guestPhone}
              onChange={(event) => setGuestPhone(event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
              placeholder="Enter phone number"
            />
          </div>
        </div>
      ) : (
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
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{`Step ${currentStep + 1} of ${steps.length}`}</div>
        
        <button
          onClick={handleNext}
          disabled={
            uploading || (isGuestStep && (!guestName.trim() || !guestPhone.trim()))
          }
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
