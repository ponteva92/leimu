"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Hero: the ignition
   ------------------------------------------------------------------------
   Left  : typography + two primary CTAs (→ /tuotteet, → ContactModal).
   Right : a lazy R3F canvas — the auto-lit candle + flame, with the white LEIMU
           logo rendered as a texture above the wick, shimmering in rising
           heat-haze and wrapped in a warm "scent aura". No smoke.

   Pinned (md+, motion allowed): a 290svh track holds a 100svh sticky stage.
   Over the first 90svh of scroll the copy lifts away, dusk falls, and the
   candle glides to centre stage and grows until it stands inside the brand
   line "Kynttilät jotka [candle] tuoksuvat Suomelta." Over the last 100svh
   the home page's paper sheet, pulled up by one stage height, rises over
   the stage while it recedes. Phones and reduced motion get the plain hero
   in normal flow: no pin, no scroll choreography.
   ════════════════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState, type ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import { easeInOut, motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { useStore } from "@/context/store";
import { SPRING_PREMIUM } from "@/lib/motionVariants";
import { usePinned } from "@/lib/pin";
import { coverStart, trackVars } from "@/lib/timeline";
import { ContactCTA } from "@/components/ContactCTA";
import { useCoverRecede, useWillChange } from "@/components/story/hooks";
import { HeroBackground } from "./HeroBackground";
import {
  HERO,
  heroStagger,
  heroLine,
  heroFade,
  amberBreatheAnimate,
  amberBreatheTransition,
} from "./heroMotion";

/* Three.js never ships in the initial bundle, never on the server, and never
   on a phone — the chunk loads only after a fine-pointer desktop is confirmed. */

/* The track's height and the home sheet's pull-up in HomeClient read
   these through CSS variables, so the classes can't drift from the
   timeline (see lib/timeline). The ignition takes the pinned scroll
   before the sheet starts to cover the stage, at IGNITE_END. */
const TRACK_SVH = 290;
export const COVER_SVH = 100;
const IGNITE_END = coverStart(TRACK_SVH, COVER_SVH);
/** A point in the ignition (0–1) as track progress. */
const at = (i: number) => i * IGNITE_END;

const COPY = {
  fi: {
    eyebrow: "Käsintehty · Pienessä erässä",
    line1Lead: "Luonnollinen ",
    line1Accent: "rauha.",
    line2: "Jokapäiväinen luksus.",
    body: "LEIMU-kynttilät on valmistettu 100% soijavahasta ja sheabutterista. Jokainen on oma käsityönsä, omilla tuoksuillaan ja viesteillään.",
    cta1: "Suunnittele oma",
    cta2: "Ota yhteyttä",
    duskLead: "Kynttilät jotka",
    duskTail: "tuoksuvat ",
    duskAccent: "Suomelta.",
  },
  en: {
    eyebrow: "Handmade · Small batch",
    line1Lead: "Natural ",
    line1Accent: "calm.",
    line2: "Everyday luxury.",
    body: "LEIMU candles are made from 100% soy wax and shea butter. Each one is its own craft, with your choice of scent and message.",
    cta1: "Design yours",
    cta2: "Contact us",
    duskLead: "Candles that",
    duskTail: "smell of ",
    duskAccent: "Finland.",
  },
} as const;

type CandleCanvasProps = { isMobile: boolean; reducedMotion: boolean };

/* Both WebGL loops park once the hero is fully covered: HeroBackground and
   CandleCanvas read heroActive from the store themselves, so the flip
   re-renders only them. */
export function HeroCandle() {
  const lang = useStore((s) => s.lang);
  const t = COPY[lang] ?? COPY.fi;

  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [CandleCanvas, setCandleCanvas] = useState<ComponentType<CandleCanvasProps> | null>(null);
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
    const queries = [mqMobile, mqMotion];
    queries.forEach((mq) => mq.addEventListener("change", sync));
    return () => queries.forEach((mq) => mq.removeEventListener("change", sync));
  }, []);

  useEffect(() => {
    if (!mounted || isMobile) return;
    let cancelled = false;
    import("./CandleCanvas").then((mod) => {
      if (!cancelled) setCandleCanvas(() => mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [mounted, isMobile]);

  /* ── Ignition. Every transform reads `p`, held at rest when not pinned
        (and on the server, so the first paint is always the resting hero). */
  const pinned = usePinned();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const p = useTransform(scrollYProgress, (v) => (pinned ? v : 0));

  // The copy lifts away bottom-first: CTAs leave early, the headline last.
  // Hidden CTAs also leave the tab order.
  const ctaY = useTransform(p, [0, IGNITE_END], [0, -160]);
  const ctaOpacity = useTransform(p, [0, at(0.35)], [1, 0]);
  const ctaVisibility = useTransform(ctaOpacity, (o) => (o > 0.02 ? "visible" : "hidden"));
  const eyebrowY = useTransform(p, [0, IGNITE_END], [0, -120]);
  const eyebrowOpacity = useTransform(p, [0, at(0.45)], [1, 0]);
  const bodyY = useTransform(p, [0, IGNITE_END], [0, -90]);
  const bodyOpacity = useTransform(p, [0, at(0.5)], [1, 0]);
  const titleY = useTransform(p, [0, IGNITE_END], [0, -60]);
  const titleOpacity = useTransform(p, [at(0.05), at(0.6)], [1, 0]);

  // Dusk falls over the backdrop (never over the candle). The candle glides
  // to centre stage, half its column plus half the 3rem gap, and grows while
  // its light spreads into the dark.
  const duskOpacity = useTransform(p, [at(0.15), at(0.75)], [0, 0.9]);
  const groundOpacity = useTransform(p, [0, at(0.3)], [1, 0]);
  const glide = useTransform(p, [0, at(0.8)], [0, 1], { ease: easeInOut });
  const candleX = useTransform(glide, (g) => `calc(${-50 * g}% - ${1.5 * g}rem)`);
  const candleScale = useTransform(p, [0, IGNITE_END], [1, 1.18]);
  const glowScale = useTransform(p, [at(0.2), IGNITE_END], [1, 1.4]);
  const haloOpacity = useTransform(p, [at(0.3), IGNITE_END], [0, 1]);

  // The brand line parts from the candle once it has nearly settled.
  const lineOpacity = useTransform(p, [at(0.55), at(0.85)], [0, 1]);
  const lineLeadX = useTransform(p, [at(0.55), at(0.85)], [32, 0]);
  const lineTailX = useTransform(p, [at(0.55), at(0.85)], [-32, 0]);

  // While the sheet covers the stage, the stage recedes beneath it.
  const recede = useCoverRecede(p, IGNITE_END, 0.94);

  /* Each moving layer is promoted while its window runs (see useWillChange).
     A layer that fades as well as moves names both, or Chrome repaints it.
     `p` rests at 0 when not pinned, so phones and reduced motion promote
     nothing. */
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const duskRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLParagraphElement>(null);
  const lineLeadRef = useRef<HTMLSpanElement>(null);
  const lineTailRef = useRef<HTMLSpanElement>(null);
  const recedeRef = useRef<HTMLDivElement>(null);
  const groundRef = useRef<HTMLDivElement>(null);
  useWillChange(p, [[0, IGNITE_END]], [eyebrowRef, titleRef, bodyRef, ctaRef], "transform, opacity");
  useWillChange(p, [[0, IGNITE_END]], [columnRef]);
  useWillChange(p, [[at(0.2), IGNITE_END]], [glowRef]);
  useWillChange(p, [[at(0.15), at(0.75)]], [duskRef], "opacity");
  useWillChange(p, [[at(0.3), IGNITE_END]], [haloRef], "opacity");
  useWillChange(p, [[0, at(0.3)]], [groundRef], "opacity");
  useWillChange(p, [[at(0.55), at(0.85)]], [lineRef], "opacity");
  useWillChange(p, [[at(0.55), at(0.85)]], [lineLeadRef, lineTailRef]);
  useWillChange(p, [[IGNITE_END, 1]], [recedeRef]);

  return (
    <div
      ref={trackRef}
      id="liekki"
      className="relative md:motion-safe:h-[var(--track)]"
      style={trackVars(TRACK_SVH)}
    >
      <section
        data-tone="dark"
        className="relative z-0 flex min-h-[100svh] items-center overflow-hidden md:motion-safe:sticky md:motion-safe:top-0 md:motion-safe:h-[100svh] md:motion-safe:min-h-0"
        style={{ backgroundColor: HERO.bg }}
      >
        {/* Animated WebGL backdrop — warm fluid mesh + soft orbs (CSS-gradient fallback) */}
        <HeroBackground />

        {/* Left scrim — lifts the cream text to AA over the warm backdrop, fades out before the candle */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{ background: "linear-gradient(105deg, rgba(26,24,20,0.60) 0%, rgba(26,24,20,0.50) 45%, rgba(26,24,20,0.16) 68%, transparent 84%)" }}
        />

        {/* faint top vignette so the navbar reads cleanly */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.10), transparent)" }}
        />

        {/* Dusk */}
        <motion.div
          ref={duskRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[var(--ink)]"
          style={{ opacity: duskOpacity }}
        />

        <motion.div ref={recedeRef} className="relative z-10 w-full" style={{ scale: recede }}>
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 pt-28 pb-16 md:grid-cols-2 md:gap-12 md:px-10 md:py-20">
            {/* ─────────────────── LEFT — typography ─────────────────── */}
            <motion.div
              className="flex min-w-0 flex-col gap-7"
              variants={heroStagger}
              initial="hidden"
              animate="visible"
            >
              <motion.div ref={eyebrowRef} style={{ y: eyebrowY, opacity: eyebrowOpacity }}>
                <motion.p
                  variants={heroFade}
                  className="font-mono text-[12px] uppercase tracking-[0.16em]"
                  style={{ color: HERO.cream }}
                >
                  {t.eyebrow}
                </motion.p>
              </motion.div>

              <motion.div ref={titleRef} style={{ y: titleY, opacity: titleOpacity }}>
                <h1 className="max-w-full font-serif font-medium text-[clamp(2.15rem,8vw,4.5rem)] leading-[1.08] tracking-[-0.015em]">
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
              </motion.div>

              <motion.div ref={bodyRef} style={{ y: bodyY, opacity: bodyOpacity }}>
                <motion.p
                  variants={heroFade}
                  className="max-w-md text-base leading-relaxed md:text-[1.05rem]"
                  style={{ color: HERO.cream }}
                >
                  {t.body}
                </motion.p>
              </motion.div>

              {/* ── Two primary CTAs ── */}
              <motion.div ref={ctaRef} className="mt-1" style={{ y: ctaY, opacity: ctaOpacity, visibility: ctaVisibility }}>
                <motion.div variants={heroFade} className="flex flex-wrap items-center gap-4">
                  <Link href="/tuotteet" passHref legacyBehavior>
                    <motion.a
                      className="relative inline-flex items-center gap-2 overflow-hidden rounded-full px-7 py-3.5 font-sans font-medium text-[13px] uppercase tracking-[0.08em]"
                      style={{ backgroundColor: HERO.cream, color: "#1A1814" }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      transition={SPRING_PREMIUM}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {t.cta1}
                        <ArrowRight size={13} weight="light" aria-hidden="true" />
                      </span>
                    </motion.a>
                  </Link>

                  <ContactCTA variant="hero" label={t.cta2} />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* ───────── RIGHT — auto-lit candle + heat-mirage logo (all WebGL) ───────── */}
            <motion.div
              ref={columnRef}
              className="relative h-[64vh] min-h-[480px] w-full md:h-[88vh]"
              style={{ x: candleX, scale: candleScale }}
            >
              <div className="absolute inset-0 translate-y-4 md:translate-y-8">
                {/* warm glow behind the candle, with a blur(45px) baked into
                    the gradient: the box extends by the blur's reach (135px a
                    side) and the stops are fitted to the blurred glow at
                    1536×695, so no filter re-runs while glowScale moves.
                    Normal blending is enough: nothing sits under it inside
                    this wrapper's stacking context. */}
                <motion.div
                  ref={glowRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-[58%] h-[calc(52%+270px)] w-[calc(58%+270px)]"
                  style={{
                    x: "-50%",
                    y: "-50%",
                    scale: glowScale,
                    background:
                      "radial-gradient(closest-side, rgba(209,143,74,0.195) 0%, rgba(209,142,73,0.182) 10%, rgba(207,139,71,0.151) 20%, rgba(204,135,68,0.111) 30%, rgba(201,130,65,0.07) 40%, rgba(199,127,62,0.037) 50%, rgba(198,124,60,0.015) 60%, rgba(197,123,59,0.005) 70%, rgba(196,122,58,0.001) 80%, transparent 90%)",
                  }}
                />
                {/* candlelight on the dusk: a wide, soft halo that only shows once dark falls */}
                <motion.div
                  ref={haloRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-[48%] h-[110%] w-[150%]"
                  style={{
                    x: "-50%",
                    y: "-50%",
                    opacity: haloOpacity,
                    background:
                      "radial-gradient(closest-side, rgba(214,150,80,0.24), rgba(196,122,58,0.09) 50%, transparent)",
                  }}
                />
                {/* WebGL candle + flame + heat-mirage logo + scent aura */}
                <div className="absolute inset-0">
                  {CandleCanvas && !isMobile ? (
                    <CandleCanvas isMobile={false} reducedMotion={reducedMotion} />
                  ) : (
                    <div className="absolute inset-0 flex items-end justify-center pb-[6%]">
                      <Image
                        src="/images/hero-candle-black.png"
                        alt=""
                        width={720}
                        height={960}
                        priority
                        className="h-[88%] w-auto object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* The brand line, parted around the settled candle. Pinned layouts only. */}
          <div className="pointer-events-none absolute inset-0 hidden items-center md:motion-safe:flex">
            <motion.p
              ref={lineRef}
              className="heading-display mx-auto grid w-full max-w-7xl grid-cols-[1fr_32%_1fr] items-center gap-x-6 px-10 text-[clamp(1.75rem,3vw,3rem)]"
              style={{ opacity: lineOpacity, color: HERO.cream }}
            >
              <motion.span ref={lineLeadRef} className="text-right" style={{ x: lineLeadX }}>
                {t.duskLead}
              </motion.span>
              <span aria-hidden="true" />
              <motion.span ref={lineTailRef} className="text-left" style={{ x: lineTailX }}>
                {t.duskTail}
                <em style={{ color: HERO.amber }}>{t.duskAccent}</em>
              </motion.span>
            </motion.p>
          </div>
        </motion.div>

        {/* Tan ground dissolves into paper — no hard jump. Clears as dusk falls. */}
        <motion.div
          ref={groundRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-28"
          style={{
            opacity: groundOpacity,
            background:
              "linear-gradient(to bottom, rgba(247,242,234,0) 0%, var(--bg) 100%)",
          }}
        />
      </section>
    </div>
  );
}
