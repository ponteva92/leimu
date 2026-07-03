"use client";

/**
 * ScentIndex — "Tuoksukirjasto"
 *
 * The commercial core of the home page as an editorial index, not a card
 * grid. Desktop: a typographic index (Cormorant italic scent names, nose
 * notes, wax-tone swatches) on the left; hovering or focusing a row
 * previews it in the sticky image easel on the right (cross-fade with a
 * 2px blur bridge so the two photos read as one dissolving frame).
 * Click opens the ScentModal exactly as before — flows preserved.
 * Mobile: horizontal scroll-snap cards, caption below the image.
 */

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useStore } from "@/context/store";
import { notesLine, SCENTS } from "@/lib/scents";
import {
  EASE_PREMIUM,
  headingReveal,
  fadeUpItem,
  staggerContainer,
  VIEWPORT_NEAR,
} from "@/lib/motionVariants";

/* One consistent warm dusk grade over every scent photo — a single light
   language instead of per-card black gradients. */
function DuskGrade() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 mix-blend-multiply"
      style={{
        background:
          "linear-gradient(180deg, rgba(196,122,58,0.06) 0%, rgba(26,24,20,0.12) 100%)",
      }}
    />
  );
}

export function ScentIndex() {
  const { lang, openModal } = useStore();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  return (
    <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_NEAR}
        className="mb-12 md:mb-16"
      >
        <motion.p variants={fadeUpItem} className="tag-mono mb-3">
          {lang === "fi" ? "Tuoksukirjasto" : "Scent library"}
        </motion.p>
        <motion.h2
          variants={headingReveal}
          className="heading-display text-5xl md:text-6xl text-[var(--ink)]"
        >
          {lang === "fi" ? "Viisi tapaa tuoksua." : "Five ways to scent."}
        </motion.h2>
      </motion.div>

      {/* ── Desktop: index + sticky easel ─────────────────────────── */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-12 lg:gap-16 items-start">
        {/* Index */}
        <motion.div
          className="md:col-span-7 border-t border-[var(--line)]"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_NEAR}
        >
          {SCENTS.map((scent, i) => {
            const isActive = active === i;
            return (
              <motion.button
                key={scent.id}
                type="button"
                variants={fadeUpItem}
                onClick={() => openModal(scent)}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="material-row group block w-full text-left py-6 lg:py-7 border-b transition-colors duration-300"
                style={{ borderColor: isActive ? "var(--accent-2)" : "var(--line)" }}
                aria-label={`${lang === "fi" ? scent.name : scent.nameEn} — ${
                  lang === "fi" ? "avaa tuoksukortti" : "open scent card"
                }`}
              >
                <span className="flex items-baseline justify-between gap-6">
                  <span
                    className={[
                      "font-serif italic text-4xl lg:text-5xl leading-[1.1] pb-1 transition-colors duration-300 min-w-0",
                      isActive ? "text-[var(--ink)]" : "text-[var(--ink-soft)]",
                    ].join(" ")}
                  >
                    {lang === "fi" ? scent.name : scent.nameEn}
                  </span>
                  <span className="flex items-center gap-4 flex-shrink-0">
                    <span className="hidden lg:inline text-sm text-[var(--ink-mute)]">
                      {notesLine(lang === "fi" ? scent.profile : scent.profileEn)}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: scent.waxColor }}
                    />
                  </span>
                </span>
                {/* Notes drop below the name on narrower desktop widths */}
                <span className="mt-1 block text-sm text-[var(--ink-mute)] lg:hidden">
                  {notesLine(lang === "fi" ? scent.profile : scent.profileEn)}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Easel — double-bezel tray, images cross-fade with the index */}
        <motion.div
          aria-hidden="true"
          className="md:col-span-5 md:sticky md:top-28"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_NEAR}
          transition={{ duration: 0.9, ease: EASE_PREMIUM }}
        >
          <div className="rounded-[var(--radius-xl)] bg-[var(--bg-2)] ring-1 ring-[var(--line)] p-1.5 shadow-e2">
            <div
              className="relative overflow-hidden rounded-[calc(var(--radius-xl)-6px)]"
              style={{ aspectRatio: "4 / 5" }}
            >
              {SCENTS.map((scent, i) => (
                <motion.div
                  key={scent.id}
                  className="absolute inset-0"
                  initial={false}
                  animate={
                    reduce
                      ? { opacity: active === i ? 1 : 0 }
                      : {
                          opacity: active === i ? 1 : 0,
                          scale: active === i ? 1 : 1.04,
                          filter: active === i ? "blur(0px)" : "blur(2px)",
                        }
                  }
                  transition={
                    reduce
                      ? { duration: 0.2 }
                      : { duration: 0.65, ease: EASE_PREMIUM }
                  }
                >
                  <Image
                    src={scent.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 767px) 1px, 40vw"
                  />
                  <DuskGrade />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Mobile: scroll-snap cards, captions under the image ───── */}
      <motion.div
        className="md:hidden -mx-6 flex gap-4 overflow-x-auto px-6 pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_NEAR}
      >
        {SCENTS.map((scent) => (
          <motion.button
            key={scent.id}
            type="button"
            variants={fadeUpItem}
            onClick={() => openModal(scent)}
            className="snap-center flex-shrink-0 w-[78vw] max-w-[330px] text-left"
          >
            <div className="rounded-[var(--radius-lg)] bg-[var(--bg-2)] ring-1 ring-[var(--line)] p-1.5">
              <div
                className="relative overflow-hidden rounded-[calc(var(--radius-lg)-6px)]"
                style={{ aspectRatio: "4 / 5" }}
              >
                <Image
                  src={scent.image}
                  alt={lang === "fi" ? scent.name : scent.nameEn}
                  fill
                  className="object-cover"
                  sizes="(max-width: 767px) 78vw, 1px"
                />
                <DuskGrade />
              </div>
            </div>
            <span className="flex items-center justify-between gap-3 pt-4 px-1">
              <span className="min-w-0">
                <span className="block font-serif italic text-2xl leading-tight text-[var(--ink)]">
                  {lang === "fi" ? scent.name : scent.nameEn}
                </span>
                <span className="mt-1 block text-[13px] text-[var(--ink-mute)]">
                  {notesLine(lang === "fi" ? scent.profile : scent.profileEn)}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="h-3.5 w-3.5 flex-shrink-0 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: scent.waxColor }}
              />
            </span>
          </motion.button>
        ))}
      </motion.div>
    </section>
  );
}
