"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useMotionValue, useTransform as useTf, useSpring } from "framer-motion";
import { useStore } from "@/context/store";
import { SCENTS } from "@/lib/scents";
import { ScentModal } from "@/components/ScentModal";
import {
  headingReveal, headingCinematic, fadeUpItem, fadeUpCinematic,
  staggerCinematic, VIEWPORT_NEAR,
} from "@/lib/motionVariants";
import { HeroCandle } from "@/components/hero/HeroCandle";

/* ─── Stats Strip ───────────────────────────────── */
function StatsStrip() {
  const { lang } = useStore();

  const stats = [
    { value: "100%", label: { fi: "Soijavaha", en: "Soy wax" } },
    { value: "~36h", label: { fi: "Paloaika", en: "Burn time" } },
    { value: "5", label: { fi: "Tuoksua", en: "Scents" } },
    { value: "1 kerrallaan", label: { fi: "Käsintehty erä", en: "Handmade batch" } },
  ];

  return (
    <section className="border-y border-[var(--line)] bg-[var(--bg-2)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--line)]">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              className="py-10 px-5 sm:px-8 flex flex-col gap-1"
              initial={{ opacity: 0, y: 28, filter: "blur(8px)", scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
              viewport={VIEWPORT_NEAR}
              transition={{ delay: i * 0.12, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-serif text-3xl md:text-4xl italic text-[var(--ink)] leading-none">
                {s.value}
              </p>
              <p className="tag-mono text-[9px] text-[var(--ink-mute)]">{s.label[lang]}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Story Teaser ──────────────────────────────── */
function StoryTeaser() {
  const { lang } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["4%", "-4%"]);
  const y3 = useTransform(scrollYProgress, [0, 1], ["-4%", "6%"]);

  const images = [
    { src: "/images/story-1.jpg", alt: "Kynttilän valmistus", style: y1 },
    { src: "/images/story-2.jpg", alt: "Tuoksuöljyt", style: y2 },
    { src: "/images/story-3.jpg", alt: "Valmiit kynttilät", style: y3 },
  ];

  return (
    <section ref={containerRef} className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        {/* Image collage */}
        <div className="relative h-[480px] md:h-[560px]">
          {images.map((img, i) => {
            const positions = [
              "left-0 top-0 w-[58%] h-[52%]",
              "right-0 top-[8%] w-[45%] h-[44%]",
              "left-[18%] bottom-0 w-[52%] h-[44%]",
            ];
            return (
              <motion.div
                key={i}
                className={`absolute rounded-xl overflow-hidden ${positions[i]}`}
                style={{ y: img.style }}
                initial={{ opacity: 0, scale: 1.08, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                viewport={VIEWPORT_NEAR}
                transition={{ duration: 1.5, delay: i * 0.14, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.03 }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 30vw"
                />
              </motion.div>
            );
          })}
        </div>

        {/* Sticky text — staggered reveal */}
        <motion.div
          className="md:sticky md:top-24 flex flex-col gap-6"
          variants={staggerCinematic}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_NEAR}
        >
          <motion.p variants={fadeUpCinematic} className="tag-mono">
            {lang === "fi" ? "Tarina taustalla" : "The story behind"}
          </motion.p>
          <motion.h2
            variants={headingCinematic}
            className="heading-display text-4xl md:text-5xl text-[var(--ink)]"
          >
            {lang === "fi" ? (
              <>
                Pienestä intohimosta <em>syntyi LEIMU.</em>
              </>
            ) : (
              <>
                From a small passion, <em>LEIMU was born.</em>
              </>
            )}
          </motion.h2>
          <motion.p variants={fadeUpItem} className="text-[var(--ink-soft)] leading-relaxed">
            {lang === "fi"
              ? "LEIMU sai alkunsa kodista ja rakkaudesta käsityöhön. Jokainen purkki täytetään käsin, yksi kerrallaan — soijavahasta ja sheabutterista, suomalaiseen luontoon inspiroituneilla tuoksuilla."
              : "LEIMU began at home, from a love of craft. Each jar is filled by hand, one at a time — with soy wax and shea butter, inspired by Finnish nature."}
          </motion.p>
          <motion.div variants={fadeUpItem}>
            <Link
              href="/tarina"
              className="inline-flex items-center gap-2 tag-mono text-[10px] text-[var(--accent)] hover:text-[var(--ink)] transition-colors mt-2 w-fit group"
            >
              {lang === "fi" ? "Lue koko tarina" : "Read full story"}
              <motion.svg
                width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Bento Card (3-D tilt + shimmer) ──────────────── */
function BentoCard({ scent, isLarge, index, lang, onOpen }: {
  scent: import("@/types").Scent;
  isLarge: boolean;
  index: number;
  lang: "fi" | "en";
  onOpen: () => void;
}) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const smx = useSpring(mx, { stiffness: 200, damping: 20 });
  const smy = useSpring(my, { stiffness: 200, damping: 20 });
  const rotateX = useTf(smy, v => `${(v - 0.5) * 14}deg`);
  const rotateY = useTf(smx, v => `${(0.5 - v) * 14}deg`);
  const shimmerX = useTf(smx, v => `${v * 100}%`);
  const shimmerY = useTf(smy, v => `${v * 100}%`);

  return (
    <motion.button
      ref={cardRef}
      className={[
        "group relative rounded-2xl border border-[var(--line)] overflow-hidden cursor-pointer text-left",
        isLarge ? "row-span-2" : "",
      ].join(" ")}
      style={{ transformStyle: "preserve-3d", perspective: "800px", rotateX, rotateY }}
      onMouseMove={(e) => {
        const r = cardRef.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onMouseLeave={() => { mx.set(0.5); my.set(0.5); }}
      onClick={onOpen}
      whileHover={{ scale: 1.03, boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      custom={index}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { delay: index * 0.09, duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-80px 0px" }}
    >
      {/* Background image */}
      <Image
        src={scent.image}
        alt={lang === "fi" ? scent.name : scent.nameEn}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-106"
        sizes="(max-width: 768px) 50vw, 33vw"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
      {/* Samsung shimmer — light radial following mouse */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          background: `radial-gradient(circle at ${shimmerX} ${shimmerY}, rgba(255,255,255,0.13) 0%, transparent 55%)`,
        }}
      />
      {/* Glow border */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ border: "1px solid rgba(212,169,106,0)" }}
        whileHover={{ border: "1px solid rgba(212,169,106,0.55)", boxShadow: "inset 0 0 20px rgba(212,169,106,0.08)" }}
        transition={{ duration: 0.25 }}
      />
      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4" style={{ transform: "translateZ(20px)" }}>
        <p className={`font-serif italic text-white drop-shadow-md ${isLarge ? "text-2xl" : "text-base"}`}>
          {lang === "fi" ? scent.name : scent.nameEn}
        </p>
        <p className="tag-mono text-[8px] text-white/60 mt-0.5">
          {lang === "fi" ? scent.profile : scent.profileEn}
        </p>
      </div>
      {/* Hover pill */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="tag-mono text-[8px] px-2.5 py-1.5 rounded-full bg-black/30 backdrop-blur-md text-white border border-white/25">
          {lang === "fi" ? "Avaa" : "Open"}
        </span>
      </div>
    </motion.button>
  );
}

/* ─── Featured Scents (Bento) ───────────────────── */
function FeaturedScents() {
  const { lang, openModal } = useStore();

  return (
    <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
      <motion.div
        variants={staggerCinematic}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_NEAR}
        className="mb-12"
      >
        <motion.p variants={fadeUpCinematic} className="tag-mono mb-2">
          {lang === "fi" ? "Tuoksuvalikoima" : "Scent collection"}
        </motion.p>
        <motion.h2 variants={headingReveal} className="heading-display text-4xl md:text-5xl text-[var(--ink)]">
          {lang === "fi" ? (
            <>
              Viisi tapaa <em>tuoksua.</em>
            </>
          ) : (
            <>
              Five ways to <em>scent.</em>
            </>
          )}
        </motion.h2>
      </motion.div>

      {/* Bento grid — Mustikka first (large), then others */}
      {(() => {
        const display = [...SCENTS];
        // Swap Havu (index 0) and Mustikka (index 3)
        [display[0], display[3]] = [display[3], display[0]];
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[200px]">
            {display.map((scent, i) => {
              const isLarge = i === 0;
              return (
                <BentoCard
                  key={scent.id}
                  scent={scent}
                  isLarge={isLarge}
                  index={i}
                  lang={lang}
                  onOpen={() => openModal(scent)}
                />
              );
            })}
          </div>
        );
      })()}
    </section>
  );
}


/* ─── Customer Reviews Marquee ───────────────────── */
function CustomerReviews() {
  const { lang } = useStore();

  const reviews = [
    {
      quote: "Staying warm, cozy and fragrant this season with @leimucandles",
      source: "Instagram Story",
      icon: "📸",
      lang: "en",
    },
    {
      quote: "Pidän. Tuoksu on hyvä ja kynttilät kauniita. 👌",
      source: "Yksityisviesti",
      icon: "💬",
      lang: "fi",
    },
    {
      quote: "Leimu Candles, enemmän kuin kynttilä, taideteos 🤩 Kaunis pakkaus ja vielä tyylikäs lahjapussi mukana! Ihana saada ja antaa lahjaksi! Ja se tuoksu 👍",
      source: "Julkinen kommentti",
      icon: "⭐",
      lang: "fi",
    },
    {
      quote: "Kauniisti viimeisteltyjä, ihanat metsäiset tuoksut 🫐🌲",
      source: "Instagram Story",
      icon: "📸",
      lang: "fi",
    },
  ];

  // Triplicate for extra-smooth infinite scroll
  const tripled = [...reviews, ...reviews, ...reviews];

  return (
    <section className="py-20 overflow-hidden">
      <motion.div
        className="px-6 md:px-10 max-w-7xl mx-auto mb-12"
        variants={staggerCinematic}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_NEAR}
      >
        <motion.p variants={fadeUpCinematic} className="tag-mono mb-2">
          {lang === "fi" ? "Asiakaspalautteet" : "Customer reviews"}
        </motion.p>
        <motion.h2 variants={headingReveal} className="heading-display text-4xl md:text-5xl text-[var(--ink)]">
          {lang === "fi" ? (
            <><span>Mitä asiakkaat </span><em>sanovat.</em></>
          ) : (
            <><span>What customers </span><em>say.</em></>
          )}
        </motion.h2>
      </motion.div>

      <div className="relative w-full">
        {/* Fade edges */}
        <div
          className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, var(--bg), transparent)" }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, var(--bg), transparent)" }}
        />

        <motion.div
          className="flex gap-5 items-stretch"
          animate={{ x: ["0%", "-33.333%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ width: "max-content" }}
        >
          {tripled.map((review, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex flex-col justify-between rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] p-6"
              style={{ width: 300 }}
            >
              {/* Opening quote mark */}
              <div>
                <span
                  className="font-serif text-5xl leading-none text-[var(--accent)] block mb-3"
                  aria-hidden="true"
                >
                  &ldquo;
                </span>
                <p className="font-serif italic text-base text-[var(--ink)] leading-relaxed">
                  {review.quote}
                </p>
              </div>
              {/* Source */}
              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[var(--line)]">
                <span className="text-base" aria-hidden="true">{review.icon}</span>
                <span className="tag-mono text-[8px] text-[var(--ink-mute)]">{review.source}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Instagram Feed (Behold widget) ────────────── */
function InstagramFeed() {
  const { lang } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    if (!document.querySelector('script[data-behold]')) {
      const s = document.createElement("script");
      s.type = "module";
      s.src = "https://w.behold.so/widget.js";
      s.setAttribute("data-behold", "1");
      document.head.appendChild(s);
    }
    if (!containerRef.current.querySelector("behold-widget")) {
      const w = document.createElement("behold-widget");
      w.setAttribute("feed-id", "Z0vXK9Le7HnNNay5tri8");
      containerRef.current.appendChild(w);
    }
  }, []);

  return (
    <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 36, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={VIEWPORT_NEAR}
        transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="tag-mono mb-2">
          {lang === "fi" ? "Seuraa meitä" : "Follow us"}
        </p>
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <h2 className="heading-display text-4xl md:text-5xl text-[var(--ink)]">
            {lang === "fi" ? (
              <><span>@leimucandles </span><em>Instagramissa.</em></>
            ) : (
              <><span>@leimucandles </span><em>on Instagram.</em></>
            )}
          </h2>
          <a
            href="https://www.instagram.com/leimucandles/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 tag-mono text-[10px] text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
          >
            {lang === "fi" ? "Avaa Instagram" : "Open Instagram"}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </motion.div>
      <div ref={containerRef} className="w-full" />
    </section>
  );
}

/* ─── Benefits + Pull Quote ─────────────────────── */
function Benefits() {
  const { lang } = useStore();

  const values = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M12 22V13" />
          <path d="M12 13C12 13 7 9.5 7 5.5A5 5 0 0 1 17 5.5C17 9.5 12 13 12 13Z" />
        </svg>
      ),
      title: { fi: "Soijavaha", en: "Soy wax" },
      desc: {
        fi: "100% luonnollinen soijavaha palaa puhtaasti ja pidemään kuin parafiini — ei nokea, ei kemikaaleja.",
        en: "100% natural soy wax burns cleanly and longer than paraffin — no soot, no chemicals.",
      },
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M12 3L13.8 8.4H19.5L14.9 11.6L16.7 17L12 13.8L7.3 17L9.1 11.6L4.5 8.4H10.2L12 3Z" />
        </svg>
      ),
      title: { fi: "Sheabutter", en: "Shea butter" },
      desc: {
        fi: "~10% sheabutteria antaa kynttilälle samettisen koostumuksen ja pidentää paloaikaa luonnollisesti.",
        en: "~10% shea butter gives the candle a velvety texture and extends burn time naturally.",
      },
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M12 2C12 2 6.5 7.5 6.5 13.5A5.5 5.5 0 0 0 17.5 13.5C17.5 7.5 12 2 12 2Z" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      ),
      title: { fi: "Puuvillasydän", en: "Cotton wick" },
      desc: {
        fi: "100% puuvillasydän — ei metallia, ei sinkkiä. Puhdas, hiljainen liekki loppuun asti.",
        en: "100% cotton wick — no metal, no zinc. Clean, quiet flame all the way through.",
      },
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <rect x="3" y="15" width="18" height="5" rx="2.5" />
          <path d="M7.5 15V10.5A4.5 4.5 0 0 1 16.5 10.5V15" />
          <line x1="12" y1="6" x2="12" y2="4" />
        </svg>
      ),
      title: { fi: "Bambukansi", en: "Bamboo lid" },
      desc: {
        fi: "Uusiutuvan bambun kansi — nopeimmin kasvava materiaali maapallolla, täysin biohajoava.",
        en: "Renewable bamboo lid — the fastest-growing material on earth, fully biodegradable.",
      },
    },
  ];

  return (
    <>
      {/* Light section: 4 values */}
      <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
        <motion.div
          variants={staggerCinematic}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_NEAR}
          className="mb-16"
        >
          <motion.p variants={fadeUpCinematic} className="tag-mono mb-2">
            {lang === "fi" ? "Miksi LEIMU?" : "Why LEIMU?"}
          </motion.p>
          <motion.h2 variants={headingCinematic} className="heading-display text-4xl md:text-5xl text-[var(--ink)]">
            {lang === "fi" ? (
              <>
                Laatu <em>jokaisessa</em> yksityiskohdassa.
              </>
            ) : (
              <>
                Quality in <em>every</em> detail.
              </>
            )}
          </motion.h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-[var(--line)]">
          {values.map((v, i) => (
            <motion.div
              key={i}
              className="pt-8 md:pt-0 md:px-8 first:pl-0 last:pr-0 flex flex-col gap-4"
              initial={{ opacity: 0, y: 36, filter: "blur(9px)", scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
              viewport={VIEWPORT_NEAR}
              transition={{ delay: i * 0.12, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="w-12 h-12 rounded-xl border border-[var(--line)] flex items-center justify-center text-[var(--accent-2)]"
                whileHover={{
                  scale: 1.15,
                  rotate: 8,
                  borderColor: "var(--accent-2)",
                  backgroundColor: "rgba(196,122,58,0.08)",
                }}
                transition={{ type: "spring", stiffness: 280, damping: 30 }}
                aria-hidden="true"
              >
                {v.icon}
              </motion.div>
              <p className="font-serif text-xl italic text-[var(--ink)]">{v.title[lang]}</p>
              <p className="text-sm text-[var(--ink-soft)] leading-relaxed">{v.desc[lang]}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Dark pull quote */}
      <section className="bg-[var(--ink)] py-28 px-6 md:px-10 overflow-hidden">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={staggerCinematic}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_NEAR}
        >
          <motion.p
            variants={{
              hidden:  { opacity: 0, y: 40, filter: "blur(8px)" },
              visible: { opacity: 1, y: 0,  filter: "blur(0px)",
                transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } },
            }}
            className="font-serif text-3xl md:text-5xl font-light italic leading-snug"
            style={{ color: "var(--bg)" }}
          >
            {lang === "fi" ? (
              <>
                &ldquo;Kynttilä ei ole vain valo —{" "}
                <span style={{ color: "var(--accent-2)" }}>se on hetki.</span>&rdquo;
              </>
            ) : (
              <>
                &ldquo;A candle is not just light —{" "}
                <span style={{ color: "var(--accent-2)" }}>it&apos;s a moment.</span>&rdquo;
              </>
            )}
          </motion.p>
          <motion.p
            variants={{
              hidden:  { opacity: 0, y: 12 },
              visible: { opacity: 0.4, y: 0,
                transition: { duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] } },
            }}
            className="tag-mono mt-8 text-[var(--bg)]"
          >
            {lang === "fi" ? "— LEIMU Candles" : "— LEIMU Candles"}
          </motion.p>
        </motion.div>
      </section>
    </>
  );
}


/* ─── Page ──────────────────────────────────────────────────────────
   The hero is sticky (z-0); everything below sits in a higher-z, opaque
   shell so it glides up and over the hero as you scroll — the hero dims
   and recedes rather than scrolling away.                                 */
export function HomeClient() {
  return (
    <>
      <ScentModal />
      <HeroCandle />
      <div className="relative z-10 bg-[var(--bg)] shadow-[0_-24px_70px_-18px_rgba(26,24,20,0.28)]">
        {/* Premium seam — a warm hairline where the content rises over the hero */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-px inset-x-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(26,24,20,0.12) 25%, rgba(196,122,58,0.28) 50%, rgba(26,24,20,0.12) 75%, transparent)" }}
        />
        <StatsStrip />
        <StoryTeaser />
        <FeaturedScents />
        <CustomerReviews />
        <InstagramFeed />
        <Benefits />
      </div>
    </>
  );
}
