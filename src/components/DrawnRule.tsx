"use client";

/**
 * DrawnRule — a hairline that draws itself in as it enters the viewport
 * (scaleX from the left, or scaleY from the top when vertical). One quiet
 * shared gesture so structural lines feel placed by hand, not printed.
 * Under prefers-reduced-motion the line is simply there. CSS reads that
 * preference, so the server's markup already suits every reader.
 */

import { motion } from "framer-motion";
import { EASE_PREMIUM, VIEWPORT_NEAR } from "@/lib/motionVariants";

/** A hairline's tone on the ink stage: paper at 20%. */
export const RULE_ON_DARK = "bg-[rgba(247,242,234,0.2)]";

interface DrawnRuleProps {
  className?: string;
  vertical?: boolean;
  /** On the ink stage the rule is paper at 20%, where the line tone would glare. */
  onDark?: boolean;
}

export function DrawnRule({ className = "", vertical = false, onDark = false }: DrawnRuleProps) {
  const base = vertical ? "w-px origin-top" : "h-px origin-left";
  const tone = onDark ? RULE_ON_DARK : "bg-[var(--line)]";

  return (
    <motion.span
      aria-hidden="true"
      className={`block ${tone} motion-reduce:!transform-none ${base} ${className}`}
      initial={vertical ? { scaleY: 0 } : { scaleX: 0 }}
      whileInView={vertical ? { scaleY: 1 } : { scaleX: 1 }}
      viewport={VIEWPORT_NEAR}
      transition={{ duration: 1.1, ease: EASE_PREMIUM }}
    />
  );
}
