// FILE: components/GlobalTourOverlay.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useTour } from "../app/dashboard/tour-context";
import { Button } from "./ui/Button";

export default function GlobalTourOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, currentStep, steps, currentStepData, endTour, nextStep, prevStep } = useTour();

  // Robust Step Retrieval
  // We use currentStepData (memoized in context) or fallback to index access
  const step = currentStepData ?? steps[currentStep];
  const Icon = step?.icon;

  // EFFECT 1: Handle Navigation & Debugging
  useEffect(() => {
    if (isOpen) {
      console.log("Tour Active:", { currentStep, stepTitle: step?.title, path: step?.path });
    }

    if (!isOpen || !step) return;

    // Navigate if the step requires a specific path and we aren't there
    const targetPath = step.path;
    if (targetPath && pathname !== targetPath) {
      router.push(targetPath);
    }
  }, [isOpen, currentStep, step, pathname, router]);

  // EFFECT 2: Safe "Self-Correction" (Moved out of Render Phase)
  useEffect(() => {
    if (isOpen) {
      // If we are "Open" but have no valid step, close safely
      if (!step || currentStep < 0 || currentStep >= steps.length) {
        console.warn("Tour lost state. Auto-closing to prevent crash.");
        endTour();
      }
    }
  }, [isOpen, step, currentStep, steps.length, endTour]);

  // RENDER GUARD: Strictly visual check
  if (!isOpen) return null;

  // Second guard: If step is missing, render null (Effect 2 will close it shortly)
  if (!step) return null;

  return (
    // UPDATED: z-[100] to beat sticky headers/sidebars
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={endTour}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Tour Step
            </span>
            <span className="font-mono text-xs font-bold text-slate-700 bg-blue-100 px-2 py-0.5 rounded">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
          <button
            type="button"
            onClick={endTour}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            aria-label="Close tour"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-6">
          <div className="flex items-start gap-4">
            {Icon && (
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <Icon className="h-7 w-7 text-blue-600" />
              </div>
            )}
            <div className="space-y-2">
              <h3 className="font-heading text-xl font-bold text-slate-900">
                {step.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
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
                    ? "w-4 bg-blue-600"
                    : index < currentStep
                    ? "w-1.5 bg-blue-200"
                    : "w-1.5 bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={endTour}
            className="text-sm font-medium text-slate-400 hover:text-slate-900 transition-colors"
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
