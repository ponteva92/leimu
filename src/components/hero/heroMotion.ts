/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Hero Framer Motion configuration
   Centralised so the text + smoke motion is easy to tune in one place.
   ════════════════════════════════════════════════════════════════════════ */
import type { Variants } from "framer-motion";

/* Brand palette for this hero (overrides the global cream theme) */
export const HERO = {
  bg: "#16140F", // charcoal cinematic chapter
  cream: "#F2ECDF",
  amber: "#D89456",
} as const;

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/* ── Headline entrance ──────────────────────────────────────────────────
   Container staggers the two lines + supporting copy / CTA in sequence.    */
export const heroStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.22 } },
};

export const heroLine: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(12px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE_OUT },
  },
};

export const heroFade: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: EASE_OUT },
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
    "0 0 0px rgba(216,148,86,0.0), 0 0 12px rgba(216,148,86,0.12)",
    "0 0 36px rgba(216,148,86,0.62), 0 0 72px rgba(216,148,86,0.32)",
    "0 0 16px rgba(216,148,86,0.28), 0 0 40px rgba(216,148,86,0.16)",
  ],
};

export const amberBreatheTransition = {
  duration: 2.1,
  delay: 1.05,
  ease: "easeOut",
  times: [0, 0.55, 1],
} as const;

/* ── Smoke plume ────────────────────────────────────────────────────────
   A plume is a small bundle of wisps released on extinguish. Each wisp
   drifts up, scales, blurs and fades. Values are read by <Smoke/>.         */
export const SMOKE = {
  wisps: 7,
  duration: 2.6, // seconds for a wisp to fully dissipate
  rise: 230, // px travelled upward
  drift: 46, // max horizontal sway
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};
