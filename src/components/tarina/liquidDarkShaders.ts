/* ════════════════════════════════════════════════════════════════════════
   LEIMU — "Liquid Dark" caustics (Materials section background)
   ------------------------------------------------------------------------
   An extremely low-contrast dark fluid: domain-warped fbm forms slow caustic
   veins, like dim light grazing the surface of melted soy wax. Evolves with
   uTime, drifts gently with uMouse. Opaque (it IS the section background) and
   deliberately subtle so it never competes with the text.
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
  for (int i = 0; i < 4; i++){ v += a * snoise(vec3(p, 0.0)); p = p * 2.0 + 17.0; a *= 0.5; }
  return v * 0.5 + 0.5;
}
`;

export const liquidVert = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const liquidFrag = /* glsl */ `
  precision highp float;
  ${NOISE}
  uniform float uTime, uOpacity;
  uniform vec2  uMouse;
  uniform vec3  uBase, uHi;
  varying vec2  vUv;

  void main() {
    vec2 p = vUv * vec2(2.6, 2.0) + uMouse * 0.25;
    float t = uTime * 0.05;
    // domain warp → flowing wax surface
    vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(3.7, 1.2) - t));
    float n = fbm(p + q * 1.4 + t * 0.5);
    // thin caustic veins
    float c = pow(1.0 - abs(sin(n * 3.14159 + uTime * 0.12)), 4.0);
    // calmest through the vertical middle (behind the text)
    float v = smoothstep(0.0, 0.5, vUv.y) * smoothstep(1.0, 0.5, vUv.y);
    vec3 col = mix(uBase, uHi, c * uOpacity * (0.55 + 0.45 * v));
    gl_FragColor = vec4(col, 1.0);
  }
`;
