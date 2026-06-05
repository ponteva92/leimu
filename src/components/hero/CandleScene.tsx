"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Candle scene (React Three Fiber)
   ------------------------------------------------------------------------
   · candleGroup (z 0)   — the candle photo, lit; gentle magnetic tilt
       └ flameGroup       — procedural shader flame at the wick
   · <HeatMirage/>         — the white LEIMU logo refracted by rising heat-haze
                             + a warm scent aura (sibling of the candle so it
                             stays put while the candle tilts)

   The candle AUTO-IGNITES on mount: `ignite` ramps 0→1, fading in the flame
   and the candle's lit shading. No click, no reveal, no pulse.
   ════════════════════════════════════════════════════════════════════════ */

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { baseVert, flameFrag, candleFrag } from "./shaders";
import { HeatMirage } from "./HeatMirage";

// hero-candle-black.png has a fully transparent background; "kynttilä musta.png"
// (candle-black.png) had a checkerboard baked into opaque pixels → checker artifact.
const candleUrl = "/images/hero-candle-black.png";

/* candle 864×1184 → 0.7297 aspect */
const CANDLE_H = 2.9; // smaller → whole lid clears the bottom, headroom above for logo + smoke
const CANDLE_W = CANDLE_H * 0.7297;

const CONFIG = {
  groupX: 0, // centred in the canvas → candle, smoke column & DOM logo share one axis
  groupY: -0.5, // sits low-centre; the upper frame is the logo + smoke "veil" zone
  // wick measured from hero-candle-black.png (centroid frac x0.481, y0.154)
  wickX: (0.481 - 0.5) * CANDLE_W + 0.036, // nudged right onto the wick
  wickY: (0.5 - 0.185) * CANDLE_H - 0.196, // nudged down so flame + smoke sit on the wick tip
  flameW: 0.36, // small flame
  flameH: 0.54,
  flameFollow: 0.03, // barely follows the cursor
  // calm magnetic tilt — the smoke is the interactive element now
  tiltY: 0.02,
  tiltX: 0.014,
  pullX: 0.012,
  pullY: 0.008,
};

/* Flame anchor — the mirage logo + scent aura sit above this. */
const FLAME_X = CONFIG.groupX + CONFIG.wickX;
const FLAME_TIP_Y = CONFIG.groupY + CONFIG.wickY + CONFIG.flameH;

const damp = THREE.MathUtils.damp;

export function CandleScene({
  isMobile,
  reducedMotion,
  onReady,
}: {
  isMobile: boolean;
  reducedMotion: boolean;
  onReady?: () => void;
}) {
  const candleTex = useLoader(THREE.TextureLoader, candleUrl);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    candleTex.colorSpace = THREE.SRGBColorSpace;
    candleTex.anisotropy = 8;
    candleTex.needsUpdate = true;
  }, [candleTex]);

  const candleGroup = useRef<THREE.Group>(null);
  const flameGroup = useRef<THREE.Group>(null);
  const ignite = useRef(0); // auto-ramps 0→1 on mount

  const flameU = useMemo(
    () => ({ uTime: { value: 0 }, uIgnite: { value: 0 }, uFlicker: { value: 0 } }),
    [],
  );

  const candleU = useMemo(
    () => ({
      uMap: { value: candleTex },
      uLightPos: { value: new THREE.Vector2(0.5, 0.6) },
      uLit: { value: 0 },
      uFlicker: { value: 1 },
      uAspect: { value: CANDLE_W / CANDLE_H },
      uRadius: { value: 0.34 },
      uWarm: { value: new THREE.Color(1.0, 0.82, 0.55) },
    }),
    [candleTex],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    // auto-ignite — smooth fade-in on load
    ignite.current = damp(ignite.current, 1, 1.4, dt);

    const flicker = reducedMotion
      ? 0
      : (Math.sin(t * 8.0) * 0.5 + Math.sin(t * 17.0 + 1.3) * 0.3 + Math.sin(t * 29.0 + 4.0) * 0.2) * 0.5;

    flameU.uIgnite.value = ignite.current;
    flameU.uTime.value = t;
    flameU.uFlicker.value = Math.max(0, flicker);

    const px = isMobile || reducedMotion ? 0 : state.pointer.x;
    const py = isMobile || reducedMotion ? 0 : state.pointer.y;

    if (candleGroup.current) {
      const g = candleGroup.current;
      const idleSway = isMobile && !reducedMotion ? Math.sin(t * 0.6) * 0.015 : 0;
      g.rotation.y = damp(g.rotation.y, px * CONFIG.tiltY + idleSway, 6, dt);
      g.rotation.x = damp(g.rotation.x, -py * CONFIG.tiltX, 6, dt);
      g.position.x = damp(g.position.x, CONFIG.groupX + px * CONFIG.pullX, 6, dt);
      g.position.y = damp(g.position.y, CONFIG.groupY + py * CONFIG.pullY, 6, dt);
    }

    if (flameGroup.current) {
      const fg = flameGroup.current;
      fg.position.x = damp(fg.position.x, CONFIG.wickX + px * CONFIG.flameFollow, 9, dt);
      fg.position.y = damp(fg.position.y, CONFIG.wickY + py * CONFIG.flameFollow * 0.4, 9, dt);
    }

    // candle stays at full daylight brightness — no dark lit-shading / mask
    candleU.uLit.value = 0;
  });

  return (
    <group>
      {/* heat mirage + scent aura — sibling of the candle so it stays stable while it tilts */}
      <HeatMirage isMobile={isMobile} reducedMotion={reducedMotion} centerX={FLAME_X} />

      <group ref={candleGroup} position={[CONFIG.groupX, CONFIG.groupY, 0]}>
        <mesh renderOrder={2}>
          <planeGeometry args={[CANDLE_W, CANDLE_H]} />
          <shaderMaterial
            vertexShader={baseVert}
            fragmentShader={candleFrag}
            uniforms={candleU}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        <group ref={flameGroup} position={[CONFIG.wickX, CONFIG.wickY, 0.06]}>
          <mesh position={[0, CONFIG.flameH / 2, 0]} renderOrder={3}>
            <planeGeometry args={[CONFIG.flameW, CONFIG.flameH]} />
            <shaderMaterial
              vertexShader={baseVert}
              fragmentShader={flameFrag}
              uniforms={flameU}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}
