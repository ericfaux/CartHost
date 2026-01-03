'use client';

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
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
            {/* Icon Container */}
            <div className="flex shrink-0 items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Wallet className="h-6 w-6 text-gray-600" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <p className="text-lg font-bold text-gray-900">
                No financial data recorded
              </p>
              <p className="mt-2 text-sm text-gray-500">
                CartHost calculates revenue and security deposits automatically based on your rental history. Configure your default deposit settings to start tracking value, or hide this section if you don't use it.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/dashboard/settings"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Configure Defaults
                </Link>
                <button
                  type="button"
                  onClick={onHide}
                  disabled={isPending}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 disabled:cursor-wait disabled:opacity-70"
                >
                  Hide Section
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
