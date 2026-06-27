"use client";

/* Success checkmark — the ring draws, then the tick draws (pathLength 0→1).
   Brand: green ring (--accent), warm tick (--accent-2). Honours reduced motion
   by rendering the final, fully-drawn state instantly. */

import { motion, useReducedMotion } from "framer-motion";

export function SuccessCheck({ size = 28, className = "" }: { size?: number; className?: string }) {
  const reduced = useReducedMotion();
  const from = { pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
      <motion.circle
        cx="14" cy="14" r="12.5"
        stroke="var(--accent)" strokeWidth="1.5"
        initial={from}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: reduced ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M8 14.5l4 4 8-9"
        stroke="var(--accent-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        initial={from}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.svg>
  );
}
