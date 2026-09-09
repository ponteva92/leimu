import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, Raleway, Space_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { StoreProvider } from "@/context/StoreProvider";
import { PrivacyLink } from "@/components/PrivacyModal";
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
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[var(--ink)] focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-[0.15em] focus:text-[var(--bg)]"
        >
          Siirry sisältöön
        </a>
        <StoreProvider>
          <SmoothScroll />
          <Preloader />
          <CustomCursor />
          <SiteHeader />
          <main id="main">{children}</main>
          <footer className="relative border-t border-[var(--line)] bg-[var(--bg-2)] py-20 px-8 mt-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: "linear-gradient(to right, transparent, rgba(196,122,58,0.28) 50%, transparent)" }}
            />
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">
              <div>
                <p className="font-serif text-3xl italic mb-3 text-[var(--ink)]">LEIMU</p>
                <p className="tag-mono mb-6">Käsintehtyjä kynttilöitä</p>
                <p className="text-sm text-[var(--ink-soft)] leading-relaxed max-w-xs">
                  Jokainen LEIMU-kynttilä on pieneräinen käsityö, valmistettu
                  100% soijavahasta ja sheabutterista Suomessa.
                </p>
              </div>
              <div>
                <p className="tag-mono mb-6">Navigaatio</p>
                <nav className="flex flex-col gap-3">
                  {[
                    { href: "/", label: "Etusivu" },
                    { href: "/tuotteet", label: "Tuotteet" },
                    { href: "/tarina", label: "Tarina" },
                  ].map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                  <PrivacyLink className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors text-left">
                    Tietosuojaseloste
                  </PrivacyLink>
                </nav>
              </div>
              <div>
                <p className="tag-mono mb-6">Yhteystiedot</p>
                <a
                  href="mailto:leimucandles@gmail.com"
                  className="text-sm text-[var(--ink-soft)] hover:text-[var(--accent-2)] transition-colors"
                >
                  leimucandles@gmail.com
                </a>
                <p className="text-sm text-[var(--ink-mute)] mt-3">Oulu, Suomi</p>
                <p className="text-sm text-[var(--ink-mute)] mt-8">
                  © {new Date().getFullYear()} LEIMU. Kaikki oikeudet pidätetään.
                </p>
              </div>
              <div>
                <p className="tag-mono mb-6">Instagram</p>
                <p className="text-sm text-[var(--ink-soft)] leading-relaxed mb-5 max-w-[14rem]">
                  Pieniä eriä, liekkejä ja Oulun studio.
                </p>
                <div className="flex items-center gap-4">
                  <a
                    href="https://www.instagram.com/leimucandles/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LEIMU Instagramissa"
                    className="text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/LEIMUcandles/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LEIMU Facebookissa"
                    className="text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                </div>
                <a
                  href="https://www.instagram.com/leimucandles/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 tag-mono text-[9px] text-[var(--ink-mute)] hover:text-[var(--ink)] mt-6"
                >
                  @leimucandles
                </a>
              </div>
            </div>
          </footer>
          <ContactModalHost />
          <GrainOverlay />
        </StoreProvider>
      </body>
    </html>
  );
}
