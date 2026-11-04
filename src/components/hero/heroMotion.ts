/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Hero Framer Motion configuration
   Centralised so the headline motion is easy to tune in one place.
   ════════════════════════════════════════════════════════════════════════ */
import type { Variants } from "framer-motion";
import { EASE_PREMIUM } from "@/lib/motionVariants";

/* Brand palette for this hero (overrides the global cream theme) */
export const HERO = {
  bg: "#CBB799", // warm tan
  cream: "#F5F5F0",
  amber: "#C68E58",
} as const;

/* ── Headline entrance ──────────────────────────────────────────────────
   Container staggers the two lines + supporting copy / CTA in sequence.    */
export const heroStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
};

export const heroLine: Variants = {
  hidden: { opacity: 0, y: 34 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_PREMIUM },
  },
};

export const heroFade: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_PREMIUM },
  },
};

/* One-shot warm glow on a separate, pre-painted copy of the accent word.
   Only opacity changes; the text shadow is never repainted every frame. */
export const amberBreatheAnimate = {
  opacity: [0.1, 1, 0.4],
};

export const amberBreatheTransition = {
  duration: 1.6,
  delay: 0.9,
  ease: "easeOut",
  times: [0, 0.55, 1],
} as const;
