"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useTour } from "../app/dashboard/tour-context";
import { Button } from "./ui/Button";

export default function GlobalTourOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, currentStep, steps, endTour, nextStep, prevStep } = useTour();

  const step = steps[currentStep];
  const Icon = step?.icon;

  // Auto-navigate when step changes
  useEffect(() => {
    if (!isOpen || !step) return;

    const targetPath = step.path;
    if (targetPath && pathname !== targetPath) {
      router.push(targetPath);
    }
  }, [isOpen, currentStep, step, pathname, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="dossier-overlay"
        onClick={endTour}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg dossier-panel-elevated overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-rule bg-paper">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-accent-ops uppercase tracking-wider">
              Tour Step
            </span>
            <span className="font-mono text-xs font-bold text-ink bg-accent-ops/10 px-2 py-0.5 rounded">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
          <button
            type="button"
            onClick={endTour}
            className="p-1.5 rounded-dossier-sm text-ink-subtle hover:text-ink hover:bg-surface transition-colors"
            aria-label="Close tour"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-6">
          <div className="flex items-start gap-4">
            {Icon && (
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-dossier-control bg-accent-ops/10">
                <Icon className="h-7 w-7 text-accent-ops" />
              </div>
            )}
            <div className="space-y-2">
              <h3 className="font-heading text-xl font-bold text-ink">
                {step.title}
              </h3>
              <p className="text-sm text-ink-subtle leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>

          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentStep
                    ? "w-4 bg-accent-ops"
                    : index < currentStep
                    ? "w-1.5 bg-accent-ops/50"
                    : "w-1.5 bg-rule"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-rule bg-paper">
          <button
            type="button"
            onClick={endTour}
            className="text-sm font-medium text-ink-subtle hover:text-ink transition-colors"
          >
            Skip Tour
          </button>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <Button variant="ops" size="sm" onClick={nextStep}>
              {currentStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
