import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./redesign.css";
import { SiteHeader } from "@/components/SiteHeader";
import { StoreProvider } from "@/context/StoreProvider";
import { CustomCursor } from "@/components/CustomCursor";
import { Footer } from "@/components/Footer";
import { GrainOverlay } from "@/components/GrainOverlay";
import { ContactModalHost } from "@/components/ContactModalHost";
import { SmoothScroll } from "@/components/SmoothScroll";
import { MotionProvider } from "@/components/MotionProvider";
import { SkipLink } from "@/components/SkipLink";
import { OrderShortcut } from "@/components/OrderShortcut";

/* Display — Cormorant Garamond (high-contrast garamond with true italics;
   one serif family carries roman, italic, and accent words alike).
   Body — Instrument Sans. Exact family faces are checked in as Latin
   WOFF2, so builds and visitors never depend on Google Fonts requests. */
const cormorant = localFont({
  src: [
    { path: "./fonts/cormorant-garamond-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/cormorant-garamond-latin-500-italic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/cormorant-garamond-latin-600-italic.woff2", weight: "600", style: "italic" },
    { path: "./fonts/cormorant-garamond-latin-700-italic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
  preload: true,
  adjustFontFallback: "Times New Roman",
  fallback: ["Georgia", "serif"],
});

const instrumentSans = localFont({
  src: [
    { path: "./fonts/instrument-sans-latin-normal.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/instrument-sans-latin-italic.woff2", weight: "400 700", style: "italic" },
  ],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
  fallback: ["Arial", "sans-serif"],
});

const spaceMono = localFont({
  src: [
    { path: "./fonts/space-mono-latin-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/space-mono-latin-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
  fallback: ["monospace"],
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
            <OrderShortcut />
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
