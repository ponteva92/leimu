"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion, useMotionValue, useSpring, useTransform, AnimatePresence,
} from "framer-motion";
import { useStore } from "@/context/store";

/* ── Flame-path builder (same physics as CandleSVG) ──────────────────── */
function buildFlameD(lean: number): string {
  // viewBox: 0 0 18 56 — flame base at (9,16), tip near (9,2)
  const bx = 9, by = 16;
  const tipX = 9 + lean * 3.2;
  const tipY = 2 - Math.abs(lean) * 0.7;
  const lc1x = bx - 2 + lean * 0.3,     lc1y = by - 3;
  const lc2x = tipX - 1.1 + lean * 0.5,  lc2y = tipY + 5;
  const rc1x = tipX + 1.1 + lean * 0.5,  rc1y = tipY + 5;
  const rc2x = bx + 2 + lean * 0.3,      rc2y = by - 3;
  const f = (n: number) => n.toFixed(2);
  return (
    `M ${f(bx)},${f(by)} ` +
    `C ${f(lc1x)},${f(lc1y)} ${f(lc2x)},${f(lc2y)} ${f(tipX)},${f(tipY)} ` +
    `C ${f(rc1x)},${f(rc1y)} ${f(rc2x)},${f(rc2y)} ${f(bx)},${f(by)} Z`
  );
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}

/* ── Particle type ───────────────────────────────────────────────────── */
type Particle = { id: number; x: number; y: number };

/* ══════════════════════════════════════════════════════════════════════
   LEIMU Physics Flame Cursor

   Pipeline:
     mouse velocity (px/ms)
       → rawLean  (MotionValue)
       → springLean  (underdamped spring – stiffness 80, damping 6)
       + flickerOff  (triple-harmonic RAF loop)
       = totalLean
       → flamePath  (SVG cubic-bezier d string)
       → flameSkewX (secondary tilt)
       → glowX      (glow ellipse follows lean)

   Particle trail: last 10 positions emitted at ≤30 fps,
   each fades opacity→0 and scale→0.2 over 650 ms.
══════════════════════════════════════════════════════════════════════ */
export function CustomCursor() {
  const { cursorType } = useStore();
  const isMagnetic = cursorType === "magnetic";

  /* ── Raw position (instant) ── */
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);

  /* ── Velocity → lean ── */
  const rawLean    = useMotionValue(0);
  const flickerOff = useMotionValue(0);
  const springLean = useSpring(rawLean, { stiffness: 80, damping: 6, mass: 0.2 });
  const totalLean  = useTransform(
    [springLean, flickerOff] as const,
    ([l, f]) => (l as number) + (f as number),
  );
  const flamePath  = useTransform(totalLean, buildFlameD);
  const flameSkewX = useTransform(totalLean, (v) => `${v * 12}deg`);
  const glowX      = useTransform(totalLean, (v) => v * 5);
  const glowOpacity = useTransform(totalLean, (v) => 0.12 + Math.abs(v) * 0.08);

  /* ── Particle trail state ── */
  const [particles, setParticles] = useState<Particle[]>([]);
  const pidRef     = useRef(0);
  const lastPRef   = useRef(0);

  /* ── Triple-harmonic RAF flicker ── */
  useEffect(() => {
    let rafId: number;
    const t0 = performance.now();
    const tick = () => {
      const t = (performance.now() - t0) * 0.001;
      flickerOff.set(
        Math.sin(t * 4.3)  * 0.065
        + Math.sin(t * 9.1  + 1.2) * 0.028
        + Math.sin(t * 13.7 + 2.4) * 0.013,
      );
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [flickerOff]);

  /* ── Mouse tracking + velocity → rawLean + particle emission ── */
  useEffect(() => {
    let prevX = 0;
    let prevT = performance.now();

    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);

      /* Velocity → lean */
      const now = performance.now();
      const dt  = Math.max(now - prevT, 4);
      const vx  = (e.clientX - prevX) / dt;
      prevX = e.clientX;
      prevT = now;
      rawLean.set(clamp(-vx * 0.42, -1.2, 1.2));

      /* Particle emission — throttled to ~30 fps */
      if (now - lastPRef.current > 30) {
        lastPRef.current = now;
        setParticles((prev) => [
          ...prev.slice(-9),
          { id: ++pidRef.current, x: e.clientX, y: e.clientY },
        ]);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my, rawLean]);

  return (
    /* hidden on mobile (no hover), shown md+ */
    <div
      className="hidden md:block fixed inset-0 pointer-events-none z-[9999]"
      aria-hidden="true"
    >
      {/* ── Smoke / scent-trail particles ─────────────────────────── */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="fixed pointer-events-none rounded-full"
            style={{
              left: p.x,
              top:  p.y,
              translateX: "-50%",
              translateY: "-50%",
              width:  7,
              height: 9,
              background:
                "radial-gradient(ellipse at 50% 80%, rgba(255,180,40,0.38) 0%, transparent 80%)",
              filter: "blur(2.5px)",
            }}
            initial={{ scale: 1, opacity: 0.38, y: 0 }}
            animate={{ scale: 0.15, opacity: 0, y: -12 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* ── Flame cursor ──────────────────────────────────────────── */}
      <motion.div
        style={{
          position: "fixed",
          x: mx,
          y: my,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        {/* Ambient glow halo */}
        <motion.div
          className="absolute rounded-full"
          style={{
            translateX: "-50%",
            translateY: "-50%",
            x: glowX,
            opacity: glowOpacity,
          }}
          animate={{
            width:      isMagnetic ? 64 : 38,
            height:     isMagnetic ? 64 : 38,
            background: isMagnetic
              ? "radial-gradient(circle, rgba(212,169,106,0.28) 0%, transparent 68%)"
              : "radial-gradient(circle, rgba(255,165,30,0.18) 0%, transparent 70%)",
            boxShadow: isMagnetic
              ? "0 0 28px rgba(212,169,106,0.38)"
              : "0 0 14px rgba(255,150,20,0.22)",
          }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        />

        {/*
          Candle + Flame SVG — viewBox 0 0 18 56
          Layout: flame (y 0–16) · wick (y 14–18) · wax (y 17–18) · body (y 17–50) · base (y 49–54)
          Flame tip ≈ y=2  →  2/56 ≈ 3.57%
          transformOrigin "50% 3.57%" + translateY "-3.57%" keeps tip at cursor hotspot
          rotate "-22deg" gives the natural cursor lean
        */}
        <motion.svg
          viewBox="0 0 18 56"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            skewX: flameSkewX,
            rotate: "-22deg",
            transformOrigin: "50% 3.57%",
            transformBox: "fill-box",
            position: "absolute",
            translateX: "-50%",
            translateY: "-3.57%",
            filter: "drop-shadow(0 0 5px rgba(255,145,10,0.50))",
            overflow: "visible",
          }}
          animate={{
            width:  isMagnetic ? 15 : 11,
            height: isMagnetic ? 47 : 34,
          }}
          transition={{ type: "spring", stiffness: 380, damping: 24 }}
        >
          {/* -- FLAME -- */}
          {/* Wide outer glow ellipse */}
          <motion.ellipse
            cx="9" cy="12" rx="7" ry="5"
            fill="rgba(255,175,30,0.13)"
            style={{ x: glowX }}
          />
          {/* Outer flame body */}
          <motion.path
            d={flamePath}
            fill="#ffb830"
            opacity={0.92}
          />
          {/* Bright inner core */}
          <motion.path
            d={flamePath}
            fill="#ffdc70"
            opacity={0.52}
            style={{
              scaleY: 0.65,
              scaleX: 0.60,
              transformOrigin: "50% 90%",
              transformBox: "fill-box",
            }}
          />
          {/* White-hot tip */}
          <motion.ellipse
            cx="9" cy="7"
            rx="1.2" ry="2"
            fill="#fff8e8"
            opacity={0.88}
            style={{ x: glowX, y: -1 }}
          />

          {/* -- WICK -- */}
          <line
            x1="9" y1="14.5" x2="9" y2="18"
            stroke="#2e1a06"
            strokeWidth="0.85"
            strokeLinecap="round"
          />

          {/* -- WAX SURFACE -- */}
          <ellipse cx="9" cy="17.5" rx="3.8" ry="1.3" fill="#221208" />
          {/* subtle warm highlight on wax */}
          <ellipse cx="7.4" cy="17.0" rx="1.3" ry="0.5" fill="rgba(255,210,120,0.07)" />

          {/* -- CANDLE BODY -- thin black matte pillar -- */}
          <rect x="5.1" y="17" width="7.8" height="33" rx="1.2" fill="#1b0f06" />
          {/* left-edge candle-light reflection */}
          <rect x="5.1" y="18" width="1.5" height="31" rx="0.75" fill="rgba(255,195,70,0.045)" />
          {/* right-edge depth shadow */}
          <rect x="11.4" y="18" width="1.5" height="31" rx="0.75" fill="rgba(0,0,0,0.22)" />

          {/* -- BASE / FOOT -- */}
          <rect x="4.3" y="49" width="9.4" height="4.5" rx="1.3" fill="#150c05" />
          <rect x="4.3" y="49" width="9.4" height="0.9" rx="1.3" fill="rgba(255,195,70,0.04)" />
        </motion.svg>
      </motion.div>
    </div>
  );
}
