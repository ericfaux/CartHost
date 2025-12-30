"use client";

import { useState } from "react";
import {
  FileText,
  Camera,
  Link2,
  CheckCircle2,
  Shield,
  Clock,
} from "lucide-react";
import { StampSealed } from "../ui/Badge";

type TabKey = "waiver" | "photos" | "custody";

interface Tab {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { key: "waiver", label: "Waiver", icon: <FileText className="h-4 w-4" /> },
  { key: "photos", label: "Photos", icon: <Camera className="h-4 w-4" /> },
  {
    key: "custody",
    label: "Chain of Custody",
    icon: <Link2 className="h-4 w-4" />,
  },
];

export function HeroDossierPreview() {
  const [activeTab, setActiveTab] = useState<TabKey>("waiver");

  return (
    <div className="relative">
      {/* Dossier Panel */}
      <div className="bg-surface rounded-dossier-surface border border-rule shadow-dossier-elevated overflow-hidden">
        {/* Header Strip */}
        <div className="bg-paper border-b border-rule px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-ink-muted uppercase tracking-wider">
                CASE ID
              </span>
              <span className="font-mono text-sm font-semibold text-ink">
                RTL-2024-0847
              </span>
            </div>
            <StampSealed />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-rule">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors
                border-b-2 -mb-px
                ${
                  activeTab === tab.key
                    ? "border-accent-ops text-accent-ops"
                    : "border-transparent text-ink-subtle hover:text-ink"
                }
              `}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === "waiver" && <WaiverPreview />}
          {activeTab === "photos" && <PhotosPreview />}
          {activeTab === "custody" && <CustodyPreview />}
        </div>
      </div>

      {/* Decorative Shadow */}
      <div className="absolute -bottom-2 left-4 right-4 h-4 bg-gradient-to-b from-ink/5 to-transparent rounded-b-xl -z-10" />
    </div>
  );
}

function WaiverPreview() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-3 bg-paper rounded-dossier-control border border-rule">
        <div className="flex-shrink-0 mt-0.5">
          <CheckCircle2 className="h-5 w-5 text-accent-ops" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">
            Digital Waiver Executed
          </p>
          <p className="text-xs text-ink-subtle mt-0.5">
            Guest acknowledged liability terms and safety guidelines
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-paper rounded-dossier-control border border-rule">
          <p className="text-[10px] font-mono uppercase text-ink-muted tracking-wider">
            Signed At
          </p>
          <p className="text-sm font-mono font-medium text-ink mt-1">
            2024-12-28 14:23:05 UTC
          </p>
        </div>
        <div className="p-3 bg-paper rounded-dossier-control border border-rule">
          <p className="text-[10px] font-mono uppercase text-ink-muted tracking-wider">
            Guest Name
          </p>
          <p className="text-sm font-medium text-ink mt-1">John D. Smith</p>
        </div>
      </div>

      <div className="p-3 bg-paper rounded-dossier-control border border-rule">
        <p className="text-[10px] font-mono uppercase text-ink-muted tracking-wider">
          IP Address
        </p>
        <p className="text-sm font-mono text-ink mt-1">192.168.1.***</p>
      </div>
    </div>
  );
}

function PhotosPreview() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {["Front", "Right Side", "Left Side", "Rear"].map((label, index) => (
          <div
            key={label}
            className="relative aspect-[4/3] bg-paper rounded-dossier-control border border-rule overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="h-8 w-8 text-ink-muted/30" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-ink/80 backdrop-blur-sm px-2 py-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-white uppercase">
                  {label}
                </span>
                <CheckCircle2 className="h-3 w-3 text-accent-ops-light" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs text-ink-subtle">
        <Shield className="h-3.5 w-3.5 text-accent-ops" />
        <span>All photos include GPS coordinates and SHA-256 hash</span>
      </div>
    </div>
  );
}

function CustodyPreview() {
  const records = [
    {
      label: "Rental Created",
      time: "14:20:03",
      detail: "System generated case file",
    },
    { label: "Waiver Signed", time: "14:23:05", detail: "IP: 192.168.1.***" },
    { label: "Photos Captured", time: "14:25:12", detail: "4 photos verified" },
    {
      label: "Keys Released",
      time: "14:26:00",
      detail: "Digital unlock code sent",
    },
    { label: "Return Logged", time: "18:45:33", detail: "Plug photo verified" },
    { label: "Case Sealed", time: "18:46:00", detail: "Evidence packaged" },
  ];

  return (
    <div className="space-y-1">
      {records.map((record, index) => (
        <div
          key={index}
          className="flex items-start gap-3 py-2 border-b border-rule last:border-0"
        >
          <div className="flex-shrink-0 mt-1">
            <div className="h-2 w-2 rounded-full bg-accent-ops" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-ink">
                {record.label}
              </span>
              <span className="text-xs font-mono text-ink-muted flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {record.time}
              </span>
            </div>
            <p className="text-xs text-ink-subtle">{record.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
