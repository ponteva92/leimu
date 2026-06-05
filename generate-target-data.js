/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Smoke target-coordinate extractor
   ------------------------------------------------------------------------
   Reads public/images/logo.png (black mark on white), isolates the fire
   emblem + "LEIMU" wordmark (drops the "CANDLES" sub-text), and samples the
   ink pixels into a normalised coordinate set the smoke particles fly to.

   Output: public/logo-target-coords.json
     { count, aspect, positions: [x0,y0, x1,y1, ...] }   // centred, max-extent = 1, y up

   Run:  node generate-target-data.js
   ════════════════════════════════════════════════════════════════════════ */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "public/images/logo.png");
const OUT = path.join(__dirname, "public/logo-target-coords.json");

const COUNT = 22000; // particle targets
const DARK = 130; // luminance below this = ink (black-on-white logo)
const CROP_BOTTOM = 0.82; // keep the top 82% of the ink bbox → excludes CANDLES

(async () => {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels } = info;

  // 1) collect all ink (dark, opaque) pixels
  const xs = [], ys = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * channels;
      if (data[i + 3] < 20) continue; // transparent
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum < DARK) { xs.push(x); ys.push(y); }
    }
  }
  if (xs.length === 0) throw new Error("No ink pixels found — check DARK threshold / source.");

  // 2) drop the CANDLES sub-text (bottom band of the ink bounding box)
  let minY = Infinity, maxY = -Infinity;
  for (const y of ys) { if (y < minY) minY = y; if (y > maxY) maxY = y; }
  const cropY = minY + (maxY - minY) * CROP_BOTTOM;
  const kx = [], ky = [];
  for (let k = 0; k < xs.length; k++) if (ys[k] <= cropY) { kx.push(xs[k]); ky.push(ys[k]); }

  // 3) bbox of the kept mark (emblem + LEIMU) → centre + normalise (max extent = 1)
  let minX = Infinity, maxX = -Infinity, kMinY = Infinity, kMaxY = -Infinity;
  for (let k = 0; k < kx.length; k++) {
    if (kx[k] < minX) minX = kx[k]; if (kx[k] > maxX) maxX = kx[k];
    if (ky[k] < kMinY) kMinY = ky[k]; if (ky[k] > kMaxY) kMaxY = ky[k];
  }
  const cx = (minX + maxX) / 2, cy = (kMinY + kMaxY) / 2;
  const bw = maxX - minX, bh = kMaxY - kMinY;
  const norm = 1 / Math.max(bw, bh);

  // 4) sample COUNT targets (uniform random → density ∝ ink coverage)
  const n = kx.length;
  const positions = new Array(COUNT * 2);
  for (let p = 0; p < COUNT; p++) {
    const k = (Math.random() * n) | 0;
    const nx = (kx[k] - cx) * norm + (Math.random() - 0.5) * 0.004;
    const ny = (cy - ky[k]) * norm + (Math.random() - 0.5) * 0.004; // flip y → up
    positions[p * 2] = Math.round(nx * 10000) / 10000;
    positions[p * 2 + 1] = Math.round(ny * 10000) / 10000;
  }

  fs.writeFileSync(OUT, JSON.stringify({ count: COUNT, aspect: Math.round((bw / bh) * 1000) / 1000, positions }));
  console.log(`✓ ${OUT}`);
  console.log(`  ${COUNT} targets · aspect ${(bw / bh).toFixed(3)} · ${n} ink px kept (of ${xs.length}, CANDLES cropped)`);
})().catch((e) => { console.error(e); process.exit(1); });
