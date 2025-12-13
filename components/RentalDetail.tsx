"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useMemo, useState } from "react";

type Rental = {
  id: string;
  created_at: string;
  guest_name?: string | null;
  status?: string | null;
  photos?: string[] | null;
  waiver_agreed?: boolean | null;
  waiver_agreed_at?: string | null;
  carts?: {
    name?: string | null;
  } | null;
};

const WAIVER_TEXT = `GOLF CART RENTAL AGREEMENT AND WAIVER OF LIABILITY

This Golf Cart Rental Agreement and Waiver of Liability (“Agreement”) is between the undersigned guest (“Renter”) and the property owner/host (“Host”). CartHost is a technology provider facilitating this process on behalf of the Host.

1. ELIGIBILITY AND DRIVER RESPONSIBILITY
I represent that I am at least 18 years old (or the minimum legal age to operate a motor vehicle in this jurisdiction, if higher) and hold a current, valid driver’s license. I agree that only licensed drivers who have been authorized by the Host and who have agreed to this Agreement will operate the golf cart.

2. ASSUMPTION OF RISK
I UNDERSTAND THAT OPERATING A GOLF CART INVOLVES INHERENT RISKS, INCLUDING BUT NOT LIMITED TO COLLISIONS, ROLLOVERS, LOSS OF CONTROL, SERIOUS INJURY, DEATH, AND PROPERTY DAMAGE. I VOLUNTARILY ASSUME ALL SUCH RISKS FOR MYSELF AND ANY MINOR OR GUEST I ALLOW TO RIDE IN OR OPERATE THE CART.

3. RELEASE OF LIABILITY
To the fullest extent permitted by law, I hereby release, waive, and discharge the Host, the property owner, their officers, employees, agents, and the technology provider CartHost from any and all liability, claims, demands, or causes of action arising out of or related to my use or operation of the golf cart, including those arising from ordinary negligence. This release does not apply to any liability that cannot be waived under applicable law, including gross negligence, willful misconduct, or intentional harm.

4. INDEMNIFICATION
I agree to indemnify, defend, and hold harmless the Host and the property owner from any and all claims, damages, losses, costs, and expenses (including reasonable attorneys’ fees) arising out of or related to: (a) my use or operation of the golf cart; (b) any use or operation by a person I allow to drive the cart; or (c) injury to third parties or damage to third-party property in connection with the cart.

5. RESPONSIBILITY FOR DAMAGE AND CHARGES
I agree that I am responsible for any loss of or damage to the golf cart occurring during my rental period, normal wear and tear excepted. I understand that the Host may seek recovery for such damage through any applicable security deposit, damage waiver, or platform resolution process, and, where applicable for direct bookings, I authorize the Host to charge the payment method on file for repair or replacement costs resulting from my use, negligence, or accident.

6. RULES OF OPERATION
I agree to operate the golf cart in a safe and lawful manner and specifically agree that:
- I will obey all local traffic laws, posted signs, and speed limits.
- I will NOT operate the cart while under the influence of alcohol, drugs, or any substance that may impair my ability to drive safely.
- I will NOT allow any underage or unlicensed person to operate the cart.
- I will ensure all passengers are seated properly while the cart is moving.
- I will ensure the cart is plugged in and charging when not in use and at the end of my stay, in accordance with the Host’s instructions.

7. CONDITION OF VEHICLE
I acknowledge that I have inspected the golf cart (including by reviewing and/or providing photos through the CartHost app) and accept it in its current condition. I agree to promptly report to the Host any damage or mechanical issues that arise during my rental period.

8. ACKNOWLEDGMENT AND CONSENT
By clicking “I Agree” or otherwise electronically signing below, I acknowledge that I have read this Agreement in full, understand its terms, and voluntarily agree to be bound by it. I understand that by signing this Agreement, I may be waiving certain legal rights, including the right to sue the Host for ordinary negligence, to the fullest extent permitted by law.`;

export default function RentalDetail({ rental }: { rental: Rental }) {
  const [showWaiver, setShowWaiver] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const photos = rental.photos ?? [];
  const preRidePhotos = photos.slice(0, 4);
  const checkoutPhoto = photos[photos.length - 1];

  const formattedDate = useMemo(() => {
    const date = new Date(rental.created_at);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [rental.created_at]);

  const formattedWaiverDate = useMemo(() => {
    if (!rental.waiver_agreed_at) return null;

    const date = new Date(rental.waiver_agreed_at);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [rental.waiver_agreed_at]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col gap-2 border-b border-gray-200 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {rental.guest_name || "Guest"}
            </h1>
            <p className="text-sm text-gray-600">{formattedDate}</p>
            <p className="text-sm text-gray-600">
              Cart: {rental.carts?.name || "Unknown"}
            </p>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 md:w-auto"
          >
            Print
          </button>
        </div>

        {!photos.length ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-center text-gray-600">
            No evidence photos available for this rental
          </div>
        ) : (
          <div className="space-y-6">
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Pre-Ride</h2>
                <p className="text-sm text-gray-500">First four photos</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {preRidePhotos.map((photo, index) => (
                  <button
                    key={`${photo}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(photo)}
                    className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:opacity-90 cursor-pointer"
                    aria-label={`Open pre-ride photo ${index + 1}`}
                  >
                    <div className="relative h-48 w-full">
                      <Image
                        src={photo}
                        alt={`Pre-ride photo ${index + 1}`}
                        fill
                        unoptimized
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Legal Agreement
                </h2>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                {rental.waiver_agreed ? (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                            className="h-5 w-5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16Zm3.707-10.293a1 1 0 00-1.414-1.414L9 9.586 7.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-green-800">
                            Liability Waiver Signed
                          </p>
                          {formattedWaiverDate && (
                            <p className="text-sm text-gray-600">
                              Signed on {formattedWaiverDate}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowWaiver((previous) => !previous)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        (View Signed Terms)
                      </button>
                    </div>

                    {showWaiver && (
                      <div className="max-h-80 overflow-y-auto rounded bg-gray-50 p-4 text-xs text-gray-700 whitespace-pre-line">
                        {WAIVER_TEXT}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                    Not Signed
                  </span>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Checkout</h2>
                <p className="text-sm text-gray-500">Last photo</p>
              </div>

              {checkoutPhoto ? (
                <button
                  type="button"
                  onClick={() => setSelectedImage(checkoutPhoto)}
                  className="group w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:opacity-90 cursor-pointer"
                  aria-label="Open checkout photo"
                >
                  <div className="relative h-80 w-full">
                    <Image
                      src={checkoutPhoto}
                      alt="Checkout photo"
                      fill
                      unoptimized
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                </button>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-center text-gray-600">
                  No checkout photo available for this rental
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Evidence photo viewer"
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="relative w-full h-full max-w-6xl max-h-[90vh]"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Selected evidence photo"
              fill
              unoptimized
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
