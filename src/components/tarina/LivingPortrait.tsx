"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Living Portrait (R3F)
   ------------------------------------------------------------------------
   The founder photo as a WebGL texture: a subtle mouse depth-parallax + a
   gentle whole-plane tilt make it feel slightly 3-D, with floating amber
   embers (dust) drifting in front of and behind it. The render loop pauses
   when scrolled offscreen. Lazy-loaded (ssr:false).
   ════════════════════════════════════════════════════════════════════════ */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useInView } from "framer-motion";
import * as THREE from "three";
import { portraitVert, portraitFrag, dustVert, dustFrag } from "./portraitShaders";

const IMG_SRC = "/images/ivs-portrait-web.jpg";
const IMG_ASPECT = 820 / 1232; // 0.665
const DUST_COUNT = 120;
const damp = THREE.MathUtils.damp;

function Portrait({ reducedMotion }: { reducedMotion: boolean }) {
  const tex = useLoader(THREE.TextureLoader, IMG_SRC);
  const { viewport } = useThree();
  const group = useRef<THREE.Group>(null);

  useEffect(() => {
    tex.anisotropy = 8;
    tex.needsUpdate = true;
  }, [tex]);

  const planeAspect = viewport.width / viewport.height;

  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uOpacity: { value: 0 },
      uImgAspect: { value: IMG_ASPECT },
      uPlaneAspect: { value: planeAspect },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  uniforms.uPlaneAspect.value = planeAspect;

  const dustGeo = useMemo(() => {
    const pos = new Float32Array(DUST_COUNT * 3);
    const seed = new Float32Array(DUST_COUNT);
    for (let i = 0; i < DUST_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * viewport.width * 1.2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 1.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.9;
      seed[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [viewport.width, viewport.height]);
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
    const dt = Math.min(delta, 0.05);
    const px = reducedMotion ? 0 : state.pointer.x;
    const py = reducedMotion ? 0 : state.pointer.y;

    uniforms.uMouse.value.x = damp(uniforms.uMouse.value.x, px, 5, dt);
    uniforms.uMouse.value.y = damp(uniforms.uMouse.value.y, py, 5, dt);
    uniforms.uOpacity.value = damp(uniforms.uOpacity.value, 1, 2.5, dt);

    dustU.uTime.value += dt;
    dustU.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 2);
    dustU.uOpacity.value = damp(dustU.uOpacity.value, reducedMotion ? 0.25 : 0.6, 2.0, dt);

    if (group.current) {
      group.current.rotation.y = damp(group.current.rotation.y, px * 0.06, 5, dt);
      group.current.rotation.x = damp(group.current.rotation.x, -py * 0.045, 5, dt);
    }
  });

  return (
    <group ref={group}>
      {/* portrait plane — overscanned so the gentle tilt never reveals an edge */}
      <mesh scale={[viewport.width * 1.2, viewport.height * 1.2, 1]}>
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

export default function LivingPortrait() {
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
    <div ref={wrapRef} className="absolute inset-0">
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ fov: 35, position: [0, 0, 4], near: 0.1, far: 20 }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <Suspense fallback={null}>
          <Portrait reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}
