/* The first-paint photograph and the WebGL plane share one projection,
   so swapping to the live flame never shows two differently sized jars. */
export const CANDLE_FRAMING = {
  fov: 32,
  cameraZ: 8,
  height: 2.9,
  aspect: 0.7297,
  centreY: -0.5,
} as const;
