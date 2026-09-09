"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Hero background, WebGL layer
   ------------------------------------------------------------------------
   A single fullscreen quad running heroBgShaders. Lazy-loaded (ssr:false) by
   HeroBackground so Three.js never ships in the initial bundle and never runs
   on the server. Capped DPR + a cheap shader keep it inside a 16 ms frame.
   uOpacity is damped 0→1 so it fades in over the CSS gradient underneath —
   no flash/blink on load.
   ════════════════════════════════════════════════════════════════════════ */

import { useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { bgVert, bgFrag } from "./heroBgShaders";

function MeshPlane() {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uOpacity: { value: 0 },
      uBase: { value: new THREE.Color("#16140F") },
      uAmber: { value: new THREE.Color("#D89456") },
      uCream: { value: new THREE.Color("#F2ECDF") },
      uDeep: { value: new THREE.Color("#0C0A08") },
    }),
    [],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    uniforms.uTime.value += dt;
    uniforms.uAspect.value = state.size.width / Math.max(1, state.size.height);
    // Fade in on first paint — no pop.
    uniforms.uOpacity.value = THREE.MathUtils.damp(uniforms.uOpacity.value, 1, 2.2, dt);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={bgVert}
        fragmentShader={bgFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </mesh>
  );
}

export default function HeroBackgroundGL() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      frameloop="always"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
    >
      <MeshPlane />
    </Canvas>
  );
}
