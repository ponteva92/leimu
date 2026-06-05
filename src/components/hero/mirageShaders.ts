/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Hero "Heat Mirage & Scent Aura" shaders
   ------------------------------------------------------------------------
   Replaces the old smoke. Above the flame:
     · logoMirageFrag — the white LEIMU logo (texture) shimmering in rising,
       cinematic heat-haze. A flowing simplex field offsets the sample UV;
       strongest just above the wick, tapering up. The cursor parts the haze
       (a decaying glass-like ripple) and it recovers smoothly.
     · auraFrag — a barely-there warm golden "scent aura": pure colored light
       (additive), column-masked, breathing and rising with the same noise.

   Shared vertex passes vUv + vWorldXY so the cursor (world space) can be
   compared uniformly across both planes. GLSL ES 1.00 (three injects the
   built-in attributes/uniforms).
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
`;

/* Shared vertex — also exposes world xy so fragments can react to the cursor. */
export const mirageVert = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  varying vec2 vWorldXY;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldXY = world.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const logoMirageFrag = /* glsl */ `
  precision highp float;
  ${NOISE}
  uniform sampler2D uLogo;
  uniform float uTime, uOpacity, uMouseStrength, uMouseRadius, uAmp;
  uniform vec2  uMouse;
  varying vec2  vUv;
  varying vec2  vWorldXY;

  void main() {
    float t = uTime;

    // rising, horizontally-biased heat shimmer (fine + finer octave, scrolls up)
    float nx = snoise(vec3(vUv.x * 9.0,      vUv.y * 6.0  - t * 0.65, t * 0.15)) * 0.65
             + snoise(vec3(vUv.x * 19.0 + 4.0, vUv.y * 12.0 - t * 1.05, t * 0.22)) * 0.35;
    float ny = snoise(vec3(vUv.x * 11.0 + 8.0, vUv.y * 7.0 - t * 0.80, t * 0.18));

    // distortion strongest just above the wick (bottom), tapering up
    float mask = smoothstep(1.0, 0.12, vUv.y);
    vec2 offset = vec2(nx * uAmp, ny * uAmp * 0.45) * mask;

    // cursor disturbance — a decaying glass-like ripple that parts the haze
    float md = distance(vWorldXY, uMouse);
    float push = smoothstep(uMouseRadius, 0.0, md) * uMouseStrength;
    vec2 dir = vWorldXY - uMouse;
    dir = length(dir) > 1e-4 ? normalize(dir) : vec2(0.0, 1.0);
    offset += dir * push * uAmp * 2.5;

    vec4 logo = texture2D(uLogo, vUv + offset);
    gl_FragColor = vec4(logo.rgb, logo.a * uOpacity);
  }
`;

export const auraFrag = /* glsl */ `
  precision highp float;
  ${NOISE}
  uniform float uTime, uOpacity, uMouseStrength, uMouseRadius;
  uniform vec2  uMouse;
  uniform vec3  uColor;
  varying vec2  vUv;
  varying vec2  vWorldXY;

  void main() {
    float t = uTime;
    float n  = snoise(vec3(vUv.x * 4.0,      vUv.y * 3.0 - t * 0.50, t * 0.10)) * 0.5 + 0.5;
    float n2 = snoise(vec3(vUv.x * 8.0 + 3.0, vUv.y * 5.0 - t * 0.80, t * 0.16)) * 0.5 + 0.5;

    // soft rising column: centre-weighted horizontally, strong low → fade high
    float hx = smoothstep(0.5, 0.04, abs(vUv.x - 0.5));
    float vy = smoothstep(1.0, 0.1, vUv.y);
    float breathe = 0.7 + 0.3 * sin(t * 0.5);
    float intensity = hx * vy * mix(0.6, 1.0, n) * (0.7 + 0.3 * n2) * breathe;

    // the cursor gently parts the aura too
    float md = distance(vWorldXY, uMouse);
    intensity *= 1.0 - 0.4 * smoothstep(uMouseRadius, 0.0, md) * uMouseStrength;

    gl_FragColor = vec4(uColor, intensity * uOpacity);
  }
`;

/* A very small, pale "scent" wisp rising from the wick — light grey ↔ very light
   blue, ultra-low opacity, normal blend (reads as a faint thread of scent). */
export const scentFrag = /* glsl */ `
  precision highp float;
  ${NOISE}
  uniform float uTime, uOpacity;
  uniform vec3  uColorA, uColorB;
  varying vec2  vUv;

  void main() {
    float t = uTime;
    float n1 = snoise(vec3(vUv.x * 5.0,        vUv.y * 4.0 - t * 0.50, t * 0.12)) * 0.5 + 0.5;
    float n2 = snoise(vec3(vUv.x * 11.0 + 4.0, vUv.y * 8.0 - t * 0.80, t * 0.18)) * 0.5 + 0.5;
    float wisp = n1 * n2;

    // narrow soft column with a gentle sway that grows with height
    float sway = sin(t * 0.6 + vUv.y * 5.0) * 0.05 * vUv.y;
    float hx = exp(-pow((vUv.x - 0.5 + sway) * 5.0, 2.0));
    // thin at the wick (bottom), present mid, dissipating to the top
    float vy = smoothstep(0.0, 0.14, vUv.y) * smoothstep(1.0, 0.4, vUv.y);

    float a = pow(hx * vy * wisp, 1.4);
    vec3 col = mix(uColorA, uColorB, n2); // light grey ↔ very light blue
    gl_FragColor = vec4(col, a * uOpacity);
  }
`;
