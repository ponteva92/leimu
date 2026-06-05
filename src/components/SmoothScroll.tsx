"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Lenis smooth scrolling
   ------------------------------------------------------------------------
   Momentum-based smooth scroll for a luxury feel. Uses real native scroll
   (no transformed wrapper), so position:sticky and framer-motion useScroll
   keep working across the site. Disabled under prefers-reduced-motion.
   ════════════════════════════════════════════════════════════════════════ */

import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
