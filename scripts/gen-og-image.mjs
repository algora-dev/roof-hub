// Regenerate the Open Graph card: node scripts/gen-og-image.mjs
import sharp from "sharp";

const W = 1200;
const H = 630;

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="#191919"/>
  <polyline points="0,540 240,392 480,540 720,392 960,540 1200,452" fill="none" stroke="#7A8F7A" stroke-width="5" opacity="0.55"/>
  <polyline points="0,586 240,438 480,586 720,438 960,586 1200,498" fill="none" stroke="#536153" stroke-width="3" opacity="0.35"/>
  <rect x="94" y="104" width="12" height="12" fill="#C15A3C"/>
  <text x="94" y="212" font-family="Segoe UI, Arial, sans-serif" font-size="106" font-weight="700" fill="#FFFFFF" letter-spacing="1">RoofHub</text>
  <text x="98" y="266" font-family="Segoe UI, Arial, sans-serif" font-size="36" fill="#C3CDC3">Know more. Build brighter.</text>
  <text x="98" y="462" font-family="Segoe UI, Arial, sans-serif" font-size="27" fill="#92A392">New Zealand roofing knowledge, pricing &amp; tools</text>
  <text x="98" y="500" font-family="Segoe UI, Arial, sans-serif" font-size="22" fill="#777777">roofhub.co.nz</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile("public/brand/og-image.png");
console.log("public/brand/og-image.png written");
