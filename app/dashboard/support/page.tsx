import Link from "next/link";
import { FileText, Mail, MessageSquare } from "lucide-react";

const cards = [
  {
    title: "Email Support",
    description: "Reach our team for any account or billing questions.",
    icon: Mail,
    actionLabel: "Send Email",
    href: "mailto:support@carthost.app",
    disabled: false,
  },
  {
    title: "Feature Requests",
    description: "Share product ideas or improvements you'd like to see.",
    icon: MessageSquare,
    actionLabel: "Suggest Feature",
    href: "mailto:features@carthost.app",
    disabled: false,
  },
  {
    title: "Documentation",
    description: "Guides and best practices for managing your fleet.",
    icon: FileText,
    actionLabel: "Read Guide",
    href: "/dashboard/documentation",
    disabled: false,
  },
];

export default function SupportPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Contact & Support
        </h1>
        <p className="text-sm text-gray-500">
          We're here to help with anything you need. Reach out anytime.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="flex h-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-gray-900">{card.title}</p>
                  <p className="text-sm text-gray-500">{card.description}</p>
                </div>
              </div>

              {card.disabled ? (
                <button
                  disabled
                  className="inline-flex w-fit cursor-not-allowed items-center justify-center rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-500"
                >
                  {card.actionLabel}
                </button>
              ) : card.href.startsWith("mailto:") ? (
                <a
                  href={card.href}
                  className="inline-flex w-fit items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  {card.actionLabel}
                </a>
              ) : (
                <Link
                  href={card.href}
                  className="inline-flex w-fit items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  {card.actionLabel}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
