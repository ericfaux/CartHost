import { ShieldCheck, Clock, Wrench } from "lucide-react";

interface Stat {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  description: string;
}

const stats: Stat[] = [
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    iconBg: "bg-teal-50",
    iconColor: "text-accent-ops",
    label: "Dispute Protection",
    value: "Evidence-Ready",
    description:
      "Every rental generates exportable documentation with timestamps and hashes",
  },
  {
    icon: <Clock className="h-5 w-5" />,
    iconBg: "bg-blue-50",
    iconColor: "text-accent-info",
    label: "Guest Checkout",
    value: "< 3 min",
    description:
      "No app download. Guests complete the entire flow in their mobile browser",
  },
  {
    icon: <Wrench className="h-5 w-5" />,
    iconBg: "bg-amber-50",
    iconColor: "text-accent-warning",
    label: "Maintenance Logging",
    value: "Centralized",
    description:
      "Track repairs, costs, and service history for every vehicle in your fleet",
  },
];

export function StatsRow() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-surface rounded-dossier-surface border border-rule shadow-dossier-surface p-5"
        >
          <div className="flex items-start gap-4">
            <div
              className={`
                flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-dossier-control
                ${stat.iconBg} ${stat.iconColor}
              `}
            >
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-mono uppercase text-ink-muted tracking-wider">
                {stat.label}
              </p>
              <p className="text-xl font-heading font-bold text-ink mt-0.5">
                {stat.value}
              </p>
            </div>
          </div>
          <p className="text-sm text-ink-subtle mt-3">{stat.description}</p>
        </div>
      ))}
    </div>
  );
}
