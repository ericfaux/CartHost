"use client";

import { FormEvent, useMemo, useState } from "react";
import { createServiceLog } from "../app/dashboard/maintenance/actions";

type CartOption = {
  id: string;
  name: string;
};

type AddMaintenanceModalProps = {
  carts: CartOption[];
};

export default function AddMaintenanceModal({ carts }: AddMaintenanceModalProps) {
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartId, setCartId] = useState<string>(carts[0]?.id ?? "");
  const [serviceType, setServiceType] = useState<string>("");
  const [serviceDate, setServiceDate] = useState<string>(today);
  const [cost, setCost] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const resetForm = () => {
    setCartId(carts[0]?.id ?? "");
    setServiceType("");
    setServiceDate(today);
    setCost("");
    setNotes("");
  };

  const openModal = () => {
    setError(null);
    if (!cartId && carts.length > 0) {
      setCartId(carts[0].id);
    }
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      await createServiceLog(formData);
      resetForm();
      closeModal();
    } catch (err: any) {
      console.error("createServiceLog failed", err);
      setError(err?.message || "Failed to add maintenance record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={openModal}
        className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-gray-800"
        disabled={carts.length === 0}
      >
        Add Maintenance
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Add Maintenance</h2>
                <p className="text-sm text-gray-500">
                  Log maintenance tasks for your carts.
                </p>
              </div>
              <button
                type="button"
                className="text-gray-400 transition hover:text-gray-600"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Cart</label>
                  <select
                    name="cartId"
                    required
                    value={cartId}
                    onChange={(event) => setCartId(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  >
                    <option value="" disabled>
                      Select cart
                    </option>
                    {carts.map((cart) => (
                      <option key={cart.id} value={cart.id}>
                        {cart.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                  <select
                    name="serviceType"
                    required
                    value={serviceType}
                    onChange={(event) => setServiceType(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  >
                    <option value="" disabled>
                      Select type
                    </option>
                    <option value="tire_rotation">Tire Rotation</option>
                    <option value="battery_check">Battery Check</option>
                    <option value="oil_change">Oil Change</option>
                    <option value="brake_service">Brake Service</option>
                    <option value="general">General</option>
                    <option value="repair">Repair</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    name="serviceDate"
                    value={serviceDate}
                    onChange={(event) => setServiceDate(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Cost</label>
                  <input
                    type="number"
                    name="cost"
                    min="0"
                    step="0.01"
                    value={cost}
                    onChange={(event) => setCost(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  rows={3}
                  placeholder="Add details about the maintenance task"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || carts.length === 0}
                  className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Saving..." : "Save Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
