"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Smart-reveal site header
   ------------------------------------------------------------------------
   Unifies the Navbar + Marquee in one fixed motion.header. Tracks scroll
   direction via useScroll + useMotionValueEvent: shown at the top and while
   scrolling up; slides fully out (translateY -100%) while scrolling down —
   reclaiming vertical space. Luxurious EASE_PREMIUM curve.
   ════════════════════════════════════════════════════════════════════════ */

import { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { EASE_PREMIUM } from "@/lib/motionVariants";
import { Navbar } from "@/components/Navbar";
import { Marquee } from "@/components/Marquee";

export function SiteHeader() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 32);
    const dy = y - lastY.current;
    if (y < 50) setHidden(false); // always show near the top
    else if (dy > 4) setHidden(true); // scrolling down → hide
    else if (dy < -4) setHidden(false); // scrolling up → reveal
    lastY.current = y;
  });

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.5, ease: EASE_PREMIUM }}
    >
      <Navbar scrolled={scrolled} />
      <Marquee />
    </motion.header>
  );
}
