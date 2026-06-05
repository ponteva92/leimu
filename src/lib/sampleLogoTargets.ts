/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Logo → particle-target sampler
   ------------------------------------------------------------------------
   Loads the brand mark, reads its alpha on an offscreen canvas, and returns
   N target positions for the smoke particles by weighted-random sampling of
   the opaque pixels (density ∝ ink coverage → the mark reads clearly).

   · Coordinates are centred on the sampled shape's bounding box and
     normalised so the larger extent spans ~1.0 unit (multiply by a world
     `scale` at the call site).
   · `cropBottom` excludes everything below that normalised y (0 = top), used
     to drop the "CANDLES" sub-text — only the emblem + "LEIMU" are formed.
   ════════════════════════════════════════════════════════════════════════ */

export interface LogoTargets {
  /** count * 3, centred + normalised logo-local positions (small z spread) */
  positions: Float32Array;
  /** count, random [0,1) per particle (phase / size / colour variance) */
  seeds: Float32Array;
  count: number;
}

interface SampleOpts {
  url: string;
  count: number;
  /** drop pixels below this normalised y (0 = top). Default 0.84 → no CANDLES. */
  cropBottom?: number;
  alphaThreshold?: number;
  /** random z spread for a touch of depth */
  depth?: number;
}

export async function sampleLogoTargets({
  url,
  count,
  cropBottom = 0.84,
  alphaThreshold = 0.5,
  depth = 0.06,
}: SampleOpts): Promise<LogoTargets> {
  const empty: LogoTargets = {
    positions: new Float32Array(count * 3),
    seeds: new Float32Array(count),
    count,
  };
  if (typeof document === "undefined") return empty;

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  try {
    await img.decode();
  } catch {
    return empty;
  }

  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return empty;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, w, h).data;

  // Collect opaque candidates (above the crop line), in centred local space.
  const aspect = w / h;
  const cropY = Math.floor(h * cropBottom);
  const candX: number[] = [];
  const candY: number[] = [];
  for (let py = 0; py < cropY; py++) {
    for (let px = 0; px < w; px++) {
      if (data[(py * w + px) * 4 + 3] / 255 > alphaThreshold) {
        candX.push((px / w - 0.5) * aspect); // x ∈ [-aspect/2, aspect/2]
        candY.push(0.5 - py / h); //              y: top → +, bottom → −
      }
    }
  }

  const n = candX.length;
  if (n === 0) return empty;

  // Bounding box → centre + normalise so the larger dimension spans 1.0.
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < n; i++) {
    if (candX[i] < minX) minX = candX[i];
    if (candX[i] > maxX) maxX = candX[i];
    if (candY[i] < minY) minY = candY[i];
    if (candY[i] > maxY) maxY = candY[i];
  }
  const cx = (minX + maxX) * 0.5;
  const cy = (minY + maxY) * 0.5;
  const norm = 1 / (Math.max(maxX - minX, maxY - minY) || 1);

  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const k = (Math.random() * n) | 0; // uniform pick → density ∝ coverage
    positions[i * 3] = (candX[k] - cx) * norm + (Math.random() - 0.5) * 0.004;
    positions[i * 3 + 1] = (candY[k] - cy) * norm + (Math.random() - 0.5) * 0.004;
    positions[i * 3 + 2] = (Math.random() - 0.5) * depth;
    seeds[i] = Math.random();
  }

  return { positions, seeds, count };
}
