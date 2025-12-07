"use client";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signUp } from "../auth/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Creating..." : "Create Account"}
    </button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useActionState(signUp, null);

  // Show success state when email verification is required
  if (state?.success) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto flex min-h-[80vh] max-w-lg items-center">
          <div className="w-full rounded-3xl border border-green-500/40 bg-green-500/10 p-10 shadow-2xl backdrop-blur">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <svg
                  className="h-8 w-8 text-green-400"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-semibold text-green-100">
                Check your email
              </h1>
              <p className="mt-4 text-base text-green-200">
                We have sent a verification link to your email address.
              </p>
            </div>
            <Link
              href="/login"
              className="mt-6 block w-full rounded-lg bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-lg items-center">
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur">
          <div className="mb-8 space-y-2 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              CartHost
            </p>
            <h1 className="text-3xl font-semibold text-white">
              Create your Host Account
            </h1>
            <p className="text-sm text-slate-400">
              Start managing your fleet in minutes.
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-slate-200"
                htmlFor="fullName"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                autoComplete="name"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-white/40 focus:ring-1 focus:ring-white/30"
                placeholder="Jordan Doe"
              />
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-slate-200"
                htmlFor="phone"
              >
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-white/40 focus:ring-1 focus:ring-white/30"
                placeholder="(555) 000-1234"
              />
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-slate-200"
                htmlFor="companyName"
              >
                Company Name <span className="text-slate-500">(Optional)</span>
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                autoComplete="organization"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-white/40 focus:ring-1 focus:ring-white/30"
                placeholder="CartHost Rentals"
              />
            </div>

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
                minLength={6}
                autoComplete="new-password"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-white/40 focus:ring-1 focus:ring-white/30"
                placeholder="••••••••"
              />
            </div>

            <SubmitButton />

            {state?.error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
                {state.error}
              </div>
            )}
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-white transition hover:text-slate-200"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
