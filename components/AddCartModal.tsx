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
  type?: string | null;
  requires_lock_photo?: boolean | null;
  access_type: "included" | "upsell";
  upsell_price?: number | null;
  upsell_unit?: string | null;
  access_code?: string | null;
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
  const [type, setType] = useState("electric");
  const [accessType, setAccessType] = useState<"included" | "upsell">("included");
  const [upsellPrice, setUpsellPrice] = useState("");
  const [upsellUnit, setUpsellUnit] = useState("day");
  const [accessCode, setAccessCode] = useState("");
  const [requiresLockPhoto, setRequiresLockPhoto] = useState(true);
  const router = useRouter();

  const isEditing = useMemo(() => Boolean(cart), [cart]);

  useEffect(() => {
    setName(cart?.name ?? "");
    setKeyCode(cart?.key_code ?? "");
    setAccessInstructions(cart?.access_instructions ?? "");
    setStatus((cart?.status ?? "active").toLowerCase());
    setType((cart?.type ?? "electric").toLowerCase());
    setAccessType(cart?.access_type ?? "included");
    setUpsellPrice(cart?.upsell_price?.toString() ?? "");
    setUpsellUnit(cart?.upsell_unit ?? "day");
    setAccessCode(cart?.access_code ?? "");
    setRequiresLockPhoto(
      cart?.requires_lock_photo ?? true
    );
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
    formData.set("type", type);
    formData.set("accessType", accessType);
    formData.set("upsellPrice", upsellPrice.trim());
    formData.set("upsellUnit", upsellUnit);
    formData.set("accessCode", accessCode.trim());
    formData.set("requiresLockPhoto", requiresLockPhoto ? "on" : "off");

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
      setType((cart?.type ?? "electric").toLowerCase());
      setAccessType(cart?.access_type ?? "included");
      setUpsellPrice(cart?.upsell_price?.toString() ?? "");
      setUpsellUnit(cart?.upsell_unit ?? "day");
      setAccessCode(cart?.access_code ?? "");
      setRequiresLockPhoto(cart?.requires_lock_photo ?? true);
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
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[85vh] overflow-y-auto">
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
                <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                <select
                  name="type"
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                >
                  <option value="electric">Electric</option>
                  <option value="gas">Gas</option>
                  <option value="bike">Bike</option>
                </select>
              </div>

              {type === "bike" && (
                <div className="flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2">
                  <label className="flex flex-1 flex-col text-sm text-gray-700">
                    Require Photo of Lock?
                    <span className="text-xs text-gray-500">
                      Enforces proof of the lock before return.
                    </span>
                  </label>
                  <input
                    type="checkbox"
                    name="requiresLockPhoto"
                    checked={requiresLockPhoto}
                    onChange={(event) => setRequiresLockPhoto(event.target.checked)}
                    className="h-5 w-5 accent-purple-600"
                  />
                </div>
              )}

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

              <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm font-semibold text-gray-800">Access & Pricing</p>

                <div className="flex flex-col gap-2 text-sm text-gray-700">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="accessType"
                      value="included"
                      checked={accessType === "included"}
                      onChange={() => setAccessType("included")}
                      className="h-4 w-4"
                    />
                    <span>
                      Included in Stay
                      <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-700">
                        Standard
                      </span>
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="accessType"
                      value="upsell"
                      checked={accessType === "upsell"}
                      onChange={() => setAccessType("upsell")}
                      className="h-4 w-4"
                    />
                    <span>
                      Upsell / Rental
                      <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                        Premium
                      </span>
                    </span>
                  </label>
                </div>

                {accessType === "upsell" && (
                  <div className="space-y-3 rounded-md bg-gray-100 p-3 text-sm text-gray-700">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                          Price ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          name="upsellPrice"
                          value={upsellPrice}
                          onChange={(event) => setUpsellPrice(event.target.value)}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                          placeholder="50"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                          Unit
                        </label>
                        <select
                          name="upsellUnit"
                          value={upsellUnit}
                          onChange={(event) => setUpsellUnit(event.target.value)}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                        >
                          <option value="day">Day</option>
                          <option value="week">Week</option>
                          <option value="stay">Stay</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Unlock Code
                      </label>
                      <input
                        type="text"
                        name="accessCode"
                        value={accessCode}
                        onChange={(event) => setAccessCode(event.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                        placeholder="PIN for guests"
                      />
                      <p className="mt-1 text-[11px] text-gray-500">
                        The PIN guests enter to unlock this cart.
                      </p>
                    </div>
                  </div>
                )}
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
