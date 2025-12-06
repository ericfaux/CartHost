"use client";

import { useEffect, useMemo, useState, FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createCart, updateCart } from "../app/dashboard/actions";

type Cart = {
  id: string;
  name: string;
  key_code?: string | null;
  last_serviced_at?: string | null;
  access_instructions?: string | null;
  status?: string | null;
};

type AddCartModalProps = {
  cart?: Cart | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: (open: () => void) => ReactNode;
  showTrigger?: boolean;
};

export default function AddCartModal({
  cart,
  isOpen: controlledOpen,
  onOpenChange,
  trigger,
  showTrigger = true,
}: AddCartModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [keyCode, setKeyCode] = useState("");
  const [lastServicedAt, setLastServicedAt] = useState("");
  const [accessInstructions, setAccessInstructions] = useState("");
  const [status, setStatus] = useState("active");
  const router = useRouter();

  const isEditing = useMemo(() => Boolean(cart), [cart]);

  useEffect(() => {
    setName(cart?.name ?? "");
    setKeyCode(cart?.key_code ?? "");
    setAccessInstructions(cart?.access_instructions ?? "");
    setStatus((cart?.status ?? "active").toLowerCase());
    if (cart?.last_serviced_at) {
      setLastServicedAt(cart.last_serviced_at);
    } else {
      setLastServicedAt("");
    }
  }, [cart, isOpen]);

  const setOpen = (open: boolean) => {
    onOpenChange?.(open);
    if (controlledOpen === undefined) {
      setInternalOpen(open);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("keyCode", keyCode.trim());
    formData.set("lastServicedAt", lastServicedAt.trim());
    formData.set("accessInstructions", accessInstructions.trim());
    formData.set("status", status);

    try {
      if (isEditing && cart) {
        await updateCart(cart.id, formData);
      } else {
        await createCart(formData);
      }
      setName(cart?.name ?? "");
      setKeyCode(cart?.key_code ?? "");
      setLastServicedAt(cart?.last_serviced_at ?? "");
      setAccessInstructions(cart?.access_instructions ?? "");
      setStatus((cart?.status ?? "active").toLowerCase());
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error("Full Error Object:", err);
      setError(err.message || "Failed to save cart");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {showTrigger && (
        trigger ? (
          trigger(() => setOpen(true))
        ) : (
          <button
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-gray-800"
            onClick={() => setOpen(true)}
          >
            Add Cart
          </button>
        )
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {isEditing ? "Edit Cart" : "Add Cart"}
                </h2>
                <p className="text-sm text-gray-500">
                  {isEditing
                    ? "Update cart details for your fleet."
                    : "Create a new cart for your fleet."}
                </p>
              </div>
              <button
                className="text-gray-400 transition hover:text-gray-600"
                onClick={() => setOpen(false)}
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
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  placeholder="Eg. Sunrise Beach Cart"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Key Code (Optional)
                </label>
                <input
                  type="text"
                  name="keyCode"
                  value={keyCode}
                  onChange={(event) => setKeyCode(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  placeholder="1234"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Access Instructions (Optional)
                </label>
                <textarea
                  name="accessInstructions"
                  value={accessInstructions}
                  onChange={(event) => setAccessInstructions(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  placeholder="e.g. Key is in the glove box under the manual."
                  rows={3}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Last Service Date
                </label>
                <input
                  type="date"
                  name="lastServicedAt"
                  value={lastServicedAt}
                  onChange={(event) => setLastServicedAt(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">Leave blank if unknown.</p>
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
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? isEditing
                      ? "Saving..."
                      : "Adding..."
                    : isEditing
                    ? "Save Changes"
                    : "Save Cart"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
