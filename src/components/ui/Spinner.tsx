"use client";

/* Brand loading spinner — faint track + warm accent-2 arc, smooth linear loop.
   `currentColor` drives the track so it adapts to whatever it sits inside.
   Mounted only while loading, so it never costs anything at rest. */

import { motion } from "framer-motion";

export function Spinner({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      role="status"
      aria-label="Ladataan"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="var(--accent-2)" strokeWidth="2.5" strokeLinecap="round" />
    </motion.svg>
  );
}
