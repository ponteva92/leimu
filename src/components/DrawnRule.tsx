"use client";

/**
 * DrawnRule — a hairline that draws itself in as it enters the viewport
 * (scaleX from the left, or scaleY from the top when vertical). One quiet
 * shared gesture so structural lines feel placed by hand, not printed.
 * Falls back to a static line under prefers-reduced-motion.
 */

import { motion, useReducedMotion } from "framer-motion";
import { EASE_PREMIUM, VIEWPORT_NEAR } from "@/lib/motionVariants";

interface DrawnRuleProps {
  className?: string;
  vertical?: boolean;
}

export function DrawnRule({ className = "", vertical = false }: DrawnRuleProps) {
  const reduce = useReducedMotion();
  const base = vertical ? "w-px origin-top" : "h-px origin-left";

  return (
    <motion.span
      aria-hidden="true"
      className={`block bg-[var(--line)] ${base} ${className}`}
      initial={reduce ? false : vertical ? { scaleY: 0 } : { scaleX: 0 }}
      whileInView={vertical ? { scaleY: 1 } : { scaleX: 1 }}
      viewport={VIEWPORT_NEAR}
      transition={{ duration: 1.1, ease: EASE_PREMIUM }}
    />
  );
}
