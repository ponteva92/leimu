import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, Raleway, Space_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SkipLink } from "@/components/SkipLink";
import { StoreProvider } from "@/context/StoreProvider";
import { CustomCursor } from "@/components/CustomCursor";
import { Preloader } from "@/components/Preloader";
import { GrainOverlay } from "@/components/GrainOverlay";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ContactModalHost } from "@/components/ContactModalHost";

/* Headings — Cinzel (classical inscriptional serif, Aesop/Trajan register).
   Body — Raleway. Both self-hosted by next/font: zero FOUT, near-zero CLS. */
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-serif",
  display: "swap",
});

/* Editorial accent — Cormorant Garamond's high-contrast italics carry every
   italicised serif word (Cinzel has no true italic). Paired by CSS, see
   globals.css. */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif-accent",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
    template: "%s — LEIMU",
    default: "LEIMU — Käsintehtyjä soijavahakynttilöitä Suomesta",
  },
  description:
    "LEIMU valmistaa käsintehtyjä, pieneräisiä soijavahakynttilöitä sheabutterilla Oulussa. Valitse tuoksu — havu, vanilja tai mustikka — ja lisää henkilökohtainen viesti. Alkaen 9 €.",
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
        alt: "LEIMU — Käsintehtyjä soijavahakynttilöitä",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LEIMU — Käsintehtyjä soijavahakynttilöitä",
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
            "Käsintehtyjä soijavahakynttilöitä sheabutterilla — havu, vanilja, mustikka",
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
      className={`${cinzel.variable} ${cormorant.variable} ${raleway.variable} ${spaceMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <StoreProvider>
          <SkipLink />
          <SmoothScroll />
          <Preloader />
          <CustomCursor />
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
          <ContactModalHost />
          <GrainOverlay />
        </StoreProvider>
      </body>
    </html>
  );
}
