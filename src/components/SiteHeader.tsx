"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Smart-reveal site header
   ------------------------------------------------------------------------
   Unifies the Navbar + Marquee in one fixed motion.header. Tracks scroll
   direction via useScroll + useMotionValueEvent: shown at the top and while
   scrolling up; slides fully out (translateY -100%) while scrolling down —
   reclaiming vertical space. Luxurious EASE_PREMIUM curve.

   Tone: on the home hero and Tarina opening the header is cream-on-charcoal;
   once parchment content covers those chapters it returns to frost.
   ════════════════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { EASE_PREMIUM } from "@/lib/motionVariants";
import { Navbar } from "@/components/Navbar";
import { Marquee } from "@/components/Marquee";

function chapterIsDark(pathname: string, y: number) {
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  if (pathname === "/") return y < vh * 0.78;
  if (pathname === "/tarina") return y < vh * 0.68;
  return false;
}

export function SiteHeader() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [overDark, setOverDark] = useState(() =>
    pathname === "/" || pathname === "/tarina",
  );
  const lastY = useRef(0);

  useEffect(() => {
    setOverDark(chapterIsDark(pathname, scrollY.get()));
  }, [pathname, scrollY]);

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 32);
    setOverDark(chapterIsDark(pathname, y));
    const dy = y - lastY.current;
    if (y < 50) setHidden(false); // always show near the top
    else if (dy > 4) setHidden(true); // scrolling down → hide
    else if (dy < -4) setHidden(false); // scrolling up → reveal
    lastY.current = y;
  });

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      data-tone={overDark ? "dark" : "light"}
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.5, ease: EASE_PREMIUM }}
    >
      <Navbar scrolled={scrolled} tone={overDark ? "dark" : "light"} />
      <Marquee tone={overDark ? "dark" : "light"} />
    </motion.header>
  );
}
