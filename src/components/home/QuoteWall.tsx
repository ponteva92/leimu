"use client";

/**
 * QuoteWall — four verbatim customer quotes as a static asymmetric
 * composition: one lead quote set large, three supporting quotes on a
 * hairline-divided column that starts lower (offset editorial rhythm).
 * Real UGC, emojis and all — authenticity beats polish. No marquee,
 * no cards, no decorative quote glyphs.
 */

import { motion } from "framer-motion";
import { useStore } from "@/context/store";
import {
  headingReveal,
  fadeUpItem,
  staggerContainer,
  VIEWPORT_NEAR,
} from "@/lib/motionVariants";

const LEAD = {
  quote:
    "Leimu Candles, enemmän kuin kynttilä, taideteos 🤩 Kaunis pakkaus ja vielä tyylikäs lahjapussi mukana! Ihana saada ja antaa lahjaksi! Ja se tuoksu 👍",
  source: { fi: "Julkinen kommentti", en: "Public comment" },
};

const SUPPORTING = [
  {
    quote: "Kauniisti viimeisteltyjä, ihanat metsäiset tuoksut 🫐🌲",
    source: { fi: "Instagram Story", en: "Instagram Story" },
  },
  {
    quote: "Pidän. Tuoksu on hyvä ja kynttilät kauniita. 👌",
    source: { fi: "Yksityisviesti", en: "Private message" },
  },
  {
    quote: "Staying warm, cozy and fragrant this season with @leimucandles",
    source: { fi: "Instagram Story", en: "Instagram Story" },
  },
];

export function QuoteWall() {
  const { lang } = useStore();

  return (
    <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
      <motion.h2
        variants={headingReveal}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_NEAR}
        className="heading-display text-5xl md:text-6xl text-[var(--ink)] mb-14 md:mb-20"
      >
        {lang === "fi" ? "Mitä asiakkaat sanovat." : "What customers say."}
      </motion.h2>

      <motion.div
        className="grid md:grid-cols-12 gap-12 lg:gap-16 items-start"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_NEAR}
      >
        {/* Lead quote — one voice set large */}
        <motion.figure variants={fadeUpItem} className="md:col-span-7">
          <blockquote className="font-serif italic font-medium text-3xl md:text-4xl leading-[1.3] text-[var(--ink)]">
            {LEAD.quote}
          </blockquote>
          <figcaption className="mt-6 text-sm text-[var(--ink-mute)]">
            {LEAD.source[lang]}
          </figcaption>
        </motion.figure>

        {/* Supporting quotes — offset column, hairline rhythm */}
        <div className="md:col-span-5 md:mt-16 lg:mt-20">
          {SUPPORTING.map((r, i) => (
            <motion.figure
              key={r.quote}
              variants={fadeUpItem}
              className={i === 0 ? "pb-8" : "border-t border-[var(--line)] py-8"}
            >
              <blockquote className="font-serif italic text-xl leading-relaxed text-[var(--ink-soft)]">
                {r.quote}
              </blockquote>
              <figcaption className="mt-3 text-[13px] text-[var(--ink-mute)]">
                {r.source[lang]}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
