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
      className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Signing In..." : "Sign In"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(signIn, null);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-lg items-center">
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur">
          <div className="mb-8 space-y-2 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              CartHost
            </p>
            <h1 className="text-3xl font-semibold text-white">Welcome Back</h1>
            <p className="text-sm text-slate-400">
              Sign in to manage your EV fleet dashboard.
            </p>
          </div>

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

            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-slate-200"
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
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-white/40 focus:ring-1 focus:ring-white/30"
                placeholder="••••••••"
              />
              <Link
                href="/forgot-password"
                className="text-xs text-blue-400 transition-colors hover:text-blue-300"
              >
                Forgot password?
              </Link>
            </div>

            <SubmitButton />

            {state?.error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
                {state.error}
              </div>
            )}
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Need an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-white transition hover:text-slate-200"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
