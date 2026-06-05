/* ════════════════════════════════════════════════════════════════════════
   LEIMU — "Living Portrait" shaders (Tarina founder hero)
   ------------------------------------------------------------------------
   portrait : cover-fit photo with a mouse depth-parallax (subject parallaxes
              more than the edges → subtle 2.5-D), a warm grade + vignette.
   dust     : tiny glowing amber embers drifting + twinkling (additive),
              front ones brighter/bigger to fake depth without occlusion.
   GLSL ES 1.00 · WYSIWYG colour (raw texture, toneMapped off).
   ════════════════════════════════════════════════════════════════════════ */

export const portraitVert = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const portraitFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2  uMouse;     // -1..1, damped
  uniform float uOpacity, uImgAspect, uPlaneAspect;
  varying vec2  vUv;

  void main() {
    // cover-fit the photo into the plane
    float ia = uImgAspect, pa = uPlaneAspect;
    vec2 s = pa > ia ? vec2(1.0, ia / pa) : vec2(pa / ia, 1.0);
    vec2 uv = (vUv - 0.5) * s + 0.5;

    // subject (upper-centre) parallaxes more than the edges → depth
    float depth = smoothstep(0.95, 0.05, distance(vUv, vec2(0.5, 0.42)));
    uv += uMouse * 0.022 * depth;

    vec3 col = texture2D(uTex, uv).rgb;
    col = mix(col, col * vec3(1.07, 1.0, 0.9), 0.22);            // warm grade
    float vig = smoothstep(1.15, 0.32, distance(vUv, vec2(0.5)));
    col *= mix(0.78, 1.0, vig);                                   // vignette

    gl_FragColor = vec4(col, uOpacity);
  }
`;

export const dustVert = /* glsl */ `
  precision highp float;
  uniform float uTime, uSize, uPixelRatio;
  attribute float aSeed;
  varying float vA;
  void main() {
    vec3 p = position;
    float t = uTime;
    p.x += sin(t * 0.40 + aSeed * 10.0) * 0.06;
    p.y += cos(t * 0.33 + aSeed * 7.0)  * 0.05;
    p.z += sin(t * 0.25 + aSeed * 5.0)  * 0.05;

    float tw = 0.4 + 0.6 * pow(0.5 + 0.5 * sin(t * 1.4 + aSeed * 22.0), 2.0); // twinkle
    float depthW = smoothstep(-0.5, 0.5, p.z); // front (z>0) brighter/bigger
    vA = tw * mix(0.35, 1.0, depthW);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * mix(0.5, 1.5, depthW) * (0.6 + aSeed) * uPixelRatio / max(-mv.z, 0.001);
    gl_Position = projectionMatrix * mv;
  }
`;

export const dustFrag = /* glsl */ `
  precision highp float;
  uniform vec3  uColor;
  uniform float uOpacity;
  varying float vA;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r2 = dot(d, d);
    if (r2 > 0.25) discard;
    float a = exp(-r2 * 5.0);                 // soft glowing ember
    gl_FragColor = vec4(uColor, a * vA * uOpacity);
  }
`;
