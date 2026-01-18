"use client";

import { useState, useMemo } from "react";
import { Input, Select } from "@/components/ui/Input";
import {
  MarketingNav,
  BetaAccessModal,
  ToolUpsell,
  Footer,
} from "@/components/marketing";

const LIFESPAN_OPTIONS = [
  { value: "1", label: "1 year (Abuse)" },
  { value: "2", label: "2 years (Average)" },
  { value: "5", label: "5 years (Perfect Care)" },
];

export default function BatteryCalculatorPage() {
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false);

  const [fleetSize, setFleetSize] = useState(1);
  const [batteryCost, setBatteryCost] = useState(1200);
  const [lifespanYears, setLifespanYears] = useState(2);

  const { yearlyCost, optimalCost, waste } = useMemo(() => {
    const yearly = (fleetSize * batteryCost) / lifespanYears;
    const optimal = (fleetSize * batteryCost) / 5;
    const wasteAmount = yearly - optimal;
    return {
      yearlyCost: yearly,
      optimalCost: optimal,
      waste: wasteAmount < 0 ? 0 : wasteAmount,
    };
  }, [fleetSize, batteryCost, lifespanYears]);

  const openBetaModal = () => setIsBetaModalOpen(true);
  const closeBetaModal = () => setIsBetaModalOpen(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-paper">
      <MarketingNav onRequestAccess={openBetaModal} />

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-ink mb-4">
              Golf Cart Battery ROI Calculator
            </h1>
            <p className="text-lg text-ink-subtle max-w-2xl mx-auto">
              See how much money you lose when guests forget to plug in your
              carts.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-surface rounded-dossier-surface border border-rule shadow-dossier-surface p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-ink mb-6">
                Your Fleet Details
              </h2>
              <div className="space-y-5">
                <Input
                  label="Fleet Size"
                  name="fleetSize"
                  type="number"
                  min={1}
                  placeholder="1"
                  value={fleetSize}
                  onChange={(e) =>
                    setFleetSize(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  hint="Number of golf carts in your rental fleet"
                />
                <Input
                  label="Battery Replacement Cost"
                  name="batteryCost"
                  type="number"
                  min={0}
                  placeholder="1200"
                  value={batteryCost}
                  onChange={(e) =>
                    setBatteryCost(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  hint="Cost to replace batteries per cart (in dollars)"
                />
                <Select
                  label="Expected Battery Lifespan"
                  name="lifespanYears"
                  options={LIFESPAN_OPTIONS}
                  value={lifespanYears.toString()}
                  onChange={(e) => setLifespanYears(parseInt(e.target.value))}
                  hint="How long batteries last with current guest behavior"
                />
              </div>
            </div>

            <div className="bg-surface rounded-dossier-surface border border-rule shadow-dossier-surface p-6 sm:p-8 flex flex-col">
              <h2 className="text-lg font-semibold text-ink mb-6">Results</h2>
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-center mb-6">
                  <p className="text-ink-subtle text-sm uppercase tracking-wide mb-2">
                    Annual Battery Expense
                  </p>
                  <p className="text-5xl font-bold text-ink">
                    {formatCurrency(yearlyCost)}
                  </p>
                  <p className="text-ink-muted text-sm mt-2">per year</p>
                </div>

                {waste > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-dossier-control p-4 mb-4">
                    <p className="text-accent-warning font-semibold text-center">
                      Money Wasted on Neglect: {formatCurrency(waste)}/yr
                    </p>
                  </div>
                )}

                <p className="text-ink-muted text-sm text-center">
                  Compared to 5-year optimal lifespan
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface border-y border-rule">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <ToolUpsell variant="battery" onRequestAccess={openBetaModal} />
        </div>
      </section>

      <Footer />
      <BetaAccessModal isOpen={isBetaModalOpen} onClose={closeBetaModal} />
    </div>
  );
}
