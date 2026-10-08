"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Tuotteet still-life canvas (R3F)
   ------------------------------------------------------------------------
   A flat plane shows the products photo through a ShaderMaterial (see
   tuotteetHeroShaders), scaled to cover the frame. On mount the photo melts
   out of dark wax; `dusk` dims it while the wax seals keep their glow. The
   photo decodes off the main thread, and the render loop runs only while the
   chapter can be seen. Loaded on demand, never on the server or a phone.
   ════════════════════════════════════════════════════════════════════════ */

import { Suspense, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { ShaderWarmup } from "@/components/ShaderWarmup";
import { useBitmapTexture } from "@/lib/useBitmapTexture";
import { heroImgVert, heroImgFrag, REVEAL_END } from "./tuotteetHeroShaders";
import { HERO_ASPECT as IMG_ASPECT, HERO_SRC as IMG_SRC } from "./HeroPhoto";

const damp = THREE.MathUtils.damp;

export type HeroImageCanvasProps = {
  /** 0 to 1: how far the photo has dimmed toward dusk. */
  dusk: MotionValue<number>;
  /** False while the chapter is out of sight; the loop parks. */
  active: boolean;
  /** Reduced motion: the photo shows at once, and frames render only on change. */
  still: boolean;
};

function HeroPlane({ dusk, still }: Omit<HeroImageCanvasProps, "active">) {
  // The shader composites in gamma space, so the photo is sampled as stored.
  const tex = useBitmapTexture(IMG_SRC, { colorSpace: THREE.NoColorSpace });
  // Cover-fit, exactly as the photo's object-cover beneath, so the two
  // register and the melt uncovers nothing new. A number, so only a resize
  // re-renders.
  const cover = useThree((s) => Math.max(s.viewport.width / IMG_ASPECT, s.viewport.height));

  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uScroll: { value: 0 },
    }),
    [tex],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    uniforms.uTime.value += dt;
    uniforms.uReveal.value = still
      ? REVEAL_END
      : damp(uniforms.uReveal.value, REVEAL_END, 0.9, dt);
    uniforms.uScroll.value = dusk.get();
  });

  return (
    <mesh scale={[cover, cover, 1]}>
      <planeGeometry args={[IMG_ASPECT, 1, 1, 1]} />
      <shaderMaterial
        vertexShader={heroImgVert}
        fragmentShader={heroImgFrag}
        uniforms={uniforms}
        toneMapped={false}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/* A textured quad gains nothing from MSAA, and dpr stops at 1.5 to bound the
   per-pixel cost. The canvas takes no pointer input, so it measures itself
   only on resize, never after a scroll, and by offset size, so the stage's
   recede scale never reads as a resize. */
export default function HeroImageCanvas({ dusk, active, still }: HeroImageCanvasProps) {
  // The loop waits until the shaders are built (ShaderWarmup).
  const [compiled, setCompiled] = useState(false);
  let frameloop: "always" | "demand" | "never" = "never";
  if (compiled) frameloop = still ? "demand" : active ? "always" : "never";

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        camera={{ fov: 40, position: [0, 0, 4], near: 0.1, far: 20 }}
        frameloop={frameloop}
        resize={{ offsetSize: true, scroll: false }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <Suspense fallback={null}>
          <HeroPlane dusk={dusk} still={still} />
          <ShaderWarmup onReady={setCompiled} />
        </Suspense>
      </Canvas>
    </div>
  );
}
