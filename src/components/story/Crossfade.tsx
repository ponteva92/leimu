"use client";

/* Beats that share one grid cell, so the column never changes height.
   Each beat fades out over the first part of the next beat's window and
   the next fades in over the rest; two beats are never visible at once.
   A hidden beat's text stays in the accessibility tree, since the story
   reads in order, but its controls leave the tab order until it returns. */

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import {
  easeInOut, motion, useMotionValueEvent, useTransform, type MotionValue,
} from "framer-motion";
import { mid, type Span } from "@/lib/timeline";
import { useWillChange } from "./hooks";

const FOCUSABLE = "a[href], button, input, select, textarea, [tabindex]";

export function Crossfade({ p, arrive, leave, className = "[grid-area:1/1]", children }: {
  p: MotionValue<number>;
  /** The window in which this beat arrives (the previous beat's wipe). */
  arrive: Span;
  /** The window in which it gives way to the next. */
  leave: Span;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const input = [mid(arrive), arrive[1], leave[0], mid(leave)];
  const opacity = useTransform(p, input, [0, 1, 1, 0]);
  const y = useTransform(p, input, [28, 0, 0, -28], { ease: easeInOut });
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));
  useWillChange(p, [[mid(arrive), arrive[1]], [leave[0], mid(leave)]], [ref], "transform, opacity");

  // Flips only when the beat crosses half opacity, never per frame.
  const shown = useRef<boolean | null>(null);
  const sync = useCallback((o: number) => {
    const el = ref.current;
    const next = o > 0.5;
    if (!el || next === shown.current) return;
    shown.current = next;
    el.querySelectorAll<HTMLElement>(FOCUSABLE).forEach((control) => {
      const saved = control.dataset.tabindex;
      if (next) {
        if (saved === undefined) return;
        if (saved === "") control.removeAttribute("tabindex");
        else control.setAttribute("tabindex", saved);
        delete control.dataset.tabindex;
      } else if (saved === undefined) {
        control.dataset.tabindex = control.getAttribute("tabindex") ?? "";
        control.tabIndex = -1;
      }
    });
  }, []);

  useMotionValueEvent(opacity, "change", sync);
  useEffect(() => sync(opacity.get()), [opacity, sync]);

  return (
    <motion.div ref={ref} className={className} style={{ opacity, y, pointerEvents }}>
      {children}
    </motion.div>
  );
}
