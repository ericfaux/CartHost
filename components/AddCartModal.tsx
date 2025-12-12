"use client";

import { useEffect, useMemo, useState, useActionState, ReactNode } from "react";
import { useFormStatus } from "react-dom";
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
  deposit_amount?: number | null;
};

type AddCartModalProps = {
  cart?: Cart | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: (open: () => void) => ReactNode;
  showTrigger?: boolean;
};

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending
        ? isEditing
          ? "Saving..."
          : "Adding..."
        : isEditing
        ? "Save Changes"
        : "Save Asset"}
    </button>
  );
}

export default function AddCartModal({
  cart,
  isOpen: controlledOpen,
  onOpenChange,
  trigger,
  showTrigger = true,
}: AddCartModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
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
  const [depositAmount, setDepositAmount] = useState("");
  const [requiresLockPhoto, setRequiresLockPhoto] = useState(true);
  const [customPhotoRequired, setCustomPhotoRequired] = useState(false);
  const [customPhotoLabel, setCustomPhotoLabel] = useState("");
  const router = useRouter();

  const isEditing = useMemo(() => Boolean(cart), [cart]);

  // Wrapper function that routes to the correct action
  const handleSave = async (prevState: any, formData: FormData) => {
    if (isEditing && cart) {
      formData.set("id", cart.id);
      return updateCart(prevState, formData);
    }
    return createCart(prevState, formData);
  };

  const [state, formAction] = useActionState(handleSave, null);

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
    setDepositAmount(cart?.deposit_amount?.toString() ?? "");
    setRequiresLockPhoto(
      cart?.requires_lock_photo ?? true
    );
    setCustomPhotoRequired(false);
    setCustomPhotoLabel("");
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

  // Close modal on success and reset form
  useEffect(() => {
    if (state?.success) {
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
      setDepositAmount(cart?.deposit_amount?.toString() ?? "");
      setRequiresLockPhoto(cart?.requires_lock_photo ?? true);
      setCustomPhotoRequired(false);
      setCustomPhotoLabel("");
      setOpen(false);
      router.refresh();
    }
  }, [state]);

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
            Add Asset
          </button>
        )
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {isEditing ? "Edit Asset" : "Add Asset"}
                </h2>
                <p className="text-sm text-gray-500">
                  {isEditing
                    ? "Update asset details for your fleet."
                    : "Create a new asset for your fleet."}
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

            <form className="mt-6 space-y-4" action={formAction}>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Asset Name</label>
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
                  <option value="hot_tub">Hot Tub</option>
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

              <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm font-semibold text-gray-800">Security Settings</p>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Security Deposit ($)
                  </label>
                  <input
                    type="number"
                    name="depositAmount"
                    min="0"
                    step="0.01"
                    value={depositAmount}
                    onChange={(event) => setDepositAmount(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Amount to track for this specific vehicle.
                  </p>
                </div>
              </div>

              {/* Custom Requirements */}
              <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm font-semibold text-blue-900">Custom Requirements</p>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="customPhotoRequired"
                    id="customPhotoRequired"
                    checked={customPhotoRequired}
                    onChange={(e) => setCustomPhotoRequired(e.target.checked)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  <label htmlFor="customPhotoRequired" className="text-sm text-blue-800">
                    Require an additional custom photo?
                  </label>
                </div>

                {customPhotoRequired && (
                  <div className="mt-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-blue-700">
                      Photo Instruction
                    </label>
                    <input
                      type="text"
                      name="customPhotoLabel"
                      value={customPhotoLabel}
                      onChange={(e) => setCustomPhotoLabel(e.target.value)}
                      required={customPhotoRequired}
                      className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                      placeholder="e.g. Take a picture of your Driver's License"
                    />
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

              {state?.error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600" role="alert">
                  {state.error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <SubmitButton isEditing={isEditing} />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
