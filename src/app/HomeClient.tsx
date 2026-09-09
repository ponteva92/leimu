"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useStore } from "@/context/store";
import { SCENTS } from "@/lib/scents";
import { ScentModal } from "@/components/ScentModal";
import {
  headingReveal, headingCinematic, fadeUpItem, fadeUpCinematic,
  staggerCinematic, VIEWPORT_NEAR,
} from "@/lib/motionVariants";
import { HeroCandle } from "@/components/hero/HeroCandle";
import { GiftCeremony } from "@/components/GiftCeremony";

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
    <section className="chapter-dark border-t border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-6 text-center md:text-left">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              className="flex flex-col gap-1.5"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_NEAR}
              transition={{ delay: i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-serif italic text-3xl md:text-4xl text-[var(--ink)] leading-[1.1] pb-0.5">
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
    <section ref={containerRef} className="py-28 md:py-32 px-6 md:px-10 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
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
                className={`absolute rounded-lg overflow-hidden shadow-e2 ${positions[i]}`}
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
              ? "LEIMU sai alkunsa kodista ja rakkaudesta käsityöhön. Jokainen purkki täytetään käsin, yksi kerrallaan: soijavahasta ja sheabutterista, suomalaiseen luontoon inspiroituneilla tuoksuilla. Kaikki purkit ovat läpikuultavaa maitolasia (mattalasi)."
              : "LEIMU began at home, from a love of craft. Each jar is filled by hand, one at a time: soy wax and shea butter, inspired by Finnish nature. All jars are translucent frosted milk glass."}
          </motion.p>
          <motion.div variants={fadeUpItem}>
            <Link
              href="/tarina"
              className="inline-flex items-center gap-2 tag-mono text-[10px] text-[var(--accent)] hover:text-[var(--ink)] transition-colors mt-2 w-fit group"
            >
              {lang === "fi" ? "Lue koko tarina" : "Read full story"}
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"
                className="transition-transform duration-base group-hover:translate-x-1"
              >
                <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Bento Card (photography first — crop + ember light, no 3-D tilt) ── */
function BentoCard({ scent, isLarge, index, lang, onOpen }: {
  scent: import("@/types").Scent;
  isLarge: boolean;
  index: number;
  lang: "fi" | "en";
  onOpen: () => void;
}) {
  return (
    <motion.button
      className={[
        "group relative rounded-xl border border-[var(--line)] overflow-hidden cursor-pointer text-left",
        isLarge ? "row-span-2" : "",
      ].join(" ")}
      onClick={onOpen}
      whileHover={{ y: -4, boxShadow: "0 20px 48px -18px rgba(26,24,20,0.22)" }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      custom={index}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { delay: index * 0.09, duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px 0px" }}
    >
      <Image
        src={scent.image}
        alt={lang === "fi" ? scent.name : scent.nameEn}
        fill
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
        sizes="(max-width: 768px) 50vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/20 to-transparent" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(ellipse 70% 50% at 50% 80%, ${scent.waxColor}33, transparent 70%)` }}
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
        <p className={`font-serif italic text-white drop-shadow-md ${isLarge ? "text-2xl md:text-3xl" : "text-base md:text-lg"}`}>
          {lang === "fi" ? scent.name : scent.nameEn}
        </p>
        <p className="tag-mono text-[8px] !text-white/90 mt-0.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
          {lang === "fi" ? scent.profile : scent.profileEn}
        </p>
      </div>
    </motion.button>
  );
}

/* ─── Featured Scents (Bento) ───────────────────── */
function FeaturedScents() {
  const { lang, openModal } = useStore();

  return (
    <section className="py-28 md:py-32 px-6 md:px-10 max-w-7xl mx-auto">
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 auto-rows-[180px] md:auto-rows-[220px]">
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
  const reduce = useReducedMotion();

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
          animate={reduce ? undefined : { x: ["0%", "-33.333%"] }}
          transition={reduce ? undefined : { duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ width: "max-content" }}
        >
          {tripled.map((review, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex flex-col justify-between rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-6"
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
                <p className="font-serif italic text-base text-[var(--ink)] leading-relaxed line-clamp-3">
                  {review.quote}
                </p>
              </div>
              {/* Source */}
              <div className="mt-5 pt-4 border-t border-[var(--line)]">
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
        fi: "100% luonnollinen soijavaha palaa puhtaasti ja pidempään kuin parafiini. Ei nokea, ei kemikaaleja.",
        en: "100% natural soy wax burns cleanly and longer than paraffin. No soot, no chemicals.",
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
        fi: "100% puuvillasydän, ei metallia eikä sinkkiä. Puhdas, hiljainen liekki loppuun asti.",
        en: "100% cotton wick, no metal or zinc. Clean, quiet flame all the way through.",
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
        fi: "Uusiutuvan bambun kansi: nopeimmin kasvava materiaali maapallolla, täysin biohajoava.",
        en: "Renewable bamboo lid: the fastest-growing material on earth, fully biodegradable.",
      },
    },
  ];

  return (
    <>
      {/* Light section: 4 values */}
      <section className="py-28 md:py-32 px-6 md:px-10 max-w-7xl mx-auto">
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
                className="w-12 h-12 rounded-lg border border-[var(--line)] flex items-center justify-center text-[var(--accent-2)]"
                whileHover={{
                  scale: 1.06,
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
    </>
  );
}

/* ─── Ember pull quote — seam from dark hero into the page ─── */
function PullQuote() {
  const { lang } = useStore();

  return (
    <section className="chapter-dark chapter-ember relative overflow-hidden py-28 md:py-36 px-6 md:px-10">
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
              transition: { duration: 1.3, ease: [0.22, 1, 0.36, 1] } },
          }}
          className="font-serif text-3xl md:text-5xl lg:text-6xl font-light italic leading-snug text-[var(--ink)]"
        >
          {lang === "fi" ? (
            <>
              &ldquo;Kynttilä ei ole vain valo,{" "}
              <span className="text-[var(--accent-2)]">se on hetki.</span>&rdquo;
            </>
          ) : (
            <>
              &ldquo;A candle is not just light.{" "}
              <span className="text-[var(--accent-2)]">It&apos;s a moment.</span>&rdquo;
            </>
          )}
        </motion.p>
        <motion.p
          variants={{
            hidden:  { opacity: 0, y: 12 },
            visible: { opacity: 0.55, y: 0,
              transition: { duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] } },
          }}
          className="tag-mono mt-10 text-[var(--ink)]"
        >
          LEIMU Candles
        </motion.p>
      </motion.div>
    </section>
  );
}


/* ─── Page ──────────────────────────────────────────────────────────
   The hero is sticky (z-0); everything below sits in a higher-z, opaque
   shell so it glides up and over the hero as you scroll — the hero dims
   and recedes rather than scrolling away. Ritual-first: quote → stats →
   scents → gift → story → why → reviews → instagram.                      */
export function HomeClient() {
  return (
    <>
      <ScentModal />
      <HeroCandle />
      <div className="home-calm relative z-10 bg-[var(--bg)] shadow-[0_-32px_80px_-16px_rgba(0,0,0,0.55)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-px inset-x-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(216,148,86,0.18) 25%, rgba(216,148,86,0.45) 50%, rgba(216,148,86,0.18) 75%, transparent)" }}
        />
        <PullQuote />
        <StatsStrip />
        <FeaturedScents />
        <GiftCeremony />
        <StoryTeaser />
        <Benefits />
        <CustomerReviews />
        <InstagramFeed />
      </div>
    </>
  );
}
