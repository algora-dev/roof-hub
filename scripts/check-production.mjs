// Lightweight live-site release check. Run after deployment:
//   npm run check:production
// Override canonical URL with NEXT_PUBLIC_SITE_URL if required.

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.roofhub.co.nz").replace(/\/+$/, "");
const EXPECT_INDEXING = process.env.EXPECT_INDEXING !== "false";
const CANONICAL_HOST = new URL(SITE).host;
const checks = [
  "/",
  "/pricing/roofing-costs",
  "/pricing/reroof-cost",
  "/roofing/long-run",
  "/guides/roof-pitch",
  "/methodology",
  "/sources",
  "/contact"
];

let failures = 0;
function fail(message) { failures += 1; console.error(`✗ ${message}`); }
function pass(message) { console.log(`✓ ${message}`); }

async function fetchText(path) {
  const response = await fetch(`${SITE}${path}`, { redirect: "manual", headers: { "User-Agent": "RoofHubReleaseCheck/1.0" } });
  const text = await response.text();
  return { response, text };
}

for (const path of checks) {
  try {
    const { response, text } = await fetchText(path);
    if (response.status !== 200) { fail(`${path} returned ${response.status}`); continue; }
    pass(`${path} returned 200`);

    const expectedCanonical = path === "/" ? SITE : `${SITE}${path}`;
    const escaped = expectedCanonical.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!new RegExp(`<link[^>]+rel=["']canonical["'][^>]+href=["']${escaped}["']`, "i").test(text) &&
        !new RegExp(`<link[^>]+href=["']${escaped}["'][^>]+rel=["']canonical["']`, "i").test(text)) {
      fail(`${path} is missing canonical ${expectedCanonical}`);
    } else pass(`${path} canonical is correct`);

    const xRobots = response.headers.get("x-robots-tag") || "";
    const metaNoIndex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(text) ||
      /<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(text);
    if (EXPECT_INDEXING && (xRobots.toLowerCase().includes("noindex") || metaNoIndex)) fail(`${path} is unexpectedly noindex`);
    if (!EXPECT_INDEXING && !(xRobots.toLowerCase().includes("noindex") || metaNoIndex)) fail(`${path} is expected to be noindex but is not`);
  } catch (error) {
    fail(`${path} check failed: ${error instanceof Error ? error.message : error}`);
  }
}

try {
  const response = await fetch(`${SITE}/robots.txt`, { redirect: "follow" });
  const text = await response.text();
  if (!response.ok) fail(`/robots.txt returned ${response.status}`);
  else if (EXPECT_INDEXING && /Disallow:\s*\/$/m.test(text)) fail("robots.txt blocks the whole site while indexing is expected");
  else pass("robots.txt matches expected launch state");
} catch (error) { fail(`robots.txt check failed: ${error}`); }

try {
  const response = await fetch(`${SITE}/sitemap.xml`, { redirect: "follow" });
  const text = await response.text();
  if (!response.ok) fail(`/sitemap.xml returned ${response.status}`);
  else if (EXPECT_INDEXING && !text.includes(`<loc>${SITE}/pricing/roofing-costs</loc>`)) fail("sitemap is missing cornerstone pricing URL");
  else if (text.includes("/tools/detailed-roof-estimator")) fail("noindex detailed estimator should not be in sitemap");
  else pass("sitemap state is correct");
} catch (error) { fail(`sitemap check failed: ${error}`); }

// Root host should redirect to www for the current Vercel configuration.
if (CANONICAL_HOST === "www.roofhub.co.nz") {
  try {
    const response = await fetch("https://roofhub.co.nz/", { redirect: "manual" });
    const location = response.headers.get("location") || "";
    if (![301, 308].includes(response.status) || !location.startsWith(SITE)) fail(`root host redirect is ${response.status} -> ${location || "(none)"}`);
    else pass(`roofhub.co.nz redirects permanently to ${CANONICAL_HOST}`);
  } catch (error) { fail(`root host redirect check failed: ${error}`); }
}

if (failures) {
  console.error(`\n${failures} release check(s) failed.`);
  process.exit(1);
}
console.log("\nRoofHub production checks passed.");
