"use client";

/**
 * QuoteWall — four verbatim customer quotes as a static asymmetric
 * composition: one lead quote set large, three supporting quotes on a
 * hairline-divided column that starts lower (offset editorial rhythm).
 * Real UGC, emojis and all — authenticity beats polish. No marquee,
 * no cards, no decorative quote glyphs.
 *
 * Scroll: the lead quote inks in word by word as it is read. Each word
 * rises from a ghost of the ink to full ink over its own slice of the
 * scroll, finished before the quote passes mid-screen. On md and up the
 * supporting column drifts a little against the page (depth, not
 * spectacle). Reduced motion: full ink at once and a still column.
 */

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useStore } from "@/context/store";
import { PIN_QUERY, useMediaQuery } from "@/lib/pin";
import { InkQuote } from "@/components/story/Ink";
import { useWillChange } from "@/components/story/hooks";
import {
  headingReveal,
  fadeUpItem,
  staggerContainer,
  VIEWPORT_NEAR,
} from "@/lib/motionVariants";

const HEADING_ID = "quote-wall-heading";

const HEADING = {
  lead: { fi: "Mitä asiakkaat", en: "What customers" },
  accent: { fi: "sanovat.", en: "say." },
};

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
  const lang = useStore((s) => s.lang);
  const sectionRef = useRef<HTMLElement>(null);
  const colRef = useRef<HTMLDivElement>(null);

  /* The supporting column drifts where the chapters pin (md and up, motion
     allowed). Below md it stacks under the lead, and a drift would crowd it. */
  const drifting = useMediaQuery(PIN_QUERY);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const drift = useTransform(scrollYProgress, [0, 1], [56, -56]);
  // The column drifts the whole time the section is in view.
  useWillChange(scrollYProgress, drifting ? [[0, 1]] : [], [colRef]);

  return (
    <section
      ref={sectionRef}
      id="aanet"
      aria-labelledby={HEADING_ID}
      className="py-24 px-6 md:px-10 max-w-7xl mx-auto"
    >
      <motion.h2
        id={HEADING_ID}
        variants={headingReveal}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_NEAR}
        className="heading-display text-5xl md:text-6xl text-[var(--ink)] mb-14 md:mb-20"
      >
        {HEADING.lead[lang]} <em>{HEADING.accent[lang]}</em>
      </motion.h2>

      <motion.div
        className="grid md:grid-cols-12 gap-12 lg:gap-16 items-start"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_NEAR}
      >
        {/* Lead quote — one voice set large, inked as it is read */}
        <figure className="md:col-span-7">
          <InkQuote
            text={LEAD.quote}
            className="font-serif italic font-medium text-3xl md:text-4xl leading-[1.3] text-[var(--ink)]"
          />
          <motion.figcaption variants={fadeUpItem} className="mt-6 text-sm text-[var(--ink-mute)]">
            {LEAD.source[lang]}
          </motion.figcaption>
        </figure>

        {/* Supporting quotes — offset column, hairline rhythm */}
        <motion.div
          ref={colRef}
          className="md:col-span-5 md:mt-16 lg:mt-20"
          style={{ y: drifting ? drift : 0 }}
        >
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
        </motion.div>
      </motion.div>
    </section>
  );
}
