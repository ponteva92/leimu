"use client";

/**
 * GiftCeremony — "Sinetöity viesti" (The Sealed Letter)
 *
 * The brand's two physical signatures are the same Finnish word: the flame
 * (leimu) and the wax seal (leima). This section closes that loop with the
 * black thank-you envelope and its golden LEIMU seal.
 *
 * Motion (all in the house framer-motion + Lenis vocabulary — no new deps):
 *   • The envelope floats on a gentle scroll-parallax under a warm spotlight.
 *   • A single golden shimmer sweeps the seal on entrance, re-triggered on hover
 *     (the same grammar as AnimatedLogo — one shared gold language site-wide).
 *   • Copy reveals with the shared stagger/blur-up variants.
 *
 * Reduced-motion: parallax + shimmer collapse to a clean fade. GPU-only
 * transforms (translate/scale/opacity) with will-change on the moving layer.
 *
 * Reusable + bilingual: the gift-card copy lives here once (single source of
 * truth) and both Etusivu and Tuotteet render it. `ctaHref` tailors the CTA
 * per page; pass `null` to omit it (e.g. when already on the products page).
 */

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useStore } from "@/context/store";
import {
  headingReveal,
  fadeUpItem,
  staggerContainer,
  VIEWPORT_NEAR,
} from "@/lib/motionVariants";

interface GiftCeremonyProps {
  /** CTA target. `undefined` → default order link; `null` → no CTA. */
  ctaHref?: string | null;
  className?: string;
}

const COPY = {
  eyebrow: { fi: "Jokaiseen tilaukseen", en: "With every order" },
  // Heading is split so the accent word routes through the Cormorant italic.
  headingLead: { fi: "Sinetöity viesti,", en: "A sealed message," },
  headingAccent: { fi: "kultaisella musteella.", en: "in gold ink." },
  // Verbatim brand copy, paragraphed at sentence boundaries for legibility.
  body: {
    fi: [
      "Jokaiseen LEIMU Candles -tilaukseen tulee mukaan musta kiitoskortti, joka sisältää sinun omavalintaisen viestin. Viesti on käsinkirjoitettu kultaisella musteella, ja se sinetöidään upealla LEIMUn logolla varustetulla kultaisella vahasinetillä.",
      "Tämän ansiosta LEIMU Candles sopii täydellisesti esim. pikkujoulu- tai yrityslahjaksi. Voit myös hemmotella itseäsi ylellisellä kokemuksella, jolloin voimme kirjoittaa sinulle yllätysviestin!",
      "LEIMU Candles on ylellinen elämys lahjansaajalle, jollaista muut kynttilät eivät tarjoa – oli saajana sitten läheinen tai sinä itse. Mieleenpainuva lahja, koska sinä olet sen ansainnut.",
    ],
    en: [
      "Every LEIMU Candles order arrives with a black thank-you card carrying a message of your choosing. It is handwritten in gold ink and closed with a golden wax seal pressed with the LEIMU mark.",
      "That makes LEIMU Candles a flawless gift for a Christmas party or a corporate occasion. Or treat yourself to the indulgence — and let us write you a surprise message.",
      "LEIMU Candles is a luxurious experience for whoever receives it, the kind ordinary candles never offer — whether that's someone close to you, or you. An unforgettable gift, because you have earned it.",
    ],
  },
  details: [
    { fi: "Käsinkirjoitettu", en: "Handwritten" },
    { fi: "Kultainen vahasinetti", en: "Gold wax seal" },
    { fi: "Oma viestisi", en: "Your own words" },
  ],
  cta: { fi: "Tee tilaus", en: "Order yours" },
  caption: { fi: "Käsinkirjoitettu · Kultainen vahasinetti", en: "Handwritten · Gold wax seal" },
  alt: {
    fi: "Musta kirjekuori, jonka sulkee kultainen LEIMU Candles -vahasinetti",
    en: "Black envelope closed with a golden LEIMU Candles wax seal",
  },
} as const;

export function GiftCeremony({ ctaHref = "/tuotteet#configurator", className = "" }: GiftCeremonyProps) {
  const { lang } = useStore();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  /* Scroll-parallax for the floating envelope (disabled under reduced motion). */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const envY = useTransform(scrollYProgress, [0, 1], ["7%", "-7%"]);

  return (
    <section className={`py-24 px-6 md:px-10 max-w-7xl mx-auto ${className}`}>
      <div ref={ref} className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* ── Envelope spotlight panel ─────────────────────────────── */}
        <motion.div
          className="group relative order-1 md:order-none"
          initial="rest"
          whileHover="hover"
          whileInView="sweep"
          viewport={{ once: true, margin: "-120px 0px" }}
        >
          <div
            className="relative overflow-hidden rounded-3xl border border-[var(--line)] shadow-e4"
            style={{
              aspectRatio: "5 / 4",
              background:
                "radial-gradient(120% 90% at 50% 38%, #2a2620 0%, #1d1a15 45%, #14110d 100%)",
            }}
          >
            {/* Warm spotlight behind the seal */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 42%, rgba(212,169,106,0.26) 0%, rgba(212,169,106,0.08) 38%, transparent 62%)",
              }}
            />

            {/* The floating envelope (parallax + a touch of lift on hover) */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center p-8 sm:p-12"
              style={{ y: reduce ? 0 : envY, willChange: "transform" }}
            >
              <motion.div
                className="relative w-full h-full"
                variants={{
                  rest: { scale: 1, y: 0 },
                  hover: { scale: 1.025, y: -6 },
                }}
                transition={{ type: "spring", stiffness: 200, damping: 24 }}
              >
                <Image
                  src="/images/kortti.png"
                  alt={COPY.alt[lang]}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 90vw, 45vw"
                  style={{
                    filter: "drop-shadow(0 34px 52px rgba(0,0,0,0.55))",
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Golden shimmer sweep across the seal — entrance + hover */}
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none mix-blend-screen"
              style={{
                background:
                  "linear-gradient(108deg, transparent 42%, rgba(255,222,140,0.45) 50%, rgba(212,169,106,0.18) 55%, transparent 64%)",
                backgroundSize: "260% 100%",
              }}
              variants={{
                rest: { backgroundPosition: "-160% 0", opacity: 0 },
                sweep: reduce
                  ? { opacity: 0 }
                  : { backgroundPosition: "260% 0", opacity: [0, 1, 1, 0] },
                hover: reduce
                  ? { opacity: 0 }
                  : { backgroundPosition: "260% 0", opacity: [0, 1, 1, 0] },
              }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />

            {/* Inner vignette for depth */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none rounded-3xl"
              style={{ boxShadow: "inset 0 0 90px 24px rgba(0,0,0,0.45)" }}
            />

            {/* Glass caption pill */}
            <div className="absolute bottom-5 left-5 right-5 flex">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/20 tag-mono text-[8px] !text-white/90">
                ✦ {COPY.caption[lang]}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Copy ─────────────────────────────────────────────────── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_NEAR}
        >
          <motion.p variants={fadeUpItem} className="tag-mono text-[var(--accent)] mb-3">
            {COPY.eyebrow[lang]}
          </motion.p>

          <motion.h2
            variants={headingReveal}
            className="heading-display text-4xl md:text-5xl text-[var(--ink)] mb-8"
          >
            {COPY.headingLead[lang]}
            <br />
            <em>{COPY.headingAccent[lang]}</em>
          </motion.h2>

          <div className="space-y-5 text-[var(--ink-soft)] leading-relaxed">
            {COPY.body[lang].map((para, i) => (
              <motion.p
                key={i}
                variants={fadeUpItem}
                className={i === 0 ? "text-lg text-[var(--ink)]" : ""}
              >
                {para}
              </motion.p>
            ))}
          </div>

          {/* Detail row — echoes the craft-stat rhythm elsewhere on the site */}
          <motion.div
            variants={fadeUpItem}
            className="mt-9 flex flex-wrap gap-x-8 gap-y-4 pt-6 border-t border-[var(--line)]"
          >
            {COPY.details.map((d) => (
              <div key={d.fi} className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="w-1.5 h-1.5 rounded-full bg-[var(--accent-2)]"
                />
                <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--ink-mute)]">
                  {d[lang]}
                </span>
              </div>
            ))}
          </motion.div>

          {ctaHref && (
            <motion.div variants={fadeUpItem} className="mt-10">
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[var(--ink)] text-[var(--bg)] font-mono text-[10px] tracking-[0.2em] uppercase rounded-full hover:bg-[var(--accent)] transition-colors duration-200"
              >
                {COPY.cta[lang]}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M2 6h8M6 2l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
