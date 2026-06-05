/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Tuotteet hero "Living Still Life" shaders
   ------------------------------------------------------------------------
   A flat image plane displaying the products photo, driven by three fragment
   effects (the geometry stays perfectly flat — no vertex displacement):

     A · Molten reveal     — on mount the image emerges from a dark liquid-wax
                             veil that organically melts away (uReveal 0→1.3).
     B · Scroll fade-dark  — uScroll dims the whole image, but the golden seals
                             stay emissive and glow brighter as it darkens.
     C · Text symbiosis    — uTextHovered blooms the golden seals when the big
                             "täysin sinun" headline is hovered.

   GLSL ES 1.00 (three injects position/uv/matrices). WYSIWYG colour: the
   texture is sampled raw and composited in gamma space — no encode dance.
   ════════════════════════════════════════════════════════════════════════ */

const NOISE = /* glsl */ `
vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0);
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  vec2  shift = vec2(100.0);
  for (int i = 0; i < 5; i++){
    v += a * snoise(vec3(p, 0.0));
    p = p * 2.0 + shift;
    a *= 0.5;
  }
  return v * 0.5 + 0.5;
}
`;

/* Flat pass-through — the plane never deforms; all the magic is in the fragment. */
export const heroImgVert = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const heroImgFrag = /* glsl */ `
  precision highp float;
  ${NOISE}
  uniform sampler2D uTex;
  uniform float uTime, uReveal, uScroll;
  varying vec2  vUv;

  // isolate the golden/amber wax seals + warm bright areas
  float goldenMask(vec3 c){
    float warm   = c.r - c.b;
    float bright = dot(c, vec3(0.299, 0.587, 0.114));
    return clamp(smoothstep(0.10, 0.42, warm) * smoothstep(0.20, 0.62, bright), 0.0, 1.0);
  }

  void main() {
    // ── A. molten reveal — image emerges from a dark liquid-wax veil (centre first) ──
    float fb    = fbm(vUv * 2.6 + vec2(uTime * 0.02, 0.0));
    float front = fb * 0.72 + distance(vUv, vec2(0.5, 0.55)) * 0.42;
    float revealed = 1.0 - smoothstep(uReveal - 0.10, uReveal + 0.06, front);
    float band  = revealed * (1.0 - revealed) * 4.0;          // hot melt edge
    vec2  distort = vec2(fbm(vUv * 6.0 + 1.3) - 0.5, fbm(vUv * 6.0 + 7.7) - 0.5) * band * 0.05;

    vec3  img  = texture2D(uTex, vUv + distort).rgb;
    float gold = goldenMask(img);

    vec3 col = img;

    // subtle static sheen on the seals so they read as warm wax (no geometry needed)
    col += gold * 0.06 * vec3(1.0, 0.78, 0.42);

    // B. scroll fade-to-dark — golden seals stay emissive and glow brighter
    float s = clamp(uScroll, 0.0, 1.0);
    col *= mix(1.0, 0.16, s);
    col += gold * s * vec3(1.0, 0.60, 0.20) * 1.6;

    // a living shimmer on the gold even at rest
    col += gold * (0.04 + 0.04 * sin(uTime * 1.4 + vUv.x * 10.0));

    // molten composite: covered = dark wax, melt line = hot amber glow
    vec3 wax = vec3(0.045, 0.034, 0.026);
    col = mix(wax, col, revealed);
    col += vec3(0.95, 0.5, 0.16) * band * 0.65;

    // cinematic vignette
    float vig = smoothstep(1.15, 0.32, distance(vUv, vec2(0.5)));
    col *= mix(0.80, 1.0, vig);

    gl_FragColor = vec4(col, 1.0);
  }
`;
