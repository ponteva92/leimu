"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Lenis smooth scrolling
   ------------------------------------------------------------------------
   Wheel inertia over real native scroll (no transformed wrapper), so
   position:sticky and framer-motion useScroll keep working site-wide.
   Touch keeps the platform's own scroll; reduced motion turns Lenis off.

   Lenis ticks inside framer-motion's frameloop (read step, kept alive), so
   it writes scrollTop before useScroll measures in the same frame: every
   scroll-linked transform paints with the scroll position it belongs to,
   no one-frame lag between the page and the pinned stages.
   ════════════════════════════════════════════════════════════════════════ */

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { frame, cancelFrame } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import { getLenis, landOn, setLenis, scrollToTarget, syncLenis } from "@/lib/scroll";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    const tick = ({ timestamp }: { timestamp: number }) => lenis?.raf(timestamp);

    const mount = () => {
      if (lenis || mq.matches) return;
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false });
      setLenis(lenis);
      frame.read(tick, true);
    };
    const unmount = () => {
      cancelFrame(tick);
      lenis?.destroy();
      lenis = null;
      setLenis(null);
    };
    const onChange = () => (mq.matches ? unmount() : mount());

    mount();
    mq.addEventListener("change", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
      unmount();
    };
  }, []);

  // Route change: Next has already scrolled (to the top, or to a #hash) in its
  // own layout phase. This component renders after <main>, so its layout
  // effect runs after that scroll and re-syncs Lenis with the new page.
  useIsoLayoutEffect(() => {
    syncLenis();
  }, [pathname]);

  // Capture-phase clicks, before next/link handles them:
  //  · same-page #hash links glide through Lenis, then update the address
  //    bar and focus as a native jump would (opt out: data-native-scroll)
  //  · other internal links drop in-flight inertia so it cannot fight the
  //    route change's own scroll-to-top
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const lenis = getLenis();
      if (!lenis || e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      const samePage =
        url.pathname === window.location.pathname && url.search === window.location.search;
      if (samePage && url.hash && !anchor.hasAttribute("data-native-scroll")) {
        const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
        if (!el) return;
        e.preventDefault();
        scrollToTarget(el);
        landOn(el);
        return;
      }

      if (lenis.isScrolling) syncLenis();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
