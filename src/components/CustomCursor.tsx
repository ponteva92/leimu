"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useStore } from "@/context/store";
import { EASE_PREMIUM } from "@/lib/motionVariants";

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
       → glowX      (glow ellipse and bloom follow lean)

   Particle trail: a fixed pool of DOM nodes animated imperatively via
   WAAPI on emission — zero React re-renders in the pointer path.

   No CSS filters. The flame path changes every frame, so a filter would
   re-run over the whole candle on every frame. The candle's orange glow
   is a baked image plus a gradient bloom, and the particles are soft
   gradients. Each is fitted to the equivalent drop-shadow or blur.

   prefers-reduced-motion: renders nothing; the system cursor stays.
══════════════════════════════════════════════════════════════════════ */

const POOL_SIZE = 10;

export function CustomCursor() {
  const cursorType = useStore((s) => s.cursorType);
  const isMagnetic = cursorType === "magnetic";

  /* ── Reduced motion — the whole flame collapses to the OS cursor ── */
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse), (max-width: 767px)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

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

  /* ── Particle pool — imperative refs, no state in the pointer path ── */
  const poolRef  = useRef<(HTMLDivElement | null)[]>([]);
  const poolIdx  = useRef(0);
  const lastPRef = useRef(0);

  /* Enable the global cursor:none rule only while the flame is live,
     so a JS failure (or reduced motion) leaves the normal system cursor. */
  useEffect(() => {
    if (reduced) return;
    document.documentElement.classList.add("cursor-ready");
    return () => document.documentElement.classList.remove("cursor-ready");
  }, [reduced]);

  /* ── Triple-harmonic RAF flicker ── */
  useEffect(() => {
    if (reduced) return;
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
  }, [flickerOff, reduced]);

  /* ── Mouse tracking + velocity → rawLean + particle emission ── */
  useEffect(() => {
    if (reduced) return;
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

      /* Particle emission — throttled to ~30 fps, WAAPI on pooled nodes */
      if (now - lastPRef.current > 30) {
        lastPRef.current = now;
        const node = poolRef.current[poolIdx.current];
        poolIdx.current = (poolIdx.current + 1) % POOL_SIZE;
        if (node) {
          node.style.left = `${e.clientX}px`;
          node.style.top  = `${e.clientY}px`;
          node.animate(
            [
              { opacity: 0.38, transform: "translate(-50%, -50%) scale(1)" },
              { opacity: 0, transform: "translate(-50%, calc(-50% - 12px)) scale(0.15)" },
            ],
            { duration: 650, easing: "ease-out", fill: "forwards" },
          );
        }
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my, rawLean, reduced]);

  if (reduced) return null;

  return (
    /* hidden on mobile (no hover), shown md+ */
    <div
      className="hidden md:block fixed inset-0 pointer-events-none z-[var(--z-cursor)]"
      aria-hidden="true"
    >
      {/* ── Scent-trail particle pool ──────────────────────────────── */}
      {Array.from({ length: POOL_SIZE }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { poolRef.current[i] = el; }}
          className="fixed pointer-events-none"
          style={{
            left: -400,
            top: -400,
            width: 18,
            height: 22,
            opacity: 0,
            /* A 7×9 gradient under blur(2.5px), baked into the stops */
            background:
              "radial-gradient(9px 10px at 50% 54.5%, rgba(255,180,40,0.14) 0%, rgba(255,180,40,0.113) 20%, rgba(255,180,40,0.062) 40%, rgba(255,180,40,0.022) 60%, rgba(255,180,40,0.005) 80%, transparent 100%)",
          }}
        />
      ))}

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
        {/* Ambient glow halo. It keeps the magnetic size (64px) and scales
            down for the resting look, while the two tints cross-fade, so
            only transform and opacity animate. The resting layer's glow is
            drawn at 64px scale: 24px here reads as 14px once scaled. */}
        <motion.div
          className="absolute h-16 w-16 rounded-full"
          style={{
            translateX: "-50%",
            translateY: "-50%",
            x: glowX,
            opacity: glowOpacity,
          }}
          animate={{ scale: isMagnetic ? 1 : 38 / 64 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(212,169,106,0.28) 0%, transparent 68%)",
              boxShadow: "0 0 28px rgba(212,169,106,0.38)",
            }}
            animate={{ opacity: isMagnetic ? 1 : 0 }}
            transition={{ duration: 0.3, ease: EASE_PREMIUM }}
          />
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,165,30,0.18) 0%, transparent 70%)",
              boxShadow: "0 0 24px rgba(255,150,20,0.22)",
            }}
            animate={{ opacity: isMagnetic ? 0 : 1 }}
            transition={{ duration: 0.3, ease: EASE_PREMIUM }}
          />
        </motion.div>

        {/*
          Candle + Flame SVG — viewBox 0 0 18 56
          Layout: flame (y 0–16) · wick (y 14–18) · wax (y 17–18) · body (y 17–50) · base (y 49–54)
          Flame tip ≈ y=2  →  2/56 ≈ 3.57%
          transformOrigin "50% 3.57%" + translateY "-3.57%" keeps tip at cursor hotspot
          rotate "-22deg" gives the natural cursor lean
          The candle keeps its magnetic size and scales about the tip, so
          the hotspot never moves and only transform animates.
        */}
        <motion.svg
          viewBox="0 0 18 56"
          width={15}
          height={47}
          xmlns="http://www.w3.org/2000/svg"
          style={{
            skewX: flameSkewX,
            rotate: "-22deg",
            transformOrigin: "50% 3.57%",
            transformBox: "fill-box",
            position: "absolute",
            translateX: "-50%",
            translateY: "-3.57%",
            overflow: "visible",
          }}
          animate={{ scale: isMagnetic ? 1 : 11 / 15 }}
          transition={{ type: "spring", stiffness: 380, damping: 24 }}
        >
          {/* -- GLOW -- drop-shadow(0 0 5px rgba(255,145,10,0.5)) in two
              parts. The image is that shadow of the wick, wax and body,
              pre-rendered (1 texel per unit). The bloom is fitted to the
              flame's share of it and follows the lean with the flame. */}
          <defs>
            <radialGradient id="cursor-flame-bloom">
              <stop offset="0%" stopColor="rgb(255,145,10)" stopOpacity={0.064} />
              <stop offset="10%" stopColor="rgb(255,145,10)" stopOpacity={0.06} />
              <stop offset="20%" stopColor="rgb(255,145,10)" stopOpacity={0.051} />
              <stop offset="30%" stopColor="rgb(255,145,10)" stopOpacity={0.039} />
              <stop offset="40%" stopColor="rgb(255,145,10)" stopOpacity={0.026} />
              <stop offset="50%" stopColor="rgb(255,145,10)" stopOpacity={0.016} />
              <stop offset="60%" stopColor="rgb(255,145,10)" stopOpacity={0.009} />
              <stop offset="70%" stopColor="rgb(255,145,10)" stopOpacity={0.004} />
              <stop offset="80%" stopColor="rgb(255,145,10)" stopOpacity={0.002} />
              <stop offset="100%" stopColor="rgb(255,145,10)" stopOpacity={0} />
            </radialGradient>
          </defs>
          <image
            href="/images/cursor-glow.webp"
            x="-14" y="-4" width="46" height="76"
            preserveAspectRatio="none"
          />
          <motion.ellipse
            cx="9" cy="10.5" rx="21" ry="23"
            fill="url(#cursor-flame-bloom)"
            style={{ x: glowX }}
          />

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
