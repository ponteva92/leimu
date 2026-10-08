"use client";

/* A figure that counts up from zero the first time it scrolls into view,
   or, inside a pinned stage, when its row arrives (`run`).
   The server renders the final figure as plain text, and screen readers
   only ever get the final figure. While it counts, the tally writes its
   own text node, so counting never re-renders React. A figure already on
   screen when the page loads stays put, as it does under reduced motion. */

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { EASE_PREMIUM } from "@/lib/motionVariants";

export function CountUp({ value, prefix = "", suffix = "", run, className }: {
  value: number;
  prefix?: string;
  suffix?: string;
  /** Starts the count in place of the scroll into view. A pinned row sits
      in view long before it shows, so its stage latches this on arrival. */
  run?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const tally = useRef<HTMLSpanElement>(null);
  const [armed, setArmed] = useState(false);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  const reduce = useReducedMotion();
  const go = run ?? inView;

  // Arm only below the fold: zero out, ready to count on arrival.
  useEffect(() => {
    const el = ref.current;
    if (reduce || !el) return;
    const { top, bottom } = el.getBoundingClientRect();
    if (top >= window.innerHeight || bottom <= 0) setArmed(true);
  }, [reduce]);

  useEffect(() => {
    if (!go || !armed) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: EASE_PREMIUM,
      onUpdate: (v) => {
        const node = tally.current?.firstChild;
        if (node) node.nodeValue = `${prefix}${Math.round(v)}${suffix}`;
      },
      onComplete: () => setArmed(false),
    });
    return () => controls.stop();
  }, [go, armed, value, prefix, suffix]);

  const figure = `${prefix}${value}${suffix}`;
  return (
    <span ref={ref} className={className}>
      {armed ? (
        <>
          <span className="sr-only">{figure}</span>
          <span ref={tally} aria-hidden="true">{`${prefix}0${suffix}`}</span>
        </>
      ) : (
        figure
      )}
    </span>
  );
}
