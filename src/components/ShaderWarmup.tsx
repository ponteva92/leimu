"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Compiles the scene's shaders and uploads its textures before the first
 * frame. A cold first render links every program on the main thread, which
 * froze scrolling for 300–600 ms where a canvas woke up. `compileAsync`
 * links in the driver's background thread (KHR_parallel_shader_compile)
 * and resolves once the programs are ready. The canvas holds its frameloop
 * until `onReady(true)` (a state setter fits), so its first frame finds
 * everything built.
 *
 * Mount it inside the scene's Suspense boundary, after the scene, so it
 * runs only once suspended textures have loaded and every material is in
 * the scene. Without the extension the link still blocks, but at mount,
 * not at the moment a chapter scrolls into view.
 */
export function ShaderWarmup({ onReady }: { onReady: (ready: true) => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    let live = true;
    scene.traverse((obj) => {
      const material = (obj as THREE.Mesh).material;
      if (!(material instanceof THREE.ShaderMaterial)) return;
      for (const uniform of Object.values(material.uniforms)) {
        if (uniform.value instanceof THREE.Texture) gl.initTexture(uniform.value);
      }
    });
    gl.compileAsync(scene, camera)
      .catch(() => undefined)
      .then(() => {
        if (live) onReady(true);
      });
    return () => {
      live = false;
    };
  }, [gl, scene, camera, onReady]);

  return null;
}
