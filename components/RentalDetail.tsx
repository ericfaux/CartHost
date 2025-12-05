"use client";

import { useMemo } from "react";

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

export default function RentalDetail({ rental }: { rental: Rental }) {
  const photos = rental.photos ?? [];
  const preRidePhotos = photos.slice(0, 4);
  const checkoutPhoto = photos[photos.length - 1];

  const formattedDate = useMemo(() => {
    const date = new Date(rental.created_at);
    return date.toLocaleDateString(undefined, {
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
    return date.toLocaleString(undefined, {
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
                <div
                  key={`${photo}-${index}`}
                  className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                >
                  <img
                    src={photo}
                    alt={`Pre-ride photo ${index + 1}`}
                    className="h-48 w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Legal Agreement</h2>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              {rental.waiver_agreed ? (
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
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              <img
                src={checkoutPhoto}
                alt="Checkout photo"
                className="h-80 w-full object-cover"
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
