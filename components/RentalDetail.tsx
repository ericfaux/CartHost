"use client";

import { useMemo } from "react";

type Rental = {
  id: string;
  created_at: string;
  guest_name?: string | null;
  status?: string | null;
  photos?: string[] | null;
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-gray-500">{formattedDate}</p>
          <h1 className="text-2xl font-bold text-gray-900">{rental.guest_name || "Guest"}</h1>
          <p className="text-gray-600">Cart: {rental.carts?.name || "Unknown"}</p>
        </div>
        <div className="flex items-center gap-2">
          {rental.status && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
              {rental.status}
            </span>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            Print Evidence
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Pre-Ride Inspection</h2>
          <p className="text-sm text-gray-500">First four photos</p>
        </div>
        {preRidePhotos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-gray-500">
            No pre-ride photos available.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {preRidePhotos.map((photo, index) => (
              <div
                key={photo + index}
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
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Checkout Proof</h2>
          <p className="text-sm text-gray-500">Plug photo</p>
        </div>
        {checkoutPhoto ? (
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <img
              src={checkoutPhoto}
              alt="Checkout plug photo"
              className="h-80 w-full object-cover"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-gray-500">
            No checkout proof available.
          </div>
        )}
      </div>
    </div>
  );
}
