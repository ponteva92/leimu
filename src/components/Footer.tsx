"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FacebookLogo, InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import { useStore } from "@/context/store";
import { PrivacyLink } from "@/components/PrivacyModal";
import { FooterWordmark } from "@/components/FooterWordmark";

const NAV = [
  { href: "/", label: { fi: "Etusivu", en: "Home" } },
  { href: "/tuotteet", label: { fi: "Tuotteet", en: "Products" } },
  { href: "/tarina", label: { fi: "Tarina", en: "Story" } },
];

const COPY = {
  fi: {
    place: "Oulu · Käsityö",
    tagline: "Kynttilät, jotka tuoksuvat Suomelta.",
    body: "Pala luksusta, jonka olet ansainnut. Jokainen kynttilä valmistettu käsityönä, yksi kerrallaan.",
    specimenAlt: "Havun oksa, LEIMU-tuoksun kasvitieteellinen näyte",
    sealAlt: "Kultainen LEIMU-vahasinetti",
    navLabel: "Alavalikko",
    privacy: "Tietosuojaseloste",
    instagram: "LEIMU Instagramissa",
    facebook: "LEIMU Facebookissa",
    rights: "Kaikki oikeudet pidätetään.",
  },
  en: {
    place: "Oulu · Craft",
    tagline: "Candles that smell of Finland.",
    body: "A piece of luxury you have earned. Every candle made by hand, one at a time.",
    specimenAlt: "A pine sprig, the botanical specimen behind a LEIMU scent",
    sealAlt: "A gold LEIMU wax seal",
    navLabel: "Footer",
    privacy: "Privacy policy",
    instagram: "LEIMU on Instagram",
    facebook: "LEIMU on Facebook",
    rights: "All rights reserved.",
  },
} as const;

/* The page is prerendered, so a year computed while rendering would be the
   build's year. The visitor's clock supplies it after hydration instead;
   until then (and without JavaScript) both lines read fine without one. */
function useYear() {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => setYear(new Date().getFullYear()), []);
  return year;
}

const SOCIAL =
  "inline-flex size-11 items-center justify-center text-[var(--on-dark)] opacity-90 transition-opacity hover:opacity-100";

export function Footer() {
  const lang = useStore((s) => s.lang);
  const t = COPY[lang] ?? COPY.fi;
  const year = useYear();

  return (
    <footer className="relative mt-0 overflow-hidden bg-[var(--ink)] text-[var(--on-dark)]">
      {/* Warm residual glow — candlelight still in the room */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[70%] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(196,122,58,0.22) 0%, rgba(196,122,58,0.06) 42%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1200px] px-6 pb-10 pt-20 md:px-10 md:pb-12 md:pt-28">
        <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)] lg:gap-16">
          <div className="relative min-w-0">
            <p className="tag-mono mb-6 text-[var(--on-dark)]">
              {t.place}
              {year && ` · ${year}`}
            </p>

            <FooterWordmark />

            <p className="mt-6 max-w-md font-serif text-2xl italic leading-snug text-[var(--on-dark)] md:text-3xl">
              {t.tagline}
            </p>
            <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-[var(--on-dark)] opacity-90">
              {t.body}
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:mx-0 lg:justify-self-end">
            <div className="paper-well">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(var(--radius-lg)-6px)] bg-[var(--ink)]">
                <Image
                  src="/images/scent-havu.jpg"
                  alt={t.specimenAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 80vw, 320px"
                />
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 w-28 md:-left-10 md:w-36">
              <Image
                src="/images/kortti.png"
                alt={t.sealAlt}
                width={220}
                height={220}
                className="h-auto w-full drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
              />
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="mt-20 h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(196,122,58,0.15) 18%, #C47A3A 50%, rgba(196,122,58,0.15) 82%, transparent 100%)",
          }}
        />

        <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label={t.navLabel}>
            {NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="footer-link font-sans text-sm tracking-[0.06em] text-[var(--on-dark)]"
              >
                {link.label[lang]}
              </Link>
            ))}
            <PrivacyLink className="footer-link font-sans text-sm tracking-[0.06em] text-[var(--on-dark)] text-left">
              {t.privacy}
            </PrivacyLink>
          </nav>

          <div className="flex flex-col gap-4 md:items-end">
            <a
              href="mailto:leimucandles@gmail.com"
              className="footer-link font-mono text-xs uppercase tracking-[0.16em] text-[var(--on-dark)]"
            >
              leimucandles@gmail.com
            </a>
            {/* 44px targets around 22px glyphs. The negative margins keep the
                glyphs on the column's edge and the row's height at 22px. */}
            <div className="-m-[11px] flex items-center">
              <a
                href="https://www.instagram.com/leimucandles/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.instagram}
                className={SOCIAL}
              >
                <InstagramLogo size={22} weight="light" aria-hidden="true" />
              </a>
              <a
                href="https://www.facebook.com/LEIMUcandles/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.facebook}
                className={SOCIAL}
              >
                <FacebookLogo size={22} weight="light" aria-hidden="true" />
              </a>
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--on-dark)]">
              © {year && `${year} `}LEIMU. {t.rights}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
