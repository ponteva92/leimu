"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Tuotteet hero image canvas (R3F)
   ------------------------------------------------------------------------
   A flat image plane shows the products photo through a custom ShaderMaterial
   (see tuotteetHeroShaders). The plane keeps the image aspect and is scaled to
   COVER the viewport. All effects are fragment-side — molten reveal + scroll
   fade-to-dark with emissive golden seals (no geometry deforms). The render
   loop pauses once the hero is scrolled offscreen. Lazy-loaded (ssr:false).
   ════════════════════════════════════════════════════════════════════════ */

import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { heroImgVert, heroImgFrag } from "./tuotteetHeroShaders";

const IMG_SRC = "/images/tuotteet-hero.png";
const IMG_ASPECT = 2244 / 1231; // 1.823

const damp = THREE.MathUtils.damp;

interface HeroProps {
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
  isMobile: boolean;
}

function HeroPlane({ scrollProgress, reducedMotion }: HeroProps) {
  const tex = useLoader(THREE.TextureLoader, IMG_SRC);
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uTime: { value: 0 },
      uReveal: { value: reducedMotion ? 1.3 : 0 },
      uScroll: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // cover-fit: scale the (image-aspect) plane to fill the viewport, slight overscan
  const cover = Math.max(viewport.width / IMG_ASPECT, viewport.height) * 1.06;

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    uniforms.uTime.value += dt;
    if (!reducedMotion) uniforms.uReveal.value = damp(uniforms.uReveal.value, 1.3, 0.9, dt);
    uniforms.uScroll.value = Math.min(1, Math.max(0, scrollProgress.get()));
  });

  return (
    <mesh scale={[cover, cover, 1]}>
      <planeGeometry args={[IMG_ASPECT, 1, 1, 1]} />
      <shaderMaterial
        vertexShader={heroImgVert}
        fragmentShader={heroImgFrag}
        uniforms={uniforms}
        toneMapped={false}
      />
    </mesh>
  );
}

export default function HeroImageCanvas(props: HeroProps) {
  // Pause the render loop once the hero is scrolled offscreen (it's dimmed to 0 by then)
  // → frees the GPU for buttery scroll + smooth video; resumes on scroll-up.
  const [active, setActive] = useState(true);
  useEffect(() => {
    const unsub = props.scrollProgress.on("change", (v) => setActive(v < 0.95));
    return () => unsub();
  }, [props.scrollProgress]);

  // Nudge R3F to measure its container after the dynamic chunk mounts (matches CandleCanvas).
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
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, props.isMobile ? 1.5 : 1.9]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 40, position: [0, 0, 4], near: 0.1, far: 20 }}
      resize={{ offsetSize: true }}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <Suspense fallback={null}>
        <HeroPlane {...props} />
      </Suspense>
    </Canvas>
  );
}
