"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — "Ota yhteyttä" CTA (liquid glow)
   ------------------------------------------------------------------------
   Reusable premium contact button. Blooms a warm --accent-2 glow on hover and
   sweeps a shimmer across the surface. Opens the global contact modal (store).
   Two contrast variants:
     · navbar — solid ink on the light page
     · hero   — frosted glass + accent-2 border on the dark hero
   ════════════════════════════════════════════════════════════════════════ */

import { motion } from "framer-motion";
import { useStore } from "@/context/store";
import { EASE_SPRING_MAGNETIC } from "@/lib/motionVariants";

export function ContactCTA({
  variant = "navbar",
  label,
}: {
  variant?: "navbar" | "hero";
  label?: string;
}) {
  const { lang, openContact, setCursorType } = useStore();
  const text = label ?? (lang === "fi" ? "Ota yhteyttä" : "Contact");
  const isHero = variant === "hero";

  return (
    <motion.button
      type="button"
      onClick={openContact}
      onMouseEnter={() => setCursorType("pointer")}
      onMouseLeave={() => setCursorType("default")}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileTap={{ scale: 0.96 }}
      variants={{
        rest: {
          scale: 1,
          boxShadow: isHero
            ? "0 0 0 1px rgba(196,122,58,0.45), 0 8px 26px -6px rgba(26,24,20,0.22)"
            : "0 2px 16px rgba(26,24,20,0.14)",
        },
        hover: {
          scale: 1.03,
          boxShadow:
            "0 12px 40px rgba(196,122,58,0.32), 0 0 0 1px rgba(196,122,58,0.85), 0 0 24px rgba(196,122,58,0.45)",
        },
      }}
      transition={EASE_SPRING_MAGNETIC}
      className={[
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-mono uppercase",
        isHero
          ? "px-7 py-3.5 text-[11px] tracking-[0.2em] border border-[rgba(196,122,58,0.7)] text-[#F5F5F0]"
          : "px-5 py-2 text-[12px] tracking-[0.14em] bg-[var(--ink)] text-[var(--bg)]",
      ].join(" ")}
    >
      {/* frosted backing — hero variant only (reads as glass on the dark hero) */}
      {isHero && (
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            background: "rgba(245,245,240,0.06)",
          }}
        />
      )}

      {/* shimmer sweep on hover (inherits the parent's rest/hover variant label) */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(212,169,106,0.42) 50%, transparent 60%)",
          backgroundSize: "220% 100%",
        }}
        variants={{ rest: { backgroundPosition: "-120% 0" }, hover: { backgroundPosition: "220% 0" } }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />

      <span className="relative z-10">{text}</span>
    </motion.button>
  );
}
