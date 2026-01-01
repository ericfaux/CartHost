"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  CheckCircle,
  Stamp,
  ClipboardCheck,
  ArrowRight,
  QrCode,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { useTour } from "../app/dashboard/tour-context";

export type DashboardTourProps = {
  carts: { id: string }[];
  rentals: { id: string }[];
  profile: { phone_number?: string | null } | null;
};

export default function DashboardTour({ carts, rentals, profile }: DashboardTourProps) {
  const { startTour } = useTour();
  const router = useRouter();

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
        showTestButton: false,
      },
      {
        title: "Set up support contact info",
        description: "",
        href: "/dashboard/settings",
        completed: step2Profile,
        showTestButton: false,
      },
      {
        title: "Complete your first rental",
        description: "Print a QR code and scan it to test the flow.",
        href: null,
        completed: step3Rental,
        showTestButton: !step3Rental && step1Assets, // Only show if has vehicles but no rentals
      },
    ];

    const completionPercent = Math.round((completed / 3) * 100);

    return {
      completedSteps: completed,
      steps: checklistSteps,
      progress: completionPercent,
    };
  }, [carts.length, profile?.phone_number, rentals.length]);

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
                {step.showTestButton && (
                  <Button
                    variant="ops"
                    size="sm"
                    className="mt-2"
                    onClick={() => router.push("/dashboard/fleet")}
                    icon={<QrCode className="h-3.5 w-3.5" />}
                  >
                    Test the Flow
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Setup Complete State
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
        <Button variant="ops" onClick={startTour}>
          Start Dashboard Tour
        </Button>
      </div>
    </div>
  );
}
