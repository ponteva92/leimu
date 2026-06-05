/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Hero candle GLSL shaders
   ------------------------------------------------------------------------
   All three materials share one pass-through vertex shader and write their
   own fragment shader. Kept as plain strings so the R3F scene stays clean.

   · baseVert        — pass uv → fragment
   · flameFrag       — procedural teardrop flame (additive, no texture)
   · candleFrag      — candle photo, lit by a warm pool around the wick
   ════════════════════════════════════════════════════════════════════════ */

export const baseVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* ── Procedural flame ───────────────────────────────────────────────────
   Drawn on a unit quad (uv 0..1). Base of the flame sits at uv.y = 0.
   uIgnite scales the visible height (0 → none, 1 → full, >1 → spark stretch).
   uFlicker injects extra brightness during ignition / live flicker.       */
export const flameFrag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uIgnite;
  uniform float uFlicker;
  varying vec2 vUv;

  float hash(float n){ return fract(sin(n) * 43758.5453123); }
  float vnoise(float x){
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(hash(i), hash(i + 1.0), u);
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime;

    // multi-octave organic flicker, centred around 0
    float n = vnoise(t * 7.0) * 0.5 + vnoise(t * 15.0 + 3.1) * 0.3 + vnoise(t * 27.0 + 9.7) * 0.2;
    float flick = n - 0.5;

    // horizontal sway grows toward the tip
    float sway = flick * 0.16 * smoothstep(0.0, 1.0, uv.y);
    float x = (uv.x - 0.5) + sway;
    float y = uv.y;

    // total flame height driven by ignition + a little flicker
    float topY = (0.80 + flick * 0.10) * clamp(uIgnite, 0.0, 1.5);
    float ny = y / max(topY, 0.0001);                 // 0 at base → 1 at tip

    // width profile: pinched at base, bulged low-mid, tapered to a point
    float w = 0.30 * sin(clamp(ny, 0.0, 1.0) * 3.14159);
    w = mix(0.32, w, smoothstep(0.0, 0.20, ny));
    w *= (1.0 + flick * 0.12);

    float edge   = abs(x) / max(w, 0.0001);
    float body   = smoothstep(1.0, 0.45, edge);
    float withinH = step(0.0, ny) * step(ny, 1.0);
    float shape  = body * withinH * smoothstep(0.0, 0.07, y);

    // bright inner core
    float core = smoothstep(0.55, 0.0, edge) * smoothstep(0.0, 0.18, ny) * smoothstep(1.0, 0.40, ny);

    // colour ramp: blue base → orange → amber → near-white core
    vec3 cBlue   = vec3(0.30, 0.45, 1.00);
    vec3 cOrange = vec3(1.00, 0.42, 0.08);
    vec3 cAmber  = vec3(1.00, 0.74, 0.26);
    vec3 cWhite  = vec3(1.00, 0.96, 0.84);

    vec3 col = mix(cOrange, cAmber, smoothstep(0.0, 0.55, ny));
    col = mix(col, cWhite, core);
    col = mix(cBlue, col, smoothstep(0.02, 0.16, ny));

    float alpha = shape * clamp(uIgnite, 0.0, 1.0);

    // soft outer glow halo so the flame reads as a light source
    float halo = smoothstep(1.7, 0.0, edge) * smoothstep(0.0, 0.04, y) * smoothstep(1.20, 0.45, ny);
    alpha = max(alpha, halo * 0.22 * clamp(uIgnite, 0.0, 1.0));

    col *= 1.0 + flick * 0.25 + uFlicker * 0.18;

    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
  }
`;

/* ── Candle (light-reactive) ────────────────────────────────────────────
   The candle photo. While unlit (uLit → 0) it shows at full studio
   brightness. When lit (uLit → 1) it is shaded by the same flame light: a
   warm pool around the wick stays bright while the rest — vessel + bamboo
   lid — sinks into candle-lit shadow, so it sits convincingly in the dark.  */
export const candleFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uMap;
  uniform vec2  uLightPos;   // flame position in candle-plane uv space
  uniform float uLit;        // 0 = full daylight, 1 = lit-in-the-dark
  uniform float uFlicker;
  uniform float uAspect;     // candleW / candleH
  uniform float uRadius;
  uniform vec3  uWarm;
  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uMap, vUv);
    if (tex.a < 0.04) discard;

    vec2 d = vUv - uLightPos;
    d.x *= uAspect;
    float dist = length(d);

    float pool = smoothstep(uRadius, uRadius * 0.08, dist);
    pool = pow(pool, 1.4) * uFlicker;

    float ambient = 0.14;
    float lightAmt = mix(1.0, ambient + pool * 1.30, uLit);

    vec3 col = tex.rgb * lightAmt;
    col = mix(col, col * uWarm, uLit * pool * 0.55); // warm the lit pool

    gl_FragColor = vec4(col, tex.a);
  }
`;
