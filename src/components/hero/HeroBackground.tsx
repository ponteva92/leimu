"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Hero background (wrapper)
   ------------------------------------------------------------------------
   Layers a CSS warm-orb gradient (always present) under the animated WebGL
   shader. The gradient is both the no-flash backdrop (paints instantly, in
   palette, before the canvas mounts) AND the fallback when WebGL is missing
   or the user prefers reduced motion. The WebGL layer is lazy + ssr:false.
   ════════════════════════════════════════════════════════════════════════ */

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const HeroBackgroundGL = dynamic(() => import("./HeroBackgroundGL"), {
  ssr: false,
  loading: () => null,
});

/* Ember-orb gradient in the cinematic hero palette — backdrop + fallback. */
const FALLBACK_GRADIENT = `
  radial-gradient(58% 50% at 28% 58%, rgba(216,148,86,0.22), transparent 70%),
  radial-gradient(50% 50% at 78% 28%, rgba(216,148,86,0.14), transparent 72%),
  radial-gradient(140% 120% at 50% 40%, #16140F 0%, #0C0A08 100%)
`;

export function HeroBackground() {
  // Stays false during SSR + first paint (only the gradient shows → no flash).
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    let webglOK = false;
    try {
      const c = document.createElement("canvas");
      webglOK = !!(
        window.WebGLRenderingContext &&
        (c.getContext("webgl") || c.getContext("experimental-webgl"))
      );
    } catch {
      webglOK = false;
    }

    const sync = () => setAnimate(webglOK && !mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: FALLBACK_GRADIENT }} />
      {animate && <HeroBackgroundGL />}
    </div>
  );
}
