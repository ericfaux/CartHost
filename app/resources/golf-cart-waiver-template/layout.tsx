import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Free Golf Cart Waiver for Airbnb Hosts & Rental Agreement",
  description:
    "Download a free, printable Golf Cart Liability Waiver for your Airbnb or Vacation Rental. Protect your property and guests.",
  keywords: [
    "golf cart waiver for airbnb",
    "golf cart liability waiver template",
    "golf cart rental agreement",
    "vacation rental golf cart waiver",
    "vrbo golf cart liability",
    "airbnb golf cart insurance",
    "free golf cart waiver pdf",
  ],
  openGraph: {
    title: "Free Golf Cart Waiver for Airbnb Hosts & Rental Agreement",
    description:
      "Download a free, printable Golf Cart Liability Waiver for your Airbnb or Vacation Rental. Protect your property and guests.",
    type: "article",
  },
};

export default function GolfCartWaiverTemplateLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
