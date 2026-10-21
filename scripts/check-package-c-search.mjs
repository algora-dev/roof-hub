import { readFileSync, existsSync } from "node:fs";

const read = path => readFileSync(path, "utf8");
const json = path => JSON.parse(read(path));
const articles = json("data/research/articles.json");
const sources = json("data/research/sources.json");
const routes = read("data/siteRoutes.ts");
const actions = read("lib/article-actions.ts");
const rates = read("lib/estimator/rate-card.ts");
const estimatorRates = read("public/roofhub-estimator/src/core/rates.mjs");
const homepage = read("app/page.tsx");
const pricing = read("app/pricing/page.tsx");
const guides = read("app/guides/page.tsx");
const roofing = read("app/roofing/page.tsx");
const navigation = read("lib/assistant/navigation.ts");

let checks = 0;
const failures = [];
function assert(condition, message) { checks++; if (!condition) failures.push(message); }

for (const [id, path] of [
  ["compare-quotes", "/guides/compare-roofing-quotes"],
  ["new-roof-cost", "/pricing/new-roof-cost"],
  ["membrane", "/roofing/membrane"]
]) {
  const article = articles[id];
  assert(article?.path === path, `${id} search intent route changed or missing`);
  assert(existsSync(`app${path}/page.tsx`), `${path} route file missing`);
  assert(routes.includes(`path: "${path}"`), `${path} missing sitemap registry entry`);
  assert(article?.updatedAt === "2026-10-20", `${id} review date mismatch`);
}

assert(articles["new-roof-cost"].title.toLowerCase().includes("new roof cost nz"), "new-build cost title lost target intent");
assert(articles["reroof-cost"].title.toLowerCase().includes("roof replacement cost nz"), "replacement cost title lost target intent");
assert(!articles["new-roof-cost"].answer.toLowerCase().includes("national average"), "new-roof article invents a national average");
assert(articles["new-roof-cost"].answer.includes("source"), "new-roof answer lost source-specific framing");
assert(articles.membrane.sections.some(section => section.id === "pricing" && JSON.stringify(section).includes("does not currently publish a membrane result")), "membrane pricing guard missing from article");
assert(articles["compare-quotes"].sections.some(section => JSON.stringify(section).includes("/tools/quote-checker")), "quote guide no longer funnels into Quote Checker");

assert(actions.includes('article.id === "new-roof-cost"') && actions.includes('project = "new"'), "new-roof contextual action does not preselect new project");
assert(actions.includes('article.id === "membrane"') && actions.includes('product = "membrane"'), "membrane contextual action does not preserve membrane product");
assert(actions.includes('article.id === "compare-quotes"') && actions.includes('"/tools/quote-checker"'), "compare-quotes action no longer opens Quote Checker");

for (const id of ["cp-quotes-2026","comcom-quotes-2026","ird-gst-2026","building-contracts-2026","ranz-comparing-quotes","tasman-new-roof-2026","branz-membranes-matter","codehub-rubco-2023","nuralite-membrane-options","ardex-tpo"]) {
  assert(Boolean(sources[id]), `Phase 6 source missing: ${id}`);
  assert(sources[id]?.reviewedAt === "2026-10-20", `Phase 6 source not reviewed on release date: ${id}`);
}
assert(sources["tasman-new-roof-2026"].note.toLowerCase().includes("not a national survey"), "contractor cost guide lost source-specific caveat");

assert(rates.includes('status: "approved"') && rates.includes('publicationVersion: "V1"'), "V1 publication state must stay declared in the rate-card registry");
assert(rates.includes('membrane: "not-configured"'), "Package C must not configure membrane estimator pricing");
assert(/approved\s*:\s*true/.test(estimatorRates) && /approvedAt\s*:\s*'2026-10-21'/.test(estimatorRates), "browser estimator V1 publication guard changed");
assert(!estimatorRates.includes("tasman-new-roof-2026"), "editorial cost guide leaked into estimator rate card");

assert(routes.includes('path: "/tools/quote-checker", lastModified: "2026-10-20", priority: 0.2, changeFrequency: "monthly", indexable: false'), "Quote Checker indexing boundary changed");
assert(routes.includes('path: "/tools/detailed-roof-estimator", lastModified: "2026-09-26", priority: 0.2, changeFrequency: "monthly", indexable: false'), "detailed estimator release boundary changed");

for (const snippet of ["compare-quotes", "new-roof-cost", "membrane"]) assert(homepage.includes(snippet), `homepage missing Package C path: ${snippet}`);
assert(pricing.includes("/pricing/new-roof-cost") && pricing.includes("/tools/quote-checker"), "pricing hub missing new-build or quote-check path");
assert(guides.includes("compare-quotes") && guides.includes("membrane"), "guides hub missing new Package C guide paths");
assert(roofing.includes("/roofing/membrane"), "roofing hub missing membrane system");
assert(navigation.includes("/guides/compare-roofing-quotes") && navigation.includes("/roofing/membrane"), "assistant navigation catalogue missing Package C content");

// Early page-one product/comparison articles stay structurally conservative.
for (const [id,date] of [["corrugate-vs-five","2026-09-28"],["five-rib","2026-09-29"],["colorsteel-zincalume","2026-09-28"],["corrugated","2026-09-28"],["lifespan","2026-09-28"]]) {
  assert(articles[id]?.updatedAt === date, `high-signal article ${id} was unnecessarily rewritten`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  console.error(`${failures.length}/${checks} Package C search checks failed`);
  process.exit(1);
}
console.log(`${checks} Package C search/content architecture checks passed.`);
