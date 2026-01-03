import Link from "next/link";
import { FileText, Mail, MessageSquare, HelpCircle, ChevronRight, Shield, PenTool, QrCode } from "lucide-react";

const cards = [
  {
    title: "Email Support",
    description: "Reach our team for any account or billing questions.",
    icon: Mail,
    actionLabel: "Send Email",
    href: "mailto:support@carthost.app",
    primary: true,
  },
  {
    title: "Feature Requests",
    description: "Share product ideas or improvements you'd like to see.",
    icon: MessageSquare,
    actionLabel: "Suggest Feature",
    href: "mailto:features@carthost.app",
    primary: false,
  },
  {
    title: "Documentation",
    description: "Full guides and best practices for managing your fleet.",
    icon: FileText,
    actionLabel: "Read Guide",
    href: "/dashboard/documentation",
    primary: false,
  },
];

const faqs = [
  {
    id: "qr-setup",
    question: "How do I set up the guest QR codes?",
    answer: (
      <div className="space-y-3">
        <p>Your fleet is designed to run autonomously using our "Scan-to-Start" system.</p>
        <ol className="list-decimal pl-5 space-y-1 text-slate-600">
          <li>Go to the <strong>Fleet</strong> tab.</li>
          <li>Click the <QrCode className="inline h-3 w-3 mx-1" /> icon on any vehicle card.</li>
          <li>Print the unique QR code (we recommend laminating it).</li>
          <li>Zip-tie or adhere the code to the vehicle's steering wheel or dashboard.</li>
        </ol>
        <p>When a guest finds the vehicle, they simply scan this code to begin the liability waiver and inspection process. No app download is required for them.</p>
      </div>
    ),
  },
  {
    id: "deposits",
    question: "How do security deposits work?",
    answer: (
      <div className="space-y-2">
        <p>
          CartHost acts as a <strong>tracker</strong> for your liability, but we do not process the actual payments or holds.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li>
            <strong>Configuration:</strong> Go to <Link href="/dashboard/settings" className="text-teal-600 underline">Settings</Link> to set your default deposit amount (e.g., $500).
          </li>
          <li>
            <strong>Tracking:</strong> When a rental starts, we log the deposit as "Pending."
          </li>
          <li>
            <strong>Disputes:</strong> If damage occurs, mark the deposit as "Withheld" in the History tab so you have a record for your external payment processor (Stripe, Square, etc.).
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "maintenance",
    question: "How does the maintenance tracking work?",
    answer: (
      <p>
        To prevent breakdowns, the system automatically tracks "Trips Since Service."
        Every <strong>30 trips</strong>, the vehicle is flagged as "Service Due."
        Once you perform the maintenance (tire check, battery water, etc.), log it in the
        <strong> Maintenance</strong> tab to reset the counter to zero.
      </p>
    ),
  },
  {
    id: "liability",
    question: "Is the waiver legally binding?",
    answer: (
      <p>
        CartHost provides a digital chain-of-custody. We record the guest's IP address, timestamp, device signature, and their specific agreement to your terms. This "Evidence Packet" (found in History) is designed to be the definitive proof needed to win damage disputes or liability claims.
      </p>
    ),
  },
];

export default function SupportPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="space-y-2 border-b border-gray-200 pb-5">
        <h1 className="font-heading text-3xl font-bold text-slate-900">
          Operational Support
        </h1>
        <p className="text-slate-500 text-lg">
          Field manuals, direct support, and system guides.
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-teal-500/30"
            >
              <div className="space-y-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg border ${card.primary ? 'bg-teal-50 border-teal-100 text-teal-700' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {card.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50">
                {card.href.startsWith("mailto:") ? (
                  <a
                    href={card.href}
                    className="flex items-center text-sm font-bold text-teal-700 hover:text-teal-800"
                  >
                    {card.actionLabel} <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                ) : (
                  <Link
                    href={card.href}
                    className="flex items-center text-sm font-bold text-teal-700 hover:text-teal-800"
                  >
                    {card.actionLabel} <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ / Field Manual Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
            <HelpCircle className="h-4 w-4 text-slate-600" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">Field Manual & FAQ</h2>
        </div>

        <div className="grid gap-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              id={faq.id}
              className="scroll-mt-24 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-gray-300"
            >
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between px-6 py-5 font-medium text-slate-900 hover:bg-slate-50/50 transition-colors list-none">
                  <span className="font-heading text-lg font-semibold">{faq.question}</span>
                  <span className="ml-6 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 group-open:rotate-180 group-open:bg-teal-50 group-open:text-teal-600 transition-all">
                    <ChevronDownIcon className="h-4 w-4" />
                  </span>
                </summary>
                <div className="px-6 pb-6 pt-2 text-base leading-relaxed text-slate-600 border-t border-gray-100">
                  {faq.answer}
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
