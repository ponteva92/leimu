"use client";

/* Empty state — a small candle with a gently flickering flame (on-brand for a
   candle shop) plus a message. Looping, but only while the empty state is on
   screen; static under reduced motion. */

import { motion, useReducedMotion } from "framer-motion";

export function EmptyState({ message, className = "" }: { message: string; className?: string }) {
  const reduced = useReducedMotion();

  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-8 text-center ${className}`}>
      <motion.svg
        width="30" height="42" viewBox="0 0 30 42" fill="none" aria-hidden="true"
        animate={reduced ? undefined : { y: [0, -1.5, 0] }}
        transition={reduced ? undefined : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* candle body */}
        <rect x="10" y="17" width="10" height="23" rx="2" fill="var(--bg-3)" stroke="var(--line)" strokeWidth="1" />
        {/* wick */}
        <line x1="15" y1="14.5" x2="15" y2="17" stroke="var(--ink-mute)" strokeWidth="1" />
        {/* flame — flickers from its base */}
        <motion.path
          d="M15 4c2.4 2.6 3.6 4.7 3.6 6.8a3.6 3.6 0 0 1-7.2 0C11.4 8.7 12.6 6.6 15 4z"
          fill="var(--accent-2)"
          style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}
          animate={reduced ? undefined : { scaleY: [1, 1.12, 0.95, 1], opacity: [0.85, 1, 0.8, 0.85] }}
          transition={reduced ? undefined : { duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
      <p className="font-serif italic text-sm text-[var(--ink-mute)]">{message}</p>
    </div>
  );
}
