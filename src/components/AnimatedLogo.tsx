"use client";

/**
 * AnimatedLogo — LEIMU premium brand mark
 *
 * On mount:
 *   1. The logo image fades + scales in with a gentle spring
 *   2. A golden shimmer sweep crosses the image once (left → right)
 *   3. A slow ambient glow pulses beneath
 *
 * On hover:
 *   • Shimmer re-triggers
 *   • Glow expands slightly
 *
 * Usage:
 *   <AnimatedLogo size={320} />    — size in px (width = height)
 *   <AnimatedLogo size={180} delay={0.3} />
 */

import { useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface AnimatedLogoProps {
  /** Rendered width & height in px */
  size?: number;
  /** Initial animation delay in seconds */
  delay?: number;
  className?: string;
}

export function AnimatedLogo({
  size = 260,
  delay = 0,
  className = "",
}: AnimatedLogoProps) {

  return (
    <motion.div
      className={`relative select-none ${className}`}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ── Ambient pulse glow ─────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(212,169,106,0.38) 0%, rgba(212,169,106,0.10) 45%, transparent 68%)",
          filter: "blur(10px)",
        }}
        animate={{
          scale:   [1, 1.14, 0.97, 1],
          opacity: [0.55, 0.85, 0.65, 0.55],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Logo image ─────────────────────────────────────────────── */}
      <Image
        src="/images/logo-transparent.png"
        alt="LEIMU Candles"
        fill
        className="object-contain relative z-10"
        priority
        sizes={`${size}px`}
        style={{
          filter:
            "drop-shadow(0 8px 36px rgba(212,169,106,0.50)) drop-shadow(0 2px 10px rgba(180,140,80,0.30))",
        }}
      />

      {/* ── Golden shimmer sweep ────────────────────────────────────── */}
      {/* Triggered on mount (key=1) and each hover (key increases) */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-20 rounded-full overflow-hidden"
        aria-hidden="true"
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(108deg, transparent 30%, rgba(255,222,100,0.60) 50%, rgba(212,169,106,0.30) 55%, transparent 70%)",
            backgroundSize: "300% 100%",
          }}
          initial={{ backgroundPosition: "-200% 0", opacity: 0 }}
          animate={{ backgroundPosition: "300% 0", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.1, delay: delay + 0.5, ease: "easeInOut" }}
        />
      </motion.div>

      {/* ── Rotating sparkle ring ──────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 rounded-full border border-[rgba(212,169,106,0.18)] pointer-events-none z-[5]"
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}
