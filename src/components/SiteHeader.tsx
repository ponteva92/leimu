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
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { EASE_PREMIUM } from "@/lib/motionVariants";
import { Navbar } from "@/components/Navbar";
import { Marquee } from "@/components/Marquee";
import { useStore } from "@/context/store";

export function SiteHeader() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);
  const modalScent = useStore((s) => s.modalScent);
  const contactOpen = useStore((s) => s.contactOpen);
  const checkoutStep = useStore((s) => s.checkoutStep);
  const navMenuOpen = useStore((s) => s.navMenuOpen);
  const pinned = Boolean(modalScent) || contactOpen || navMenuOpen || (pathname === "/tuotteet" && checkoutStep !== "configure");

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 32);
    const dy = y - lastY.current;
    if (pinned || y < 50) setHidden(false);
    else if (dy > 4) setHidden(true);
    else if (dy < -4) setHidden(false);
    lastY.current = y;
  });

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      animate={{ y: pinned || !hidden ? "0%" : "-100%" }}
      transition={{ duration: 0.5, ease: EASE_PREMIUM }}
    >
      <Navbar scrolled={scrolled} />
      <Marquee />
    </motion.header>
  );
}
