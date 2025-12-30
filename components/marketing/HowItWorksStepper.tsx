import { QrCode, FileSignature, Camera, Plug } from "lucide-react";
import type { ReactNode } from "react";

interface Step {
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: <QrCode className="h-5 w-5" />,
    iconBg: "bg-blue-50",
    iconColor: "text-accent-info",
    title: "Scan to Start",
    description:
      "Guest scans QR code on cart. No app download required—works in any browser.",
  },
  {
    icon: <FileSignature className="h-5 w-5" />,
    iconBg: "bg-teal-50",
    iconColor: "text-accent-ops",
    title: "Sign Waiver + ID",
    description:
      "Digital waiver captures timestamp, IP address, and user agent for legal protection.",
  },
  {
    icon: <Camera className="h-5 w-5" />,
    iconBg: "bg-amber-50",
    iconColor: "text-accent-warning",
    title: "Pre-Ride Inspection",
    description:
      "4 photos required + pre-existing damage notes. Each photo hashed for authenticity.",
  },
  {
    icon: <Plug className="h-5 w-5" />,
    iconBg: "bg-green-50",
    iconColor: "text-accent-success",
    title: "Return Proof",
    description:
      "Guest photographs plug in wall or key return to close session. Evidence sealed.",
  },
];

export function HowItWorksStepper() {
  return (
    <div className="bg-surface rounded-dossier-surface border border-rule shadow-dossier-surface overflow-hidden">
      {/* Header Strip */}
      <div className="bg-paper border-b border-rule px-4 sm:px-6 py-3">
        <p className="font-mono text-xs text-ink-muted uppercase tracking-wider">
          Rental Flow Protocol
        </p>
      </div>

      {/* Steps */}
      <div className="divide-y divide-rule">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="flex items-start gap-4 p-4 sm:p-6 hover:bg-paper/50 transition-colors"
          >
            {/* Step Number & Icon */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-ink-muted uppercase tracking-wider">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div
                className={`
                  flex h-10 w-10 items-center justify-center rounded-dossier-control
                  ${step.iconBg} ${step.iconColor}
                `}
              >
                {step.icon}
              </div>
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 pt-1">
              <h3 className="font-heading text-base font-semibold text-ink">
                {step.title}
              </h3>
              <p className="text-sm text-ink-subtle mt-1">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
