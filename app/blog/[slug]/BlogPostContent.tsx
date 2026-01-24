"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  ArrowRight,
} from "lucide-react";
import {
  MarketingNav,
  BetaAccessModal,
  Footer,
} from "@/components/marketing";
import { Button } from "@/components/ui/Button";
import type { BlogPost } from "@/lib/blogData";

interface BlogPostContentProps {
  post: BlogPost;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false);

  const openBetaModal = () => setIsBetaModalOpen(true);
  const closeBetaModal = () => setIsBetaModalOpen(false);

  return (
    <div className="min-h-screen bg-paper">
      <MarketingNav onRequestAccess={openBetaModal} />

      {/* Article Header */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Back Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-subtle hover:text-ink transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-ink-muted mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-ink leading-tight">
            {post.title}
          </h1>
        </div>
      </section>

      {/* Article Content with Sidebar */}
      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-[1fr_320px] gap-12">
            {/* Main Content */}
            <article className="prose prose-lg max-w-none">
              <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </article>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
              {/* Waiver CTA */}
              <div className="bg-surface rounded-dossier-surface border border-rule shadow-dossier-surface p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-accent-ops/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-accent-ops" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-ink">
                    Need a Waiver?
                  </h3>
                </div>
                <p className="text-ink-subtle text-sm mb-4">
                  Download our Free Golf Cart Liability Template to protect yourself from lawsuits and liability claims.
                </p>
                <Link href="/resources/golf-cart-waiver-template">
                  <Button
                    variant="ops"
                    size="sm"
                    className="w-full"
                    icon={<ArrowRight className="h-4 w-4" />}
                    iconPosition="right"
                  >
                    Get Free Template
                  </Button>
                </Link>
              </div>

              {/* CartHost CTA */}
              <div className="bg-accent-ops/5 rounded-dossier-surface border border-accent-ops/20 p-6">
                <h3 className="font-heading text-lg font-bold text-ink mb-2">
                  Go Digital with CartHost
                </h3>
                <p className="text-ink-subtle text-sm mb-4">
                  Automate waivers, capture inspection photos, and build evidence packets for every rental.
                </p>
                <button
                  onClick={openBetaModal}
                  className="inline-flex items-center gap-2 text-sm font-medium text-accent-ops hover:text-accent-ops-dark transition-colors"
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* In-Article CTA (Mobile-friendly) */}
      <section className="lg:hidden bg-amber-50 border-y border-amber-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-amber-900 mb-2">
                Need a Waiver?
              </h2>
              <p className="text-amber-800 mb-4">
                Download our Free Golf Cart Liability Template to protect yourself from lawsuits.
              </p>
              <Link href="/resources/golf-cart-waiver-template">
                <Button variant="ops" size="sm">
                  Get Free Template
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-surface border-t border-rule">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink mb-4">
            Protect Your Golf Cart Fleet
          </h2>
          <p className="text-ink-subtle max-w-2xl mx-auto mb-8">
            CartHost automates waivers, inspection photos, and damage evidence for Airbnb and VRBO hosts.
          </p>
          <Button
            variant="ops"
            size="lg"
            onClick={openBetaModal}
            icon={<ArrowRight className="h-4 w-4" />}
            iconPosition="right"
          >
            Start Free Trial
          </Button>
        </div>
      </section>

      <Footer />

      <BetaAccessModal isOpen={isBetaModalOpen} onClose={closeBetaModal} />

      <style jsx global>{`
        .blog-content h2 {
          font-family: var(--font-fraunces), Georgia, serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #0b1220;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .blog-content h3 {
          font-family: var(--font-fraunces), Georgia, serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: #0b1220;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .blog-content p {
          color: #475569;
          margin-bottom: 1rem;
          line-height: 1.75;
        }
        .blog-content ul,
        .blog-content ol {
          color: #475569;
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .blog-content li {
          margin-bottom: 0.5rem;
          line-height: 1.75;
        }
        .blog-content strong {
          color: #0b1220;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
