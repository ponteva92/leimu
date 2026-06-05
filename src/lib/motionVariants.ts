import type { Variants, Transition } from "framer-motion";

/* ── The two laws of motion ────────────────────────────────────────
   Premium Ease  — every entrance/transition rides this single curve:
   dramatic, fast off the line, very soft to settle.
   Premium Spring — every physics-driven interaction uses this spring.
   All other tokens below are aliases pointing back to these two, so the
   whole site shares one rhythm (no stray easeOut / default springs).   */
export const EASE_PREMIUM   = [0.22, 1, 0.36, 1] as const;
export const SPRING_PREMIUM: Transition = {
  type: "spring", stiffness: 280, damping: 30,
};

/* ── Aliases (kept for call-site compatibility, all → Premium Ease) ── */
export const EASE_FILM      = EASE_PREMIUM;
export const EASE_OUT_EXPO  = EASE_PREMIUM;
export const EASE_OUT_QUART = EASE_PREMIUM;
/* The one exception: exits read crisper with an ease-in curve. */
export const EASE_IN_EXPO   = [0.7,  0, 0.84, 0] as const;

export const EASE_SPRING_SOFT: Transition = {
  type: "spring", stiffness: 60, damping: 18, mass: 1.2,
};
export const EASE_SPRING_SNAP: Transition = SPRING_PREMIUM;
export const EASE_SPRING_MAGNETIC: Transition = {
  type: "spring", stiffness: 180, damping: 22, mass: 0.8,
};

/* ── Viewport presets ──────────────────────────── */
/* VIEWPORT_ONCE: page-load entrance only (once:true)  */
/* All others: once:false = fire on BOTH scroll down AND scroll up */
export const VIEWPORT_ONCE  = { once: true,  margin: "-80px 0px" } as const;
export const VIEWPORT_NEAR  = { once: false, margin: "-80px 0px" } as const;
export const VIEWPORT_EARLY = { once: false, margin: "-40px 0px" } as const;
export const VIEWPORT_BOTH  = { once: false, margin: "-60px 0px" } as const;

/* ── Page transition ───────────────────────────── */
export const pageCinematic: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1.1, ease: EASE_FILM, when: "beforeChildren" },
  },
  exit: { opacity: 0, transition: { duration: 0.55, ease: EASE_IN_EXPO } },
};

/* ── Section reveal — deep cinematic ──────────── */
export const sectionCinematic: Variants = {
  hidden:  { opacity: 0, y: 60, filter: "blur(12px)", scale: 0.98 },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)", scale: 1,
    transition: { duration: 1.05, ease: EASE_FILM },
  },
};

export const sectionReveal: Variants = {
  hidden:  { opacity: 0, y: 40, filter: "blur(6px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.95, ease: EASE_OUT_QUART },
  },
};

/* ── Heading reveal ────────────────────────────── */
export const headingCinematic: Variants = {
  hidden:  { opacity: 0, y: 48, filter: "blur(10px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 1.15, ease: EASE_FILM },
  },
};

export const headingReveal: Variants = {
  hidden:  { opacity: 0, y: 32, filter: "blur(5px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 1.05, ease: EASE_OUT_EXPO },
  },
};

/* ── Stagger containers ────────────────────────── */
export const staggerCinematic: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const staggerContainerFast: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

/* ── Child items ───────────────────────────────── */
export const fadeUpItem: Variants = {
  hidden:  { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.75, ease: EASE_OUT_QUART },
  },
};

export const fadeUpCinematic: Variants = {
  hidden:  { opacity: 0, y: 40, filter: "blur(8px)", scale: 0.98 },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)", scale: 1,
    transition: { duration: 0.9, ease: EASE_FILM },
  },
};

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: EASE_OUT_QUART },
  },
};

/* ── Image slow zoom ───────────────────────────── */
export const imageSlowZoom: Variants = {
  hidden:  { opacity: 0, scale: 1.08, filter: "blur(8px)" },
  visible: {
    opacity: 1, scale: 1, filter: "blur(0px)",
    transition: { duration: 1.6, ease: EASE_FILM },
  },
};

export const imageSlowZoomCinematic: Variants = {
  hidden:  { opacity: 0, scale: 1.12 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 2.2, ease: [0.0, 0.0, 0.2, 1] },
  },
};

export const imageReveal: Variants = {
  hidden:  { opacity: 0, scale: 1.04 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 1.1, ease: EASE_OUT_QUART },
  },
};

/* ── Atmospheric haze ──────────────────────────── */
export const hazeReveal: Variants = {
  hidden:  { opacity: 0, scale: 1.1 },
  visible: {
    opacity: 0.55, scale: 1,
    transition: { duration: 2.5, ease: EASE_FILM },
  },
};

/* ── CTA magnetic ──────────────────────────────── */
export const ctaMagneticCinematic = {
  rest:  { scale: 1,    boxShadow: "0 4px 24px rgba(26,24,20,0.14)" },
  hover: {
    scale: 1.06,
    boxShadow: "0 12px 48px rgba(26,24,20,0.28), 0 0 0 1px rgba(212,169,106,0.3)",
    transition: EASE_SPRING_SNAP,
  },
  tap:   { scale: 0.96, transition: { duration: 0.12 } },
};

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.88, filter: "blur(4px)" },
  visible: {
    opacity: 1, scale: 1, filter: "blur(0px)",
    transition: { duration: 0.65, ease: EASE_OUT_EXPO },
  },
};

/* ── Slide variants ────────────────────────────── */
export const slideFromLeft: Variants = {
  hidden:  { opacity: 0, x: -50, filter: "blur(6px)" },
  visible: {
    opacity: 1, x: 0, filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE_FILM },
  },
};

export const slideFromRight: Variants = {
  hidden:  { opacity: 0, x: 50, filter: "blur(6px)" },
  visible: {
    opacity: 1, x: 0, filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE_FILM },
  },
};

/* ── Parallax depth multipliers ────────────────── */
export const parallaxLayersCinematic = {
  bg:      { depth: -0.02 },
  bgMid:   { depth: -0.04 },
  mid:     { depth: -0.06 },
  fg:      { depth: -0.10 },
  haze:    { depth: -0.03 },
  content: { depth: -0.08 },
} as const;

/* ── Navbar scroll-aware ───────────────────────── */
export const navbarScrollAwareCinematic = {
  visible: { y: "0%",    transition: { duration: 0.4,  ease: EASE_FILM     } },
  hidden:  { y: "-105%", transition: { duration: 0.35, ease: EASE_IN_EXPO  } },
};

/* ── Testimonial 3D stack ──────────────────────── */
export const testimonial3DStack = {
  active: (_i: number) => ({
    rotateX: 0, rotateY: 0, translateZ: 0, opacity: 1, scale: 1, zIndex: 10,
    transition: { duration: 0.6, ease: EASE_FILM },
  }),
  inactive: (i: number) => ({
    rotateX: 6, rotateY: i % 2 === 0 ? 4 : -4,
    translateZ: -60 - i * 30,
    opacity: 0.5 - i * 0.12, scale: 0.92 - i * 0.04, zIndex: 10 - i,
    transition: { duration: 0.6, ease: EASE_FILM },
  }),
};
