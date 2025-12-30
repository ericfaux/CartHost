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
  Stamp,
  ClipboardCheck,
  ArrowRight,
  X,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

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
      "Your Liability Shield. Monitors signed waivers, evidence photos, and open security deposits. If this section is highlighted, ensure you review and return guest deposits in a timely manner.",
    icon: Shield,
  },
  {
    title: "Business Performance",
    description:
      "The Bottom Line. Tracks total rides and estimated revenue. Note that revenue figures are based on your fleet's pricing configuration and the guest's self-reported length of stay.",
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

  // Setup Docket (incomplete state)
  if (completedSteps < 3) {
    return (
      <div className="dossier-panel overflow-hidden">
        {/* Docket Header Strip */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-rule bg-accent-info/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-dossier-control bg-accent-info/10">
              <ClipboardCheck className="h-5 w-5 text-accent-info" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-ink">Setup Docket</h2>
              <p className="text-dossier-caption text-ink-subtle">
                Complete these steps to activate your console
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold text-accent-info tabular-nums">
              {progress}%
            </span>
            <Badge variant="active" style="chip">
              {completedSteps}/3 Complete
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-rule">
          <div
            className="h-full bg-accent-info transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Checklist Items */}
        <div className="divide-y divide-rule">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`flex items-start gap-4 px-6 py-4 transition-colors ${
                step.completed ? "bg-accent-ops/5" : "hover:bg-paper"
              }`}
            >
              {/* Step Number / Check */}
              <div className="flex-shrink-0 pt-0.5">
                {step.completed ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-ops">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-rule bg-surface">
                    <span className="font-mono text-xs font-bold text-ink-subtle">{index + 1}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {step.href && !step.completed ? (
                    <Link
                      href={step.href}
                      className="text-sm font-semibold text-ink hover:text-accent-info transition-colors group flex items-center gap-1"
                    >
                      {step.title}
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  ) : (
                    <p className={`text-sm font-semibold ${step.completed ? "text-accent-ops" : "text-ink"}`}>
                      {step.title}
                    </p>
                  )}
                  {step.completed && (
                    <Badge variant="verified" style="stamp" className="scale-75 origin-left">
                      SEALED
                    </Badge>
                  )}
                </div>
                {step.description && (
                  <p className="mt-0.5 text-xs text-ink-muted">{step.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Setup Complete State
  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="dossier-panel overflow-hidden">
      {/* Complete Header Strip */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-rule bg-accent-ops/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-dossier-control bg-accent-ops/10">
            <Stamp className="h-5 w-5 text-accent-ops" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-lg font-bold text-ink">Setup Complete</h2>
              <Badge variant="verified" style="stamp">
                SEALED
              </Badge>
            </div>
            <p className="text-dossier-caption text-ink-subtle">
              Your operations console is ready for action
            </p>
          </div>
        </div>
        <Button variant="ops" onClick={handleStartTour}>
          Start Dashboard Tour
        </Button>
      </div>

      {/* Tour Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="dossier-overlay"
            onClick={handleDismiss}
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
                  {currentStep + 1} / {TOUR_STEPS.length}
                </span>
              </div>
              <button
                type="button"
                onClick={handleDismiss}
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
                  <h3 className="font-heading text-xl font-bold text-ink">{step.title}</h3>
                  <p className="text-sm text-ink-subtle leading-relaxed">{step.description}</p>
                </div>
              </div>

              {/* Progress Dots */}
              <div className="flex items-center justify-center gap-1.5 mt-6">
                {TOUR_STEPS.map((_, index) => (
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
                onClick={handleDismiss}
                className="text-sm font-medium text-ink-subtle hover:text-ink transition-colors"
              >
                Skip Tour
              </button>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                >
                  Back
                </Button>
                <Button variant="ops" size="sm" onClick={handleNext}>
                  {currentStep === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
