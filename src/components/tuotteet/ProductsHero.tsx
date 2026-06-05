"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Tuotteet "Living Still Life" hero
   ------------------------------------------------------------------------
   Sticky split layout (z-0). The product content below glides up and over it
   (higher z, opaque bg) — mirroring the home hero's scroll architecture.

   Left  : eyebrow + a two-line headline that mask-reveals on load (staggered).
   Right : a lazy R3F canvas of the products photo with a molten reveal and a
           scroll-driven fade-to-dark that keeps the wax seals glowing.
   ════════════════════════════════════════════════════════════════════════ */

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { useStore } from "@/context/store";
import { AnimatedLogo } from "@/components/AnimatedLogo";

const HeroImageCanvas = dynamic(() => import("./HeroImageCanvas"), {
  ssr: false,
  loading: () => null,
});

const COPY = {
  fi: {
    eyebrow: "LEIMU — Tuotteet",
    l1: "Kynttilä, joka on",
    l2: "täysin sinun",
    body: "Valitse purkin väri ja tuoksut, lisää koriin ja tilaa helposti. Jokainen LEIMU valetaan käsin pienissä erissä — 100 % soijavahasta ja sheabutterista, puhtaalla puuvillasydämellä ja Suomen luontoon inspiroituneilla tuoksuilla. Viimeistelynä käsinleimattu vahasinetti ja tyylikäs lahjapussi — pala luonnollista rauhaa, joka on täysin sinun.",
    scroll: "Vieritä",
  },
  en: {
    eyebrow: "LEIMU — Products",
    l1: "A candle that is",
    l2: "entirely yours",
    body: "Choose your jar colour and scents, add to cart and order with ease. Every LEIMU is hand-poured in small batches — 100% soy wax and shea butter, a pure cotton wick, and scents inspired by Finnish nature. Finished with a hand-stamped wax seal and an elegant gift bag — a piece of natural calm that is entirely yours.",
    scroll: "Scroll",
  },
} as const;

export function ProductsHero() {
  const { lang } = useStore();
  const t = COPY[lang] ?? COPY.fi;

  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

  /* Scroll: the hero dims/recedes (DOM) while uScroll fades the image to dark. */
  const { scrollY } = useScroll();
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const scrollProgress = useTransform(scrollY, [0, vh * 0.9], [0, 1]);
  const heroOpacity = useTransform(scrollY, [0, vh * 0.85], [1, 0]);
  const heroScale = useTransform(scrollY, [0, vh], [1, 0.95]);

  return (
    <section
      className="sticky top-0 z-0 flex items-center overflow-hidden"
      style={{ backgroundColor: "var(--bg)", height: "100svh" }}
      aria-label={t.eyebrow}
    >
      <motion.div
        suppressHydrationWarning
        className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 pt-28 pb-16 md:grid-cols-2 md:gap-14 md:px-10 md:py-0"
        style={mounted ? { opacity: heroOpacity, scale: heroScale } : undefined}
      >
        {/* ── LEFT — typography ── */}
        <motion.div
          className="order-2 flex flex-col gap-6 md:order-1"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          <div className="flex items-center gap-3">
            <AnimatedLogo size={44} delay={0.1} />
            <p className="tag-mono">{t.eyebrow}</p>
          </div>

          <h1 className="font-serif leading-[0.92] text-[var(--ink)]">
            <span className="block overflow-hidden pb-[0.05em]">
              <motion.span
                className="block text-2xl font-light tracking-tight text-[var(--ink-soft)] md:text-3xl"
                initial={{ y: "115%", scale: 1.04 }}
                animate={{ y: "0%", scale: 1 }}
                transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
              >
                {t.l1}
              </motion.span>
            </span>
            <span className="mt-1 block overflow-hidden pb-[0.08em]">
              <motion.span
                className="block text-6xl italic md:text-8xl"
                initial={{ y: "115%", scale: 1.04 }}
                animate={{ y: "0%", scale: 1 }}
                transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1], delay: 0.42 }}
              >
                {t.l2}
              </motion.span>
            </span>
          </h1>

          <p className="max-w-md text-base leading-relaxed text-[var(--ink-soft)]">{t.body}</p>

          <div className="mt-2 flex items-center gap-3 text-[var(--ink-mute)]">
            <span className="tag-mono text-[9px]">{t.scroll}</span>
            <motion.span
              aria-hidden="true"
              className="block h-8 w-px origin-top bg-[var(--line)]"
              animate={reducedMotion ? undefined : { scaleY: [0.35, 1, 0.35] }}
              transition={reducedMotion ? undefined : { duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>

        {/* ── RIGHT — Living Still Life canvas ── */}
        <motion.div
          className="relative order-1 h-[46vh] min-h-[300px] w-full overflow-hidden rounded-3xl border border-[var(--line)] md:order-2 md:h-[78vh]"
          style={{ boxShadow: "0 30px 80px -34px rgba(26,24,20,0.55)" }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <HeroImageCanvas
            scrollProgress={scrollProgress}
            reducedMotion={reducedMotion}
            isMobile={isMobile}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
