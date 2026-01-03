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
  metadataBase: new URL('https://www.carthost.app'), // CRITICAL: Fixes image path resolution
  title: {
    default: "CartHost — Golf Cart Liability & Waivers for Airbnb Hosts",
    template: "%s | CartHost",
  },
  description:
    "The liability operating system for Airbnb, VRBO, and vacation rental hosts. Automate golf cart waivers, inspection photos, and damage evidence.",
  keywords: [
    "airbnb golf cart waiver",
    "vrbo liability protection",
    "vacation rental golf cart insurance",
    "digital waiver for hosts",
    "golf cart rental software",
    "turo for golf carts",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.carthost.app",
    title: "CartHost — Turn every rental into a sealed case file",
    description:
      "QR scan → waiver → inspection photos → return proof. Automatically packaged into an evidence-grade case file for dispute protection.",
    siteName: "CartHost",
    // images: Automatically handled by adding opengraph-image.png to /app
  },
  twitter: {
    card: "summary_large_image",
    title: "CartHost — Liability-First Checkout for Golf Cart Rentals",
    description:
      "Digital waivers, inspection photos, and evidence-grade case files. No app download for guests.",
    // images: Automatically handled by adding opengraph-image.png to /app
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
