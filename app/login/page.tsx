"use client";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { signIn } from "../auth/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="dossier-btn-ops w-full"
    >
      {pending ? "Signing In..." : "Sign In"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(signIn, null);

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-lg items-center">
        <div className="w-full rounded-dossier-surface border border-rule bg-surface p-10 shadow-dossier-surface">
          <div className="mb-8 space-y-2 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-ops">
              CartHost
            </p>
            <h1 className="font-heading text-3xl font-semibold text-ink">
              Welcome Back
            </h1>
            <p className="text-sm text-ink-subtle">
              Sign in to manage your fleet dashboard.
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            <div className="space-y-2">
              <label
                className="dossier-label"
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
                className="dossier-input"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label
                className="dossier-label"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="dossier-input"
                placeholder="••••••••"
              />
              <Link
                href="/forgot-password"
                className="text-xs text-accent-ops transition-colors hover:text-accent-ops-light"
              >
                Forgot password?
              </Link>
            </div>

            <SubmitButton />

            {state?.error && (
              <div
                className="rounded-dossier-control border border-accent-legal/40 bg-accent-legal/10 px-3 py-2 text-sm text-accent-legal"
                role="alert"
              >
                {state.error}
              </div>
            )}
          </form>

          <p className="mt-8 text-center text-sm text-ink-subtle">
            Need an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-accent-ops transition hover:text-accent-ops-light"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
