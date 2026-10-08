"use client";

/**
 * Home scent library — same horizontal specimen grid as /tuotteet.
 * Featured scent stays Havu so the two pages keep distinct jobs.
 *
 * Where the craft film pins (md+, motion allowed), this sheet rises over
 * the film's last stretch and each specimen wipes up through its mount
 * with the scroll, in reading order, finishing as the grid's last row
 * enters. Elsewhere the cards simply fade up.
 */

import { useRef } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/context/store";
import { usePinned } from "@/lib/pin";
import { HOME_FEATURED_SCENT_ID, SCENTS } from "@/lib/scents";
import { ScentCard } from "@/components/ScentCard";
import { useStaggeredReveal } from "@/components/story/hooks";
import {
  fadeUpItem,
  headingReveal,
  staggerContainer,
  VIEWPORT_NEAR,
} from "@/lib/motionVariants";

const HEADING_ID = "scent-library-heading";

export function ScentLibrary() {
  const lang = useStore((s) => s.lang);
  const openModal = useStore((s) => s.openModal);
  const scrubbed = usePinned();
  const gridRef = useRef<HTMLDivElement>(null);
  const { p, near, at } = useStaggeredReveal(gridRef, SCENTS.length);

  const featured =
    SCENTS.find((s) => s.id === HOME_FEATURED_SCENT_ID) ?? SCENTS[0];
  const specimens = [featured, ...SCENTS.filter((s) => s.id !== featured.id)];

  return (
    <section id="tuoksut" className="relative py-8 md:py-12" aria-labelledby={HEADING_ID}>
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_NEAR}
          className="mb-8 md:mb-12"
        >
          <motion.p variants={fadeUpItem} className="tag-mono mb-3">
            {lang === "fi" ? "Tuoksukirjasto" : "Scent library"}
          </motion.p>
          <motion.h2
            id={HEADING_ID}
            variants={headingReveal}
            className="heading-display text-5xl text-[var(--ink)] md:text-6xl"
          >
            {lang === "fi" ? (
              <>Viisi tapaa <em>tuoksua.</em></>
            ) : (
              <>Five ways to <em>scent.</em></>
            )}
          </motion.h2>
        </motion.div>

        <motion.div
          ref={gridRef}
          className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_NEAR}
        >
          {specimens.map((scent, i) => (
            <ScentCard
              key={scent.id}
              scent={scent}
              lang={lang}
              featured={scent.id === featured.id}
              onSelect={openModal}
              reveal={scrubbed ? { p, at: at(i) } : undefined}
              eager={near}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
