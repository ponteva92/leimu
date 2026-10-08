"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Liquid Dark (R3F background for the Materials section)
   ------------------------------------------------------------------------
   A subtle dark caustics canvas behind the materials grid — the surface of
   melted soy wax catching dim light. Opaque, very low-contrast, evolves with
   uTime + drifts with uMouse. The render loop runs only while the canvas can
   be seen and its chapter holds it (`active`); under reduced motion it draws
   one still frame. Lazy-loaded (ssr:false).
   ════════════════════════════════════════════════════════════════════════ */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useInView } from "framer-motion";
import * as THREE from "three";
import { liquidVert, liquidFrag } from "./liquidDarkShaders";
import { SafeWebGL } from "@/components/SafeWebGL";
import { ShaderWarmup } from "@/components/ShaderWarmup";
import { REDUCE_QUERY } from "@/lib/pin";

/* The field is soft and dim, so it upscales from a small buffer unseen, and
   three fbm stacks per pixel stay cheap at any window size. */
const DPR = 0.6;
const GLOW = 0.65;
const damp = THREE.MathUtils.damp;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(REDUCE_QUERY).matches;
}

function Caustics({ reducedMotion }: { reducedMotion: boolean }) {
  // Numbers, so only a real resize re-renders the scene.
  const vw = useThree((s) => s.viewport.width);
  const vh = useThree((s) => s.viewport.height);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uBase: { value: new THREE.Color("#1A1814") }, // --ink
      uHi: { value: new THREE.Color("#3a2f22") }, // faint warm highlight
    }),
    [],
  );

  useFrame((state, delta) => {
    // Reduced motion renders on demand: one frame, already at full glow.
    if (reducedMotion) {
      uniforms.uOpacity.value = GLOW;
      return;
    }
    const dt = Math.min(delta, 0.05);
    uniforms.uTime.value += dt;
    uniforms.uOpacity.value = damp(uniforms.uOpacity.value, GLOW, 1.5, dt);
    uniforms.uMouse.value.x = damp(uniforms.uMouse.value.x, state.pointer.x, 3, dt);
    uniforms.uMouse.value.y = damp(uniforms.uMouse.value.y, state.pointer.y, 3, dt);
  });

  return (
    <mesh scale={[vw, vh, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial vertexShader={liquidVert} fragmentShader={liquidFrag} uniforms={uniforms} toneMapped={false} />
    </mesh>
  );
}

/* The pointer reads offsetX/Y, so the canvas needs no bounds tracked on
   scroll; it measures only on resize, and by offset size, so a scaled stage
   never reads as a resize. */
export default function LiquidDark({ active = true }: { active?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { margin: "200px" });
  // Client only (ssr:false), so the first render already knows the
  // motion preference.
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  // The loop waits until the shaders are built (ShaderWarmup).
  const [compiled, setCompiled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(REDUCE_QUERY);
    const sync = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  let frameloop: "always" | "demand" | "never" = "never";
  if (compiled && inView && active) frameloop = reducedMotion ? "demand" : "always";

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden="true">
      <SafeWebGL fallback={null}>
        <Canvas
          frameloop={frameloop}
          dpr={DPR}
          gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
          camera={{ fov: 40, position: [0, 0, 4], near: 0.1, far: 20 }}
          resize={{ scroll: false, offsetSize: true }}
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <Suspense fallback={null}>
            <Caustics reducedMotion={reducedMotion} />
            <ShaderWarmup onReady={setCompiled} />
          </Suspense>
        </Canvas>
      </SafeWebGL>
    </div>
  );
}
