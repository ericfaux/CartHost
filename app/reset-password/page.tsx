"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { updatePassword } from "../auth/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Updating..." : "Update Password"}
    </button>
  );
}

function resetPasswordAction(prevState: any, formData: FormData) {
  return updatePassword(formData);
}

export default function ResetPasswordPage() {
  const [state, formAction] = useActionState(resetPasswordAction, null);
  const [clientError, setClientError] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-lg items-center">
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur">
          <div className="mb-8 space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white">
              <KeyRound className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-semibold text-white">Set New Password</h1>
            <p className="text-sm text-slate-400">
              Choose a strong password to secure your account.
            </p>
          </div>

          <form
            action={formAction}
            className="space-y-5"
            onSubmit={(event) => {
              setClientError(null);

              const formData = new FormData(event.currentTarget);
              const password = formData.get("password")?.toString();
              const confirmPassword = formData
                .get("confirmPassword")
                ?.toString();

              if (!password || !confirmPassword || password !== confirmPassword) {
                event.preventDefault();
                setClientError("Passwords must match.");
              }
            }}
          >
            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-slate-200"
                htmlFor="password"
              >
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-white/40 focus:ring-1 focus:ring-white/30"
                placeholder="Enter new password"
              />
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-slate-200"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-white/40 focus:ring-1 focus:ring-white/30"
                placeholder="Re-enter new password"
              />
            </div>

            <SubmitButton />

            {(clientError || state?.error) && (
              <div
                className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
                role="alert"
              >
                {clientError || state?.error}
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
