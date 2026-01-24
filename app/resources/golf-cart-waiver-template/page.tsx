"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, FileText, AlertTriangle, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  MarketingNav,
  BetaAccessModal,
  Footer,
} from "@/components/marketing";

export default function GolfCartWaiverTemplatePage() {
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false);

  const openBetaModal = () => setIsBetaModalOpen(true);
  const closeBetaModal = () => setIsBetaModalOpen(false);

  return (
    <div className="min-h-screen bg-paper">
      <MarketingNav onRequestAccess={openBetaModal} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-ink leading-tight mb-6">
              Free Golf Cart Liability Waiver Template for Airbnb Hosts (2026 Edition)
            </h1>
            <p className="text-lg text-ink-subtle max-w-2xl mx-auto mb-8">
              Protect your property. Ensure guest safety. Download the free PDF or Word Doc below.
            </p>

            {/* Download Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button
                variant="ops"
                size="lg"
                icon={<Download className="h-4 w-4" />}
                iconPosition="left"
              >
                Download PDF
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon={<FileText className="h-4 w-4" />}
                iconPosition="left"
              >
                Download Word Doc
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trojan Horse Upsell Block */}
      <section className="bg-amber-50 border-y border-amber-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-amber-900 mb-3">
                The Problem with Paper Waivers
              </h2>
              <p className="text-amber-800 mb-6">
                Paper waivers get lost, don&apos;t prove <em>who</em> was driving, and don&apos;t capture pre-ride photos. If a guest damages your cart, a paper form won&apos;t help you prove the condition.
              </p>
              <Link href="/signup">
                <Button
                  variant="ops"
                  icon={<ShieldCheck className="h-4 w-4" />}
                  iconPosition="left"
                >
                  Upgrade to Digital Waivers (Free for 3 Carts)
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Body */}
      <section className="bg-paper">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <article className="prose prose-lg max-w-none">
            {/* What This Waiver Covers */}
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink mt-0 mb-4">
              What This Golf Cart Waiver Covers
            </h2>
            <p className="text-ink-subtle mb-6">
              Our free golf cart liability waiver template is designed specifically for vacation rental hosts who provide golf carts to their Airbnb, VRBO, or direct-booking guests. This document establishes the terms of use, outlines safety requirements, and helps protect you from liability claims when guests operate your golf carts on your property.
            </p>
            <p className="text-ink-subtle mb-8">
              The waiver includes essential clauses covering assumption of risk, release of liability, indemnification, and guest acknowledgment of safety rules. It&apos;s been reviewed by attorneys familiar with vacation rental operations and hospitality law.
            </p>

            {/* Why AirCover Excludes Golf Carts */}
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink mb-4">
              Why Airbnb AirCover Excludes Golf Carts
            </h2>
            <p className="text-ink-subtle mb-6">
              Many hosts assume that Airbnb&apos;s AirCover protection extends to golf cart damage and liability. Unfortunately, this is not the case. Airbnb&apos;s Host Protection Insurance and Host Damage Protection both contain explicit exclusions for motorized vehicles, including golf carts, ATVs, and similar equipment.
            </p>
            <p className="text-ink-subtle mb-6">
              According to Airbnb&apos;s terms, AirCover excludes &quot;damage to or theft of motor vehicles, watercraft, aircraft, or similar vehicles.&quot; This means if a guest crashes your golf cart, drives it into a pool, or causes damage to third-party property, you&apos;re on your own for recovery costs.
            </p>
            <p className="text-ink-subtle mb-8">
              This is why having a signed liability waiver is essential&mdash;it&apos;s your primary protection when platform coverage doesn&apos;t apply.
            </p>

            {/* 3 Clauses Your Rental Agreement Needs */}
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink mb-4">
              3 Clauses Your Rental Agreement Needs
            </h2>
            <p className="text-ink-subtle mb-4">
              A basic waiver isn&apos;t enough. To maximize protection, your golf cart rental agreement should include these three critical clauses:
            </p>

            <div className="bg-surface rounded-dossier-surface border border-rule p-6 mb-6">
              <h3 className="font-heading text-lg font-semibold text-ink mb-2">
                1. Assumption of Risk
              </h3>
              <p className="text-ink-subtle mb-0">
                This clause establishes that the guest understands and accepts the inherent risks of operating a golf cart, including the risk of injury, property damage, and accidents. It acknowledges that golf carts can tip over, collide with obstacles, or malfunction.
              </p>
            </div>

            <div className="bg-surface rounded-dossier-surface border border-rule p-6 mb-6">
              <h3 className="font-heading text-lg font-semibold text-ink mb-2">
                2. Release and Waiver of Liability
              </h3>
              <p className="text-ink-subtle mb-0">
                The guest agrees to release you, your property, and your business from any claims, lawsuits, or demands arising from their use of the golf cart. This covers personal injury, property damage, and consequential damages.
              </p>
            </div>

            <div className="bg-surface rounded-dossier-surface border border-rule p-6 mb-8">
              <h3 className="font-heading text-lg font-semibold text-ink mb-2">
                3. Damage Responsibility & Security Deposit
              </h3>
              <p className="text-ink-subtle mb-0">
                Clearly state that the guest is financially responsible for any damage to the golf cart during their rental period, beyond normal wear and tear. Include language authorizing charges to their payment method or security deposit.
              </p>
            </div>

            {/* Common Mistakes Hosts Make */}
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink mb-4">
              Common Mistakes Hosts Make with Golf Cart Waivers
            </h2>
            <p className="text-ink-subtle mb-4">
              Even hosts who use waivers often make critical errors that can invalidate their protection:
            </p>
            <ul className="text-ink-subtle mb-8 space-y-2">
              <li><strong>No photo documentation:</strong> Without before and after photos, you can&apos;t prove when damage occurred. Guests will claim it was pre-existing.</li>
              <li><strong>Missing driver identification:</strong> If multiple guests have access to the cart, you need to know who was driving when damage occurred.</li>
              <li><strong>Unsigned or partially completed waivers:</strong> A waiver without a signature is worthless. Digital capture with timestamps is more reliable than paper.</li>
              <li><strong>No safety briefing acknowledgment:</strong> Courts look favorably on hosts who can prove they provided safety instructions.</li>
              <li><strong>Using generic templates:</strong> Templates not designed for vacation rentals may miss crucial provisions for short-term hospitality scenarios.</li>
            </ul>

            {/* State-by-State Considerations */}
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink mb-4">
              State-by-State Legal Considerations
            </h2>
            <p className="text-ink-subtle mb-6">
              Liability waiver enforceability varies significantly by state. Some states like California have specific requirements for assumption of risk language. Florida, a major vacation rental market, generally enforces liability waivers but requires clear and unambiguous language.
            </p>
            <p className="text-ink-subtle mb-8">
              We recommend having any waiver template reviewed by a local attorney familiar with your state&apos;s laws. This template provides a strong starting point, but local legal requirements should always be verified.
            </p>

            {/* Why Digital Waivers Are Better */}
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink mb-4">
              Why Smart Hosts Are Switching to Digital Waivers
            </h2>
            <p className="text-ink-subtle mb-6">
              While paper waivers are better than nothing, digital waiver systems offer significant advantages for vacation rental hosts:
            </p>
            <ul className="text-ink-subtle mb-8 space-y-2">
              <li><strong>Timestamped signatures:</strong> Prove exactly when the waiver was signed with cryptographic verification.</li>
              <li><strong>Photo evidence integration:</strong> Capture before and after photos in the same workflow as the waiver.</li>
              <li><strong>Driver identification:</strong> Know exactly who signed and agreed to the terms.</li>
              <li><strong>Cloud storage:</strong> Waivers can&apos;t be lost, damaged, or destroyed by water or fire.</li>
              <li><strong>Easy retrieval:</strong> Find any waiver instantly when a dispute arises months later.</li>
            </ul>
          </article>

          {/* Secondary CTA */}
          <div className="mt-12 bg-surface rounded-dossier-surface border border-rule p-8 text-center">
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-ink mb-3">
              Ready to protect your golf cart fleet?
            </h3>
            <p className="text-ink-subtle mb-6">
              CartHost automates waivers, inspection photos, and damage evidence for Airbnb hosts.
            </p>
            <Button
              variant="ops"
              size="lg"
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
              onClick={openBetaModal}
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      <BetaAccessModal isOpen={isBetaModalOpen} onClose={closeBetaModal} />
    </div>
  );
}
