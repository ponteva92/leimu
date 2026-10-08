let webglProbe: boolean | undefined;

/**
 * True when this browser can create a WebGL context. SSR-safe (false).
 * Probed once per page load, and the probe context is released at once so
 * it never counts toward the browser's cap on live contexts (Chrome drops
 * the oldest live canvas past 16).
 */
export function webglAvailable(): boolean {
  if (typeof window === "undefined") return false;
  if (webglProbe !== undefined) return webglProbe;
  try {
    const canvas = document.createElement("canvas");
    const gl = window.WebGLRenderingContext
      ? ((canvas.getContext("webgl") ||
          canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null)
      : null;
    webglProbe = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webglProbe = false;
  }
  return webglProbe;
}

/** Phone / coarse pointer. Live canvases stay on fine-pointer desktop only. */
export function isCoarseViewport(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
}
