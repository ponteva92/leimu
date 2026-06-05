"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Heat Mirage & Scent Aura (R3F)
   ------------------------------------------------------------------------
   Sibling of the candle group (stays stable while the candle tilts). Renders
   the white LEIMU logo as a texture plane that shimmers in rising heat-haze,
   wrapped in a warm, additive "scent aura" column. The cursor is ray-cast onto
   the mirage plane and parts the haze, then it recovers smoothly.
   ════════════════════════════════════════════════════════════════════════ */

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { mirageVert, logoMirageFrag, auraFrag, scentFrag } from "./mirageShaders";

const damp = THREE.MathUtils.damp;
const LOGO_SRC = "/images/leimu-logo-white.png";
const LOGO_ASPECT = 530 / 562; // 0.943

export function HeatMirage({
  isMobile = false,
  reducedMotion = false,
  centerX = 0,
  logoY = 1.46,
  logoW = 1.3,
  auraY = 1.5,
  scentY = 1.35,
  z = 0.12,
}: {
  isMobile?: boolean;
  reducedMotion?: boolean;
  centerX?: number;
  logoY?: number;
  logoW?: number;
  auraY?: number;
  scentY?: number;
  z?: number;
}) {
  const tex = useLoader(THREE.TextureLoader, LOGO_SRC);
  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
  }, [tex]);

  const logoH = logoW / LOGO_ASPECT;

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), -z), [z]);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const strength = useRef(0);
  const lastPointer = useRef(new THREE.Vector2());

  const logoU = useMemo(
    () => ({
      uLogo: { value: tex },
      uTime: { value: 0 },
      uOpacity: { value: 0 }, // fades in
      uMouse: { value: new THREE.Vector2(999, 999) },
      uMouseStrength: { value: 0 },
      uMouseRadius: { value: 0.6 },
      uAmp: { value: reducedMotion ? 0 : 0.02 }, // heat-haze strength
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const auraU = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 }, // fades in (ultra-low target)
      uMouse: { value: new THREE.Vector2(999, 999) },
      uMouseStrength: { value: 0 },
      uMouseRadius: { value: 0.6 },
      uColor: { value: new THREE.Color("#C47A3A") }, // warm --accent-2
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const scentU = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 }, // fades in — a VERY small wisp
      uColorA: { value: new THREE.Color("#cfd4d6") }, // light grey
      uColorB: { value: new THREE.Color("#d6e4ee") }, // very light blue
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    if (!reducedMotion) {
      logoU.uTime.value += dt;
      auraU.uTime.value += dt;
      scentU.uTime.value += dt;
    }

    logoU.uOpacity.value = damp(logoU.uOpacity.value, 0.95, 2.0, dt);
    auraU.uOpacity.value = damp(auraU.uOpacity.value, reducedMotion ? 0.1 : 0.16, 2.0, dt);
    scentU.uOpacity.value = damp(scentU.uOpacity.value, reducedMotion ? 0.04 : 0.11, 2.0, dt);

    raycaster.setFromCamera(state.pointer, state.camera);
    if (raycaster.ray.intersectPlane(plane, hit)) {
      logoU.uMouse.value.set(hit.x, hit.y);
      auraU.uMouse.value.set(hit.x, hit.y);
    }

    const moved =
      Math.abs(state.pointer.x - lastPointer.current.x) +
      Math.abs(state.pointer.y - lastPointer.current.y);
    lastPointer.current.set(state.pointer.x, state.pointer.y);
    const target = moved > 0.0008 && !isMobile && !reducedMotion ? 1 : 0;
    strength.current = damp(strength.current, target, target > 0.5 ? 8 : 4, dt); // ramp / smooth recover
    logoU.uMouseStrength.value = strength.current;
    auraU.uMouseStrength.value = strength.current;
  });

  return (
    <group>
      {/* Scent aura — pure warm light, additive, barely-there */}
      <mesh position={[centerX, auraY, z - 0.01]} renderOrder={4}>
        <planeGeometry args={[1.2, 1.8, 1, 1]} />
        <shaderMaterial
          vertexShader={mirageVert}
          fragmentShader={auraFrag}
          uniforms={auraU}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* White logo, refracted by the heat haze */}
      <mesh position={[centerX, logoY, z]} renderOrder={5}>
        <planeGeometry args={[logoW, logoH, 1, 1]} />
        <shaderMaterial
          vertexShader={mirageVert}
          fragmentShader={logoMirageFrag}
          uniforms={logoU}
          transparent
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </mesh>

      {/* Scent — a VERY small pale wisp rising from the wick (light grey ↔ light blue) */}
      <mesh position={[centerX, scentY, z + 0.02]} renderOrder={6}>
        <planeGeometry args={[0.4, 1.4, 1, 1]} />
        <shaderMaterial
          vertexShader={mirageVert}
          fragmentShader={scentFrag}
          uniforms={scentU}
          transparent
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
