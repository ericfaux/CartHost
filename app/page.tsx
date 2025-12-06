import Link from "next/link";
import {
  BatteryWarning,
  CheckCircle,
  Mail,
  Shield,
  Zap,
} from "lucide-react";

const problems = [
  {
    icon: Shield,
    title: "Liability Risks",
    description: "No proof of condition when guests crash.",
  },
  {
    icon: BatteryWarning,
    title: "Dead Batteries",
    description: "Guests forget to plug in, killing expensive batteries.",
  },
  {
    icon: CheckCircle,
    title: "Unmanned Handoffs",
    description: "Keys left unsecured and waivers ignored.",
  },
];

const steps = [
  {
    label: "Step 1",
    title: "The Gatekeeper",
    description: "Guest scans QR code to unlock keys.",
  },
  {
    label: "Step 2",
    title: "Verified Inspection",
    description: "AI-verified photos & signed waiver required to ride.",
  },
  {
    label: "Step 3",
    title: "The Plug Police",
    description: "Guest must photograph the plug in the wall to end the rental.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Zap className="h-5 w-5" aria-hidden />
            </span>
            CartHost
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-blue-200 hover:text-blue-700"
          >
            Log In
          </Link>
        </div>
      </header>

      <section className="border-b border-slate-100">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              <Shield className="h-4 w-4" aria-hidden />
              Fleet safety, automated
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                The Digital Gate for Your Golf Cart Fleet.
              </h1>
              <p className="text-lg text-slate-600">
                Stop eating $2,000 battery costs. Protect your liability. Automate
                the handoff.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Host Login
              </Link>
              <Link
                href="mailto:support@carthost.app"
                className="inline-flex items-center justify-center rounded-md border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-blue-200 hover:text-blue-700"
              >
                Contact Sales
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6 shadow-sm">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">The Problem</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {problems.map((problem) => (
                  <div
                    key={problem.title}
                    className="flex h-full items-start gap-3 rounded-lg bg-white p-4 shadow-sm"
                  >
                    <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <problem.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-slate-900">
                        {problem.title}
                      </h3>
                      <p className="text-sm text-slate-600">{problem.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <div className="mb-10 space-y-3 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              How it works
            </p>
            <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              The solution from arrival to plug-in
            </h2>
            <p className="text-base text-slate-600">
              Every guest interaction is verified, logged, and tied to your rental.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.title}
                className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 text-sm font-semibold text-blue-700">
                  <CheckCircle className="h-4 w-4" aria-hidden />
                  {step.label}
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-slate-900">
              Have questions? Need help setting up?
            </h3>
            <p className="text-sm text-slate-600">
              We&apos;re here to get your fleet live without the headaches.
            </p>
          </div>
          <Link
            href="mailto:support@carthost.app"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Mail className="h-4 w-4" aria-hidden />
            support@carthost.app
          </Link>
        </div>
      </section>
    </main>
  );
}
