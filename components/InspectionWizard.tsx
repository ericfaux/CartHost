'use client';

import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sendWelcomeSms } from '../app/actions/notifications';
import { BikeWaiver, GolfCartWaiver } from './WaiverContent';

type InspectionWizardProps = {
  cartId: string;
  onComplete: (rentalId: string) => void;
  revenue?: number | null;
  depositAmount: number;
  hostPhone?: string | null;
  assetType: string;
  showSupportLink: boolean;
  customPhotoRequired?: boolean;
  customPhotoLabel?: string;
};

type Step = {
  title: string;
  description: string;
  type: 'info' | 'waiver' | 'photo';
  id?: string;
  field?: string;
};

export default function InspectionWizard({
  cartId,
  onComplete,
  revenue,
  depositAmount,
  hostPhone,
  assetType,
  showSupportLink,
  customPhotoRequired,
  customPhotoLabel,
}: InspectionWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [waiverAgreed, setWaiverAgreed] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const steps = useMemo<Step[]>(() => {
    const baseSteps: Step[] = [
      { title: 'Guest', description: 'Guest Information', type: 'info' },
      { title: 'Waiver', description: 'Liability Agreement', type: 'waiver' },
    ];

    const photoSteps: Step[] =
      assetType === 'hot_tub'
        ? [{ title: 'Water', description: 'Current Water Clarity', type: 'photo' }]
        : [
            { title: 'Front', description: 'Front Bumper', type: 'photo' },
            { title: 'Left', description: 'Left Side', type: 'photo' },
            { title: 'Right', description: 'Right Side', type: 'photo' },
            { title: 'Back', description: 'Back Bumper', type: 'photo' },
          ];

    if (customPhotoRequired) {
      photoSteps.push({
        id: 'custom_photo',
        title: 'Additional Requirement',
        description: customPhotoLabel || 'Please take the requested photo.',
        type: 'photo',
        field: 'custom_photo_url',
      });
    }

    return [...baseSteps, ...photoSteps];
  }, [assetType, customPhotoLabel, customPhotoRequired]);

  const totalSteps = steps.length;
  const progress = useMemo(() => ((currentStep + 1) / totalSteps) * 100, [currentStep, totalSteps]);

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

  const currentStepData = steps[currentStep];
  const isGuestStep = currentStepData.type === 'info';
  const isWaiverStep = currentStepData.type === 'waiver';
  const photoLabel =
    currentStepData.id === 'custom_photo' && customPhotoLabel
      ? customPhotoLabel
      : currentStepData.description;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
    setError(null);
  };

  // 3. The Debugged Upload Function (with Console Logs)
  const handleNext = async () => {
    setError(null);

    if (isGuestStep) {
      if (!guestName.trim() || !guestPhone.trim() || !departureDate.trim()) {
        setError('Please enter your full name, phone number, and checkout date.');
        return;
      }
      setCurrentStep((prev) => prev + 1);
      return;
    }

    if (isWaiverStep) {
      if (!waiverAgreed) {
        setError('Please confirm you have read and agree to the terms.');
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
          departure_date: departureDate,
          status: 'active',
          waiver_agreed: true,
          waiver_agreed_at: new Date().toISOString(),
          photos: updatedPhotoUrls,
          revenue: revenue ?? null,
          deposit_amount: depositAmount,
          deposit_status: 'pending',
        })
        .select()
        .single();

      setUploading(false);

      if (rentalError) {
        console.error('Failed to save rental:', rentalError);
        setError(`Failed to save rental: ${rentalError.message}`);
        return;
      }

      try {
        await sendWelcomeSms(data.id);
      } catch (err) {
        console.error('Failed to send welcome SMS:', err);
      }

      onComplete(data.id);
      return;
    }

    setCurrentStep((prev) => prev + 1);
    setFile(null);
    setPreviewUrl(null);
    setUploading(false);
  };

  return (
    <div className="bg-white shadow-xl shadow-blue-900/5 border border-white/50 rounded-xl p-6 space-y-6 backdrop-blur-sm">
      <div className="flex gap-2 mb-6" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const statusClass = isCompleted || isActive ? 'bg-blue-600' : 'bg-gray-100';

          return <div key={step.title} className={`h-1 flex-1 rounded-full transition-all duration-300 ${statusClass}`} />;
        })}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-500">{steps[currentStep].title} Inspection</p>
        <h2 className="text-xl font-semibold text-gray-900">{currentStepData.description}</h2>
        {isGuestStep ? (
          <p className="text-sm text-gray-600">Please provide the guest information before starting the inspection.</p>
        ) : isWaiverStep ? (
          <p className="text-sm text-gray-600">Please review and agree to the liability terms before continuing.</p>
        ) : (
          <p className="text-sm text-gray-600">
            Please take a clear photo of the {photoLabel.toLowerCase()} of the cart.
          </p>
        )}
      </div>

      {isGuestStep ? (
        <div className="space-y-4">
          {depositAmount > 0 && (
            <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-blue-800">
              <Shield className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Security Deposit Required: ${depositAmount}</p>
                <p className="text-sm mt-1">A fully refundable deposit of ${depositAmount} applies to this rental.</p>
              </div>
            </div>
          )}
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
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="departure-date">
              Checkout Date
            </label>
            <input
              id="departure-date"
              type="date"
              value={departureDate}
              onChange={(event) => setDepartureDate(event.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
          </div>
        </div>
      ) : isWaiverStep ? (
        <div className="space-y-4">
          <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            {assetType === 'bike' ? <BikeWaiver /> : <GolfCartWaiver />}
          </div>
          <label className="flex items-center space-x-3 text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
              checked={waiverAgreed}
              onChange={(event) => setWaiverAgreed(event.target.checked)}
            />
            <span>I have read and agree to the Waiver of Liability.</span>
          </label>
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
                  alt={`${photoLabel} preview`}
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

      <div className="flex items-center justify-end">
        <button
          onClick={handleNext}
          disabled={
            uploading ||
            (isGuestStep && (!guestName.trim() || !guestPhone.trim() || !departureDate.trim())) ||
            (isWaiverStep && !waiverAgreed)
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
      {showSupportLink && hostPhone && (
        <p className="mt-6 text-center text-xs text-gray-400">
          Having trouble? <a href={`sms:${hostPhone}`} className="underline hover:text-gray-600">Text your host</a>
        </p>
      )}
    </div>
  );
}
