"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Smart-reveal site header
   ------------------------------------------------------------------------
   One fixed motion.header around the Navbar. Tracks scroll direction via
   useScroll + useMotionValueEvent: shown at the top and while scrolling up;
   slides fully out (translateY -100%) while scrolling down — reclaiming
   vertical space. Luxurious EASE_PREMIUM curve.

   Tone: dark glass while a dark stage sits under the bar, paper glass
   everywhere else. The home hero reports through heroUnderBar as the
   paper sheet rises over it; a later dark stage on any page (the gift
   ceremony, say) reports through darkStageUnderBar. Stages pin, so
   scroll distance alone can't tell.
   ════════════════════════════════════════════════════════════════════════ */

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { EASE_PREMIUM } from "@/lib/motionVariants";
import { useStore } from "@/context/store";
import { Navbar } from "@/components/Navbar";

export function SiteHeader() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);
  const heroUnderBar = useStore((s) => s.heroUnderBar);
  const darkStageUnderBar = useStore((s) => s.darkStageUnderBar);
  const dark = (pathname === "/" && heroUnderBar) || darkStageUnderBar;

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
      className="fixed inset-x-0 top-0 z-[var(--z-header)]"
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.5, ease: EASE_PREMIUM }}
      // Keyboard focus landing on a tucked-away link brings the bar back.
      onFocus={() => setHidden(false)}
    >
      <Navbar scrolled={scrolled} tone={dark ? "dark" : "paper"} />
    </motion.header>
  );
}
