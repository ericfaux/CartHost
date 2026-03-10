"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { signUp } from "../auth/actions";
import { Badge } from "../../components/ui/Badge";
import { Logo } from "../../components/ui/Logo";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="dossier-btn-ops w-full"
    >
      {pending ? "Creating..." : "Create Account"}
    </button>
  );
}

function SignupForm() {
  const [state, formAction] = useActionState(signUp, null);
  const searchParams = useSearchParams();
  const betaCode = searchParams.get("beta");

  // Show success state when email verification is required
  if (state?.success) {
    return (
      <main className="min-h-screen bg-paper px-4 py-10">
        <div className="mx-auto flex min-h-[80vh] max-w-lg items-center">
          <div className="w-full rounded-dossier-surface border border-rule bg-surface p-10 shadow-dossier-surface">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent-success bg-green-50">
                <MailCheck className="h-8 w-8 text-accent-success" />
              </div>
              <Badge variant="success" style="stamp" className="mb-4">
                LINK SENT
              </Badge>
              <h1 className="font-heading text-3xl font-semibold text-ink">
                Check your email
              </h1>
              <p className="mt-4 text-base text-ink-subtle">
                We have sent a verification link to your email address.
              </p>
            </div>
            <Link
              href="/login"
              className="dossier-btn-secondary mt-6 block w-full text-center"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-lg items-center">
        <div className="w-full rounded-dossier-surface border border-rule bg-surface p-10 shadow-dossier-surface">
          <div className="mb-8 space-y-4 text-center">
            <div className="flex justify-center">
              <Logo className="text-3xl" />
            </div>
            <div className="space-y-2">
              <h1 className="font-heading text-3xl font-semibold text-ink">
                Create your Host Account
              </h1>
              <p className="text-sm text-ink-subtle">
                Start managing your fleet in minutes.
              </p>
            </div>
          </div>

          <form action={formAction} className="space-y-5">
            {betaCode && (
              <>
                <input type="hidden" name="betaCode" value={betaCode} />
                <div className="rounded-dossier-control border border-accent-ops/40 bg-accent-ops/10 px-3 py-2 text-sm text-accent-ops text-center font-medium">
                  Beta Access Invite
                </div>
              </>
            )}
            <div className="space-y-2">
              <label
                className="dossier-label"
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
                className="dossier-input"
                placeholder="Jordan Doe"
              />
            </div>

            <div className="space-y-2">
              <label
                className="dossier-label"
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
                className="dossier-input"
                placeholder="(555) 000-1234"
              />
            </div>

            <div className="space-y-2">
              <label
                className="dossier-label"
                htmlFor="companyName"
              >
                Company Name <span className="text-ink-muted">(Optional)</span>
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                autoComplete="organization"
                className="dossier-input"
                placeholder="CartHost Rentals"
              />
            </div>

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
                minLength={6}
                autoComplete="new-password"
                className="dossier-input"
                placeholder="••••••••"
              />
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
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-accent-ops transition hover:text-accent-ops-light"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
