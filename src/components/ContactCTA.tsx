"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — "Ota yhteyttä" CTA
   ------------------------------------------------------------------------
   Opens the global contact modal (store). Two variants with a clear
   hierarchy — one filled button per surface:
     · navbar — outline pill beside the filled Order pill
     · hero   — quiet underlined text link beside the filled primary pill
   ════════════════════════════════════════════════════════════════════════ */

import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { useStore } from "@/context/store";
import { EASE_SPRING_MAGNETIC } from "@/lib/motionVariants";

export function ContactCTA({
  variant = "navbar",
  label,
}: {
  variant?: "navbar" | "hero";
  label?: string;
}) {
  const lang = useStore((s) => s.lang);
  const openContact = useStore((s) => s.openContact);
  const setCursorType = useStore((s) => s.setCursorType);
  const text = label ?? (lang === "fi" ? "Ota yhteyttä" : "Contact");

  if (variant === "hero") {
    return (
      <button
        type="button"
        onClick={openContact}
        onMouseEnter={() => setCursorType("pointer")}
        onMouseLeave={() => setCursorType("default")}
        className="group inline-flex items-center gap-2 py-2 font-sans font-medium text-[13px] uppercase tracking-[0.08em] text-[rgba(245,245,240,0.85)] transition-colors hover:text-[#F5F5F0]"
      >
        <span className="relative">
          {text}
          <span
            aria-hidden="true"
            className="absolute -bottom-1 left-0 h-px w-full bg-[rgba(245,245,240,0.35)] transition-colors duration-300 group-hover:bg-[rgba(245,245,240,0.85)]"
          />
        </span>
        <ArrowRight
          size={14}
          weight="light"
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={openContact}
      onMouseEnter={() => setCursorType("pointer")}
      onMouseLeave={() => setCursorType("default")}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={EASE_SPRING_MAGNETIC}
      className="group relative inline-flex items-center justify-center rounded-full border border-[var(--field-border)] px-5 py-2 font-sans font-medium text-[13px] uppercase tracking-[0.08em] text-[var(--ink)] transition-colors duration-300 hover:border-[var(--accent-2)]"
    >
      {/* The amber glow is its own layer and only fades in. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-full opacity-0 shadow-glow transition-opacity duration-300 group-hover:opacity-100"
      />
      {text}
    </motion.button>
  );
}
