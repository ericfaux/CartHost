"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
  type ComponentType,
} from "react";
import {
  Shield,
  LayoutGrid,
  QrCode,
  Vault,
  FolderOpen,
  Briefcase,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

export type TourStep = {
  id: string;
  title: string;
  description: string;
  icon?: ComponentType<{ className?: string }>;
  targetId?: string;      // The ID/data-tour of the HTML element to highlight
  path?: string;          // Route to navigate to before showing
  action?: "next" | "dismiss"; // What the primary button does
  onMobile?: "modal" | "skip"; // Behavior on small screens (default: "modal")
  requiresData?: boolean; // If true, step requires specific data (like latestRentalId)
};

type TourState = {
  isOpen: boolean;
  currentStep: number;
  isNavigating: boolean;   // True while waiting for route/element
  isMobileView: boolean;   // Detected viewport size
};

type TourContextValue = {
  isOpen: boolean;
  currentStep: number;
  currentStepData: TourStep | null;
  steps: TourStep[];
  latestRentalId: string | null;
  isNavigating: boolean;
  isMobileView: boolean;
  targetRect: DOMRect | null; // Position of the current target element
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipToStep: (stepId: string) => void;
};

// ============================================================================
// TOUR STEPS DEFINITION
// ============================================================================

function getTourSteps(latestRentalId: string | null): TourStep[] {
  return [
    {
      id: "briefing-start",
      title: "Welcome to Command",
      description:
        "This is your operational headquarters. Every rental, every waiver, every photo — it's all captured here. Let's walk you through your liability shield.",
      icon: Briefcase,
      path: "/dashboard",
      onMobile: "modal",
    },
    {
      id: "fleet-nav",
      title: "Your Fleet",
      description:
        "Manage your assets here. Add vehicles, set pricing, configure deposits, and generate guest check-in codes.",
      icon: LayoutGrid,
      targetId: "tour-fleet-nav",
      path: "/dashboard",
      onMobile: "modal",
    },
    {
      id: "qr-button",
      title: "The Guest Entry Point",
      description:
        "This is where guests start. Hover over any asset card and click the QR button to generate a check-in code. Print it or share the link — when they scan, the evidence collection begins.",
      icon: QrCode,
      targetId: "tour-qr-button",
      path: "/dashboard/fleet",
      onMobile: "modal",
    },
    {
      id: "history-nav",
      title: "The Evidence Locker",
      description:
        "Your vault. Every signed waiver, every photo, every IP address — it's all here. When a dispute arises, this is your first stop.",
      icon: Vault,
      targetId: "tour-history-nav",
      path: "/dashboard",
      onMobile: "modal",
    },
    {
      id: "evidence-packet",
      title: "The Kill Shot",
      description: latestRentalId
        ? "Each rental generates a sealed evidence packet. Signed waivers, timestamped photos, device fingerprints — everything you need to win a dispute."
        : "Once you have your first rental, each one generates a sealed evidence packet. Signed waivers, timestamped photos, device fingerprints — everything you need to win a dispute.",
      icon: FolderOpen,
      targetId: latestRentalId ? "tour-packet-row" : undefined,
      path: latestRentalId ? `/dashboard/history/${latestRentalId}` : undefined,
      onMobile: "modal",
      requiresData: !latestRentalId, // Marks this step as data-dependent
    },
  ];
}

// ============================================================================
// CONTEXT
// ============================================================================

const TourContext = createContext<TourContextValue | null>(null);

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

type TourProviderProps = {
  children: ReactNode;
  latestRentalId: string | null;
};

export function TourProvider({ children, latestRentalId }: TourProviderProps) {
  const [tourState, setTourState] = useState<TourState>({
    isOpen: false,
    currentStep: 0,
    isNavigating: false,
    isMobileView: false,
  });

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setTourState((prev) => ({
        ...prev,
        isMobileView: window.innerWidth < 768,
      }));
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Memoize steps
  const steps = useMemo(
    () => getTourSteps(latestRentalId),
    [latestRentalId]
  );

  // Derive current step data
  const currentStepData = useMemo(() => {
    const { currentStep } = tourState;
    if (currentStep >= 0 && currentStep < steps.length) {
      return steps[currentStep];
    }
    return null;
  }, [tourState, steps]);

  // Update target rect when step changes or window resizes/scrolls
  useEffect(() => {
    if (!tourState.isOpen || !currentStepData?.targetId) {
      setTargetRect(null);
      return;
    }

    const updateTargetRect = () => {
      // Try data-tour attribute first, then fall back to id
      let element = document.querySelector(`[data-tour="${currentStepData.targetId}"]`);
      if (!element) {
        element = document.getElementById(currentStepData.targetId ?? "");
      }

      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    };

    // Initial update
    updateTargetRect();

    // Update on resize and scroll
    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, true);

    return () => {
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
    };
  }, [tourState.isOpen, currentStepData?.targetId]);

  // Start tour
  const startTour = useCallback(() => {
    setTourState((prev) => ({
      ...prev,
      isOpen: true,
      currentStep: 0,
      isNavigating: false,
    }));
  }, []);

  // End tour
  const endTour = useCallback(() => {
    setTourState((prev) => ({
      ...prev,
      isOpen: false,
      currentStep: 0,
      isNavigating: false,
    }));
    setTargetRect(null);
  }, []);

  // Next step
  const nextStep = useCallback(() => {
    setTourState((prev) => {
      const nextIndex = prev.currentStep + 1;

      if (nextIndex >= steps.length) {
        return {
          ...prev,
          isOpen: false,
          currentStep: 0,
          isNavigating: false,
        };
      }

      return {
        ...prev,
        currentStep: nextIndex,
        isNavigating: false,
      };
    });
  }, [steps.length]);

  // Previous step
  const prevStep = useCallback(() => {
    setTourState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
      isNavigating: false,
    }));
  }, []);

  // Skip to specific step
  const skipToStep = useCallback((stepId: string) => {
    const stepIndex = steps.findIndex((s) => s.id === stepId);
    if (stepIndex !== -1) {
      setTourState((prev) => ({
        ...prev,
        currentStep: stepIndex,
        isNavigating: false,
      }));
    }
  }, [steps]);

  // Set navigating state
  const setNavigating = useCallback((isNavigating: boolean) => {
    setTourState((prev) => ({
      ...prev,
      isNavigating,
    }));
  }, []);

  // Context value
  const contextValue = useMemo<TourContextValue>(
    () => ({
      isOpen: tourState.isOpen,
      currentStep: tourState.currentStep,
      currentStepData,
      steps,
      latestRentalId,
      isNavigating: tourState.isNavigating,
      isMobileView: tourState.isMobileView,
      targetRect,
      startTour,
      endTour,
      nextStep,
      prevStep,
      skipToStep,
    }),
    [
      tourState.isOpen,
      tourState.currentStep,
      tourState.isNavigating,
      tourState.isMobileView,
      currentStepData,
      steps,
      latestRentalId,
      targetRect,
      startTour,
      endTour,
      nextStep,
      prevStep,
      skipToStep,
    ]
  );

  return (
    <TourContext.Provider value={contextValue}>
      {children}
    </TourContext.Provider>
  );
}
