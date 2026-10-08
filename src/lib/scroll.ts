/* ════════════════════════════════════════════════════════════════════════
   LEIMU — scroll utilities
   ------------------------------------------------------------------------
   One home for everything that moves the page: the shared Lenis instance
   (registered by <SmoothScroll/>), header-aware anchor glides, and a
   ref-counted scroll lock for modals. Native scroll stays the source of
   truth, so position:sticky pins and framer-motion useScroll keep working.
   ════════════════════════════════════════════════════════════════════════ */

import { useEffect } from "react";
import type Lenis from "@studio-freight/lenis";

/** Clears the fixed header. Matches `scroll-padding-top` in globals.css. */
export const HEADER_OFFSET = 88;

let lenis: Lenis | null = null;
let locks = 0;

/** Registered by <SmoothScroll/>. Null while smooth scroll is off (reduced motion). */
export function setLenis(instance: Lenis | null) {
  lenis = instance;
  // A modal may already be open when Lenis (re)mounts — honour its lock.
  if (instance && locks > 0) instance.stop();
}

export const getLenis = () => lenis;

/**
 * Drops any in-flight inertia and re-reads the page height, so Lenis agrees
 * with the native scroll position after something else moved the page
 * (a route change, a browser jump). stop()/start() resets the internal
 * scroll state without swallowing the next native scroll event, which
 * scrollTo({ immediate }) would.
 */
export function syncLenis() {
  if (!lenis) return;
  lenis.resize();
  if (locks > 0) return; // already stopped; unlockScroll() re-syncs via start()
  lenis.stop();
  lenis.start();
}

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Scrolls so `target` lands just below the fixed header. Glides through
 * Lenis when it runs (longer trips get a little more time, so a jump never
 * reads as a teleport); otherwise native smooth scroll, or an instant jump
 * under prefers-reduced-motion.
 */
export function scrollToTarget(
  target: string | HTMLElement,
  { offset = -HEADER_OFFSET, immediate = false }: { offset?: number; immediate?: boolean } = {},
) {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  const distance = el.getBoundingClientRect().top + offset;

  if (lenis) {
    lenis.scrollTo(el, {
      offset,
      immediate,
      duration: Math.min(1.8, 0.9 + Math.abs(distance) / 4000),
      easing: easeInOutCubic,
    });
    return;
  }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({
    top: distance + window.scrollY,
    behavior: immediate || reduce ? "auto" : "smooth",
  });
}

/**
 * Finishes an in-page link the way a native anchor jump would, for links
 * whose scroll we glide ourselves: the #id goes into the address bar as a
 * new history entry (Back returns to where the reader was), and keyboard
 * focus moves to the target, so the next Tab continues from there. Focus
 * moves at once and without scrolling, so it never fights the glide.
 *
 * `hash: false` only moves focus, for a landing that is no place in the
 * page to go back to, such as the next step of a form.
 */
export function landOn(el: HTMLElement, { hash = true }: { hash?: boolean } = {}) {
  if (hash && el.id) {
    const hash = `#${encodeURIComponent(el.id)}`;
    if (window.location.hash !== hash) window.history.pushState(null, "", hash);
  }
  // A section is no control: it takes focus only from script, and draws no ring.
  if (el.tabIndex < 0 && !el.hasAttribute("tabindex")) {
    el.setAttribute("tabindex", "-1");
    el.setAttribute("data-landing", "");
  }
  el.focus({ preventScroll: true });
}

/*
 * Scroll lock — ref-counted, so stacked dialogs release only when the last
 * one closes. It locks <body>, never <html>: an overflow value on <html>
 * stops body's overflow propagating to the viewport, which turns <body>
 * (overflow-x: hidden) into the scroll container and unpins every sticky
 * stage behind the dialog.
 */
export function lockScroll() {
  locks += 1;
  if (locks > 1) return;
  lenis?.stop();
  document.body.style.overflow = "hidden";
}

export function unlockScroll() {
  if (locks === 0) return;
  locks -= 1;
  if (locks > 0) return;
  document.body.style.overflow = "";
  lenis?.start();
}

/** Locks page scroll while `active` is true. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lockScroll();
    return unlockScroll;
  }, [active]);
}
