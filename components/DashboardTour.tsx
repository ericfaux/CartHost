"use client";

import Link from "next/link";
import { useMemo, useState, type ComponentType } from "react";
import {
  Activity,
  CheckCircle,
  Circle,
  History,
  LayoutGrid,
  Shield,
  TrendingUp,
} from "lucide-react";

export type DashboardTourProps = {
  carts: { id: string }[];
  rentals: { id: string }[];
  profile: { phone_number?: string | null } | null;
};

type TourStep = {
  title: string;
  description: string;
  icon?: ComponentType<{ className?: string }>;
};

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome", 
    description: "Your dashboard is ready. Let's show you how to protect your business.",
  },
  {
    title: "Quick Access",
    description:
      "The Command Center. Manage your fleet, open the history log, or record maintenance in one click.",
    icon: LayoutGrid,
  },
  {
    title: "Protection Overview",
    description:
      "Your Liability Shield. Quickly see if active rentals have signed waivers and uploaded photos. If this is red, take action.",
    icon: Shield,
  },
  {
    title: "Business Performance",
    description:
      "The Bottom Line. Track your revenue against maintenance costs to see your true Net Profit.",
    icon: TrendingUp,
  },
  {
    title: "Fleet Health",
    description:
      "The Mechanic. We track every trip. When a cart hits 20 rides, we flag it here so you never miss a service date.",
    icon: Activity,
  },
  {
    title: "History (The Evidence Locker)",
    description:
      "Most Important: This is your 'Vault'. If a guest damages a cart, come here immediately to find their signed waiver, pre-ride photos, and IP logs. It is your first line of defense.",
    icon: History,
  },
];

export default function DashboardTour({ carts, rentals, profile }: DashboardTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const { completedSteps, steps, progress } = useMemo(() => {
    const step1Assets = carts.length > 0;
    const step2Profile = Boolean(profile?.phone_number?.trim());
    const step3Rental = rentals.length > 0;

    const completed = [step1Assets, step2Profile, step3Rental].filter(Boolean).length;
    const checklistSteps = [
      {
        title: "Add your first vehicle",
        description: "",
        href: "/dashboard/fleet",
        completed: step1Assets,
      },
      {
        title: "Set up support contact info",
        description: "",
        href: "/dashboard/settings",
        completed: step2Profile,
      },
      {
        title: "Complete your first rental",
        description: "Print a QR code and scan it to test the flow.",
        href: null,
        completed: step3Rental,
      },
    ];

    const completionPercent = Math.round((completed / 3) * 100);

    return {
      completedSteps: completed,
      steps: checklistSteps,
      progress: completionPercent,
    };
  }, [carts.length, profile?.phone_number, rentals.length]);

  const handleStartTour = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsOpen(false);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleDismiss = () => {
    setIsOpen(false);
    setCurrentStep(0);
  };

  if (completedSteps < 3) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-gray-900">
              Welcome to CartHost! Let's get your fleet running.
            </p>
            <p className="mt-1 text-sm text-blue-900/80">
              Knock out these steps to bring your dashboard to life.
            </p>
          </div>
          <div className="text-sm font-semibold text-blue-900">{progress}% Complete</div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white shadow-inner">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-5 space-y-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="flex items-start gap-3 rounded-xl bg-white/60 px-4 py-3"
            >
              <div className="pt-0.5">
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300" />
                )}
              </div>
              <div className="flex-1">
                {step.href ? (
                  <Link
                    href={step.href}
                    className="text-sm font-semibold text-blue-900 underline-offset-2 hover:underline"
                  >
                    {step.title}
                  </Link>
                ) : (
                  <p className="text-sm font-semibold text-blue-900">{step.title}</p>
                )}
                {step.description ? (
                  <p className="text-xs text-blue-900/80">{step.description}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="rounded-2xl border border-green-100 bg-green-50 p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-bold text-gray-900">Setup Complete</p>
          <p className="text-sm text-green-900/80">
            Great work. Start a quick tour to learn where everything lives.
          </p>
        </div>
        <button
          type="button"
          onClick={handleStartTour}
          className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
        >
          Start Dashboard Tour
        </button>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-green-700">Step {currentStep + 1} of {TOUR_STEPS.length}</p>
                <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
              {Icon ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                  <Icon className="h-6 w-6 text-green-700" />
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDismiss}
                className="text-sm font-semibold text-gray-500 hover:text-gray-700"
              >
                Dismiss
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
                >
                  {currentStep === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
