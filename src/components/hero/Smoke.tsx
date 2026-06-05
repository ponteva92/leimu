"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Smoke overlay
   ------------------------------------------------------------------------
   A pure-DOM / Framer Motion effect (no WebGL) layered over the candle wick.
   Each time `trigger` increments, one plume of wisps is released: they drift
   upward, sway, scale, blur and fade — the elegant "just blown out" wisp.

   Positioned by the parent via absolute `style` (origin = the wick point).
   ════════════════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SMOKE } from "./heroMotion";

type Plume = { id: number };

export function Smoke({
  trigger,
  className,
  style,
}: {
  trigger: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [plumes, setPlumes] = useState<Plume[]>([]);
  const idRef = useRef(0);

  // Release a new plume whenever `trigger` advances (skip the initial 0).
  useEffect(() => {
    if (trigger <= 0) return;
    const id = ++idRef.current;
    setPlumes((p) => [...p, { id }]);
    const timeout = setTimeout(() => {
      setPlumes((p) => p.filter((x) => x.id !== id));
    }, (SMOKE.duration + 0.4) * 1000);
    return () => clearTimeout(timeout);
  }, [trigger]);

  return (
    <div
      className={className}
      style={{ position: "absolute", pointerEvents: "none", ...style }}
      aria-hidden="true"
    >
      <AnimatePresence>
        {plumes.map((plume) => (
          <Plume key={plume.id} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Plume() {
  // Deterministic-enough randomised wisps per plume.
  const wisps = useRef(
    Array.from({ length: SMOKE.wisps }).map((_, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      return {
        id: i,
        delay: i * 0.06,
        size: 10 + Math.random() * 16,
        driftX: dir * (8 + Math.random() * SMOKE.drift),
        rise: SMOKE.rise * (0.7 + Math.random() * 0.5),
        startBlur: 2 + Math.random() * 2,
        endBlur: 12 + Math.random() * 10,
      };
    }),
  ).current;

  return (
    <>
      {wisps.map((w) => (
        <motion.span
          key={w.id}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: w.size,
            height: w.size * 1.6,
            borderRadius: "50%",
            translateX: "-50%",
            translateY: "-50%",
            background:
              "radial-gradient(ellipse at 50% 65%, rgba(238,232,222,0.55) 0%, rgba(200,190,178,0.28) 45%, rgba(160,150,138,0) 78%)",
            willChange: "transform, opacity, filter",
          }}
          initial={{
            opacity: 0,
            x: 0,
            y: 0,
            scale: 0.5,
            filter: `blur(${w.startBlur}px)`,
          }}
          animate={{
            opacity: [0, 0.7, 0.45, 0],
            x: [0, w.driftX * 0.4, w.driftX],
            y: [0, -w.rise * 0.5, -w.rise],
            scale: [0.5, 1.3, 2.4],
            filter: [
              `blur(${w.startBlur}px)`,
              `blur(${(w.startBlur + w.endBlur) / 2}px)`,
              `blur(${w.endBlur}px)`,
            ],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: SMOKE.duration,
            delay: w.delay,
            ease: SMOKE.ease,
            times: [0, 0.35, 1],
          }}
        />
      ))}
    </>
  );
}
