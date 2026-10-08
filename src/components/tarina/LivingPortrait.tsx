"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Living Portrait (R3F)
   ------------------------------------------------------------------------
   The founder photo as a WebGL texture: a subtle mouse depth-parallax + a
   gentle whole-plane tilt make it feel slightly 3-D, with floating amber
   embers (dust) drifting in front of and behind it. The chapter
   server-renders the plain photo (PortraitPhoto) under this canvas, so the
   frame is never empty while the chunk loads, and the canvas fades in over
   it. The render loop runs only while the portrait can be seen and its
   chapter holds it (`active`); under reduced motion it draws one still
   frame. Lazy-loaded (ssr:false).
   ════════════════════════════════════════════════════════════════════════ */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useInView } from "framer-motion";
import * as THREE from "three";
import { portraitVert, portraitFrag, dustVert, dustFrag } from "./portraitShaders";
import { SafeWebGL } from "@/components/SafeWebGL";
import { ShaderWarmup } from "@/components/ShaderWarmup";
import { REDUCE_QUERY } from "@/lib/pin";
import { useBitmapTexture } from "@/lib/useBitmapTexture";
import { PORTRAIT_OVERSCAN as OVERSCAN, PORTRAIT_SRC as IMG_SRC } from "./PortraitPhoto";

const IMG_ASPECT = 820 / 1232; // 0.665
const DUST_COUNT = 120;
const damp = THREE.MathUtils.damp;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(REDUCE_QUERY).matches;
}

function Portrait({ reducedMotion }: { reducedMotion: boolean }) {
  // The shader grades in gamma space, so the photo is sampled as stored.
  const tex = useBitmapTexture(IMG_SRC, { anisotropy: 8, colorSpace: THREE.NoColorSpace });
  // Numbers, so only a real resize re-renders the scene.
  const vw = useThree((s) => s.viewport.width);
  const vh = useThree((s) => s.viewport.height);
  const group = useRef<THREE.Group>(null);

  const planeAspect = vw / vh;

  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uOpacity: { value: 0 },
      uImgAspect: { value: IMG_ASPECT },
      uPlaneAspect: { value: planeAspect },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tex],
  );
  uniforms.uPlaneAspect.value = planeAspect;

  const dustGeo = useMemo(() => {
    const pos = new Float32Array(DUST_COUNT * 3);
    const seed = new Float32Array(DUST_COUNT);
    for (let i = 0; i < DUST_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * vw * OVERSCAN;
      pos[i * 3 + 1] = (Math.random() - 0.5) * vh * OVERSCAN;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.9;
      seed[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [vw, vh]);
  useEffect(() => () => dustGeo.dispose(), [dustGeo]);

  const dustU = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 42 },
      uPixelRatio: { value: 1 },
      uColor: { value: new THREE.Color("#f0b35a") }, // warm amber ember
      uOpacity: { value: 0 },
    }),
    [],
  );

  useFrame((state, delta) => {
    dustU.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 2);
    // Reduced motion renders on demand: one still frame, already faded in.
    if (reducedMotion) {
      uniforms.uOpacity.value = 1;
      uniforms.uMouse.value.set(0, 0);
      dustU.uOpacity.value = 0.25;
      group.current?.rotation.set(0, 0, 0);
      return;
    }
    const dt = Math.min(delta, 0.05);
    const px = state.pointer.x;
    const py = state.pointer.y;

    uniforms.uMouse.value.x = damp(uniforms.uMouse.value.x, px, 5, dt);
    uniforms.uMouse.value.y = damp(uniforms.uMouse.value.y, py, 5, dt);
    uniforms.uOpacity.value = damp(uniforms.uOpacity.value, 1, 2.5, dt);

    dustU.uTime.value += dt;
    dustU.uOpacity.value = damp(dustU.uOpacity.value, 0.6, 2.0, dt);

    if (group.current) {
      group.current.rotation.y = damp(group.current.rotation.y, px * 0.06, 5, dt);
      group.current.rotation.x = damp(group.current.rotation.x, -py * 0.045, 5, dt);
    }
  });

  return (
    <group ref={group}>
      <mesh scale={[vw * OVERSCAN, vh * OVERSCAN, 1]}>
        <planeGeometry args={[1, 1, 1, 1]} />
        <shaderMaterial
          vertexShader={portraitVert}
          fragmentShader={portraitFrag}
          uniforms={uniforms}
          transparent
          toneMapped={false}
        />
      </mesh>

      {/* amber dust */}
      <points geometry={dustGeo} renderOrder={2}>
        <shaderMaterial
          vertexShader={dustVert}
          fragmentShader={dustFrag}
          uniforms={dustU}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}

type LivingPortraitProps = {
  /** False while the chapter has the portrait covered; the loop parks. */
  active?: boolean;
};

/* dpr stops at 1.5 and MSAA stays off: the plane is a textured quad and the
   embers are soft sprites, so neither gains from either. The pointer reads
   offsetX/Y, so the canvas needs no bounds tracked on scroll; it measures
   only on resize, and by offset size, so a scaled stage never reads as a
   resize (which would re-render the scene and re-seed the dust). */
export default function LivingPortrait({ active = true }: LivingPortraitProps) {
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
    <div ref={wrapRef} className="absolute inset-0">
      <SafeWebGL fallback={null}>
        <Canvas
          frameloop={frameloop}
          dpr={[1, 1.5]}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          camera={{ fov: 35, position: [0, 0, 4], near: 0.1, far: 20 }}
          resize={{ scroll: false, offsetSize: true }}
          style={{ position: "absolute", inset: 0 }}
        >
          <Suspense fallback={null}>
            <Portrait reducedMotion={reducedMotion} />
            <ShaderWarmup onReady={setCompiled} />
          </Suspense>
        </Canvas>
      </SafeWebGL>
    </div>
  );
}
