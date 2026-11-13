// One-off (2026-11-13): assistant badge mark for light surfaces.
// The owner-approved colour TB mark (design/Logo/v2/Black_colour_TB.png) is orange + dark charcoal,
// but only exists on a solid black background. The transparent derivative
// (public/brand/roofhub-mark-colour.png, from favicon-mark) is the same mark with a WHITE right band,
// which disappears on the white launcher circle. Recolour the white band to ink charcoal while
// keeping alpha + orange, so the mark reads correctly on white surfaces.
// Output: public/brand/roofhub-mark-ink.png
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = path.join(root, "public/brand/roofhub-mark-colour.png");
const out = path.join(root, "public/brand/roofhub-mark-ink.png");

const ink = [31, 31, 29]; // #1f1f1d, matches the charcoal band of Black_colour_TB.png

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const channels = info.channels;
let kept = 0, recoloured = 0, skipped = 0;
for (let i = 0; i < data.length; i += channels) {
  if (data[i + 3] === 0) { skipped++; continue; }
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const min = Math.min(r, g, b);
  const isOrange = r > g && g >= b && (r - b) >= 40 && r >= 120;
  if (isOrange) { kept++; continue; }
  // White band (incl. anti-aliasing): map whiteness ratio onto the ink colour.
  const w = min / 255;
  data[i] = Math.round(ink[0] * w);
  data[i + 1] = Math.round(ink[1] * w);
  data[i + 2] = Math.round(ink[2] * w);
  recoloured++;
}
await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .resize({ width: 200 })
  .png({ compressionLevel: 9, palette: true, quality: 95 })
  .toFile(out);
const meta = await sharp(out).metadata();
console.log(`roofhub-mark-ink.png written (${kept} orange kept, ${recoloured} recoloured to ink, ${skipped} transparent): ${meta.width}x${meta.height}, ${(fs.statSync(out).size / 1024).toFixed(1)} KB`);
