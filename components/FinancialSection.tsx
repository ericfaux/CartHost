// FILE: components/FinancialSection.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ellipsis, Wallet } from "lucide-react";

import DashboardCharts from "./DashboardCharts";
import type { DashboardPeriod } from "./DashboardCharts";
import { hideFinancialPerformance } from "../app/dashboard/actions";

type FinancialSectionProps = {
  rentals: any[];
  period: DashboardPeriod;
};

export default function FinancialSection({ rentals, period }: FinancialSectionProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { totalRevenue, totalDeposits } = useMemo(() => {
    const totalRevenue = rentals.reduce(
      (sum, rental) => sum + Number(rental?.revenue ?? 0),
      0
    );
    const totalDeposits = rentals.reduce(
      (sum, rental) => sum + Number(rental?.deposit_amount ?? 0),
      0
    );

    return { totalRevenue, totalDeposits };
  }, [rentals]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!isMenuOpen) return;
      const target = event.target as Node | null;
      if (!target) return;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (!isMenuOpen) return;
      if (event.key === "Escape") setIsMenuOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

  function onHide() {
    startTransition(async () => {
      try {
        setIsMenuOpen(false);
        await hideFinancialPerformance();
        router.refresh();
      } catch (error) {
        console.error(error);
      }
    });
  }

  const showNormal = totalRevenue > 0 || totalDeposits > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-2xl font-bold tracking-tight text-gray-900">
            Business Performance
          </p>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Financial performance menu"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <Ellipsis className="h-5 w-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 z-10 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
              <button
                type="button"
                onClick={onHide}
                disabled={isPending}
                className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:cursor-wait disabled:opacity-70"
              >
                Hide Financial Performance
              </button>
            </div>
          )}
        </div>
      </div>

      {showNormal ? (
        <DashboardCharts rentals={rentals} period={period} />
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
          <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 border border-gray-100">
            <Wallet className="h-8 w-8 text-gray-400" />
          </div>

          <div className="flex-1 space-y-2">
            <p className="text-lg font-bold text-gray-900">
              No financial data recorded
            </p>
            <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
              CartHost calculates revenue and security deposits automatically based on your rental history. 
              Configure your default deposit settings to start tracking value, or hide this section if you don&apos;t use it.
            </p>

            <div className="pt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* UPDATED LINK STYLES BELOW */}
              <Link
                href="/dashboard/settings"
                className="inline-flex items-center justify-center rounded-lg bg-accent-ops px-4 py-2 text-sm font-semibold text-white shadow-dossier-bevel transition hover:bg-accent-ops-dark"
              >
                Configure Defaults
              </Link>
              <button
                type="button"
                onClick={onHide}
                disabled={isPending}
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 disabled:cursor-wait disabled:opacity-70"
              >
                Hide Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
