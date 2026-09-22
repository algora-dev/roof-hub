// Generates the RoofHub favicon: rounded black square with white mark.
// Outputs: public/brand/roofhub-icon.png (512) + app/favicon.ico (48/32/16 PNG-entries).
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const markSrc = path.join(root, "public/brand/roofhub-mark-white.png");
const iconOut = path.join(root, "public/brand/roofhub-icon.png");
const icoOut = path.join(root, "app/favicon.ico");

const SIZE = 512;
const RADIUS = 110; // ~21% rounded corners
const MARK_WIDTH = 340; // mark occupies ~66% width

const roundedSquare = Buffer.from(
  `<svg width="${SIZE}" height="${SIZE}"><rect x="0" y="0" width="${SIZE}" height="${SIZE}" rx="${RADIUS}" ry="${RADIUS}" fill="#0A0A0A"/></svg>`
);

const mark = await sharp(markSrc).resize({ width: MARK_WIDTH }).png().toBuffer();
const markMeta = await sharp(mark).metadata();

await sharp(roundedSquare)
  .composite([{ input: mark, left: Math.round((SIZE - markMeta.width) / 2), top: Math.round((SIZE - markMeta.height) / 2) }])
  .png()
  .toFile(iconOut);

// .ico pack (Vista+ PNG-compressed entries)
const sizes = [48, 32, 16];
const frames = await Promise.all(
  sizes.map(async (s) => ({ s, png: await sharp(iconOut).resize(s, s).png().toBuffer() }))
);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(frames.length, 4);
let offset = 6 + frames.length * 16;
const parts = [header];
for (const { s, png } of frames) {
  const e = Buffer.alloc(16);
  e.writeUInt8(s === 256 ? 0 : s, 0);
  e.writeUInt8(s === 256 ? 0 : s, 1);
  e.writeUInt8(0, 2);
  e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(png.length, 8);
  e.writeUInt32LE(offset, 12);
  parts.push(e, png);
  offset += png.length;
}
import fs from "node:fs";
fs.writeFileSync(icoOut, Buffer.concat(parts));
console.log("favicon + ico written");
