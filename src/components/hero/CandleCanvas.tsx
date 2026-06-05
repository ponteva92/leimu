"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Candle <Canvas> boundary
   ------------------------------------------------------------------------
   The WebGL surface for the right half of the hero, lazy-loaded by HeroCandle
   (next/dynamic, ssr:false) so Three.js never ships in the initial bundle.

   No ignite UI — the candle auto-lights. The canvas just tracks the pointer
   (R3F `state.pointer`) so the smoke reacts to the cursor. A transparent
   canvas lets the warm hero background show through.
   ════════════════════════════════════════════════════════════════════════ */

import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { CandleScene } from "./CandleScene";

export default function CandleCanvas({
  isMobile,
  reducedMotion,
  onReady,
}: {
  isMobile: boolean;
  reducedMotion: boolean;
  onReady?: () => void;
}) {
  // Ensure the canvas measures its container after the dynamic chunk mounts.
  useEffect(() => {
    const fire = () => window.dispatchEvent(new Event("resize"));
    const raf = requestAnimationFrame(fire);
    const timer = setTimeout(fire, 150);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ fov: 32, position: [0, 0, 8], near: 0.1, far: 50 }}
        frameloop="always"
        resize={{ offsetSize: true }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <Suspense fallback={null}>
          <CandleScene isMobile={isMobile} reducedMotion={reducedMotion} onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}
