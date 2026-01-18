'use client';

import { Shield, Clock, CreditCard, FileCheck, Zap } from 'lucide-react';
import SubscriptionPricing from '../SubscriptionPricing';

interface PricingSectionProps {
  currentPriceId?: string | null;
}

export function PricingSection({ currentPriceId }: PricingSectionProps) {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="font-mono text-xs uppercase text-accent-ops tracking-wider mb-3">
          Simple Pricing
        </p>

        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink mb-4">
          Protect your fleet. Win disputes.
        </h2>

        <p className="text-ink-subtle mb-6">
          Choose the plan that fits your operation. All plans include our liability-first
          documentation system with forensic-grade evidence capture.
        </p>

        {/* 30-Day Trial Highlight */}
        <div className="inline-flex items-center gap-3 bg-accent-ops/10 border border-accent-ops/30 rounded-full px-5 py-2.5">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent-ops" />
            <span className="font-semibold text-accent-ops">30-Day Free Trial</span>
          </div>
          <span className="text-ink-subtle text-sm">on all plans</span>
        </div>
      </div>

      {/* Social Proof */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-4 bg-surface border border-rule rounded-dossier-surface px-6 py-3">
          <div className="flex -space-x-2">
            {/* Avatar placeholders */}
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-ops to-accent-ops-dark border-2 border-surface flex items-center justify-center"
              >
                <span className="text-white text-xs font-bold">
                  {String.fromCharCode(64 + i)}
                </span>
              </div>
            ))}
          </div>
          <div className="text-sm">
            <span className="font-semibold text-ink">Join 50+ hosts</span>
            <span className="text-ink-subtle"> protecting their fleet</span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="relative max-w-5xl mx-auto">
        <SubscriptionPricing currentPriceId={currentPriceId} />
      </div>

      {/* Trust Signals */}
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 bg-surface rounded-dossier-surface border border-rule p-4 transition-shadow hover:shadow-dossier-surface">
            <div className="flex-shrink-0 h-10 w-10 bg-green-50 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-accent-success" />
            </div>
            <div>
              <p className="font-medium text-ink text-sm">Risk-Free Trial</p>
              <p className="text-xs text-ink-subtle">30 days, no credit card holds</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-surface rounded-dossier-surface border border-rule p-4 transition-shadow hover:shadow-dossier-surface">
            <div className="flex-shrink-0 h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-accent-info" />
            </div>
            <div>
              <p className="font-medium text-ink text-sm">Cancel Anytime</p>
              <p className="text-xs text-ink-subtle">No contracts, no questions</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-surface rounded-dossier-surface border border-rule p-4 transition-shadow hover:shadow-dossier-surface">
            <div className="flex-shrink-0 h-10 w-10 bg-teal-50 rounded-full flex items-center justify-center">
              <Zap className="h-5 w-5 text-accent-ops" />
            </div>
            <div>
              <p className="font-medium text-ink text-sm">Instant Setup</p>
              <p className="text-xs text-ink-subtle">Protect your first cart today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Value Comparison */}
      <div className="max-w-2xl mx-auto bg-surface rounded-dossier-surface border border-rule overflow-hidden">
        <div className="bg-accent-ops/5 border-b border-rule px-6 py-4">
          <h3 className="font-heading font-semibold text-ink flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-accent-ops" />
            Why hosts switch from paper waivers
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Paper Waivers */}
            <div>
              <p className="font-mono text-xs uppercase text-ink-muted tracking-wider mb-3">
                Paper Waivers
              </p>
              <ul className="space-y-2.5">
                {[
                  'Signatures get lost or damaged',
                  'Photos with no proof of timing',
                  'He-said-she-said disputes',
                  'No chain of custody',
                  'Manual organization required',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-ink-subtle">
                    <span className="text-accent-legal mt-0.5">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* CartHost */}
            <div>
              <p className="font-mono text-xs uppercase text-accent-ops tracking-wider mb-3">
                CartHost
              </p>
              <ul className="space-y-2.5">
                {[
                  'Digital waivers with timestamps',
                  'Photos with GPS & SHA-256 hashes',
                  'Forensic evidence packages',
                  'Complete chain of custody',
                  'Auto-organized by rental',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-ink">
                    <span className="text-accent-success mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Teaser */}
      <div className="text-center">
        <p className="text-sm text-ink-subtle">
          Questions about pricing?{' '}
          <a
            href="#faq"
            className="text-accent-ops hover:text-accent-ops-dark underline underline-offset-2 transition-colors"
          >
            Check our FAQ
          </a>
          {' '}or{' '}
          <a
            href="mailto:support@carthost.io"
            className="text-accent-ops hover:text-accent-ops-dark underline underline-offset-2 transition-colors"
          >
            contact us
          </a>
        </p>
      </div>
    </div>
  );
}
