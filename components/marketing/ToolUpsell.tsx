"use client";

import { FileCheck, Camera, Zap, Droplets, BatteryWarning } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ToolUpsellProps {
  variant: "waiver" | "battery";
  onRequestAccess: () => void;
}

const variantContent = {
  waiver: {
    headline: "The problem with paper waivers...",
    body: "Paper gets lost. Paper gets wet. Paper doesn't hold up in court when a guest claims they never signed anything. CartHost captures digital signatures with timestamps, IP addresses, and device fingerprints—evidence that actually protects you.",
    visualLabel: "Verified Photo",
    visualIcon: FileCheck,
    visualAccent: "bg-accent-ops/10",
    visualIconColor: "text-accent-ops",
  },
  battery: {
    headline: "Stop buying batteries.",
    body: "Guests leave carts unplugged. Dead batteries shorten lifespan by 50% and cost $800+ to replace. CartHost requires photo proof of plug-in before completing check-in—saving you thousands.",
    visualLabel: "Plugged In",
    visualIcon: Camera,
    visualAccent: "bg-accent-info/10",
    visualIconColor: "text-accent-info",
  },
};

export function ToolUpsell({ variant, onRequestAccess }: ToolUpsellProps) {
  const content = variantContent[variant];
  const VisualIcon = content.visualIcon;

  return (
    <div className="bg-surface rounded-dossier-surface border border-rule shadow-dossier-surface overflow-hidden">
      <div className="grid lg:grid-cols-2">
        {/* Text Side */}
        <div className="p-6 sm:p-8 flex flex-col justify-center">
          <h3 className="font-heading text-xl sm:text-2xl font-semibold text-ink leading-tight">
            {content.headline}
          </h3>
          <p className="text-sm sm:text-base text-ink-subtle mt-3 leading-relaxed">
            {content.body}
          </p>
          <div className="mt-6">
            <Button variant="ops" onClick={onRequestAccess}>
              Get Beta Access
            </Button>
          </div>
        </div>

        {/* Visual Side */}
        <div className="bg-paper border-t lg:border-t-0 lg:border-l border-rule p-6 sm:p-8 flex items-center justify-center">
          <div className="w-full max-w-[280px]">
            {/* Digital Evidence Packet Mock */}
            <div className="bg-surface rounded-dossier-control border border-rule shadow-dossier-surface overflow-hidden">
              {/* Packet Header */}
              <div className="bg-ink/5 border-b border-rule px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-accent-legal/60" />
                  <div className="w-2 h-2 rounded-full bg-accent-warning/60" />
                  <div className="w-2 h-2 rounded-full bg-accent-ops/60" />
                </div>
                <span className="text-[10px] font-mono text-ink-muted uppercase tracking-wider">
                  Evidence Packet
                </span>
              </div>

              {/* Packet Content */}
              <div className="p-4 space-y-3">
                {/* Photo Preview Area */}
                <div className="aspect-[4/3] bg-paper rounded-dossier-sm border border-rule flex flex-col items-center justify-center relative overflow-hidden">
                  {/* Abstract visual representation */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-2 left-2 w-8 h-8 border-2 border-ink rounded-sm" />
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-2 border-ink rounded-sm" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-ink rounded-full" />
                  </div>

                  <div className={`h-12 w-12 rounded-full ${content.visualAccent} flex items-center justify-center mb-2`}>
                    <VisualIcon className={`h-6 w-6 ${content.visualIconColor}`} />
                  </div>
                  <span className="text-xs font-semibold text-ink">
                    {content.visualLabel}
                  </span>
                  <span className="text-[10px] text-ink-muted mt-0.5">
                    Timestamped & Verified
                  </span>
                </div>

                {/* Metadata Rows */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-ink-muted uppercase tracking-wider">
                      Status
                    </span>
                    <span className="font-semibold text-accent-ops">
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-ink-muted uppercase tracking-wider">
                      Hash
                    </span>
                    <span className="font-mono text-ink-subtle">
                      a3f8...c4e2
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-ink-muted uppercase tracking-wider">
                      Captured
                    </span>
                    <span className="font-mono text-ink-subtle">
                      14:23:05 UTC
                    </span>
                  </div>
                </div>
              </div>

              {/* Packet Footer */}
              <div className="bg-ink/5 border-t border-rule px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {variant === "waiver" ? (
                    <Droplets className="h-3 w-3 text-ink-muted" />
                  ) : (
                    <BatteryWarning className="h-3 w-3 text-ink-muted" />
                  )}
                  <span className="text-[10px] text-ink-muted">
                    {variant === "waiver" ? "Waterproof" : "Battery-Saver"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-accent-ops" />
                  <span className="text-[10px] font-semibold text-accent-ops">
                    Protected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
