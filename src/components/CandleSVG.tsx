"use client";

import { useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { JarColor } from "@/types";

/**
 * LEIMU CandleSVG — Physics-based flame
 *
 * Velocity → morphing pipeline:
 * 1. mousemove measures cursor velocity (px/ms) relative to the candle rect.
 * 2. Velocity maps to rawLean (MotionValue, range ±1.2).
 *    Fast right-moving cursor → negative lean (flame trails left).
 * 3. rawLean feeds an underdamped useSpring (stiffness 80, damping 6, mass 0.2).
 *    Low damping ratio ≈ 0.42 → ~2 natural oscillations → realistic elastic bounce.
 * 4. Triple-harmonic RAF loop writes organic flicker to flickerOff.
 * 5. totalLean = springLean + flickerOff drives:
 *      flamePath  — dynamic SVG cubic-bezier d string (no React re-renders)
 *      flameSkewX — secondary CSS skewX on flame group
 *      glowShiftX / innerShiftX/Y — glow and core follow the lean
 */

interface CandleSVGProps {
  jar?: JarColor;
  waxColor?: string;
  label?: string;
  className?: string;
  animate?: boolean;
}

const JAR_STYLES: Record<
  JarColor,
  { fill: string; stroke: string; textColor: string; lidFill: string }
> = {
  white: { fill: "#fafaf7", stroke: "#d8d0bf", textColor: "#1a1814", lidFill: "#8b6f47" },
  green: { fill: "#5C7C5C", stroke: "#4A6A4A", textColor: "#fafaf7", lidFill: "#8b6f47" },
  red:   { fill: "#7C3A3A", stroke: "#6A2A2A", textColor: "#fafaf7", lidFill: "#8b6f47" },
};

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}

/**
 * Build a smooth two-bezier flame path from a lean value.
 * lean = 0  → perfectly upright
 * lean = +1 → tip drifts 6px right (wind from left)
 * lean = -1 → tip drifts 6px left  (wind from right)
 */
function buildFlamePath(lean: number): string {
  const bx = 60, by = 57;
  const tipX = 60 + lean * 6;
  const tipY = 46 - Math.abs(lean) * 1.4;

  const lc1x = bx - 3.5 + lean * 0.4,  lc1y = by - 3.5;
  const lc2x = tipX - 2.2 + lean * 0.6, lc2y = tipY + 5.5;
  const rc1x = tipX + 2.2 + lean * 0.6, rc1y = tipY + 5.5;
  const rc2x = bx + 3.5 + lean * 0.4,  rc2y = by - 3.5;

  const f = (n: number) => n.toFixed(2);
  return (
    `M ${f(bx)},${f(by)} ` +
    `C ${f(lc1x)},${f(lc1y)} ${f(lc2x)},${f(lc2y)} ${f(tipX)},${f(tipY)} ` +
    `C ${f(rc1x)},${f(rc1y)} ${f(rc2x)},${f(rc2y)} ${f(bx)},${f(by)} Z`
  );
}

export function CandleSVG({
  jar = "white",
  waxColor = "#c47a3a",
  label = "LEIMU",
  className = "",
  animate = true,
}: CandleSVGProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const uid = jar;

  /* ── MotionValues — always at top level ── */
  const rawLean    = useMotionValue(0);
  const flickerOff = useMotionValue(0);
  const springLean = useSpring(rawLean, { stiffness: 80, damping: 6, mass: 0.2 });
  const totalLean  = useTransform(
    [springLean, flickerOff] as const,
    ([l, f]) => (l as number) + (f as number),
  );
  const flamePath   = useTransform(totalLean, buildFlamePath);
  const flameSkewX  = useTransform(totalLean, (v) => `${v * 14}deg`);
  const glowShiftX  = useTransform(totalLean, (v) => v * 8);
  const innerShiftX = useTransform(totalLean, (v) => v * 5);
  const innerShiftY = useTransform(totalLean, (v) => -(Math.abs(v) * 1.2));

  /* ── Mouse velocity → rawLean ── */
  useEffect(() => {
    if (!animate) return;
    let prevX = 0;
    let prevT = performance.now();

    const onMove = (e: MouseEvent) => {
      const rect = svgRef.current?.getBoundingClientRect();
      const now = performance.now();
      const dt = Math.max(now - prevT, 4);
      const vx = (e.clientX - prevX) / dt;
      prevX = e.clientX;
      prevT = now;
      if (!rect) return;
      const dist = Math.abs(e.clientX - (rect.left + rect.width / 2));
      const influence = Math.max(0, 1 - dist / (rect.width * 4));
      if (influence > 0.01) {
        rawLean.set(clamp(-vx * 0.55 * influence, -1.2, 1.2));
      } else {
        rawLean.set(rawLean.get() * 0.95);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [animate, rawLean]);

  /* ── Triple-harmonic flicker via RAF ── */
  useEffect(() => {
    if (!animate) return;
    let id: number;
    const t0 = performance.now();
    const tick = () => {
      const t = (performance.now() - t0) * 0.001;
      flickerOff.set(
        Math.sin(t * 4.3) * 0.075
        + Math.sin(t * 9.1 + 1.2) * 0.032
        + Math.sin(t * 13.7 + 2.4) * 0.016,
      );
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [animate, flickerOff]);

  const s = JAR_STYLES[jar];

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 120 200"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full ${className}`}
      role="img"
      aria-label={`LEIMU kynttilaä — ${jar} purkki`}
    >
      <defs>
        <linearGradient id={`lid-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#a0834f" />
          <stop offset="40%"  stopColor={s.lidFill} />
          <stop offset="100%" stopColor="#6b5030" />
        </linearGradient>
        <linearGradient id={`jar-gloss-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
          <stop offset="30%"  stopColor="rgba(255,255,255,0.06)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
        </linearGradient>
        <linearGradient id={`wax-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={waxColor} stopOpacity="0.95" />
          <stop offset="100%" stopColor={waxColor} stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id={`flame-glow-${uid}`} cx="50%" cy="75%" r="50%">
          <stop offset="0%"   stopColor="#ffcc55" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#ffcc55" stopOpacity="0" />
        </radialGradient>
        <filter id={`flame-blur-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.9" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Wick */}
      <line x1="60" y1="57" x2="60" y2="65"
        stroke="#2a1f0e" strokeWidth="1.2" strokeLinecap="round" />

      {/* Flame assembly */}
      {animate ? (
        <motion.g style={{ skewX: flameSkewX, transformOrigin: "60px 57px", transformBox: "fill-box" }}>
          <motion.ellipse
            cx="60" cy="51" rx="11" ry="8"
            fill={`url(#flame-glow-${uid})`}
            style={{ x: glowShiftX }}
          />
          <motion.path d={flamePath} fill="#ffb830" filter={`url(#flame-blur-${uid})`} />
          <motion.path
            d={flamePath} fill="#ffcf60" opacity={0.55}
            style={{ scaleY: 0.7, scaleX: 0.65, transformOrigin: "60px 57px", transformBox: "fill-box" }}
          />
          <motion.ellipse
            cx="60" cy="51" rx="1.8" ry="2.8"
            fill="#fff8e8" opacity={0.92}
            style={{ x: innerShiftX, y: innerShiftY }}
          />
        </motion.g>
      ) : (
        <>
          <ellipse cx="60" cy="51" rx="11" ry="8" fill={`url(#flame-glow-${uid})`} />
          <path d={buildFlamePath(0)} fill="#ffb830" />
          <ellipse cx="60" cy="51" rx="1.8" ry="2.8" fill="#fff8e8" opacity={0.92} />
        </>
      )}

      {/* Bamboo Lid */}
      <rect x="22" y="65" width="76" height="16" rx="3"
        fill={`url(#lid-${uid})`} stroke="#5a3e20" strokeWidth="0.6" />
      <rect x="22" y="65" width="76" height="3" rx="2" fill="rgba(255,255,255,0.15)" />
      {[71, 75, 79].map((y) => (
        <line key={y} x1="26" y1={y} x2="94" y2={y}
          stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
      ))}
      <rect x="52" y="61" width="16" height="6" rx="2"
        fill={`url(#lid-${uid})`} stroke="#5a3e20" strokeWidth="0.5" />

      {/* Jar Body */}
      <rect x="16" y="81" width="88" height="110" rx="6"
        fill={s.fill} stroke={s.stroke} strokeWidth="1.2" />
      <rect x="16" y="81" width="88" height="110" rx="6"
        fill={`url(#jar-gloss-${uid})`} />

      {/* Wax Surface */}
      <ellipse cx="60" cy="85" rx="41" ry="7" fill={`url(#wax-${uid})`} />

      {/* Label */}
      <rect x="30" y="116" width="60" height="46" rx="3"
        fill="rgba(255,255,255,0.08)" stroke={s.stroke} strokeWidth="0.6" />
      <text x="60" y="137" textAnchor="middle"
        fontFamily="'DM Serif Display', serif"
        fontStyle="italic" fontSize="13" fontWeight="400"
        fill={s.textColor} opacity="0.95">
        {label}
      </text>
      <text x="60" y="150" textAnchor="middle"
        fontFamily="'Space Mono', monospace"
        fontSize="4.5" fontWeight="400"
        fill={s.textColor} opacity="0.55" letterSpacing="1.8">
        CANDLES
      </text>
      <line x1="38" y1="155" x2="82" y2="155"
        stroke={s.textColor} strokeOpacity="0.2" strokeWidth="0.5" />

      {/* Bottom shadow */}
      <ellipse cx="60" cy="188" rx="40" ry="4" fill="rgba(0,0,0,0.06)" />
    </svg>
  );
}
