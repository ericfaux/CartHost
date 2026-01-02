"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Input, Textarea, Toggle } from "../ui/Input";
import { StampSealed } from "../ui/Badge";
import { requestBetaAccess, type BetaAccessState } from "../../app/actions/marketing";

interface BetaAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BetaFormData {
  email: string;
  location: string;
  vehicleCount: string;
  assetTypes: {
    golfCarts: boolean;
    ebikes: boolean;
    kayaks: boolean;
    other: boolean;
  };
  notes: string;
}

/**
 * Submit button component that uses useFormStatus to show loading state
 */
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="ops"
      className="w-full"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        "Request Access"
      )}
    </Button>
  );
}

export function BetaAccessModal({ isOpen, onClose }: BetaAccessModalProps) {
  const [formData, setFormData] = useState<BetaFormData>({
    email: "",
    location: "",
    vehicleCount: "",
    assetTypes: {
      golfCarts: false,
      ebikes: false,
      kayaks: false,
      other: false,
    },
    notes: "",
  });

  const formRef = useRef<HTMLFormElement>(null);

  // Use Server Action with useFormState
  const [state, formAction] = useFormState<BetaAccessState | null, FormData>(
    requestBetaAccess,
    null
  );

  // Reset form after successful submission
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state?.success]);

  const getMailtoLink = () => {
    const subject = encodeURIComponent("CartHost Beta Access Request");
    const assetTypesSelected = Object.entries(formData.assetTypes)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(", ");

    const body = encodeURIComponent(
      `Hi CartHost team,

I'd like to request beta access.

Email: ${formData.email}
Location: ${formData.location || "Not specified"}
Number of vehicles: ${formData.vehicleCount || "Not specified"}
Asset types: ${assetTypesSelected || "Not specified"}
${formData.notes ? `\nAdditional notes:\n${formData.notes}` : ""}

Thanks!`
    );

    return `mailto:support@carthost.app?subject=${subject}&body=${body}`;
  };

  const handleClose = () => {
    setFormData({
      email: "",
      location: "",
      vehicleCount: "",
      assetTypes: {
        golfCarts: false,
        ebikes: false,
        kayaks: false,
        other: false,
      },
      notes: "",
    });
    formRef.current?.reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-lg bg-surface rounded-dossier-surface border border-rule shadow-dossier-elevated overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 bg-paper border-b border-rule">
          <div>
            <h2
              id="modal-title"
              className="font-heading text-lg font-semibold text-ink"
            >
              Request Beta Access
            </h2>
            <p className="text-sm text-ink-subtle mt-0.5">
              Join our founding host program
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 -m-2 text-ink-subtle hover:text-ink hover:bg-surface rounded-dossier-control transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {state?.success ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-teal-50 mb-4">
                <CheckCircle className="h-8 w-8 text-accent-ops" />
              </div>
              <StampSealed className="mx-auto mb-4" />
              <h3 className="font-heading text-lg font-semibold text-ink mb-2">
                Request Received
              </h3>
              <p className="text-sm text-ink-subtle mb-6">
                We&apos;ll be in touch within 24-48 hours to set up your beta
                access.
              </p>
              <div className="space-y-3">
                <a
                  href={getMailtoLink()}
                  className="block w-full px-4 py-2.5 text-sm font-medium text-center text-ink border border-rule rounded-dossier-control hover:bg-paper transition-colors"
                >
                  Send Backup Email
                </a>
                <Button variant="ops" className="w-full" onClick={handleClose}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form ref={formRef} action={formAction} className="space-y-4">
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                error={state?.errors?.email}
                required
              />

              <Input
                label="Location (optional)"
                name="location"
                type="text"
                placeholder="e.g., Gulf Shores, AL"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                hint="City or region where you operate"
              />

              <Input
                label="Number of vehicles (optional)"
                name="vehicleCount"
                type="number"
                placeholder="e.g., 4"
                min="1"
                value={formData.vehicleCount}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleCount: e.target.value })
                }
              />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle mb-2">
                  Asset Types (optional)
                </p>
                <div className="space-y-2">
                  <input
                    type="hidden"
                    name="assetTypes.golfCarts"
                    value={formData.assetTypes.golfCarts.toString()}
                  />
                  <Toggle
                    checked={formData.assetTypes.golfCarts}
                    onChange={(checked) =>
                      setFormData({
                        ...formData,
                        assetTypes: { ...formData.assetTypes, golfCarts: checked },
                      })
                    }
                    label="Golf Carts"
                  />

                  <input
                    type="hidden"
                    name="assetTypes.ebikes"
                    value={formData.assetTypes.ebikes.toString()}
                  />
                  <Toggle
                    checked={formData.assetTypes.ebikes}
                    onChange={(checked) =>
                      setFormData({
                        ...formData,
                        assetTypes: { ...formData.assetTypes, ebikes: checked },
                      })
                    }
                    label="E-Bikes"
                  />

                  <input
                    type="hidden"
                    name="assetTypes.kayaks"
                    value={formData.assetTypes.kayaks.toString()}
                  />
                  <Toggle
                    checked={formData.assetTypes.kayaks}
                    onChange={(checked) =>
                      setFormData({
                        ...formData,
                        assetTypes: { ...formData.assetTypes, kayaks: checked },
                      })
                    }
                    label="Kayaks / Paddleboards"
                  />

                  <input
                    type="hidden"
                    name="assetTypes.other"
                    value={formData.assetTypes.other.toString()}
                  />
                  <Toggle
                    checked={formData.assetTypes.other}
                    onChange={(checked) =>
                      setFormData({
                        ...formData,
                        assetTypes: { ...formData.assetTypes, other: checked },
                      })
                    }
                    label="Other amenities"
                  />
                </div>
              </div>

              <Textarea
                label="Additional notes (optional)"
                name="notes"
                placeholder="Tell us about your rental operation..."
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />

              {/* Display general errors */}
              {state?.errors?.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-dossier-control text-sm text-red-800">
                  {state.errors.general}
                </div>
              )}

              <div className="pt-2">
                <SubmitButton />
              </div>

              <p className="text-xs text-ink-muted text-center">
                We&apos;ll never share your email with third parties.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
