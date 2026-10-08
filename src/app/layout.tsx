import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Instrument_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { StoreProvider } from "@/context/StoreProvider";
import { CustomCursor } from "@/components/CustomCursor";
import { Footer } from "@/components/Footer";
import { GrainOverlay } from "@/components/GrainOverlay";
import { ContactModalHost } from "@/components/ContactModalHost";
import { SmoothScroll } from "@/components/SmoothScroll";
import { MotionProvider } from "@/components/MotionProvider";
import { SkipLink } from "@/components/SkipLink";

/* Display — Cormorant Garamond (high-contrast garamond with true italics;
   one serif family carries roman, italic, and accent words alike).
   Body — Instrument Sans. Both self-hosted by next/font: zero FOUT/CLS. */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-sans",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s · LEIMU",
    default: "LEIMU · Käsintehtyjä soijavahakynttilöitä Suomesta",
  },
  description:
    "LEIMU valmistaa käsintehtyjä, pieneräisiä soijavahakynttilöitä sheabutterilla Oulussa. Valitse tuoksu (havu, vanilja tai mustikka) ja lisää henkilökohtainen viesti. Alkaen 9 €.",
  keywords: [
    "kynttilä",
    "soijavaha",
    "käsintehdyt kynttilät",
    "tuoksukynttilä",
    "kynttilä lahja",
    "ekologinen kynttilä",
    "sheabutter",
    "pienerä",
    "suomalainen",
    "Oulu",
  ],
  metadataBase: new URL("https://leimucandles.fi"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    siteName: "LEIMU Candles",
    locale: "fi_FI",
    type: "website",
    url: "https://leimucandles.fi",
    images: [
      {
        url: "/images/launch-kuva.png",
        width: 1200,
        height: 630,
        alt: "Palava LEIMU-kynttilä mustikoiden, vaniljan ja havun keskellä",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LEIMU · Käsintehtyjä soijavahakynttilöitä",
    description:
      "Havu, vanilja, mustikka. 100% soijavahaa ja sheabutteria, valmistettu Oulussa.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F7F2EA",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "LEIMU Candles",
  url: "https://leimucandles.fi",
  description:
    "Käsintehtyjä soijavahakynttilöitä sheabutterilla. Pienissä käsierissä valmistettuja tuoksukynttilöitä Oulusta.",
  founder: {
    "@type": "Person",
    name: "Shane",
    jobTitle: "Perustaja ja kynttilänvalmistaja",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Oulu",
    addressCountry: "FI",
  },
  priceRange: "€",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Kynttilät",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: "LEIMU Soijavahakynttilä",
          description:
            "Käsintehtyjä soijavahakynttilöitä sheabutterilla: havu, vanilja, mustikka",
          offers: {
            "@type": "Offer",
            priceCurrency: "EUR",
            price: "9.00",
            availability: "https://schema.org/InStock",
          },
        },
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fi"
      className={`${cormorant.variable} ${instrumentSans.variable} ${spaceMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <SkipLink />
        <StoreProvider>
          <MotionProvider>
            <CustomCursor />
            <SiteHeader />
            <main id="main">{children}</main>
            <Footer />
            {/* After <main>: its route-change layout effect runs after Next's own scroll. */}
            <SmoothScroll />
            <ContactModalHost />
            <GrainOverlay />
          </MotionProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
