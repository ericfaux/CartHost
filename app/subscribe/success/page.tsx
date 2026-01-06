"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";

import { Logo } from "@/components/ui/Logo";
import { Badge } from "@/components/ui/Badge";

export default function SubscribeSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Auto-redirect countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRedirecting(true);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-paper">
      {/* Header */}
      <header className="border-b border-rule bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="text-xl" />
          </Link>
        </div>
      </header>

      {/* Success Content */}
      <div className="mx-auto flex min-h-[80vh] max-w-lg items-center px-4 py-12">
        <div className="w-full rounded-dossier-surface border border-rule bg-surface p-10 shadow-dossier-surface text-center">
          {/* Success Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent-success bg-green-50">
            <CheckCircle className="h-10 w-10 text-accent-success" />
          </div>

          {/* Badge */}
          <Badge variant="success" style="stamp" className="mb-4">
            SUBSCRIPTION ACTIVE
          </Badge>

          {/* Title */}
          <h1 className="mb-3 font-heading text-3xl font-bold text-ink">
            Welcome to CartHost!
          </h1>

          {/* Description */}
          <p className="mb-6 text-ink-subtle">
            Your account is all set up. Your 30-day free trial has started, and
            you have full access to all features.
          </p>

          {/* Next Steps */}
          <div className="mb-8 rounded-xl border border-rule bg-paper p-4 text-left">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Next Steps
            </h2>
            <ul className="space-y-2 text-sm text-ink-subtle">
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-success" />
                <span>Add your first golf cart to start tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-success" />
                <span>Set up your rental agreements and waivers</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-success" />
                <span>Configure your business settings</span>
              </li>
            </ul>
          </div>

          {/* CTA Button */}
          <Link
            href="/dashboard"
            className="dossier-btn-ops mb-4 flex w-full items-center justify-center gap-2"
          >
            {isRedirecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Link>

          {/* Countdown */}
          {!isRedirecting && countdown > 0 && (
            <p className="text-sm text-ink-muted">
              Redirecting automatically in {countdown} second{countdown !== 1 ? "s" : ""}...
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
