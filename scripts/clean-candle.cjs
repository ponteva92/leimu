/* One-off asset cleanup: the source candle PNG ships with a half-keyed
   background (near-white pixels with dithered alpha) that renders as a
   checkerboard halo on a transparent canvas. We border-flood-fill the
   connected near-white background to fully transparent; the cream wax is
   enclosed by the dark vessel rim, so the flood can't reach it.            */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const IMG_DIR = path.join(__dirname, "..", "public", "images");
const INPUT = path.join(IMG_DIR, "kynttilä musta.png"); // untouched original
const OUTPUT = path.join(IMG_DIR, "hero-candle-black.png");

const png = PNG.sync.read(fs.readFileSync(INPUT));
const { width, height, data } = png; // RGBA, 4 bytes/px
const N = width * height;

const luma = (i) => data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;

const BLOCK_LUMA = 224; // darker than this (and opaque) = candle → flood stops
const visited = new Uint8Array(N);
const stack = [];

const seed = (x, y) => {
  const p = y * width + x;
  if (!visited[p]) stack.push(p);
};
for (let x = 0; x < width; x++) {
  seed(x, 0);
  seed(x, height - 1);
}
for (let y = 0; y < height; y++) {
  seed(0, y);
  seed(width - 1, y);
}

let cleared = 0;
while (stack.length) {
  const p = stack.pop();
  if (visited[p]) continue;
  visited[p] = 1;
  const i = p * 4;
  // a dark, still-opaque pixel is the candle/lid edge → boundary, don't cross
  if (luma(i) < BLOCK_LUMA && data[i + 3] > 40) continue;

  if (data[i + 3] !== 0) {
    data[i + 3] = 0;
    cleared++;
  }
  const x = p % width;
  const y = (p / width) | 0;
  if (x > 0) stack.push(p - 1);
  if (x < width - 1) stack.push(p + 1);
  if (y > 0) stack.push(p - width);
  if (y < height - 1) stack.push(p + width);
}

// Conservative second pass: kill any isolated near-white dither the flood
// didn't reach (keeps the fully-opaque cream wax, which stays at alpha 255).
let speckles = 0;
for (let p = 0; p < N; p++) {
  if (visited[p]) continue;
  const i = p * 4;
  if (luma(i) > 242 && data[i + 3] < 235 && data[i + 3] > 0) {
    data[i + 3] = 0;
    speckles++;
  }
}

fs.writeFileSync(OUTPUT, PNG.sync.write(png));
console.log(
  `cleaned ${cleared} bg px + ${speckles} speckles → ${path.basename(OUTPUT)} (${width}x${height})`,
);
