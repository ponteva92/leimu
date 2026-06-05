"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Hero
   ------------------------------------------------------------------------
   Left  : typography + two primary CTAs (→ /tuotteet, → ContactModal).
   Right : a lazy R3F canvas — the auto-lit candle + flame, with the white LEIMU
           logo rendered as a texture above the wick, shimmering in rising
           heat-haze and wrapped in a warm "scent aura". No smoke.

   The hero is sticky + dims on scroll so the next section glides over it.
   ════════════════════════════════════════════════════════════════════════ */

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useTransform, useScroll } from "framer-motion";
import { useStore } from "@/context/store";
import { SPRING_PREMIUM } from "@/lib/motionVariants";
import { ContactCTA } from "@/components/ContactCTA";
import {
  HERO,
  heroStagger,
  heroLine,
  heroFade,
  amberBreatheAnimate,
  amberBreatheTransition,
} from "./heroMotion";

/* Three.js never ships in the initial bundle and never runs on the server. */
const CandleCanvas = dynamic(() => import("./CandleCanvas"), {
  ssr: false,
  loading: () => null,
});

const COPY = {
  fi: {
    eyebrow: "Käsintehty · Pienessä erässä",
    line1Lead: "Luonnollinen ",
    line1Accent: "rauha.",
    line2: "Jokapäiväinen luksus.",
    body: "LEIMU-kynttilät on valmistettu 100% soijavahasta ja sheabutterista. Jokainen kynttilä on oma käsityönsä — valittavilla tuoksuilla, purkeilla ja viesteillä.",
    cta1: "Suunnittele oma",
    cta2: "Ota yhteyttä",
  },
  en: {
    eyebrow: "Handmade · Small batch",
    line1Lead: "Natural ",
    line1Accent: "calm.",
    line2: "Everyday luxury.",
    body: "LEIMU candles are made from 100% soy wax and shea butter. Each candle is its own craft — with your choice of scents, jars, and messages.",
    cta1: "Design yours",
    cta2: "Contact us",
  },
} as const;

export function HeroCandle() {
  const { lang } = useStore();
  const t = COPY[lang] ?? COPY.fi;

  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* ── Environment ── */
  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setIsMobile(mqMobile.matches);
      setReducedMotion(mqMotion.matches);
    };
    sync();
    mqMobile.addEventListener("change", sync);
    mqMotion.addEventListener("change", sync);
    return () => {
      mqMobile.removeEventListener("change", sync);
      mqMotion.removeEventListener("change", sync);
    };
  }, []);

  /* ── Scroll dim: the hero recedes as the next section glides over it. ── */
  const { scrollY } = useScroll();
  const viewH = typeof window !== "undefined" ? window.innerHeight : 800;
  const dimOpacity = useTransform(scrollY, [0, viewH * 0.85], [1, 0]);
  const dimScale = useTransform(scrollY, [0, viewH], [1, 0.93]);
  const dimY = useTransform(scrollY, [0, viewH], ["0%", "7%"]);
  const dimBlur = useTransform(scrollY, [0, viewH * 0.7], ["blur(0px)", "blur(6px)"]);

  return (
    <section
      className="relative top-0 z-0 flex min-h-[100svh] items-center overflow-hidden md:sticky md:min-h-0 md:h-[100dvh]"
      style={{ backgroundColor: HERO.bg }}
      aria-label="Hero"
    >
      {/* faint top vignette so the navbar/marquee read cleanly */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.10), transparent)" }}
      />

      <motion.div
        suppressHydrationWarning
        className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 pt-28 pb-16 md:grid-cols-2 md:gap-12 md:px-10 md:py-20"
        style={mounted ? { opacity: dimOpacity, scale: dimScale, y: dimY, filter: dimBlur } : undefined}
      >
        {/* ─────────────────── LEFT — typography ─────────────────── */}
        <motion.div
          className="flex flex-col gap-7"
          variants={heroStagger}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            variants={heroFade}
            className="font-mono text-[0.7rem] uppercase tracking-[0.28em]"
            style={{ color: "rgba(245,245,240,0.6)" }}
          >
            {t.eyebrow}
          </motion.p>

          <h1 className="font-serif text-5xl leading-[1.06] tracking-[-0.02em] md:text-6xl lg:text-7xl">
            <motion.span variants={heroLine} className="block" style={{ color: HERO.cream }}>
              {t.line1Lead}
              <motion.span
                className="italic"
                style={{ color: HERO.amber }}
                animate={reducedMotion ? undefined : amberBreatheAnimate}
                transition={reducedMotion ? undefined : amberBreatheTransition}
              >
                {t.line1Accent}
              </motion.span>
            </motion.span>
            <motion.span variants={heroLine} className="block" style={{ color: HERO.cream }}>
              {t.line2}
            </motion.span>
          </h1>

          <motion.p
            variants={heroFade}
            className="max-w-md text-base leading-relaxed md:text-[1.05rem]"
            style={{ color: "rgba(245,245,240,0.82)" }}
          >
            {t.body}
          </motion.p>

          {/* ── Two primary CTAs ── */}
          <motion.div variants={heroFade} className="mt-1 flex flex-wrap items-center gap-4">
            <Link href="/tuotteet" passHref legacyBehavior>
              <motion.a
                className="relative inline-flex items-center gap-2 overflow-hidden rounded-full px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em]"
                style={{ backgroundColor: HERO.cream, color: "#1A1814" }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={SPRING_PREMIUM}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t.cta1}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </motion.a>
            </Link>

            <ContactCTA variant="hero" label={t.cta2} />
          </motion.div>
        </motion.div>

        {/* ───────── RIGHT — auto-lit candle + heat-mirage logo (all WebGL) ───────── */}
        <div className="relative h-[64vh] min-h-[480px] w-full md:h-[88vh]">
          <div className="absolute inset-0 translate-y-4 md:translate-y-8">
            {/* warm glow behind the candle */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[58%] h-[52%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(214,150,80,0.30) 0%, rgba(196,122,58,0.10) 45%, transparent 72%)",
                filter: "blur(45px)",
                mixBlendMode: "screen",
              }}
            />
            {/* WebGL candle + flame + heat-mirage logo + scent aura */}
            <div className="absolute inset-0">
              <CandleCanvas isMobile={isMobile} reducedMotion={reducedMotion} />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
