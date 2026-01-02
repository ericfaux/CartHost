"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
  type ComponentType,
} from "react";
import {
  Activity,
  History,
  LayoutGrid,
  Shield,
  TrendingUp,
  FolderOpen,
} from "lucide-react";

export type TourStep = {
  id: string;
  title: string;
  description: string;
  icon?: ComponentType<{ className?: string }>;
  path: string;
};

type TourState = {
  isOpen: boolean;
  currentStep: number;
};

type TourContextValue = {
  isOpen: boolean;
  currentStep: number;
  currentStepData: TourStep | null;
  steps: TourStep[];
  latestRentalId: string | null;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
};

const TourContext = createContext<TourContextValue | null>(null);

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}

// Function to generate steps with dynamic paths
function getTourSteps(latestRentalId: string | null): TourStep[] {
  return [
    {
      id: "welcome",
      title: "Welcome",
      description:
        "Your dashboard is ready. Let's show you how to protect your business.",
      path: "/dashboard",
    },
    {
      id: "quick-access",
      title: "Quick Access",
      description:
        "The Command Center. Manage your fleet, open the history log, or record maintenance in one click.",
      icon: LayoutGrid,
      path: "/dashboard",
    },
    {
      id: "qr-step",
      title: "Test Your Flow",
      description:
        "Try it out! Hover over your first vehicle card and click the highlighted QR button to generate a check-in code. Scan it with your phone to see what your guests experience.",
      icon: Activity,
      path: "/dashboard/fleet",
    },
    {
      id: "protection",
      title: "Protection Overview",
      description:
        "Your Liability Shield. Monitors signed waivers, evidence photos, and open security deposits. If this section is highlighted, ensure you review and return guest deposits in a timely manner.",
      icon: Shield,
      path: "/dashboard",
    },
    {
      id: "performance",
      title: "Business Performance",
      description:
        "The Bottom Line. Tracks total rides and estimated revenue. Note that revenue figures are based on your fleet's pricing configuration and the guest's self-reported length of stay.",
      icon: TrendingUp,
      path: "/dashboard",
    },
    {
      id: "history",
      title: "History (The Evidence Locker)",
      description:
        "Most Important: This is your 'Vault'. If a guest damages a cart, come here immediately to find their signed waiver, pre-ride photos, and IP logs. It is your first line of defense.",
      icon: History,
      path: "/dashboard/history",
    },
    {
      id: "evidence-packet",
      title: "Deep Dive: Evidence Packet",
      description:
        "Each rental has a complete evidence packet. View the signed waiver, timestamped photos, IP address, and user agent. This is what you present in a dispute.",
      icon: FolderOpen,
      path: latestRentalId
        ? `/dashboard/history/${latestRentalId}`
        : "/dashboard/history",
    },
  ];
}

type TourProviderProps = {
  children: ReactNode;
  latestRentalId: string | null;
};

export function TourProvider({ children, latestRentalId }: TourProviderProps) {
  // Use a single state object for atomic updates to prevent race conditions
  // This ensures isOpen and currentStep are always in sync
  const [tourState, setTourState] = useState<TourState>({
    isOpen: false,
    currentStep: 0,
  });

  // Memoize steps to prevent unnecessary re-renders
  // Steps only change when latestRentalId changes
  const steps = useMemo(
    () => getTourSteps(latestRentalId),
    [latestRentalId]
  );

  // Derive current step data with bounds checking
  const currentStepData = useMemo(() => {
    const { currentStep } = tourState;
    if (currentStep >= 0 && currentStep < steps.length) {
      return steps[currentStep];
    }
    return null;
  }, [tourState, steps]);

  // Start tour: Reset to step 0 and open in a single atomic update
  const startTour = useCallback(() => {
    setTourState({
      isOpen: true,
      currentStep: 0,
    });
  }, []);

  // End tour: Close and reset in a single atomic update
  const endTour = useCallback(() => {
    setTourState({
      isOpen: false,
      currentStep: 0,
    });
  }, []);

  // Move to next step, or close tour if at the end
  const nextStep = useCallback(() => {
    setTourState((prev) => {
      const nextIndex = prev.currentStep + 1;

      // If we've reached beyond the last step, close the tour
      if (nextIndex >= steps.length) {
        return {
          isOpen: false,
          currentStep: 0,
        };
      }

      // Otherwise, advance to the next step
      return {
        ...prev,
        currentStep: nextIndex,
      };
    });
  }, [steps.length]);

  // Move to previous step (clamped at 0)
  const prevStep = useCallback(() => {
    setTourState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo<TourContextValue>(
    () => ({
      isOpen: tourState.isOpen,
      currentStep: tourState.currentStep,
      currentStepData,
      steps,
      latestRentalId,
      startTour,
      endTour,
      nextStep,
      prevStep,
    }),
    [
      tourState.isOpen,
      tourState.currentStep,
      currentStepData,
      steps,
      latestRentalId,
      startTour,
      endTour,
      nextStep,
      prevStep,
    ]
  );

  return (
    <TourContext.Provider value={contextValue}>
      {children}
    </TourContext.Provider>
  );
}
