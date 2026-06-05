"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Liquid Dark (R3F background for the Materials section)
   ------------------------------------------------------------------------
   A subtle dark caustics canvas behind the materials grid — the surface of
   melted soy wax catching dim light. Opaque, very low-contrast, evolves with
   uTime + drifts with uMouse. Render loop pauses offscreen; low DPR (it's a
   background). Lazy-loaded (ssr:false).
   ════════════════════════════════════════════════════════════════════════ */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useInView } from "framer-motion";
import * as THREE from "three";
import { liquidVert, liquidFrag } from "./liquidDarkShaders";

const damp = THREE.MathUtils.damp;

function Caustics({ reducedMotion }: { reducedMotion: boolean }) {
  const { viewport } = useThree();

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
    const dt = Math.min(delta, 0.05);
    if (!reducedMotion) uniforms.uTime.value += dt;
    uniforms.uOpacity.value = damp(uniforms.uOpacity.value, 0.65, 1.5, dt);
    uniforms.uMouse.value.x = damp(uniforms.uMouse.value.x, state.pointer.x, 3, dt);
    uniforms.uMouse.value.y = damp(uniforms.uMouse.value.y, state.pointer.y, 3, dt);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial vertexShader={liquidVert} fragmentShader={liquidFrag} uniforms={uniforms} toneMapped={false} />
    </mesh>
  );
}

export default function LiquidDark() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { margin: "200px" });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden="true">
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={[1, 1.25]}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        camera={{ fov: 40, position: [0, 0, 4], near: 0.1, far: 20 }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <Suspense fallback={null}>
          <Caustics reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}
