import type { Variants, Transition } from "framer-motion";

/* ── The two laws of motion ────────────────────────────────────────
   Premium Ease  — every entrance/transition rides this single curve:
   dramatic, fast off the line, very soft to settle.
   Premium Spring — every physics-driven interaction uses this spring.
   The whole site shares this one rhythm; the two exceptions below say
   why they differ. */
export const EASE_PREMIUM   = [0.22, 1, 0.36, 1] as const;
export const SPRING_PREMIUM: Transition = {
  type: "spring", stiffness: 280, damping: 30,
};

/* Exits read crisper with an ease-in curve. */
export const EASE_IN_EXPO   = [0.7,  0, 0.84, 0] as const;

/* A button's hover and press scale rides a lighter, looser spring. */
export const EASE_SPRING_MAGNETIC: Transition = {
  type: "spring", stiffness: 180, damping: 22, mass: 0.8,
};

/* ── Viewport presets ──────────────────────────── */
/* Animate once on entrance. Re-firing on every scroll up/down is motion the
   user sees too often (Emil's frequency principle), so all presets use once:true. */
export const VIEWPORT_ONCE  = { once: true, margin: "-80px 0px" } as const;
export const VIEWPORT_NEAR  = { once: true, margin: "-80px 0px" } as const;

/* ── Heading reveal ────────────────────────────── */
export const headingCinematic: Variants = {
  hidden:  { opacity: 0, y: 48 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 1.15, ease: EASE_PREMIUM },
  },
};

export const headingReveal: Variants = {
  hidden:  { opacity: 0, y: 32 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 1.05, ease: EASE_PREMIUM },
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

/* ── Child items ───────────────────────────────── */
export const fadeUpItem: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.75, ease: EASE_PREMIUM },
  },
};
