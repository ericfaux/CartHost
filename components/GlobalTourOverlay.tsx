// FILE: components/GlobalTourOverlay.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X, ChevronRight, ChevronLeft, FileText } from "lucide-react";
import { useTour } from "../app/dashboard/tour-context";
import { Button } from "./ui/Button";

// ============================================================================
// CONSTANTS
// ============================================================================

const ELEMENT_WAIT_TIMEOUT = 5000; // 5 seconds max wait
const ELEMENT_POLL_INTERVAL = 100; // Check every 100ms
const SPOTLIGHT_PADDING = 8; // Padding around spotlight target

// ============================================================================
// SPOTLIGHT OVERLAY (Desktop Coachmark)
// ============================================================================

type SpotlightProps = {
  targetRect: DOMRect | null;
  onBackdropClick: () => void;
};

function Spotlight({ targetRect, onBackdropClick }: SpotlightProps) {
  if (!targetRect) {
    // Full backdrop when no target
    return (
      <div
        className="fixed inset-0 bg-ink/70 backdrop-blur-sm transition-all duration-300"
        onClick={onBackdropClick}
        aria-hidden="true"
      />
    );
  }

  // Calculate spotlight cutout with padding
  const spotlightStyle = {
    position: "fixed" as const,
    top: targetRect.top - SPOTLIGHT_PADDING,
    left: targetRect.left - SPOTLIGHT_PADDING,
    width: targetRect.width + SPOTLIGHT_PADDING * 2,
    height: targetRect.height + SPOTLIGHT_PADDING * 2,
    borderRadius: "8px",
    boxShadow: "0 0 0 9999px rgba(20, 20, 20, 0.75)",
    pointerEvents: "none" as const,
    transition: "all 0.3s ease-out",
  };

  return (
    <>
      {/* Clickable backdrop areas */}
      <div
        className="fixed inset-0"
        onClick={onBackdropClick}
        aria-hidden="true"
        style={{ zIndex: -1 }}
      />
      {/* Spotlight cutout */}
      <div style={spotlightStyle} />
    </>
  );
}

// ============================================================================
// COACHMARK POPOVER (Desktop)
// ============================================================================

type CoachmarkPosition = "top" | "bottom" | "left" | "right";

function calculateCoachmarkPosition(
  targetRect: DOMRect | null,
  coachmarkWidth: number = 360,
  coachmarkHeight: number = 200
): { position: CoachmarkPosition; top: number; left: number } {
  if (!targetRect) {
    // Center modal fallback
    return {
      position: "bottom",
      top: window.innerHeight / 2 - coachmarkHeight / 2,
      left: window.innerWidth / 2 - coachmarkWidth / 2,
    };
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const padding = 16;
  const arrowOffset = 12;

  // Check available space in each direction
  const spaceTop = targetRect.top;
  const spaceBottom = viewportHeight - targetRect.bottom;
  const spaceLeft = targetRect.left;
  const spaceRight = viewportWidth - targetRect.right;

  // Prefer bottom, then top, then right, then left
  if (spaceBottom >= coachmarkHeight + padding + arrowOffset) {
    return {
      position: "bottom",
      top: targetRect.bottom + arrowOffset + SPOTLIGHT_PADDING,
      left: Math.max(
        padding,
        Math.min(
          targetRect.left + targetRect.width / 2 - coachmarkWidth / 2,
          viewportWidth - coachmarkWidth - padding
        )
      ),
    };
  }

  if (spaceTop >= coachmarkHeight + padding + arrowOffset) {
    return {
      position: "top",
      top: targetRect.top - coachmarkHeight - arrowOffset - SPOTLIGHT_PADDING,
      left: Math.max(
        padding,
        Math.min(
          targetRect.left + targetRect.width / 2 - coachmarkWidth / 2,
          viewportWidth - coachmarkWidth - padding
        )
      ),
    };
  }

  if (spaceRight >= coachmarkWidth + padding + arrowOffset) {
    return {
      position: "right",
      top: Math.max(
        padding,
        Math.min(
          targetRect.top + targetRect.height / 2 - coachmarkHeight / 2,
          viewportHeight - coachmarkHeight - padding
        )
      ),
      left: targetRect.right + arrowOffset + SPOTLIGHT_PADDING,
    };
  }

  // Default to left
  return {
    position: "left",
    top: Math.max(
      padding,
      Math.min(
        targetRect.top + targetRect.height / 2 - coachmarkHeight / 2,
        viewportHeight - coachmarkHeight - padding
      )
    ),
    left: targetRect.left - coachmarkWidth - arrowOffset - SPOTLIGHT_PADDING,
  };
}

// ============================================================================
// DOSSIER CARD (The step content)
// ============================================================================

type DossierCardProps = {
  title: string;
  description: string;
  stepNumber: number;
  totalSteps: number;
  icon?: React.ComponentType<{ className?: string }>;
  isFirst: boolean;
  isLast: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isNavigating?: boolean;
};

function DossierCard({
  title,
  description,
  stepNumber,
  totalSteps,
  icon: Icon,
  isFirst,
  isLast,
  onNext,
  onPrev,
  onSkip,
  isNavigating,
}: DossierCardProps) {
  return (
    <div className="flex flex-col bg-white rounded-lg border-2 border-slate-200 shadow-2xl overflow-hidden">
      {/* Dossier Header */}
      <div className="flex items-center justify-between gap-4 px-5 py-3 border-b-2 border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Briefing
            </span>
          </div>
          <div className="h-4 w-px bg-slate-300" />
          <span className="font-mono text-xs font-bold text-slate-600 tabular-nums">
            {stepNumber}/{totalSteps}
          </span>
        </div>
        <button
          type="button"
          onClick={onSkip}
          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          aria-label="End tour"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Dossier Body */}
      <div className="px-5 py-4 space-y-3">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
              <Icon className="h-5 w-5 text-slate-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-base font-bold text-slate-900 leading-tight">
              {title}
            </h3>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Dossier Footer */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-t-2 border-slate-200 bg-slate-50">
        {/* Progress Dots */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i + 1 === stepNumber
                  ? "w-4 bg-slate-700"
                  : i + 1 < stepNumber
                  ? "w-1.5 bg-slate-400"
                  : "w-1.5 bg-slate-300"
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          {!isFirst && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onPrev}
              disabled={isNavigating}
              className="gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          )}
          <Button
            variant="ops"
            size="sm"
            onClick={onNext}
            disabled={isNavigating}
            className="gap-1"
          >
            {isNavigating ? (
              "Loading..."
            ) : isLast ? (
              "Complete"
            ) : (
              <>
                Continue
                <ChevronRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MOBILE BOTTOM SHEET
// ============================================================================

type MobileSheetProps = DossierCardProps & {
  onBackdropClick: () => void;
};

function MobileBottomSheet(props: MobileSheetProps) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
        onClick={props.onBackdropClick}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300 pb-safe">
        <DossierCard {...props} />
      </div>
    </div>
  );
}

// ============================================================================
// MAIN OVERLAY COMPONENT
// ============================================================================

export default function GlobalTourOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isOpen,
    currentStep,
    steps,
    currentStepData,
    endTour,
    nextStep,
    prevStep,
    isMobileView,
    targetRect,
    latestRentalId,
  } = useTour();

  const [isWaitingForElement, setIsWaitingForElement] = useState(false);
  const [localTargetRect, setLocalTargetRect] = useState<DOMRect | null>(null);
  const waitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const step = currentStepData ?? steps[currentStep];
  const Icon = step?.icon;

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (waitTimeoutRef.current) {
      clearTimeout(waitTimeoutRef.current);
      waitTimeoutRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Wait for element to appear in DOM
  const waitForElement = useCallback(
    (targetId: string): Promise<DOMRect | null> => {
      return new Promise((resolve) => {
        const findElement = () => {
          let element = document.querySelector(`[data-tour="${targetId}"]`);
          if (!element) {
            element = document.getElementById(targetId);
          }
          return element;
        };

        // Check immediately
        const element = findElement();
        if (element) {
          resolve(element.getBoundingClientRect());
          return;
        }

        // Set up polling and timeout
        setIsWaitingForElement(true);

        waitTimeoutRef.current = setTimeout(() => {
          clearTimers();
          setIsWaitingForElement(false);
          resolve(null); // Fallback: element not found
        }, ELEMENT_WAIT_TIMEOUT);

        pollIntervalRef.current = setInterval(() => {
          const el = findElement();
          if (el) {
            clearTimers();
            setIsWaitingForElement(false);
            resolve(el.getBoundingClientRect());
          }
        }, ELEMENT_POLL_INTERVAL);
      });
    },
    [clearTimers]
  );

  // Handle navigation and element waiting
  useEffect(() => {
    if (!isOpen || !step) return;

    const handleNavigation = async () => {
      // If step has a path and we're not on it, navigate first
      if (step.path && pathname !== step.path) {
        setIsWaitingForElement(true);
        router.push(step.path);
        // Wait a tick for navigation to start
        await new Promise((r) => setTimeout(r, 100));
      }

      // If step has a target, wait for it
      if (step.targetId && !isMobileView) {
        const rect = await waitForElement(step.targetId);
        setLocalTargetRect(rect);
      } else {
        setLocalTargetRect(null);
      }

      setIsWaitingForElement(false);
    };

    handleNavigation();

    return () => {
      clearTimers();
    };
  }, [
    isOpen,
    step,
    pathname,
    router,
    isMobileView,
    waitForElement,
    clearTimers,
  ]);

  // Update local rect when context rect changes
  useEffect(() => {
    if (targetRect) {
      setLocalTargetRect(targetRect);
    }
  }, [targetRect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // RENDER GUARD
  if (!isOpen) return null;
  if (!step) return null;

  // Calculate coachmark position for desktop
  const coachmarkPos = isMobileView
    ? null
    : calculateCoachmarkPosition(localTargetRect);

  const cardProps: DossierCardProps = {
    title: step.title,
    description: step.description,
    stepNumber: currentStep + 1,
    totalSteps: steps.length,
    icon: Icon,
    isFirst: currentStep === 0,
    isLast: currentStep === steps.length - 1,
    onNext: nextStep,
    onPrev: prevStep,
    onSkip: endTour,
    isNavigating: isWaitingForElement,
  };

  // Mobile: Bottom Sheet
  if (isMobileView) {
    return (
      <MobileBottomSheet {...cardProps} onBackdropClick={endTour} />
    );
  }

  // Desktop: Spotlight + Coachmark
  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      {/* Spotlight Overlay */}
      <Spotlight targetRect={localTargetRect} onBackdropClick={endTour} />

      {/* Coachmark Card */}
      {coachmarkPos && (
        <div
          className="fixed w-[360px] animate-in fade-in zoom-in-95 duration-200"
          style={{
            top: coachmarkPos.top,
            left: coachmarkPos.left,
            zIndex: 101,
          }}
        >
          <DossierCard {...cardProps} />
        </div>
      )}
    </div>
  );
}
