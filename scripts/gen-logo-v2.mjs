// One-off: build v2 logo derivatives from owner-supplied finals (2026-10-28).
// Sources archived to design/Logo/v2/. Outputs:
//   public/brand/roofhub-logo-dark.png   (light-bg lockup, dark wordmark + colour icon)
//   public/brand/roofhub-logo-white.png  (dark-bg lockup, white wordmark + colour icon)
//   public/brand/roofhub-mark-colour.png (transparent colour mark, favicon/OG source)
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const inbound = "C:/Users/Jimmy/.openclaw/workspace-ron/media/inbound";
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = d + "/" + f.name;
    if (f.isDirectory()) walk(p);
    else if (/\.png$/i.test(f.name)) files.push({ name: f.name, path: p });
  }
})(inbound);

function find(substr) {
  const hit = files.filter(f => f.name.startsWith(substr));
  if (hit.length !== 1) throw new Error(`expected 1 match for ${substr}, got ${hit.length}`);
  return hit[0].path;
}

const srcFooter = find("Footer---");
const srcWhiteLockup = find("Colour_white_TB_Text_Long---");
const srcFaviconMark = find("favicon---");
const srcBlackColourTB = find("Black_colour_TB---");
const srcBlackTB = find("Black_TB---");
const srcBlackTBTextLong = find("Black_TB_Text_Long---");
const srcMulti = find("Multi---");
const srcStackedBlackTB = find("Stacked_Black_TB---");
const srcStackedWhiteTB = find("Stacked_White_TB---");
const srcWhiteTB = find("White_TB---");
const srcWhiteTBTextLong = find("White_TB_Text_Long---");
const srcWhiteTextTrans = find("White_Text_Trans---");

const v2 = path.join(root, "design/Logo/v2");
fs.mkdirSync(v2, { recursive: true });

const archive = [
  ["Footer.png", srcFooter],
  ["Colour_white_TB_Text_Long.png", srcWhiteLockup],
  ["favicon-mark.png", srcFaviconMark],
  ["Black_colour_TB.png", srcBlackColourTB],
  ["Black_TB.png", srcBlackTB],
  ["Black_TB_Text_Long.png", srcBlackTBTextLong],
  ["Multi.png", srcMulti],
  ["Stacked_Black_TB.png", srcStackedBlackTB],
  ["Stacked_White_TB.png", srcStackedWhiteTB],
  ["White_TB.png", srcWhiteTB],
  ["White_TB_Text_Long.png", srcWhiteTBTextLong],
  ["White_Text_Trans.png", srcWhiteTextTrans],
];
for (const [name, src] of archive) fs.copyFileSync(src, path.join(v2, name));

const trimAlpha = (input, threshold = 8) =>
  sharp(input).trim({ threshold }).png().toBuffer();

// Trim transparent padding so lockups sit tight, then cap width.
async function lockup(src, out, maxW) {
  const trimmed = await trimAlpha(src);
  let img = sharp(trimmed);
  const meta = await img.metadata();
  if (meta.width > maxW) img = img.resize({ width: maxW });
  await img.png({ compressionLevel: 9, palette: true, quality: 95 }).toFile(out);
  const kb = (fs.statSync(out).size / 1024).toFixed(1);
  console.log(`${path.basename(out)}: ${kb} KB`);
}

async function mark(src, out) {
  const trimmed = await trimAlpha(src);
  await sharp(trimmed).png({ compressionLevel: 9, palette: true, quality: 95 }).toFile(out);
  console.log(`${path.basename(out)}: ${(fs.statSync(out).size / 1024).toFixed(1)} KB`);
}

await mark(srcFaviconMark, path.join(root, "public/brand/roofhub-mark-colour.png"));
await lockup(srcFooter, path.join(root, "public/brand/roofhub-logo-dark.png"), 640);
await lockup(srcWhiteLockup, path.join(root, "public/brand/roofhub-logo-white.png"), 640);
console.log("v2 logo derivatives written; originals archived to design/Logo/v2/");
