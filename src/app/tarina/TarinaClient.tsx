"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  motion, AnimatePresence, useScroll, useTransform, useSpring,
  useMotionValue, useInView,
} from "framer-motion";
import { useStore } from "@/context/store";
import { AnimatedLogo } from "@/components/AnimatedLogo";
import { submitNetlifyForm } from "@/lib/netlifyForms";
import {
  headingReveal, fadeUpItem, staggerContainer,
  sectionReveal, slideFromLeft, slideFromRight,
  VIEWPORT_ONCE, VIEWPORT_NEAR,
} from "@/lib/motionVariants";

/* WebGL canvases — never SSR'd, lazy-loaded */
const LivingPortrait = dynamic(() => import("@/components/tarina/LivingPortrait"), { ssr: false });
const LiquidDark = dynamic(() => import("@/components/tarina/LiquidDark"), { ssr: false });

/* ─── Animation helpers ─────────────────────────── */
const ease = [0.22, 1, 0.36, 1] as const;

/* ─── SVG Drop Cap — draws the letter on scroll ─── */
function DropCap({ letter, delay = 0 }: { letter: string; delay?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <svg
      ref={ref}
      viewBox="0 0 60 80"
      xmlns="http://www.w3.org/2000/svg"
      className="float-left mr-3 mb-1"
      style={{ width: 68, height: 88 }}
      aria-hidden="true"
    >
      {/* Decorative frame ring */}
      <motion.rect
        x="2" y="2" width="56" height="76" rx="4"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="0.6"
        strokeOpacity={0.3}
        initial={{ pathLength: 0 }}
        animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* The letter itself — drawn as text with stroke animation */}
      <motion.text
        x="30" y="66"
        textAnchor="middle"
        fontFamily="'DM Serif Display', serif"
        fontStyle="italic"
        fontSize="62"
        fontWeight="400"
        fill="var(--ink)"
        stroke="var(--accent-2)"
        strokeWidth="0.4"
        initial={{ opacity: 0, y: 8 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.65, delay: delay + 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {letter}
      </motion.text>
      {/* Golden shimmer overlay sweep */}
      <motion.rect
        x="0" y="0" width="60" height="80"
        fill="url(#dc-shimmer)"
        initial={{ x: -60 }}
        animate={isInView ? { x: 60 } : { x: -60 }}
        transition={{ duration: 0.7, delay: delay + 0.8, ease: "easeInOut" }}
      />
      <defs>
        <linearGradient id="dc-shimmer" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(255,222,100,0)" />
          <stop offset="50%"  stopColor="rgba(255,222,100,0.45)" />
          <stop offset="100%" stopColor="rgba(255,222,100,0)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── 3D Tilt Card (material / value) ─────────────── */
function TiltCard({
  children,
  className = "",
  glowColor = "rgba(212,169,106,0.15)",
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx  = useMotionValue(0.5);
  const my  = useMotionValue(0.5);
  const smx = useSpring(mx, { stiffness: 220, damping: 22 });
  const smy = useSpring(my, { stiffness: 220, damping: 22 });
  const rotX = useTransform(smy, v => `${(v - 0.5) * 14}deg`);
  const rotY = useTransform(smx, v => `${(0.5 - v) * 14}deg`);
  const shimX = useTransform(smx, v => `${v * 100}%`);
  const shimY = useTransform(smy, v => `${v * 100}%`);

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden cursor-default ${className}`}
      style={{ transformStyle: "preserve-3d", perspective: "700px", rotateX: rotX, rotateY: rotY }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onMouseLeave={() => { mx.set(0.5); my.set(0.5); }}
      whileHover={{
        scale: 1.03,
        boxShadow: `0 24px 60px rgba(0,0,0,0.14), 0 0 0 1px rgba(212,169,106,0.25)`,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      {children}
      {/* Mouse-following glare */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-[inherit]"
        style={{
          background: `radial-gradient(circle at ${shimX} ${shimY}, ${glowColor} 0%, transparent 55%)`,
        }}
      />
      {/* Bottom accent line */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[2px] origin-left"
        style={{
          background: "linear-gradient(to right, var(--accent), var(--accent-2), transparent)",
        }}
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.35 }}
      />
    </motion.div>
  );
}

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.75, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Founder Story ─────────────────────────────── */
function FounderStory() {
  const { lang } = useStore();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const rawY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const springY = useSpring(rawY, { stiffness: 60, damping: 18 });

  const meta = [
    { key: { fi: "Perustaja", en: "Founder" }, val: "Shane" },
    {
      key: { fi: "Tausta", en: "Background" },
      val: lang === "fi" ? "Sairaanhoitaja" : "Nurse",
    },
    {
      key: { fi: "Kotoisin", en: "From" },
      val: lang === "fi" ? "Filippiinit" : "Philippines",
    },
    { key: { fi: "Studio", en: "Studio" }, val: "Oulu, Suomi" },
    { key: { fi: "Vuodesta", en: "Since" }, val: "2024" },
  ];

  return (
    <section ref={sectionRef} className="pt-36 pb-24 px-6 md:px-10 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-[320px_1fr] gap-16 lg:gap-24 items-start">
        {/* Left: Sticky photo + meta */}
        <div className="md:sticky md:top-24 flex flex-col gap-6">
          <FadeUp>
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
              <motion.div className="absolute inset-0" style={{ y: springY }}>
                <LivingPortrait />
              </motion.div>
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(26,24,20,0.55)] via-transparent to-transparent pointer-events-none" />
              {/* Bottom info tag */}
              <div className="absolute bottom-4 left-4 right-4 bg-[var(--bg)] border border-[var(--line)] rounded-xl px-4 py-3">
                <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--ink-mute)] mb-0.5">
                  Oulu · Studio
                </p>
                <p className="font-serif text-lg italic text-[var(--ink)]">LEIMU by Shane</p>
              </div>
            </div>
          </FadeUp>

          <div className="space-y-0">
            {meta.map(({ key, val }, i) => (
              <motion.div
                key={i}
                className="flex justify-between items-baseline border-b border-[var(--line)] py-2.5"
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: 0.1 + i * 0.07 }}
              >
                <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--ink-mute)]">
                  {key[lang]}
                </span>
                <span className="text-sm text-[var(--ink-soft)] font-medium">{val}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Story text */}
        <div className="flex flex-col gap-10">
          <div>

            <FadeUp delay={0.05}>
              <div className="flex items-center gap-3 mb-2">
                <AnimatedLogo size={44} delay={0} />
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-mute)]">
                  {lang === "fi" ? "— Tarinamme · Est. 2024" : "— Our story · Est. 2024"}
                </span>
              </div>
            </FadeUp>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl italic leading-[1.05] text-[var(--ink)]">
              <span className="t1">
                {lang === "fi" ? (
                  <>Kuinka{" "}<em style={{ color: "var(--accent-2)" }}>LEIMU</em></>
                ) : (
                  <>How{" "}<em style={{ color: "var(--accent-2)" }}>LEIMU</em></>
                )}
              </span>
              <span className="t2">
                {lang === "fi" ? "syntyi." : "was born."}
              </span>
            </h1>
          </div>

          {lang === "fi" ? (
            <div className="space-y-7 max-w-2xl">
              <FadeUp delay={0.15}>
                <p className="text-lg text-[var(--ink-soft)] leading-[1.85]">
                  <DropCap letter="S" delay={0.1} />
                  uomalaiset rakastavat kynttilöitä. Ne tuovat valoa ja lämpöä
                  silloin, kun aurinko piiloutuu kuukausiksi pohjoisen taakse —
                  ja juuri se ajatus sytytti kipinän.
                </p>
              </FadeUp>
              <FadeUp delay={0.2}>
                <p className="text-base text-[var(--ink-soft)] leading-[1.85]">
                  Filippiineiltä Suomeen muuttanut sairaanhoitaja Shane huomasi,
                  että kynttilän liekissä on jotain syvästi inhimillistä. Se ei
                  ole vain valoa — se on hetki, jonka ympärille kerääntyä. Ja jos
                  liekki on niin tärkeä, eikö myös se, mitä siitä jää huoneeseen,
                  ansaitse erityistä huomiota?
                </p>
              </FadeUp>

              {/* Pull quote */}
              <FadeIn delay={0.25}>
                <blockquote className="my-10 pl-6 border-l-[3px] border-[var(--accent-2)]">
                  <p className="font-serif text-2xl md:text-3xl italic leading-[1.35] text-[var(--ink)]">
                    "Halusin luoda kynttilän, joka olisi enemmän kuin liekki —
                    se olisi tarina."
                  </p>
                  <cite className="block mt-4 font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--ink-mute)] not-italic">
                    — Shane, LEIMU
                  </cite>
                </blockquote>
              </FadeIn>

              <FadeUp delay={0.3}>
                <p className="text-base text-[var(--ink-soft)] leading-[1.85]">
                  LEIMU syntyi siitä halusta. Se yhdistää kaksi maailmaa:
                  skandinaavisen pelkistetyn estetiikan ja Kaakkois-Aasiassa
                  rakastetut luonnolliset raaka-aineet — kuten{" "}
                  <em className="not-italic font-medium" style={{ color: "var(--accent-2)" }}>sheabutterin</em>,
                  joka tunnetaan kotiseudulla ihon hellijänä ja josta tulee
                  LEIMUn salainen ainesosa kynttilänvalmistuksessa.
                </p>
              </FadeUp>
              <FadeUp delay={0.35}>
                <p className="text-base text-[var(--ink-soft)] leading-[1.85]">
                  Jokainen LEIMU-kynttilä syntyy yksi kerrallaan, käsityönä,
                  Oulussa. Vahaa ei kaadeta erissä isoihin altaisiin, vaan
                  jokainen purkki täytetään huolella, oikeassa lämpötilassa,
                  oikealla rytmillä. Sen jälkeen kynttilät saavat rauhassa{" "}
                  <em className="not-italic font-medium" style={{ color: "var(--accent-2)" }}>cure</em>-vaiheensa
                  — viikon, jonka aikana tuoksu kypsyy ja koostumus löytää
                  lopullisen muotonsa.
                </p>
              </FadeUp>
              <FadeUp delay={0.4}>
                <p className="text-base text-[var(--ink-soft)] leading-[1.85]">
                  Tämä on hidas tapa tehdä asioita. Mutta se on ainoa tapa, jolla
                  LEIMU haluaa ne tehdä. Pieni luksus, jonka sinä ansaitset — ja
                  jonka takana on ihminen, joka tietää tarkalleen, miten se on
                  tehty.
                </p>
              </FadeUp>
            </div>
          ) : (
            <div className="space-y-7 max-w-2xl">
              <FadeUp delay={0.15}>
                <p className="text-lg text-[var(--ink-soft)] leading-[1.85]">
                  <DropCap letter="F" delay={0.1} />
                  inns love candles. They bring light and warmth when the sun
                  hides for months behind the north — and that very thought
                  sparked the flame.
                </p>
              </FadeUp>
              <FadeUp delay={0.2}>
                <p className="text-base text-[var(--ink-soft)] leading-[1.85]">
                  Shane, a nurse who moved from the Philippines to Finland,
                  noticed there is something deeply human about a candle's flame.
                  It is not just light — it is a moment to gather around. And if
                  the flame matters that much, should not what it leaves in the
                  room deserve special attention?
                </p>
              </FadeUp>

              {/* Pull quote */}
              <FadeIn delay={0.25}>
                <blockquote className="my-10 pl-6 border-l-[3px] border-[var(--accent-2)]">
                  <p className="font-serif text-2xl md:text-3xl italic leading-[1.35] text-[var(--ink)]">
                    "I wanted to create a candle that was more than a flame —
                    it would be a story."
                  </p>
                  <cite className="block mt-4 font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--ink-mute)] not-italic">
                    — Shane, LEIMU
                  </cite>
                </blockquote>
              </FadeIn>

              <FadeUp delay={0.3}>
                <p className="text-base text-[var(--ink-soft)] leading-[1.85]">
                  LEIMU was born from that desire. It bridges two worlds:
                  Scandinavian minimalist aesthetics and the natural ingredients
                  beloved in Southeast Asia — like{" "}
                  <em className="not-italic font-medium" style={{ color: "var(--accent-2)" }}>shea butter</em>,
                  known at home as a skin-nurturing treasure and now LEIMU's
                  secret ingredient in candle making.
                </p>
              </FadeUp>
              <FadeUp delay={0.35}>
                <p className="text-base text-[var(--ink-soft)] leading-[1.85]">
                  Every LEIMU candle is made one at a time, by hand, in Oulu.
                  Wax is not poured in batches into large vats — each jar is
                  filled carefully, at the right temperature, with the right
                  rhythm. Then the candles quietly undergo their{" "}
                  <em className="not-italic font-medium" style={{ color: "var(--accent-2)" }}>cure</em> phase
                  — a week during which the scent matures and the texture finds
                  its final form.
                </p>
              </FadeUp>
              <FadeUp delay={0.4}>
                <p className="text-base text-[var(--ink-soft)] leading-[1.85]">
                  This is a slow way of doing things. But it is the only way
                  LEIMU wants to do them. A small luxury you deserve — made by
                  someone who knows exactly how it was crafted.
                </p>
              </FadeUp>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


/* ─── StepItem — viewport audio trigger ─────────── */
type StepDatum = {
  num: string;
  title: { fi: string; en: string };
  desc:  { fi: string; en: string };
  data:  string;
  img:   string;
};

function StepItem({
  step, i, lang, onEnter,
}: {
  step: StepDatum;
  i: number;
  lang: "fi" | "en";
  onEnter: () => void;
}) {
  const stepRef = useRef<HTMLDivElement>(null);
  const inView  = useInView(stepRef, { once: true, margin: "-15%" });
  const fired   = useRef(false);

  useEffect(() => {
    if (inView && !fired.current) { fired.current = true; onEnter(); }
  }, [inView, onEnter]);

  return (
    <motion.div
      ref={stepRef}
      className="group relative grid md:grid-cols-[80px_1fr_280px] gap-6 md:gap-12 items-start py-10 border-t border-[var(--line)] cursor-default"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay: i * 0.06 }}
    >
      {/* Per-step vertical line — right of number column */}
      <div className="absolute left-[78px] inset-y-0 w-[1px] bg-[var(--line)] hidden md:block opacity-15" />
      <motion.div
        className="absolute left-[78px] inset-y-0 w-[1px] origin-top hidden md:block"
        animate={{ scaleY: inView ? 1 : 0, opacity: inView ? 1 : 0 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] as const, delay: 0.15 }}
        style={{
          background: "linear-gradient(to bottom, var(--accent), var(--accent-2))",
          boxShadow: "0 0 8px rgba(212,169,106,0.5)",
        }}
      />

      <motion.div
        className="font-serif text-5xl italic leading-none"
        style={{ color: inView ? "var(--accent-2)" : "var(--line)", transition: "color 0.6s ease" }}
        whileHover={{ color: "var(--accent-2)" }}
        transition={{ duration: 0.25 }}
      >
        {step.num}
      </motion.div>

      <div className="flex flex-col gap-3">
        <h3 className="font-serif text-2xl italic text-[var(--ink)] group-hover:text-[var(--accent-2)] transition-colors duration-300">
          {step.title[lang]}
        </h3>
        <p className="text-sm text-[var(--ink-soft)] leading-relaxed">{step.desc[lang]}</p>
        <p className="font-mono text-[10px] tracking-[0.15em] text-[var(--ink-mute)] mt-1 uppercase">{step.data}</p>
      </div>

      <motion.div
        className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[var(--bg-2)]"
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
      >
        <Image
          src={step.img}
          alt={step.title[lang]}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="280px"
        />
      </motion.div>
    </motion.div>
  );
}

/* ─── Process Timeline ──────────────────────────── */
function ProcessTimeline() {
  const { lang, isMuted } = useStore();
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: timelineProg } = useScroll({
    target: timelineRef,
    offset: ["start 75%", "end 25%"],
  });
  const lineScaleY = useTransform(timelineProg, [0, 1], [0, 1]);

  const playStepTone = useCallback(() => {
    if (isMuted || typeof window === "undefined") return;
    try {
      const _ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = _ctx.createOscillator();
      const g   = _ctx.createGain();
      osc.connect(g); g.connect(_ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(640, _ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(420, _ctx.currentTime + 0.15);
      g.gain.setValueAtTime(0.03, _ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, _ctx.currentTime + 0.28);
      osc.start(); osc.stop(_ctx.currentTime + 0.28);
    } catch { /* AudioContext unavailable */ }
  }, [isMuted]);

  const steps = [
    {
      num: "01",
      title: { fi: "Raaka-aineiden valinta", en: "Raw material sourcing" },
      desc: {
        fi: "Soijavaha valitaan luotetulta toimittajalta — 100% luonnollinen, ei lisäaineita. Sheabutter ja aromiöljyt seulotaan tarkasti.",
        en: "Soy wax sourced from trusted suppliers — 100% natural, no additives. Shea butter and fragrance oils carefully vetted.",
      },
      data: "Soy wax 100% · Shea butter 10% · Cotton wick",
      img: "/images/proc-materials.avif",
    },
    {
      num: "02",
      title: { fi: "Vahan sulatus", en: "Wax melting" },
      desc: {
        fi: "Vaha sulatetaan tarkalleen 75–80°C:ssa. Liian kuuma polttaa tuoksun, liian kylmä ei sido sitä — keskellä on totuus.",
        en: "Wax melted to exactly 75–80°C. Too hot burns the scent, too cold won't bind it — the truth lives in between.",
      },
      data: "Temp: 75–80°C · Duration: 30–40 min",
      img: "/images/pour-process.jpg",
    },
    {
      num: "03",
      title: { fi: "Tuoksuöljyn lisäys", en: "Fragrance addition" },
      desc: {
        fi: "Sheabutterin ja aromien suhde mitoitetaan jokaiselle erälle erikseen. Tämä antaa LEIMUlle samettisen, kermaisen rakenteen.",
        en: "Fragrance and shea butter ratio calibrated per batch. This gives LEIMU its signature velvety, creamy texture.",
      },
      data: "Fragrance load: 8–10% · Mix time: 15 min · by hand",
      img: "/images/proc-scent.png",
    },
    {
      num: "04",
      title: { fi: "Kaataminen", en: "Pouring" },
      desc: {
        fi: "Yksi kynttilä kerrallaan. Puuvillasydän asetetaan keskelle, vaha kaadetaan tasaisella liikkeellä — ei kuplia, ei pintaviivoja.",
        en: "One candle at a time. Wick centered, wax poured in one smooth motion — no bubbles, no surface lines.",
      },
      data: "Pour temp: 55°C · ~5 min per candle",
      img: "/images/proc-pour.jpg",
    },
    {
      num: "05",
      title: { fi: "Cure-vaihe", en: "Curing" },
      desc: {
        fi: "Kynttilät saavat rauhassa kypsyä viikon. Tuoksu vahvistuu, vaha asettuu, lopullinen luonne löytyy.",
        en: "Candles cure undisturbed for a week. Scent deepens, wax settles, final character emerges.",
      },
      data: "Cure time: 7 days · 20°C · in the dark",
      img: "/images/proc-cure.png",
    },
    {
      num: "06",
      title: { fi: "Viimeistely ja pakkaus", en: "Finishing & packaging" },
      desc: {
        fi: "Käsinkirjoitettu kiitoskortti, kultasinetti, sinetöity kuori. Bambukansi asetetaan, tarra kiinnitetään käsin — juuri sinulle.",
        en: "Handwritten thank-you card, gold wax seal, sealed envelope. Bamboo lid placed, label applied by hand — made just for you.",
      },
      data: "Bamboo lid · Hand-applied label · Gold wax seal · QC check",
      img: "/images/Setti.jpg",
    },
  ];

  return (
    <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-end mb-20">
        <FadeUp>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-mute)] mb-4">
            {lang === "fi" ? "— Valmistusprosessi" : "— Process"}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl italic leading-[1.1] text-[var(--ink)]">
            {lang === "fi" ? (
              <>
                Kuusi askelta
                <br />
                <em style={{ color: "var(--accent-2)" }}>liekkiin asti.</em>
              </>
            ) : (
              <>
                Six steps
                <br />
                <em style={{ color: "var(--accent-2)" }}>to the flame.</em>
              </>
            )}
          </h2>
        </FadeUp>
        <FadeUp delay={0.12}>
          <p className="text-base text-[var(--ink-soft)] leading-relaxed">
            {lang === "fi"
              ? "Jokainen LEIMU kulkee saman polun raaka-aineista valmiiksi kynttiläksi. Polku on lyhyt, mutta sitä ei oikaista."
              : "Every LEIMU travels the same path from raw materials to finished candle. The path is short, but never cut short."}
          </p>
        </FadeUp>
      </div>

      <div ref={timelineRef} className="relative space-y-0">
        {/* Golden thread — a glowing "wick" that draws downward as you scroll */}
        <svg
          className="pointer-events-none absolute left-[78px] top-0 bottom-0 hidden w-6 -translate-x-1/2 overflow-visible md:block"
          viewBox="0 0 24 1000"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <motion.path
            d="M12 0 C 19 250, 5 500, 12 750 C 17 880, 9 940, 12 1000"
            fill="none"
            stroke="var(--accent-2)"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ pathLength: lineScaleY, filter: "drop-shadow(0 0 5px var(--accent-2))" }}
          />
        </svg>
        {steps.map((step, i) => (
          <StepItem key={step.num} step={step} i={i} lang={lang} onEnter={playStepTone} />
        ))}
      </div>
    </section>
  );
}


/* ─── MaterialItem — tilt + glare + blur-neighbours ─ */
type MatDatum = {
  nameFi: React.ReactNode;
  nameEn: React.ReactNode;
  desc:   { fi: string; en: string };
  stat:   string;
  unit:   string;
  label:  { fi: string; en: string };
};

function MaterialItem({
  mat, i, lang, isBlurred, onEnter, onLeave,
}: {
  mat: MatDatum;
  i: number;
  lang: "fi" | "en";
  isBlurred: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const smx = useSpring(mx, { stiffness: 200, damping: 22 });
  const smy = useSpring(my, { stiffness: 200, damping: 22 });
  const rotX  = useTransform(smy, (v) => `${(v - 0.5) * 5}deg`);
  const rotY  = useTransform(smx, (v) => `${(0.5 - v) * 5}deg`);
  const shimX = useTransform(smx, (v) => `${v * 100}%`);
  const shimY = useTransform(smy, (v) => `${v * 100}%`);

  return (
    <div
      style={{
        opacity: isBlurred ? 0.45 : 1,
        filter:  isBlurred ? "blur(1px)" : "none",
        transition: "opacity 0.35s ease, filter 0.35s ease",
      }}
    >
      <motion.div
        ref={cardRef}
        className="group grid md:grid-cols-[minmax(0,200px)_1fr_110px] gap-6 md:gap-12 py-8 border-t border-[rgba(216,208,191,0.12)] items-center cursor-default relative overflow-hidden"
        style={{ transformStyle: "preserve-3d", perspective: "900px", rotateX: rotX, rotateY: rotY }}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
        whileHover={{ paddingLeft: "16px", transition: { duration: 0.3 } }}
        onMouseMove={(e) => {
          const r = cardRef.current?.getBoundingClientRect();
          if (!r) return;
          mx.set((e.clientX - r.left) / r.width);
          my.set((e.clientY - r.top) / r.height);
        }}
        onMouseLeave={() => { mx.set(0.5); my.set(0.5); onLeave(); }}
        onMouseEnter={onEnter}
      >
        {/* Glare */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(circle at ${shimX} ${shimY}, rgba(212,169,106,0.09) 0%, transparent 60%)` }}
        />
        <p className="font-serif text-3xl md:text-4xl font-light leading-tight text-[var(--bg)] group-hover:text-[var(--accent-2)] transition-colors duration-300 break-words min-w-0 relative z-10">
          {lang === "fi" ? mat.nameFi : mat.nameEn}
        </p>
        <p className="text-sm text-[var(--bg)] opacity-55 leading-relaxed max-w-sm relative z-10">
          {mat.desc[lang]}
        </p>
        <div className="md:text-right relative z-10">
          <p className="font-serif text-3xl italic font-light leading-none" style={{ color: "var(--accent-2)" }}>
            {mat.stat}<span className="text-xl">{mat.unit}</span>
          </p>
          <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--bg)] opacity-40 mt-2">
            {mat.label[lang]}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Materials Row ─────────────────────────────── */
function MaterialsSection() {
  const { lang } = useStore();
  const [hoveredMat, setHoveredMat] = useState<number | null>(null);

  const materials = [
    {
      nameFi: (
        <>
          Soija<em style={{ color: "var(--accent-2)", fontStyle: "italic" }}>vaha</em>
        </>
      ),
      nameEn: (
        <>
          Soy<em style={{ color: "var(--accent-2)", fontStyle: "italic" }}>wax</em>
        </>
      ),
      desc: {
        fi: "100% luonnollinen, uusiutuva soijavaha. Palaa pehmeästi, kauemmin ja puhtaammin kuin parafiini — ei mustaa nokea, ei kemikaalipäästöjä.",
        en: "100% natural, renewable soy wax. Burns softly, longer and cleaner than paraffin — no black soot, no chemical emissions.",
      },
      stat: "100",
      unit: "%",
      label: { fi: "Luonnollinen", en: "Natural" },
    },
    {
      nameFi: (
        <>
          Shea<em style={{ color: "var(--accent-2)", fontStyle: "italic" }}>butter</em>
        </>
      ),
      nameEn: (
        <>
          Shea<em style={{ color: "var(--accent-2)", fontStyle: "italic" }}>butter</em>
        </>
      ),
      desc: {
        fi: "Kaakkois-Aasian klassikko, joka antaa kynttilälle samettisen koostumuksen ja varmistaa puhtaan, tasaisen liekin.",
        en: "A Southeast Asian classic that gives the candle a velvety texture and ensures a clean, steady flame.",
      },
      stat: "~10",
      unit: "%",
      label: { fi: "Reseptistä", en: "Of recipe" },
    },
    {
      nameFi: (
        <>
          <em style={{ color: "var(--accent-2)", fontStyle: "italic" }}>Puuvilla</em>sydän
        </>
      ),
      nameEn: (
        <>
          <em style={{ color: "var(--accent-2)", fontStyle: "italic" }}>Cotton</em>wick
        </>
      ),
      desc: {
        fi: "100% puuvilla, ei lyijyä, ei sinkkiä. Tasainen, hiljainen liekki joka palaa loppuun asti — vain valoa, ei kemikaaleja.",
        en: "100% cotton, no lead, no zinc. Steady, quiet flame that burns to the end — only light, no chemicals.",
      },
      stat: "0",
      unit: " kem.",
      label: { fi: "Puhdas liekki", en: "Clean flame" },
    },
    {
      nameFi: (
        <>
          Aromi<em style={{ color: "var(--accent-2)", fontStyle: "italic" }}>öljyt</em>
        </>
      ),
      nameEn: (
        <>
          Fragrance<em style={{ color: "var(--accent-2)", fontStyle: "italic" }}>oils</em>
        </>
      ),
      desc: {
        fi: "Jokainen aromi valittu huolella — eko-ystävällinen, myrkytön, ja tarpeeksi hieno kestämään koko cure-vaiheen laadun menetystä.",
        en: "Every fragrance carefully selected — eco-friendly, non-toxic, refined enough to endure the full cure phase without quality loss.",
      },
      stat: "5+",
      unit: "",
      label: { fi: "Tuoksua", en: "Scents" },
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[var(--ink)] py-24 px-6 md:px-10">
      <LiquidDark />
      <div className="relative z-10 max-w-7xl mx-auto">
        <FadeUp>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--bg)] opacity-40 mb-4">
            {lang === "fi" ? "— Raaka-aineet" : "— Materials"}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl italic text-[var(--bg)] mb-16">
            {lang === "fi" ? (
              <>
                Vain{" "}
                <em style={{ color: "var(--accent-2)" }}>parasta</em> — ei
                kompromisseja.
              </>
            ) : (
              <>
                Only the{" "}
                <em style={{ color: "var(--accent-2)" }}>best</em> — no
                compromises.
              </>
            )}
          </h2>
        </FadeUp>

        <div className="space-y-0">
          {materials.map((mat, i) => (
            <MaterialItem
              key={i}
              mat={mat}
              i={i}
              lang={lang}
              isBlurred={hoveredMat !== null && hoveredMat !== i}
              onEnter={() => setHoveredMat(i)}
              onLeave={() => setHoveredMat(null)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}


/* ─── ValueItem — 3D tilt + glare + blur-neighbours ─ */
type ValueDatum = {
  num: string;
  tag:   { fi: string; en: string };
  title: { fi: string; en: string };
  desc:  { fi: string; en: string };
};

function ValueItem({
  v, i, lang, isBlurred, onEnter, onLeave, icon,
}: {
  v: ValueDatum;
  i: number;
  lang: "fi" | "en";
  isBlurred: boolean;
  onEnter: () => void;
  onLeave: () => void;
  icon: React.ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const smx = useSpring(mx, { stiffness: 220, damping: 22 });
  const smy = useSpring(my, { stiffness: 220, damping: 22 });
  const rotX  = useTransform(smy, (val) => `${(val - 0.5) * 11}deg`);
  const rotY  = useTransform(smx, (val) => `${(0.5 - val) * 11}deg`);
  const shimX = useTransform(smx, (val) => `${val * 100}%`);
  const shimY = useTransform(smy, (val) => `${val * 100}%`);

  return (
    <div
      style={{
        opacity: isBlurred ? 0.4 : 1,
        filter:  isBlurred ? "blur(1.5px)" : "none",
        transition: "opacity 0.35s ease, filter 0.35s ease",
      }}
    >
      <motion.div
        ref={cardRef}
        className="group relative flex flex-col gap-5 px-0 md:px-6 py-10 border-b md:border-b-0 md:border-r border-[var(--line)] last:border-r-0 overflow-hidden cursor-default"
        style={{ transformStyle: "preserve-3d", perspective: "700px", rotateX: rotX, rotateY: rotY }}
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.12, duration: 0.65, ease: [0.22, 1, 0.36, 1] as const }}
        whileHover={{ y: -5, boxShadow: "0 24px 56px rgba(0,0,0,0.09)", transition: { type: "spring", stiffness: 300, damping: 24 } }}
        onMouseMove={(e) => {
          const r = cardRef.current?.getBoundingClientRect();
          if (!r) return;
          mx.set((e.clientX - r.left) / r.width);
          my.set((e.clientY - r.top) / r.height);
        }}
        onMouseLeave={() => { mx.set(0.5); my.set(0.5); onLeave(); }}
        onMouseEnter={onEnter}
      >
        {/* Gradient wash */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(135deg, var(--accent-2), transparent)" }}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.06 }}
          transition={{ duration: 0.4 }}
        />
        {/* Mouse-following glare */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(circle at ${shimX} ${shimY}, rgba(212,169,106,0.12) 0%, transparent 55%)` }}
        />

        {/* Icon pill */}
        <motion.div
          className="relative w-11 h-11 rounded-2xl flex items-center justify-center text-[var(--accent-2)] border border-[var(--line)]"
          style={{ background: "var(--bg-3)" }}
          initial={{ scale: 0.6, opacity: 0, rotate: -15 }}
          whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.12 + 0.2, duration: 0.55, type: "spring", stiffness: 260, damping: 18 }}
          whileHover={{ scale: 1.18, rotate: 8, boxShadow: "0 8px 24px rgba(196,122,58,0.25)" }}
        >
          {icon}
          <motion.div
            className="absolute inset-0 rounded-2xl border border-[var(--accent-2)]"
            initial={{ scale: 1, opacity: 0 }}
            whileHover={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        </motion.div>

        <span className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: "var(--accent-2)" }}>
          {v.num} / {v.tag[lang]}
        </span>

        <motion.h3
          className="font-serif text-2xl italic text-[var(--ink)]"
          whileHover={{ color: "var(--accent-2)" }}
          transition={{ duration: 0.2 }}
        >
          {v.title[lang]}
        </motion.h3>

        <p className="text-sm text-[var(--ink-soft)] leading-relaxed">{v.desc[lang]}</p>

        {/* Bottom sweep line */}
        <motion.div
          className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-transparent"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }}
          style={{ transformOrigin: "left" }}
        />
      </motion.div>
    </div>
  );
}

/* ─── Values Grid ───────────────────────────────── */
const VALUE_ICONS = [
  /* 01 EKO — leaf */
  <svg key="eco" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>,
  /* 02 EETTINEN — shield check */
  <svg key="eth" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>,
  /* 03 KÄSITYÖ — hand */
  <svg key="craft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M18 11V6a2 2 0 0 0-4 0v0"/>
    <path d="M14 10V4a2 2 0 0 0-4 0v2"/>
    <path d="M10 10.5V6a2 2 0 0 0-4 0v8"/>
    <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
  </svg>,
  /* 04 LUKSUS — gem */
  <svg key="lux" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M6 3h12l4 6-10 13L2 9Z"/>
    <path d="M11 3 8 9l4 13 4-13-3-6"/>
    <path d="M2 9h20"/>
  </svg>,
];

function ValuesGrid() {
  const { lang } = useStore();
  const [hoveredVal, setHoveredVal] = useState<number | null>(null);

  const values = [
    {
      num: "01",
      tag: { fi: "EKO", en: "ECO" },
      title: { fi: "Ekologisuus", en: "Ecological" },
      desc: {
        fi: "Soijavaha, sheabutter, puuvillasydän — ainoastaan luonnollisia, uusiutuvia raaka-aineita. Ympäristö kiittää.",
        en: "Soy wax, shea butter, cotton wick — only natural, renewable materials. The environment thanks you.",
      },
    },
    {
      num: "02",
      tag: { fi: "EETTINEN", en: "ETHICAL" },
      title: { fi: "Eettisyys", en: "Ethical" },
      desc: {
        fi: "Vastuullisesti hankitut aineet. Ei eläinkokeita. Ei hämärää alkuperää. Läpinäkyvä toimitusketju.",
        en: "Responsibly sourced materials. No animal testing. No murky origins. Transparent supply chain.",
      },
    },
    {
      num: "03",
      tag: { fi: "KÄSITYÖ", en: "CRAFT" },
      title: { fi: "Käsityö", en: "Handcraft" },
      desc: {
        fi: "Yksi kynttilä kerrallaan. Ei massatuotantoa — vain käsi, vaha ja huolellisuus.",
        en: "One candle at a time. No mass production — just hand, wax, and care.",
      },
    },
    {
      num: "04",
      tag: { fi: "LUKSUS", en: "LUXURY" },
      title: { fi: "Saavutettava luksus", en: "Accessible luxury" },
      desc: {
        fi: "Kohtuuhintainen, mutta tinkimätön laatu. 9 € — ja jokainen euro on perusteltu.",
        en: "Affordable but uncompromising quality. 9 € — and every euro is justified.",
      },
    },
  ];

  return (
    <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
      <FadeUp>
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-mute)] mb-3">
          {lang === "fi" ? "— Arvomme" : "— Our values"}
        </p>
        <h2 className="font-serif text-4xl md:text-5xl italic text-[var(--ink)] mb-16">
          {lang === "fi" ? (
            <>
              Neljä asiaa, jotka{" "}
              <em style={{ color: "var(--accent-2)" }}>eivät jousta.</em>
            </>
          ) : (
            <>
              Four things that{" "}
              <em style={{ color: "var(--accent-2)" }}>don't bend.</em>
            </>
          )}
        </h2>
      </FadeUp>

      <div className="grid grid-cols-1 md:grid-cols-4 border-t border-[var(--line)]">
        {values.map((v, i) => (
          <ValueItem
            key={i}
            v={v}
            i={i}
            lang={lang}
            isBlurred={hoveredVal !== null && hoveredVal !== i}
            onEnter={() => setHoveredVal(i)}
            onLeave={() => setHoveredVal(null)}
            icon={VALUE_ICONS[i]}
          />
        ))}
      </div>
    </section>
  );
}

/* ─── Contact Modal ─────────────────────────────── */
function ContactModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(false);
    try {
      await submitNetlifyForm("leimu-contact", { name, email, subject, message });
      setSubmitted(true);
    } catch (err) {
      console.error("Virhe lähetettäessä lomaketta:", err);
      setError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-[rgba(26,24,20,0.65)] backdrop-blur-sm" />
        <motion.div
          className="relative z-10 w-full max-w-lg bg-[var(--bg)] rounded-2xl border border-[var(--line)] shadow-2xl overflow-hidden"
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--line)]">
            <div>
              <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--ink-mute)] mb-0.5">LEIMU by Shane</p>
              <h2 className="font-serif text-xl italic text-[var(--ink)]">Yhteydenottopyyntö</h2>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--ink-mute)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
              aria-label="Sulje">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 1l10 10M11 1L1 11"/>
              </svg>
            </button>
          </div>

          <div className="px-6 py-6">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="thanks"
                  className="py-8 text-center"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div
                    className="w-14 h-14 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l4 4 10-10" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                  <p className="font-serif text-2xl italic text-[var(--ink)] mb-3">Kiitos yhteydenotosta!</p>
                  <p className="text-sm text-[var(--ink-soft)] leading-relaxed max-w-sm mx-auto">
                    Palautteesi on meille tärkeä, joten käsittelemme viestisi ja olemme sinuun yhteydessä tarvittaessa.{" "}
                    <em className="not-italic font-medium text-[var(--ink)]">Kiitos!</em>
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-[8px] tracking-[0.15em] uppercase text-[var(--ink-mute)] block mb-1.5">Nimi</label>
                      <input required value={name} onChange={e => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--accent-2)] transition-colors"/>
                    </div>
                    <div>
                      <label className="font-mono text-[8px] tracking-[0.15em] uppercase text-[var(--ink-mute)] block mb-1.5">Sähköposti</label>
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--accent-2)] transition-colors"/>
                    </div>
                  </div>
                  <div>
                    <label className="font-mono text-[8px] tracking-[0.15em] uppercase text-[var(--ink-mute)] block mb-1.5">Mitä asia koskee?</label>
                    <input required value={subject} onChange={e => setSubject(e.target.value)}
                      placeholder="Esim. tilaus, yhteistyö, kysymys..."
                      className="w-full px-4 py-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--accent-2)] transition-colors placeholder:text-[var(--ink-mute)]"/>
                  </div>
                  <div>
                    <label className="font-mono text-[8px] tracking-[0.15em] uppercase text-[var(--ink-mute)] block mb-1.5">Kerro tarkemmin</label>
                    <textarea required value={message} onChange={e => setMessage(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--accent-2)] transition-colors resize-none leading-relaxed"/>
                  </div>
                  <div className="pt-2 space-y-3">
                    {error && (
                      <p className="text-sm text-red-500 text-center leading-snug" role="alert">
                        Viestin lähetys epäonnistui — tarkista yhteys ja yritä uudelleen.
                      </p>
                    )}
                    <button type="submit" disabled={isSubmitting}
                      className="w-full py-3.5 bg-[var(--ink)] text-[var(--bg)] font-mono text-[10px] tracking-[0.2em] uppercase rounded-full hover:bg-[var(--accent)] transition-colors duration-200 disabled:opacity-50 flex justify-center items-center gap-2">
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                          </svg>
                          Lähetetään…
                        </>
                      ) : "Lähetä →"}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Magnetic Liquid-Glow CTA ──────────────────── */
function MagneticCTA({
  children, href, onClick, primary = false,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  primary?: boolean;
}) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 180, damping: 22, mass: 0.8 });
  const smy = useSpring(my, { stiffness: 180, damping: 22, mass: 0.8 });

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left - r.width / 2) * 0.4);
    my.set((e.clientY - r.top - r.height / 2) * 0.4);
  };
  const reset = () => { mx.set(0); my.set(0); };

  const className =
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-mono uppercase px-7 py-3.5 text-[11px] tracking-[0.18em] " +
    (primary ? "bg-[var(--ink)] text-[var(--bg)]" : "border border-[var(--line)] text-[var(--ink)]");

  const variants = {
    rest: { scale: 1, boxShadow: primary ? "0 2px 16px rgba(26,24,20,0.14)" : "0 0 0 1px rgba(196,122,58,0)" },
    hover: {
      scale: 1.05,
      boxShadow: "0 12px 40px rgba(196,122,58,0.30), 0 0 0 1px rgba(196,122,58,0.85), 0 0 24px rgba(196,122,58,0.45)",
    },
  };

  const body = (
    <>
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(212,169,106,0.42) 50%, transparent 60%)",
          backgroundSize: "220% 100%",
        }}
        variants={{ rest: { backgroundPosition: "-120% 0" }, hover: { backgroundPosition: "220% 0" } }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </>
  );

  const motionProps = {
    className,
    style: { x: smx, y: smy },
    onMouseMove: handleMove,
    onMouseLeave: reset,
    initial: "rest",
    animate: "rest",
    whileHover: "hover",
    whileTap: { scale: 0.97 },
    variants,
    transition: { type: "spring" as const, stiffness: 180, damping: 22, mass: 0.8 },
  };

  if (href) {
    return (
      <Link href={href} passHref legacyBehavior>
        <motion.a {...motionProps}>{body}</motion.a>
      </Link>
    );
  }
  return (
    <motion.button type="button" onClick={onClick} {...motionProps}>
      {body}
    </motion.button>
  );
}

/* ─── Story CTA ─────────────────────────────────── */
function StoryCTA() {
  const { lang } = useStore();
  const [showContact, setShowContact] = useState(false);

  return (
    <section className="relative py-32 px-6 md:px-10 text-center overflow-hidden bg-[var(--bg-2)]">
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}

      {/* Vertical accent line from top */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px bg-[var(--accent-2)]"
        initial={{ height: 0, opacity: 0 }}
        whileInView={{ height: 72, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease }}
      />

      <div className="max-w-2xl mx-auto pt-10">
        <FadeUp>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-mute)] mb-6">
            {lang === "fi" ? "— Liity tarinaan" : "— Join the story"}
          </p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <h2 className="font-serif text-4xl md:text-5xl italic text-[var(--ink)] mb-6">
            {lang === "fi" ? (
              <>
                Pienen liekin{" "}
                <em style={{ color: "var(--accent-2)" }}>iso tarina.</em>
              </>
            ) : (
              <>
                A small flame&apos;s{" "}
                <em style={{ color: "var(--accent-2)" }}>big story.</em>
              </>
            )}
          </h2>
        </FadeUp>
        <FadeUp delay={0.2}>
          <p className="text-base text-[var(--ink-soft)] leading-relaxed mb-10 max-w-md mx-auto">
            {lang === "fi"
              ? "Jokainen tilaus on hetki, joka rakentaa LEIMUa eteenpäin. Kiitos että olet osa sitä."
              : "Every order is a moment that builds LEIMU forward. Thank you for being part of it."}
          </p>
        </FadeUp>
        <FadeUp delay={0.3}>
          <div className="flex gap-4 justify-center flex-wrap">
            <MagneticCTA href="/tuotteet" primary>
              {lang === "fi" ? "Tutustu tuoksuihin" : "Explore scents"}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
            </MagneticCTA>
            <MagneticCTA onClick={() => setShowContact(true)}>
              {lang === "fi" ? "Ota yhteyttä" : "Get in touch"}
            </MagneticCTA>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─── Page ──────────────────────────────────────── */
export function TarinaClient() {
  return (
    <>
      <FounderStory />
      <div className="px-6 md:px-10"><div className="divider" /></div>
      <ProcessTimeline />
      <MaterialsSection />
      <ValuesGrid />
      <StoryCTA />
    </>
  );
}
