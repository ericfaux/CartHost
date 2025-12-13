'use client';

import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sendWelcomeSms } from '../app/actions/notifications';

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

const GolfCartWaiver = () => (
  <div className="space-y-4">
    <h3 className="font-bold text-center">GOLF CART RENTAL AGREEMENT AND WAIVER OF LIABILITY</h3>
    <p>
      This Golf Cart Rental Agreement and Waiver of Liability (“Agreement”) is between the undersigned guest (“Renter”) and
      the property owner/host (“Host”). CartHost is a technology provider facilitating this process on behalf of the Host.
    </p>

    <div>
      <p className="font-bold">1. ELIGIBILITY AND DRIVER RESPONSIBILITY</p>
      <p>
        I represent that I am at least 18 years old (or the minimum legal age to operate a motor vehicle in this
        jurisdiction, if higher) and hold a current, valid driver’s license. I agree that only licensed drivers who have
        been authorized by the Host and who have agreed to this Agreement will operate the golf cart.
      </p>
    </div>

    <div>
      <p className="font-bold">2. ASSUMPTION OF RISK</p>
      <p className="uppercase font-semibold">
        I UNDERSTAND THAT OPERATING A GOLF CART INVOLVES INHERENT RISKS, INCLUDING BUT NOT LIMITED TO COLLISIONS,
        ROLLOVERS, LOSS OF CONTROL, SERIOUS INJURY, DEATH, AND PROPERTY DAMAGE. I VOLUNTARILY ASSUME ALL SUCH RISKS FOR
        MYSELF AND ANY MINOR OR GUEST I ALLOW TO RIDE IN OR OPERATE THE CART.
      </p>
    </div>

    <div>
      <p className="font-bold">3. RELEASE OF LIABILITY</p>
      <p>
        To the fullest extent permitted by law, I hereby release, waive, and discharge the Host, the property owner, their
        officers, employees, agents, and the technology provider CartHost from any and all liability, claims, demands, or
        causes of action arising out of or related to my use or operation of the golf cart, including those arising from
        ordinary negligence. This release does not apply to any liability that cannot be waived under applicable law,
        including gross negligence, willful misconduct, or intentional harm.
      </p>
    </div>

    <div>
      <p className="font-bold">4. INDEMNIFICATION</p>
      <p>
        I agree to indemnify, defend, and hold harmless the Host and the property owner from any and all claims, damages,
        losses, costs, and expenses (including reasonable attorneys’ fees) arising out of or related to: (a) my use or
        operation of the golf cart; (b) any use or operation by a person I allow to drive the cart; or (c) injury to third
        parties or damage to third-party property in connection with the cart.
      </p>
    </div>

    <div>
      <p className="font-bold">5. RESPONSIBILITY FOR DAMAGE AND CHARGES</p>
      <p>
        I agree that I am responsible for any loss of or damage to the golf cart occurring during my rental period, normal
        wear and tear excepted. I understand that the Host may seek recovery for such damage through any applicable
        security deposit, damage waiver, or platform resolution process, and, where applicable for direct bookings, I
        authorize the Host to charge the payment method on file for repair or replacement costs resulting from my use,
        negligence, or accident.
      </p>
    </div>

    <div>
      <p className="font-bold">6. RULES OF OPERATION</p>
      <p>I agree to operate the golf cart in a safe and lawful manner and specifically agree that:</p>
      <ul className="list-disc pl-5 mt-1 space-y-1">
        <li>I will obey all local traffic laws, posted signs, and speed limits.</li>
        <li>
          I will NOT operate the cart while under the influence of alcohol, drugs, or any substance that may impair my
          ability to drive safely.
        </li>
        <li>I will NOT allow any underage or unlicensed person to operate the cart.</li>
        <li>I will ensure all passengers are seated properly while the cart is moving.</li>
        <li>
          I will ensure the cart is plugged in and charging when not in use and at the end of my stay, in accordance with
          the Host’s instructions.
        </li>
      </ul>
    </div>

    <div>
      <p className="font-bold">7. CONDITION OF VEHICLE</p>
      <p>
        I acknowledge that I have inspected the golf cart (including by reviewing and/or providing photos through the
        CartHost app) and accept it in its current condition. I agree to promptly report to the Host any damage or
        mechanical issues that arise during my rental period.
      </p>
    </div>

    <div>
      <p className="font-bold">8. ACKNOWLEDGMENT AND CONSENT</p>
      <p>
        By clicking “I Agree” or otherwise electronically signing below, I acknowledge that I have read this Agreement in
        full, understand its terms, and voluntarily agree to be bound by it. I understand that by signing this Agreement, I
        may be waiving certain legal rights, including the right to sue the Host for ordinary negligence, to the fullest
        extent permitted by law.
      </p>
    </div>
  </div>
);

const BikeWaiver = () => (
  <div className="space-y-4">
    <h3 className="font-bold text-center">BICYCLE / E-BIKE RENTAL AGREEMENT AND WAIVER OF LIABILITY</h3>
    <p>
      This Bicycle / E-Bike Rental Agreement and Waiver of Liability (“Agreement”) is between the undersigned guest
      (“Renter”) and the property owner/host (“Host”). CartHost is a technology provider facilitating this process on behalf
      of the Host.
    </p>
    <p>
      For purposes of this Agreement, “Bicycle” includes any bicycle, e-bike, or similar micromobility device provided by
      the Host, and all included accessories (such as helmets, locks, lights, baskets, or child seats).
    </p>

    <div>
      <p className="font-bold">1. ELIGIBILITY AND RIDER RESPONSIBILITY</p>
      <p>I represent that:</p>
      <ul className="list-disc pl-5 mt-1 space-y-1">
        <li>I am at least 18 years old (or the minimum legal age to operate the Bicycle in this jurisdiction, if higher).</li>
        <li>I am physically able and competent to ride a bicycle and, if applicable, an e-bike.</li>
        <li>
          I will ensure that any minor or additional rider using the Bicycle does so only:
          <ul className="list-[circle] pl-5 mt-1 space-y-1">
            <li>With the Host’s permission,</li>
            <li>In compliance with applicable age, height, and weight limits, and</li>
            <li>Under my direct supervision.</li>
          </ul>
        </li>
      </ul>
      <p className="mt-2">I agree that only riders who have been authorized by the Host and who have agreed to this Agreement will use the Bicycle.</p>
      <p className="mt-2">
        I understand that the Host may require or recommend the use of a helmet and other safety equipment, and I agree to
        comply with all applicable helmet and safety laws. If I decline to use a helmet or other protective gear made
        available to me, I do so at my own risk.
      </p>
    </div>

    <div>
      <p className="font-bold">2. ASSUMPTION OF RISK</p>
      <p className="uppercase font-semibold">
        I UNDERSTAND THAT RIDING A BICYCLE OR E-BIKE INVOLVES INHERENT RISKS, INCLUDING BUT NOT LIMITED TO COLLISIONS WITH
        MOTOR VEHICLES, PEDESTRIANS, OBJECTS, OR OTHER CYCLISTS; LOSS OF CONTROL; EQUIPMENT FAILURE; DANGEROUS ROAD
        CONDITIONS; WEATHER-RELATED HAZARDS; SERIOUS INJURY; PARALYSIS; DEATH; AND PROPERTY DAMAGE.
      </p>
      <p className="uppercase font-semibold mt-2">
        I VOLUNTARILY ASSUME ALL SUCH RISKS FOR MYSELF AND FOR ANY MINOR OR GUEST I ALLOW TO RIDE THE BICYCLE, WHETHER AS A
        RIDER OR PASSENGER (INCLUDING IN ANY CHILD SEAT OR TRAILER).
      </p>
    </div>

    <div>
      <p className="font-bold">3. RELEASE OF LIABILITY</p>
      <p>
        To the fullest extent permitted by law, I hereby release, waive, and discharge the Host, the property owner, their
        officers, employees, agents, and the technology provider CartHost from any and all liability, claims, demands, or
        causes of action arising out of or related to my use or operation of the Bicycle, including those arising from
        ordinary negligence.
      </p>
      <p className="mt-2">
        This release does not apply to any liability that cannot be waived under applicable law, including gross negligence,
        willful misconduct, or intentional harm.
      </p>
    </div>

    <div>
      <p className="font-bold">4. INDEMNIFICATION</p>
      <p>
        I agree to indemnify, defend, and hold harmless the Host and the property owner from any and all claims, damages,
        losses, costs, and expenses (including reasonable attorneys’ fees) arising out of or related to:
      </p>
      <ul className="list-disc pl-5 mt-1 space-y-1">
        <li>My use or operation of the Bicycle;</li>
        <li>Any use or operation of the Bicycle by a person I allow to ride it; or</li>
        <li>Injury to third parties or damage to third-party property in connection with the Bicycle.</li>
      </ul>
    </div>

    <div>
      <p className="font-bold">5. RESPONSIBILITY FOR DAMAGE, LOSS, AND CHARGES</p>
      <p>I agree that I am responsible for any loss of, theft of, or damage to the Bicycle and its accessories occurring during my rental period, normal wear and tear excepted.</p>
      <p className="mt-2">I understand and agree that:</p>
      <ul className="list-disc pl-5 mt-1 space-y-1">
        <li>
          I am responsible for properly securing the Bicycle with the provided lock and following the Host’s instructions on
          where and how to park and lock it.
        </li>
        <li>
          If the Bicycle is lost, stolen, or returned with damage beyond normal wear and tear, the Host may seek recovery for
          repair or replacement costs through any applicable security deposit, damage waiver, or platform resolution process.
        </li>
        <li>
          Where applicable for direct bookings, I authorize the Host to charge the payment method on file for such repair or
          replacement costs resulting from my use, negligence, or accident.
        </li>
      </ul>
    </div>

    <div>
      <p className="font-bold">6. RULES OF OPERATION</p>
      <p>I agree to operate the Bicycle in a safe and lawful manner and specifically agree that:</p>

      <p className="font-semibold mt-2">Traffic Laws & Routes</p>
      <ul className="list-disc pl-5 mt-1 space-y-1">
        <li>I will obey all local traffic laws, signals, and signs, and ride only where bicycles are legally allowed.</li>
        <li>I will ride with the flow of traffic, not against it, and use bike lanes where available and appropriate.</li>
        <li>I will not ride on sidewalks or restricted paths where prohibited by law or by Host rules.</li>
      </ul>

      <p className="font-semibold mt-2">Alcohol, Drugs, and Impairment</p>
      <ul className="list-disc pl-5 mt-1 space-y-1">
        <li>I will NOT operate the Bicycle while under the influence of alcohol, drugs, or any substance that may impair my ability to ride safely.</li>
      </ul>

      <p className="font-semibold mt-2">Riders and Passengers</p>
      <ul className="list-disc pl-5 mt-1 space-y-1">
        <li>
          I will NOT allow any underage or unauthorized person to ride the Bicycle, whether as a rider or passenger, except
          as permitted by the Host and local law (for example, a child in an approved child seat).
        </li>
        <li>I will not carry more riders than the Bicycle is designed or rated for.</li>
      </ul>

      <p className="font-semibold mt-2">Safe Riding Practices</p>
      <ul className="list-disc pl-5 mt-1 space-y-1">
        <li>I will operate the Bicycle at a safe speed for conditions and will not perform stunts, jumps, or other high-risk maneuvers.</li>
        <li>I will use caution on hills, wet or uneven surfaces, gravel, and other hazardous conditions.</li>
        <li>If riding at night or in low-visibility conditions, I will use lights and reflectors as required by law and exercise extra care.</li>
      </ul>

      <p className="font-semibold mt-2">Locking and Returning the Bicycle</p>
      <ul className="list-disc pl-5 mt-1 space-y-1">
        <li>I will follow the Host’s instructions for where to park and how to lock the Bicycle, including securing the frame to a fixed object when required.</li>
        <li>
          At the end of my stay, I will return the Bicycle in substantially the same condition as at the start of my rental,
          normal wear and tear excepted, and I will follow any instructions (including taking and uploading required photos)
          to confirm proper locking and return.
        </li>
      </ul>
    </div>

    <div>
      <p className="font-bold">7. CONDITION OF BICYCLE AND REPORTING ISSUES</p>
      <p>
        I acknowledge that I have inspected the Bicycle (including by reviewing and/or providing photos through the CartHost
        experience) and accept it in its current condition.
      </p>
      <p className="mt-2">
        Before riding, I will inspect the Bicycle for obvious defects, including brakes, tires, wheels, handlebars, pedals,
        and lights. If I notice any damage, malfunction, or unsafe condition:
      </p>
      <ul className="list-disc pl-5 mt-1 space-y-1">
        <li>I will NOT ride the Bicycle until the issue is resolved; and</li>
        <li>I will promptly report the issue to the Host.</li>
      </ul>
      <p className="mt-2">
        I understand that continued use of the Bicycle after noticing a problem is at my own risk and may increase my
        responsibility for resulting damage.
      </p>
    </div>

    <div>
      <p className="font-bold">8. ACKNOWLEDGMENT, PHOTOS, AND CONSENT</p>
      <p>
        I understand that the Host may require me to upload photos or other information (for example, photos of the Bicycle
        at the start and end of my ride, and photos confirming the Bicycle was properly locked) through CartHost to document
        the condition of the Bicycle and my compliance with these rules.
      </p>
      <p className="mt-2">By clicking “I Agree” or otherwise electronically signing below, I acknowledge that:</p>
      <ul className="list-disc pl-5 mt-1 space-y-1">
        <li>I have read this Agreement in full;</li>
        <li>I understand its terms and the risks involved in riding the Bicycle; and</li>
        <li>I voluntarily agree to be bound by this Agreement.</li>
      </ul>
      <p className="mt-2">
        I understand that by signing this Agreement, I may be waiving certain legal rights, including the right to sue the
        Host for ordinary negligence, to the fullest extent permitted by law.
      </p>
    </div>
  </div>
);

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
