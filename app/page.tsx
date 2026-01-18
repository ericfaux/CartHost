"use client";

import { useState } from "react";
import Script from "next/script";
import {
  FileWarning,
  FileX,
  ImageOff,
  ArrowRight,
  Smartphone,
  Link2,
  Camera,
  ShieldCheck,
  BrainCircuit,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import {
  MarketingNav,
  HeroDossierPreview,
  HowItWorksStepper,
  FeatureGrid,
  EvidencePacketPreview,
  StatsRow,
  FAQ,
  BetaAccessModal,
  Footer,
  SupportCTA,
  PricingSection,
} from "../components/marketing";

export default function LandingPage() {
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false);

  const openBetaModal = () => setIsBetaModalOpen(true);
  const closeBetaModal = () => setIsBetaModalOpen(false);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Do guests need to download an app?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Guests complete the entire checkout flow in their mobile browser. They simply scan the QR code on your cart and follow the on-screen prompts."
        }
      },
      {
        "@type": "Question",
        "name": "Is the waiver legally binding?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CartHost provides the infrastructure for digital waiver capture including timestamp, IP address, and user agent metadata. We recommend having your waiver language reviewed by a local attorney."
        }
      },
      {
        "@type": "Question",
        "name": "How does this help with Airbnb disputes?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CartHost creates a complete chain of custody for every rental. If a guest disputes damage, you have timestamped photos with hashes proving they haven't been altered."
        }
      },
      {
        "@type": "Question",
        "name": "What evidence is captured for each rental?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Each rental captures: a digitally signed waiver with timestamp, IP address, and user agent; four inspection photos with GPS coordinates and SHA-256 hashes; pre-existing damage notes; and return proof photo."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-paper">
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Navigation */}
      <MarketingNav onRequestAccess={openBetaModal} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 24px,
                #0B1220 24px,
                #0B1220 25px
              )`,
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Hero Content */}
            <div className="space-y-6">
              <Badge variant="verified" style="chip">
                Liability-First Operations
              </Badge>

              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-ink leading-tight">
                The <span className="text-accent-ops">Golf Cart Liability</span> & Waiver System for Airbnb Hosts.
              </h1>

              <p className="text-lg text-ink-subtle max-w-xl">
                Turn every rental into a sealed case file. The operating system to automate{" "}
                <strong>liability waivers, inspection photos, and damage evidence</strong>.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button variant="ops" size="lg" onClick={openBetaModal}>
                  Request Beta Access
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<ArrowRight className="h-4 w-4" />}
                  iconPosition="right"
                  onClick={() => {
                    document
                      .getElementById("evidence-packet")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  View Evidence Packet
                </Button>
              </div>

              {/* Trust Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-4 text-sm text-ink-subtle">
                <span className="inline-flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-accent-ops shrink-0" />
                  No app download for guests
                </span>
                <span className="inline-flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-accent-ops shrink-0" />
                  Chain of custody metadata
                </span>
                <span className="inline-flex items-center gap-2">
                  <Camera className="h-4 w-4 text-accent-ops shrink-0" />
                  Photo evidence vault
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-accent-ops shrink-0" />
                  Deters reckless usage
                </span>
              </div>
              
              {/* Platform Trust Strip */}
              <div className="pt-6 border-t border-rule mt-8">
                <p className="text-xs font-mono uppercase text-ink-muted mb-3">
                  Built for hosts on
                </p>
                <div className="flex gap-6 opacity-60 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                  <span className="font-heading font-bold text-ink text-lg">Airbnb</span>
                  <span className="font-heading font-bold text-ink text-lg">Vrbo</span>
                  <span className="font-heading font-bold text-ink text-lg">Booking.com</span>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="lg:pl-4">
              <HeroDossierPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="product" className="bg-surface border-y border-rule">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="font-mono text-xs uppercase text-accent-ops tracking-wider mb-3">
              The Problem
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink">
              Why hosts need bulletproof documentation
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: <BrainCircuit className="h-5 w-5" />,
                iconBg: "bg-indigo-50",
                iconColor: "text-indigo-600",
                title: "Guests treat rentals like toys",
                description:
                  "Casual handoffs signal 'vacation mode.' A formal, legal-grade intake process instantly signals that you are a professional who tracks damage.",
              },
              {
                icon: <FileWarning className="h-5 w-5" />,
                iconBg: "bg-amber-50",
                iconColor: "text-accent-warning",
                title: "Airbnb dispute protection",
                description:
                  "Airbnb Resolution Center requires proof. When a guest claims pre-existing damage, the host with the 'Evidence Packet' wins.",
              },
              {
                icon: <FileX className="h-5 w-5" />,
                iconBg: "bg-red-50",
                iconColor: "text-accent-legal",
                title: "Paper waivers + handoffs = risk",
                description:
                  "Unsigned waivers, missing signatures, and he-said-she-said checkout disputes.",
              },
              {
                icon: <ImageOff className="h-5 w-5" />,
                iconBg: "bg-blue-50",
                iconColor: "text-accent-info",
                title: "Photos without proof don't hold up",
                description:
                  "Timestamps can be faked. Without hashes and metadata, photos are just pictures.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-paper rounded-dossier-surface border border-rule p-5"
              >
                <div
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-dossier-control ${item.iconBg} ${item.iconColor} mb-4`}
                >
                  {item.icon}
                </div>
                <h3 className="font-heading text-base font-semibold text-ink mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-ink-subtle">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-paper">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="font-mono text-xs uppercase text-accent-ops tracking-wider mb-3">
              How It Works
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink">
              Four steps to a sealed case file
            </h2>
            <p className="text-ink-subtle mt-3">
              Every guest interaction is verified, logged, and tied to your
              rental.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <HowItWorksStepper />
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-ink-subtle">
              Works with lockboxes, key safes, or hidden keys — no hardware
              required.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="bg-surface border-y border-rule">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="font-mono text-xs uppercase text-accent-ops tracking-wider mb-3">
              Operations Console
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink">
              Everything you need to run your fleet
            </h2>
          </div>

          <FeatureGrid />
        </div>
      </section>

      {/* Evidence Packet Section */}
      <section id="evidence-packet" className="bg-paper">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="font-mono text-xs uppercase text-accent-ops tracking-wider mb-3">
              The Differentiator
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink">
              Evidence that holds up
            </h2>
            <p className="text-ink-subtle mt-3">
              Every rental generates a complete evidence package with chain of
              custody, timestamps, and cryptographic hashes.
            </p>
          </div>

          <EvidencePacketPreview />
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-surface border-y border-rule">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="font-mono text-xs uppercase text-accent-ops tracking-wider mb-3">
              Designed For Hosts
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink">
              Operational outcomes that matter
            </h2>
          </div>

          <StatsRow />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-paper">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <PricingSection />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-surface border-y border-rule">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="font-mono text-xs uppercase text-accent-ops tracking-wider mb-3">
              FAQ
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink">
              Common questions
            </h2>
          </div>

          <div className="max-w-2xl mx-auto">
            <FAQ />
          </div>
        </div>
      </section>

      {/* Free Resources Section */}
      <section className="bg-surface border-y border-rule py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            {/* Left Column - Text */}
            <div className="space-y-6">
              <p className="font-mono text-xs uppercase text-accent-ops tracking-wider">
                Free Resources
              </p>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink">
                Not ready to automate yet?
              </h2>
              <p className="text-ink-subtle">
                Use our free tools to generate a liability waiver or calculate your battery costs manually. No account required.
              </p>
              <div className="flex flex-wrap gap-6">
                <a
                  href="/tools/waiver-generator"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-accent-ops hover:text-accent-ops-dark transition-colors"
                >
                  <FileWarning className="h-4 w-4" />
                  Waiver Generator
                </a>
                <a
                  href="/tools/battery-calculator"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-accent-ops hover:text-accent-ops-dark transition-colors"
                >
                  <BrainCircuit className="h-4 w-4" />
                  Battery Calculator
                </a>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="flex justify-center">
              <div className="opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                <div className="bg-paper rounded-dossier-surface border border-rule shadow-dossier-surface p-6 w-64">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-dossier-control bg-surface flex items-center justify-center">
                      <FileWarning className="h-5 w-5 text-accent-ops" />
                    </div>
                    <div>
                      <div className="h-3 w-24 bg-surface rounded mb-1.5" />
                      <div className="h-2 w-16 bg-surface rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-surface rounded" />
                    <div className="h-2 w-5/6 bg-surface rounded" />
                    <div className="h-2 w-4/5 bg-surface rounded" />
                    <div className="h-2 w-full bg-surface rounded" />
                    <div className="h-2 w-3/4 bg-surface rounded" />
                  </div>
                  <div className="mt-4 pt-4 border-t border-rule">
                    <div className="h-2 w-1/2 bg-surface rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="bg-surface rounded-dossier-surface border border-rule shadow-dossier-surface p-8 sm:p-12 text-center">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink mb-4">
              Stop disputes with evidence, not arguments.
            </h2>
            <p className="text-ink-subtle mb-8 max-w-lg mx-auto">
              Join the founding hosts building bulletproof rental operations.
            </p>
            <Button variant="ops" size="lg" onClick={openBetaModal}>
              Request Beta Access
            </Button>
          </div>
        </div>
      </section>

      {/* Support CTA Section */}
      <SupportCTA />

      {/* Footer */}
      <Footer />

      {/* Beta Access Modal */}
      <BetaAccessModal isOpen={isBetaModalOpen} onClose={closeBetaModal} />
    </div>
  );
}
