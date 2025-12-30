import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-paper border-t border-rule">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-ops/10 text-accent-ops ring-1 ring-accent-ops/30">
              <Zap className="h-4 w-4" aria-hidden />
            </span>
            <span className="font-heading text-base font-bold text-ink">
              CartHost
            </span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              href="/terms"
              className="text-sm text-ink-subtle hover:text-ink transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-ink-subtle hover:text-ink transition-colors"
            >
              Privacy
            </Link>
            <a
              href="mailto:support@carthost.app"
              className="text-sm text-ink-subtle hover:text-ink transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 pt-6 border-t border-rule">
          <p className="text-xs text-ink-muted leading-relaxed">
            CartHost is a technology provider offering digital checkout and
            documentation tools. Hosts remain responsible for local regulatory
            compliance, insurance requirements, and rental operations. Waiver
            enforceability varies by jurisdiction; consult a local attorney for
            legal advice.
          </p>
        </div>

        {/* Copyright */}
        <p className="mt-4 text-xs text-ink-muted">
          &copy; {new Date().getFullYear()} CartHost. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
