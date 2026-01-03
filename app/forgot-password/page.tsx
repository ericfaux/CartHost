"use client";

import Link from "next/link";
import { KeyRound, CheckCircle2, Loader2 } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useState, useEffect } from "react";

import { forgotPassword } from "../auth/actions";

const COOLDOWN_SECONDS = 60;

function SubmitButton({ isSuccess }: { isSuccess: boolean }) {
  const { pending } = useFormStatus();
  const [cooldown, setCooldown] = useState(0);

  // Start countdown when isSuccess becomes true
  useEffect(() => {
    if (isSuccess && cooldown === 0) {
      setCooldown(COOLDOWN_SECONDS);
    }
  }, [isSuccess, cooldown]);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const isDisabled = pending || cooldown > 0;

  // Cooldown state - email was sent
  if (cooldown > 0) {
    return (
      <button
        type="submit"
        disabled
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400 cursor-not-allowed"
      >
        <CheckCircle2 className="h-4 w-4" />
        Email Sent! Wait {cooldown}s to resend
      </button>
    );
  }

  // Loading state
  if (pending) {
    return (
      <button
        type="submit"
        disabled
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/70 px-4 py-2.5 text-sm font-semibold text-slate-900 cursor-not-allowed"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Sending...
      </button>
    );
  }

  // Default state
  return (
    <button
      type="submit"
      className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
    >
      Send Reset Link
    </button>
  );
}

function forgotPasswordAction(prevState: any, formData: FormData) {
  return forgotPassword(formData);
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(forgotPasswordAction, null);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-lg items-center">
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur">
          <div className="mb-8 space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white">
              <KeyRound className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-semibold text-white">Reset Password</h1>
            <p className="text-sm text-slate-400">
              Enter your email to receive a reset link.
            </p>
          </div>

          {/* Success Card */}
          {state?.success && (
            <div
              className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4"
              role="status"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                <div className="space-y-1">
                  <p className="font-medium text-emerald-200">
                    Check your inbox!
                  </p>
                  <p className="text-sm text-emerald-300/80">
                    We&apos;ve sent a password reset link to your email. Don&apos;t
                    forget to check your spam folder.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-slate-200"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-white/40 focus:ring-1 focus:ring-white/30"
                placeholder="you@example.com"
              />
            </div>

            <SubmitButton isSuccess={state?.success ?? false} />

            {state?.error && (
              <div
                className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
                role="alert"
              >
                {state.error}
              </div>
            )}
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            <Link
              href="/login"
              className="font-semibold text-white transition hover:text-slate-200"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
