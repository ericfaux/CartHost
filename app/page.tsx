import Link from "next/link";
import {
  BatteryWarning,
  CheckCircle,
  ClipboardList,
  Mail,
  Play,
  Shield,
  Zap,
} from "lucide-react";
import ImageCarousel from "../components/ImageCarousel";

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
  {
    icon: ClipboardList,
    title: "Untracked Maintenance",
    description: "No central record of repairs, costs, or service history.",
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
    title: "Charge Check",
    description: "Guest must photograph the plug in the wall to end the rental.",
  },
];

export default function LandingPage() {
  const hostSlides = [
    {
      id: 1,
      label: "Dashboard Home",
      content: (
        <div className="flex h-full w-full flex-col gap-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-left text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">Revenue</p>
              <p className="text-2xl font-semibold text-blue-400">$24,300</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-600/20 ring-1 ring-blue-500/30" />
          </div>
          <div className="grid grid-cols-4 items-end gap-2">
            {[50, 70, 40, 90, 65, 80, 55].map((height, idx) => (
              <div key={idx} className="rounded-md bg-blue-500/70" style={{ height: `${height}%` }} />
            ))}
          </div>
          <div className="rounded-xl bg-slate-900/80 p-4 ring-1 ring-slate-800">
            <p className="text-sm text-slate-300">Active rentals</p>
            <p className="text-lg font-semibold">7 carts</p>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      label: "Fleet Manager",
      content: (
        <div className="flex h-full w-full flex-col gap-3 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-left text-white">
          <h3 className="text-lg font-semibold">Carts</h3>
          <div className="space-y-3">
            {["Beach Runner", "Lake Cruiser", "Club Elite", "Harbor Hopper"].map((name, idx) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-lg bg-slate-900/70 px-4 py-3 ring-1 ring-slate-800"
              >
                <div>
                  <p className="font-semibold">{name}</p>
                  <p className="text-xs text-slate-300">Battery {85 - idx * 10}%</p>
                </div>
                <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-300 ring-1 ring-green-500/30">
                  Ready
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 3,
      label: "Rental History",
      content: (
        <div className="flex h-full w-full flex-col gap-3 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-left text-white">
          <h3 className="text-lg font-semibold">Recent rides</h3>
          <div className="overflow-hidden rounded-xl bg-slate-900/80 ring-1 ring-slate-800">
            <div className="grid grid-cols-4 bg-slate-800/80 px-4 py-2 text-xs uppercase tracking-wide text-slate-300">
              <span>Guest</span>
              <span>Cart</span>
              <span>Duration</span>
              <span className="text-right">Revenue</span>
            </div>
            {["Liam", "Ava", "Noah", "Isla"].map((name, idx) => (
              <div
                key={name}
                className="grid grid-cols-4 items-center px-4 py-2 text-sm text-slate-200 odd:bg-slate-900 even:bg-slate-800"
              >
                <span>{name}</span>
                <span>{idx % 2 === 0 ? "Beach Runner" : "Lake Cruiser"}</span>
                <span>{45 + idx * 10} mins</span>
                <span className="text-right text-green-300">${80 + idx * 15}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 4,
      label: "Settings",
      content: (
        <div className="flex h-full w-full flex-col gap-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-left text-white">
          <h3 className="text-lg font-semibold">Rental rules</h3>
          <div className="space-y-3">
            {["Require waiver", "Verify ID", "Pre-ride photos", "Safety checklist"].map((item, idx) => (
              <div key={item} className="flex items-center justify-between rounded-lg bg-slate-900/80 px-4 py-3 ring-1 ring-slate-800">
                <div className="space-y-1">
                  <p className="font-semibold">{item}</p>
                  <p className="text-xs text-slate-300">Applied to all carts</p>
                </div>
                <div
                  className={`relative h-6 w-11 rounded-full border ${idx % 2 === 0 ? "border-blue-400 bg-blue-500" : "border-slate-600 bg-slate-700"}`}
                >
                  <span
                    className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white transition-all ${
                      idx % 2 === 0 ? "right-1" : "left-1"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  const guestSlides = [
    {
      id: 1,
      label: "Scan to Unlock",
      content: (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 p-6 text-center text-white">
          <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-white text-slate-900">
            <div className="grid grid-cols-3 gap-1 p-3 text-xs font-bold">
              {[...Array(9)].map((_, idx) => (
                <div key={idx} className={`h-6 w-6 ${idx % 2 === 0 ? "bg-slate-900" : "bg-white"}`} />
              ))}
            </div>
          </div>
          <p className="text-sm text-slate-200">Scan the QR code to start your ride.</p>
        </div>
      ),
    },
    {
      id: 2,
      label: "Identity Verification",
      content: (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 p-6 text-center text-white">
          <div className="flex h-36 w-28 flex-col items-center justify-center rounded-2xl bg-slate-900/80 ring-1 ring-slate-800">
            <div className="h-12 w-20 rounded bg-blue-500/30" />
            <div className="mt-2 h-2 w-16 rounded bg-slate-700" />
            <div className="mt-1 h-2 w-14 rounded bg-slate-700" />
          </div>
          <p className="text-sm text-slate-200">Snap a photo of your ID to continue.</p>
        </div>
      ),
    },
    {
      id: 3,
      label: "Safety Check",
      content: (
        <div className="flex h-full w-full flex-col justify-center gap-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 p-6 text-left text-white">
          <h3 className="text-center text-lg font-semibold">Safety Checklist</h3>
          <div className="space-y-2 rounded-xl bg-slate-900/80 p-4 ring-1 ring-slate-800">
            {["Tires look good", "Brakes tested", "Lights working", "Seatbelts secured"].map((item, idx) => (
              <div key={item} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-green-400 bg-green-500/20 text-[10px] font-bold text-green-200">
                  ✓
                </span>
                <p className="text-sm text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 4,
      label: "Digital Key",
      content: (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 p-6 text-center text-white">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-green-500 text-lg font-semibold text-white ring-4 ring-green-400/60">
            START
          </div>
          <p className="text-sm text-slate-200">Tap to unlock and begin the rental.</p>
        </div>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/10 text-blue-500 ring-1 ring-blue-500/30">
              <Zap className="h-5 w-5" aria-hidden />
            </span>
            CartHost
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-blue-500/60 hover:text-white"
          >
            Log In
          </Link>
        </div>
      </header>

      <section className="border-b border-slate-900 bg-slate-950">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-3 py-1 text-sm font-medium text-blue-400 ring-1 ring-blue-500/30">
              <Shield className="h-4 w-4" aria-hidden />
              Fleet safety, automated
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                The Digital Gate for Your Golf Cart Fleet.
              </h1>
              <p className="text-lg text-slate-300">
                Avoid $2,000 battery replacements, win damage disputes, and
                automate every cart handoff.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="mailto:support@carthost.app?subject=Early Access"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
              >
                Get Early Access
              </Link>
              <Link
                href="#demo"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-700 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-blue-500/60 hover:text-white"
              >
                <Play size={16} />
                Watch 2-min demo
              </Link>
            </div>
            <p className="text-sm text-slate-400">
              If CartHost prevents one dead battery, it pays for itself for years.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-blue-900/30">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">The Problem</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {problems.map((problem) => (
                  <div
                    key={problem.title}
                    className="flex h-full items-start gap-3 rounded-lg bg-slate-800/80 p-4 shadow-lg shadow-black/30"
                  >
                    <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/10 text-blue-400 ring-1 ring-blue-500/30">
                      <problem.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-white">
                        {problem.title}
                      </h3>
                      <p className="text-sm text-slate-300">{problem.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="demo" className="border-b border-slate-900 bg-slate-900">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:py-20">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Host View</h2>
            <p className="text-base text-slate-300">
              See every ride, photo, and waiver in one place.
            </p>
            <ImageCarousel slides={hostSlides} aspectRatio="aspect-video" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Guest View</h2>
            <p className="text-base text-slate-300">
              2-minute safety check on their phone – no app download.
            </p>
            <div className="mx-auto max-w-[280px]">
              <ImageCarousel slides={guestSlides} aspectRatio="aspect-[9/19]" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <div className="mb-10 space-y-3 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-400">
              How it works
            </p>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              The solution from arrival to plug-in
            </h2>
            <p className="text-base text-slate-300">
              Every guest interaction is verified, logged, and tied to your rental.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-blue-900/30">
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.title}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-800/80 p-6 shadow-lg shadow-black/30"
                >
                  <div className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-600/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-300 ring-1 ring-blue-500/30">
                    <CheckCircle className="h-4 w-4" aria-hidden />
                    {step.label}
                  </div>
                  <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                  <p className="text-sm text-slate-300">{step.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-3 rounded-2xl border border-slate-800 bg-slate-800/60 px-6 py-4 text-center text-sm text-slate-300 sm:grid-cols-2 sm:text-base">
              <p>Works with lockboxes, key safes, or hidden keys – no hardware required.</p>
              <p>Now onboarding founding hosts in beach and lake markets.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-white">
              Want CartHost set up for you?
            </h3>
            <p className="text-sm text-slate-300">
              We’ll configure your waivers, QR codes, and first cart for free.
            </p>
          </div>
          <Link
            href="mailto:support@carthost.app"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
          >
            <Mail className="h-4 w-4" aria-hidden />
            Email us to get started
          </Link>
        </div>
      </section>
    </main>
  );
}
