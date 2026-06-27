/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Hero background shader (warm fluid mesh + soft orbs)
   ------------------------------------------------------------------------
   A full-bleed ambient backdrop for the candlelit hero. Domain-warped value
   noise (fluid "mesh") in the brand tan/amber/cream palette, with two slow
   warm orbs drifting through it. Cheap by design: 4-octave value noise, one
   fullscreen quad, capped DPR — comfortably inside a 16 ms frame budget.

   The vertex shader writes clip space directly (gl_Position = position.xy),
   so the [2,2] plane fills the canvas regardless of camera — no matrices,
   auto-responsive. uOpacity ramps 0→1 (damped on the CPU) so it fades in
   instead of popping: no flash on load.
   ════════════════════════════════════════════════════════════════════════ */

export const bgVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const bgFrag = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform float uAspect;
  uniform float uOpacity;
  uniform vec3  uBase;   // tan   #CBB799
  uniform vec3  uAmber;  // amber #C68E58
  uniform vec3  uCream;  // cream #F5F5F0
  uniform vec3  uDeep;   // deep warm shade for troughs

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);          // smoothstep weights
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      v += amp * noise(p);
      p *= 2.0;
      amp *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    uv.x *= uAspect;                            // aspect-correct so noise isn't stretched
    float t = uTime * 0.04;                     // slow, ambient

    // ── domain warp → fluid "mesh" feel ──
    vec2 q = vec2(fbm(uv * 1.5 + t), fbm(uv * 1.5 - t + 5.0));
    vec2 r = vec2(
      fbm(uv * 1.5 + q * 1.2 + t * 1.3 + 1.7),
      fbm(uv * 1.5 + q * 1.2 - t * 1.1 + 9.2)
    );
    float f = fbm(uv * 1.5 + r * 1.4);

    // ── two slow warm orbs ──
    float o1 = smoothstep(0.55, 0.0,
      distance(uv, vec2(0.30 * uAspect + 0.15 * sin(t * 1.3), 0.62 + 0.10 * cos(t * 1.1))));
    float o2 = smoothstep(0.70, 0.0,
      distance(uv, vec2(0.78 * uAspect + 0.12 * cos(t * 0.9), 0.30 + 0.10 * sin(t * 1.4))));

    vec3 col = uBase;
    col = mix(col, uDeep,  smoothstep(0.2, 0.9, f) * 0.55);  // depth in the troughs
    col = mix(col, uAmber, clamp(r.x * 0.9, 0.0, 1.0) * 0.6); // amber veins
    col = mix(col, uAmber, o2 * 0.5);                         // lower warm bloom
    col = mix(col, uCream, o1 * 0.35 + pow(f, 3.0) * 0.15);   // cream highlight

    // soft vignette so the edges sit back behind the content
    float vig = smoothstep(1.25, 0.2, length((vUv - 0.5) * vec2(uAspect, 1.0)));
    col *= mix(0.86, 1.0, vig);

    gl_FragColor = vec4(col, uOpacity);
  }
`;
