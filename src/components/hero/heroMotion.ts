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

/* ── Amber accent ("rauha.") — slow breathing glow ──────────────────────
   Applied as an infinite `animate` on the inline amber word. A breathing
   text-shadow signals warmth; no vertical float, since floating a single
   inline word out of its line reads as a glitch.                           */
/* One-shot warm glow on entrance, then it holds a gentle resting state.
   No infinite loop — the brief bans perpetual motion on primary UI. */
export const amberBreatheAnimate = {
  textShadow: [
    "0 0 0px rgba(198,142,88,0.0), 0 0 12px rgba(198,142,88,0.10)",
    "0 0 28px rgba(198,142,88,0.55), 0 0 64px rgba(198,142,88,0.30)",
    "0 0 14px rgba(198,142,88,0.22), 0 0 34px rgba(198,142,88,0.14)",
  ],
};

export const amberBreatheTransition = {
  duration: 1.6,
  delay: 0.9,
  ease: "easeOut",
  times: [0, 0.55, 1],
} as const;
