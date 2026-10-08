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

import { Suspense, useState } from "react";
import Image from "next/image";
import { Canvas } from "@react-three/fiber";
import { CandleScene } from "./CandleScene";
import { SafeWebGL } from "@/components/SafeWebGL";
import { ShaderWarmup } from "@/components/ShaderWarmup";
import { useStore } from "@/context/store";

function CandleFallback() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-[6%]">
      <Image
        src="/images/hero-candle-black.png"
        alt=""
        width={720}
        height={960}
        className="h-[88%] w-auto object-contain"
        priority
      />
    </div>
  );
}

export default function CandleCanvas({
  isMobile,
  reducedMotion,
  onReady,
}: {
  isMobile: boolean;
  reducedMotion: boolean;
  onReady?: () => void;
}) {
  // False once the hero is covered: the render loop parks on its last frame.
  const active = useStore((s) => s.heroActive);
  // The loop waits until the shaders are built (ShaderWarmup).
  const [compiled, setCompiled] = useState(false);

  // Textured quads gain nothing from MSAA, and dpr stops at 1.5 to bound
  // the per-pixel cost of the flame and heat-haze shaders. The canvas
  // re-measures only when its box resizes, never on scroll, and by offset
  // size, which CSS transforms leave alone.
  return (
    <div className="absolute inset-0">
      <SafeWebGL fallback={<CandleFallback />}>
        <Canvas
          dpr={[1.25, 1.5]}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          camera={{ fov: 32, position: [0, 0, 8], near: 0.1, far: 50 }}
          frameloop={active && compiled ? "always" : "never"}
          resize={{ scroll: false, offsetSize: true }}
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <Suspense fallback={null}>
            <CandleScene isMobile={isMobile} reducedMotion={reducedMotion} onReady={onReady} />
            <ShaderWarmup onReady={setCompiled} />
          </Suspense>
        </Canvas>
      </SafeWebGL>
    </div>
  );
}
