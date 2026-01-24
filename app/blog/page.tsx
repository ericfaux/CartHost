"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import {
  MarketingNav,
  BetaAccessModal,
  Footer,
} from "@/components/marketing";
import { getAllBlogPosts } from "@/lib/blogData";

export default function BlogPage() {
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false);
  const posts = getAllBlogPosts();

  const openBetaModal = () => setIsBetaModalOpen(true);
  const closeBetaModal = () => setIsBetaModalOpen(false);

  return (
    <div className="min-h-screen bg-paper">
      <MarketingNav onRequestAccess={openBetaModal} />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-rule">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-ink leading-tight mb-4">
              The CartHost Blog
            </h1>
            <p className="text-lg text-ink-subtle max-w-2xl mx-auto">
              Guides, stories, and insights for vacation rental hosts who offer golf carts to their guests.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group bg-surface rounded-dossier-surface border border-rule shadow-dossier-surface hover:shadow-dossier-elevated transition-shadow duration-200"
              >
                <Link href={`/blog/${post.slug}`} className="block p-6">
                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-ink-muted mb-3">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "short",
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
                  <h2 className="font-heading text-xl font-bold text-ink mb-3 group-hover:text-accent-ops transition-colors">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-ink-subtle text-sm leading-relaxed mb-4">
                    {post.excerpt}
                  </p>

                  {/* Read More */}
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-accent-ops group-hover:gap-3 transition-all">
                    Read More
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-surface border-t border-rule">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink mb-4">
            Protect Your Golf Cart Fleet
          </h2>
          <p className="text-ink-subtle max-w-2xl mx-auto mb-8">
            CartHost automates waivers, inspection photos, and damage evidence for Airbnb and VRBO hosts.
          </p>
          <button
            onClick={openBetaModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent-ops text-white font-medium rounded-dossier-control hover:bg-accent-ops-dark transition-colors"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <Footer />

      <BetaAccessModal isOpen={isBetaModalOpen} onClose={closeBetaModal} />
    </div>
  );
}
