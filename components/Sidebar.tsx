"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Vault,
  LogOut,
  LayoutDashboard,
  Wrench,
  LifeBuoy,
  Settings,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "../app/auth/actions";
import { Logo } from "./ui/Logo";

const navLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Fleet", href: "/dashboard/fleet", icon: LayoutGrid, tourId: "tour-fleet-nav" },
  { label: "Evidence Locker", href: "/dashboard/history", icon: Vault, tourId: "tour-history-nav" },
  { label: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Support", href: "/dashboard/support", icon: LifeBuoy },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const NavContent = () => (
    <>
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <Logo className="text-3xl" variant="inverted" />
        <div className="flex flex-col -space-y-0.5">
          <span className="font-heading font-bold text-base tracking-wide text-white">
            CartHost
          </span>
          <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">
            Console
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        <div className="mb-3 px-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">
            Navigation
          </p>
        </div>
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              data-active={active}
              data-tour={link.tourId}
              className={`
                group relative flex items-center gap-3 px-3 py-2.5 rounded-dossier-control text-sm font-medium
                transition-all duration-150
                ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90"
                }
              `}
            >
              {/* Active indicator bar */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-accent-ops" />
              )}
              <Icon
                className={`h-5 w-5 transition-colors ${
                  active ? "text-accent-ops-light" : "text-white/50 group-hover:text-white/80"
                }`}
              />
              <span className="flex-1">{link.label}</span>
              {active && (
                <ChevronRight className="h-4 w-4 text-white/40" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-dossier-control px-3 py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-red-950/30 hover:text-red-400"
        >
          <LogOut className="h-5 w-5 transition-colors group-hover:text-red-400" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col bg-ink border-r border-ink/80 md:flex">
        <NavContent />
      </aside>

      {/* Mobile Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-rule bg-ink px-4 md:hidden">
        <Logo className="text-lg" variant="inverted" />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-dossier-control text-white/70 hover:bg-white/10 hover:text-white"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 flex-col bg-ink transform transition-transform duration-200 ease-out md:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <NavContent />
      </aside>

      {/* Spacer for mobile header */}
      <div className="h-16 md:hidden" />
    </>
  );
}
