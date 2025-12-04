"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createCart } from "../app/dashboard/actions";

export default function AddCartModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      await createCart(formData);
      event.currentTarget.reset();
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to add cart");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <button
        className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-gray-800"
        onClick={() => setIsOpen(true)}
      >
        Add Cart
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Add Cart</h2>
                <p className="text-sm text-gray-500">Create a new cart for your fleet.</p>
              </div>
              <button
                className="text-gray-400 transition hover:text-gray-600"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Cart Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  placeholder="Eg. Sunrise Beach Cart"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Key Code</label>
                <input
                  type="text"
                  name="keyCode"
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  placeholder="1234"
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
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Adding..." : "Save Cart"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
