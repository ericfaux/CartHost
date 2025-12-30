import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Heading font: Fraunces - confident serif for case file headers
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
});

// UI/Body font: Plus Jakarta Sans - clean density for tables and forms
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
});

// Mono font: JetBrains Mono - for IDs, codes, hashes, timestamps
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CartHost — Operations Console for Golf Cart Rentals",
  description:
    "Liability-first checkout for golf cart and e-bike rentals. Digital waivers, inspection photos, and evidence-grade case files. No app download for guests.",
  keywords: [
    "golf cart rental",
    "e-bike rental",
    "vacation rental amenities",
    "digital waiver",
    "rental liability",
    "fleet management",
    "airbnb golf cart",
    "vrbo amenities",
  ],
  authors: [{ name: "CartHost" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CartHost",
    title: "CartHost — Turn every rental into a sealed case file",
    description:
      "QR scan → waiver → inspection photos → return proof. Automatically packaged into an evidence-grade case file for dispute protection.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CartHost — Liability-First Checkout for Golf Cart Rentals",
    description:
      "Digital waivers, inspection photos, and evidence-grade case files. No app download for guests.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jakarta.variable} ${jetbrains.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
