"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
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
  title: string;
  description: string;
  icon?: ComponentType<{ className?: string }>;
  path: string;
};

type TourContextValue = {
  isOpen: boolean;
  currentStep: number;
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
      title: "Welcome",
      description:
        "Your dashboard is ready. Let's show you how to protect your business.",
      path: "/dashboard",
    },
    {
      title: "Quick Access",
      description:
        "The Command Center. Manage your fleet, open the history log, or record maintenance in one click.",
      icon: LayoutGrid,
      path: "/dashboard",
    },
    {
      title: "Fleet Management",
      description:
        "Your Vehicle Roster. Add, edit, and manage all your carts here. Each cart gets a unique QR code for guest check-in.",
      icon: Activity,
      path: "/dashboard/fleet",
    },
    {
      title: "Protection Overview",
      description:
        "Your Liability Shield. Monitors signed waivers, evidence photos, and open security deposits. If this section is highlighted, ensure you review and return guest deposits in a timely manner.",
      icon: Shield,
      path: "/dashboard",
    },
    {
      title: "Business Performance",
      description:
        "The Bottom Line. Tracks total rides and estimated revenue. Note that revenue figures are based on your fleet's pricing configuration and the guest's self-reported length of stay.",
      icon: TrendingUp,
      path: "/dashboard",
    },
    {
      title: "History (The Evidence Locker)",
      description:
        "Most Important: This is your 'Vault'. If a guest damages a cart, come here immediately to find their signed waiver, pre-ride photos, and IP logs. It is your first line of defense.",
      icon: History,
      path: "/dashboard/history",
    },
    {
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
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = getTourSteps(latestRentalId);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  const endTour = useCallback(() => {
    setIsOpen(false);
    setCurrentStep(0);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev < steps.length - 1) {
        return prev + 1;
      }
      setIsOpen(false);
      return 0;
    });
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  return (
    <TourContext.Provider
      value={{
        isOpen,
        currentStep,
        steps,
        latestRentalId,
        startTour,
        endTour,
        nextStep,
        prevStep,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}
