import { FolderLock, Truck, Shield, Wrench, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

interface Feature {
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  link: string;
}

const features: Feature[] = [
  {
    icon: <FolderLock className="h-5 w-5" />,
    iconBg: "bg-blue-50",
    iconColor: "text-accent-info",
    title: "Evidence Locker",
    description:
      "Every rental becomes a sealed case file. Waivers, photos, and metadata stored securely.",
    link: "#evidence-packet",
  },
  {
    icon: <Truck className="h-5 w-5" />,
    iconBg: "bg-teal-50",
    iconColor: "text-accent-ops",
    title: "Fleet Command",
    description:
      "Real-time status for every asset. See what's rented, available, or needs attention.",
    link: "#product",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    iconBg: "bg-green-50",
    iconColor: "text-accent-success",
    title: "Protection Overview",
    description:
      "Monitor compliance posture across your fleet. Waiver rates, photo coverage, and gaps.",
    link: "#product",
  },
  {
    icon: <Wrench className="h-5 w-5" />,
    iconBg: "bg-amber-50",
    iconColor: "text-accent-warning",
    title: "Maintenance Tracker",
    description:
      "Log repairs, track service intervals, and monitor costs per vehicle.",
    link: "#product",
  },
];

export function FeatureGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {features.map((feature) => (
        <a
          key={feature.title}
          href={feature.link}
          className="group block bg-surface rounded-dossier-surface border border-rule shadow-dossier-surface p-5 hover:shadow-dossier-elevated hover:-translate-y-0.5 transition-all"
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={`
                flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-dossier-control
                ${feature.iconBg} ${feature.iconColor}
              `}
            >
              {feature.icon}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-base font-semibold text-ink">
                  {feature.title}
                </h3>
                <ArrowRight className="h-4 w-4 text-ink-muted opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
              <p className="text-sm text-ink-subtle mt-1">
                {feature.description}
              </p>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
