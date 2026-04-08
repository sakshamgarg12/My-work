/**
 * One-off: crop emblem (strip wordmark), remove light grey background → transparent PNG.
 * Run: node scripts/process-catalyst-logo.mjs
 */
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const input = path.join(root, 'public', 'catalyst-logo.png');
const output = path.join(root, 'public', 'catalyst-mark.png');

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

let { width, height, channels } = info;
const src = new Uint8ClampedArray(data);

// Drop bottom ~48% (wordmark + tagline). Tune CROP_RATIO if needed.
const CROP_RATIO = 0.52;
const cropH = Math.max(1, Math.round(height * CROP_RATIO));

function idx(x, y) {
  return (y * width + x) * channels;
}

const out = new Uint8ClampedArray(width * cropH * 4);

for (let y = 0; y < cropH; y++) {
  for (let x = 0; x < width; x++) {
    const si = idx(x, y);
    const di = (y * width + x) * 4;
    let r = src[si];
    let g = src[si + 1];
    let b = src[si + 2];
    const a = src[si + 3];

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max < 1 ? 0 : (max - min) / max;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    let outA = a;
    // Backdrop: grey radial + flat white around the emblem.
    const nearWhite = r > 232 && g > 232 && b > 232;
    const lightGrey = lum > 175 && sat < 0.28;
    const veryBright = lum > 218;
    if (nearWhite) outA = 0;
    else if (lightGrey && lum > 195) outA = 0;
    else if (veryBright && sat < 0.2) outA = 0;

    out[di] = r;
    out[di + 1] = g;
    out[di + 2] = b;
    out[di + 3] = outA;
  }
}

await sharp(Buffer.from(out), {
  raw: { width, height: cropH, channels: 4 },
})
  .png()
  .trim({ threshold: 8 })
  .toFile(output);

console.log('Wrote', output);
