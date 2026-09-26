import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

let failures = 0;
const fail = (message) => { failures += 1; console.error(`✗ ${message}`); };
const pass = (message) => console.log(`✓ ${message}`);

const observationsText = readFileSync("data/observations.ts", "utf8");
const statusById = new Map();
for (const match of observationsText.matchAll(/"id":\s*"([^"]+)"[\s\S]*?"status":\s*"([^"]+)"/g)) {
  statusById.set(match[1], match[2]);
}

function filesUnder(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...filesUnder(full));
    else out.push(full);
  }
  return out;
}

const pageFiles = filesUnder("app").filter((p) => p.endsWith("page.tsx"));
let evidenceRefs = 0;
for (const file of pageFiles) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(/const\s+(?:evidenceIds|ids)\s*=\s*\[([\s\S]*?)\];/g)) {
    for (const idMatch of match[1].matchAll(/"([^"]+)"/g)) {
      evidenceRefs += 1;
      const status = statusById.get(idMatch[1]);
      if (!status) fail(`${file} references unknown observation ${idMatch[1]}`);
      else if (status !== "verified") fail(`${file} publishes ${idMatch[1]} with status ${status}`);
    }
  }
}
if (!failures) pass(`${evidenceRefs} published observation references are verified`);

const requiredRoutes = [
  "app/pricing/roofing-costs/page.tsx",
  "app/pricing/reroof-cost/page.tsx",
  "app/roofing/long-run/page.tsx",
  "app/roofing/corrugated/page.tsx",
  "app/roofing/five-rib/page.tsx",
  "app/roofing/pressed-metal-tile/page.tsx",
  "app/roofing/tray-standing-seam/page.tsx",
  "app/guides/roof-pitch/page.tsx",
  "app/pricing/scaffolding-cost/page.tsx",
  "app/guides/roof-area/page.tsx"
];
for (const route of requiredRoutes) {
  if (!existsSync(route)) fail(`missing cornerstone route ${route}`);
}
if (requiredRoutes.every(existsSync)) pass("all 10 cornerstone routes exist");

const routeManifest = readFileSync("data/siteRoutes.ts", "utf8");
const expectedPaths = [
  "/pricing/roofing-costs", "/pricing/reroof-cost", "/roofing/long-run", "/roofing/corrugated",
  "/roofing/five-rib", "/roofing/pressed-metal-tile", "/roofing/tray-standing-seam", "/guides/roof-pitch",
  "/pricing/scaffolding-cost", "/guides/roof-area"
];
for (const path of expectedPaths) if (!routeManifest.includes(`path: "${path}"`)) fail(`sitemap route registry missing ${path}`);
if (!failures) pass("cornerstone routes are registered for sitemap generation");

const publicFiles = [
  ...filesUnder("app"), ...filesUnder("components"), ...filesUnder("public")
].filter((p) => !p.endsWith("app/api/enquiry/route.ts"));
for (const file of publicFiles) {
  if (!/\.(tsx?|mjs|js|html|css|md)$/.test(file)) continue;
  const text = readFileSync(file, "utf8");
  if (/insights@t3labs\.co\.uk|@t3labs\.co\.uk/i.test(text)) fail(`private destination email leaked into public-facing source: ${file}`);
}
if (!failures) pass("private destination email is not present in public-facing code/assets");

const forbiddenPhrases = [
  "Prototype build", "representative draft", "Integration planned", "awaiting existing tool audit",
  "before public launch", "DEVELOPMENT RATE CARD"
];
for (const file of publicFiles) {
  if (!/\.(tsx?|mjs|js|html|md)$/.test(file)) continue;
  const text = readFileSync(file, "utf8");
  for (const phrase of forbiddenPhrases) if (text.includes(phrase)) fail(`development wording \"${phrase}\" remains in ${file}`);
}
if (!failures) pass("development-only wording is absent from public-facing pages/tools");

// Framework-independent estimator smoke tests.
const estimator = await import(pathToFileURL(join(process.cwd(), "public/roofhub-estimator/src/index.mjs")).href);
const { newProject, newEntry, calculateEstimate } = estimator;
const base = newProject();
base.projectType = "new";
base.roofSystem = "corrugate";
base.entryMode = "manual";
base.measurementBasis = "actual";
base.reviewedComponents = true;
base.measurements = [newEntry("roofAreas", "actual", { value: 200 })];
base.access.choice = "exclude";
const newEstimate = calculateEstimate(base);
if (!newEstimate.ok || newEstimate.roofArea !== 200 || !(newEstimate.total.max > newEstimate.total.min)) {
  fail("detailed estimator new-roof smoke test failed");
} else pass("detailed estimator new-roof calculation smoke test passed");

const reroof = structuredClone(base);
reroof.projectType = "reroof";
reroof.existingRoof = "long-run";
reroof.asbestos = "negative";
const reroofEstimate = calculateEstimate(reroof);
if (!reroofEstimate.ok || !reroofEstimate.lines.some((line) => line.id === "removal.long-run")) {
  fail("detailed estimator reroof removal smoke test failed");
} else pass("detailed estimator reroof removal smoke test passed");

if (failures) {
  console.error(`\n${failures} content/core check(s) failed.`);
  process.exit(1);
}
console.log("\nRoofHub content/core checks passed.");
