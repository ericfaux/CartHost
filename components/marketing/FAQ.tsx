"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Do guests need to download an app?",
    answer:
      "No. Guests complete the entire checkout flow in their mobile browser. They simply scan the QR code on your cart and follow the on-screen prompts. Works on any smartphone.",
  },
  {
    question: "What evidence is captured for each rental?",
    answer:
      "Each rental captures: a digitally signed waiver with timestamp, IP address, and user agent; four inspection photos with GPS coordinates and SHA-256 hashes; pre-existing damage notes; and return proof photo. All data is packaged into an exportable evidence file.",
  },
  {
    question: "Does this work without SMS verification?",
    answer:
      "Yes. While SMS codes are available as an option, CartHost supports on-screen unlock codes and QR-based verification. This means guests can complete checkout even without cell service—perfect for remote properties.",
  },
  {
    question: "How does this help with disputes?",
    answer:
      "CartHost creates a complete chain of custody for every rental. If a guest disputes damage, you have timestamped photos with hashes proving they haven't been altered, plus a signed waiver and metadata showing the exact state of the cart at checkout. This documentation package is designed to hold up in disputes.",
  },
  {
    question: "What types of assets does CartHost support?",
    answer:
      "CartHost works with golf carts, e-bikes, kayaks, paddleboards, beach chairs, or any amenity you rent to guests. The inspection flow can be customized for different asset types.",
  },
  {
    question: "Is the waiver legally binding?",
    answer:
      "CartHost provides the infrastructure for digital waiver capture including timestamp, IP address, and user agent metadata. However, waiver enforceability varies by jurisdiction. We recommend having your waiver language reviewed by a local attorney. CartHost is a technology provider; hosts remain responsible for local compliance.",
  },
  {
    question: "Can I use my existing lockbox or key system?",
    answer:
      "Yes. CartHost doesn't require any hardware changes. It works with physical lockboxes, key safes, hidden key spots, or digital smart locks. The unlock code is displayed after the guest completes all required steps.",
  },
  {
    question: "How much does CartHost cost?",
    answer:
      "CartHost offers three plans: Safety & Compliance at $14/month for 1 vehicle, Pro Host at $22/month for up to 5 vehicles (most popular), and Fleet Manager at $44/month for 10+ vehicles. All plans include a 30-day free trial and you can cancel anytime. Annual billing saves you 15%.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="bg-surface rounded-dossier-surface border border-rule shadow-dossier-surface overflow-hidden divide-y divide-rule">
      {faqs.map((faq, index) => (
        <div key={index}>
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-paper/50 transition-colors"
          >
            <span className="font-medium text-ink pr-4">{faq.question}</span>
            <ChevronDown
              className={`h-5 w-5 text-ink-subtle flex-shrink-0 transition-transform ${
                openIndex === index ? "rotate-180" : ""
              }`}
            />
          </button>
          {openIndex === index && (
            <div className="px-5 pb-4">
              <p className="text-sm text-ink-subtle leading-relaxed">
                {faq.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
