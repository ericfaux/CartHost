"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/Button";
import { Logo } from "../ui/Logo";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "Product", href: "#product" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Evidence Packet", href: "#evidence-packet" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

interface MarketingNavProps {
  onRequestAccess: () => void;
}

export function MarketingNav({ onRequestAccess }: MarketingNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-rule">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" aria-label="CartHost home" className="flex items-center">
            <Logo className="text-2xl" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-ink-subtle hover:text-ink transition-colors rounded-dossier-control hover:bg-surface"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-ink-subtle hover:text-ink transition-colors"
            >
              Log In
            </Link>
            <Button variant="ops" size="sm" onClick={onRequestAccess}>
              Request Beta Access
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden p-2 -m-2 text-ink-subtle hover:text-ink"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-rule bg-surface">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-sm font-medium text-ink-subtle hover:text-ink hover:bg-paper rounded-dossier-control transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 mt-4 border-t border-rule space-y-3">
              <Link
                href="/login"
                className="block px-3 py-2 text-sm font-medium text-ink-subtle hover:text-ink"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log In
              </Link>
              <Button
                variant="ops"
                size="sm"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onRequestAccess();
                }}
              >
                Request Beta Access
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
