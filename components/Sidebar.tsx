"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  History,
  LogOut,
  Zap,
  LayoutDashboard,
  Wrench,
  LifeBuoy,
  Settings,
} from "lucide-react";
import { signOut } from "../app/auth/actions";

const navLinks = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Fleet", href: "/dashboard/fleet", icon: LayoutGrid },
  { label: "History", href: "/dashboard/history", icon: History },
  { label: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Support", href: "/dashboard/support", icon: LifeBuoy },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-800 bg-slate-900 text-white md:flex">
      {/* Brand Header */}
      <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
        <Zap className="h-5 w-5 text-blue-500" />
        <h1 className="text-lg font-bold tracking-wide text-white">CartHost</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "border-r-2 border-blue-400 bg-blue-500/10 text-blue-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"
                }`}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User */}
      <div className="border-t border-slate-800 p-4">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-red-950/30 hover:text-red-400"
        >
          <LogOut className="h-5 w-5 transition-colors group-hover:text-red-400" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
