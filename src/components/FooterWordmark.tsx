"use client";

/**
 * FooterWordmark — the colophon's oversized LEIMU rises once from behind
 * its own baseline, like a seal lifted clear of the wax. The clip cuts
 * only below the line, so nothing above it is ever cropped. The wrapper
 * watches the viewport: the word itself starts clipped out of sight, where
 * an IntersectionObserver would never see it. Reduced motion: set in place.
 */

import { motion } from "framer-motion";
import { EASE_PREMIUM } from "@/lib/motionVariants";

export function FooterWordmark() {
  return (
    <motion.div
      className="[clip-path:inset(-50%_-10%_0_-10%)]"
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
    >
      <motion.p
        className="font-serif font-medium leading-[0.82] tracking-[-0.03em] text-[var(--on-dark)] motion-reduce:!transform-none"
        style={{ fontSize: "clamp(4.5rem, 18vw, 11rem)" }}
        variants={{
          hidden: { y: "100%" },
          shown: { y: "0%", transition: { duration: 1.3, ease: EASE_PREMIUM } },
        }}
      >
        LEIMU
      </motion.p>
    </motion.div>
  );
}
