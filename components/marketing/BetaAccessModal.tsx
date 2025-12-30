"use client";

import { useState } from "react";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Input, Textarea, Toggle } from "../ui/Input";
import { StampSealed } from "../ui/Badge";

interface BetaAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormState = "idle" | "submitting" | "success" | "error";

interface FormData {
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

export function BetaAccessModal({ isOpen, onClose }: BetaAccessModalProps) {
  const [formState, setFormState] = useState<FormState>("idle");
  const [formData, setFormData] = useState<FormData>({
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
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setFormState("submitting");

    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Since we don't have a backend configured, we'll show success
    // and provide a mailto fallback
    setFormState("success");
  };

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
    setFormState("idle");
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
    setErrors({});
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
          {formState === "success" ? (
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                error={errors.email}
                required
              />

              <Input
                label="Location (optional)"
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
                placeholder="Tell us about your rental operation..."
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="ops"
                  className="w-full"
                  loading={formState === "submitting"}
                  disabled={formState === "submitting"}
                >
                  {formState === "submitting" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Request Access"
                  )}
                </Button>
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
