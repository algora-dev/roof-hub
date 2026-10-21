import { existsSync, readFileSync } from "node:fs";
import { rankArticles } from "../lib/assistant/knowledge-ranker.mjs";

const read = path => readFileSync(path, "utf8");
const json = path => JSON.parse(read(path));
const articles = json("data/research/articles.json");
const sources = json("data/research/sources.json");
const routesText = read("data/siteRoutes.ts");
const knowledgeSource = read("lib/assistant/knowledge.ts");
const articleComponent = read("components/content/ResearchArticle.tsx");
const sourcePage = read("app/sources/page.tsx");
const methodology = read("app/methodology/page.tsx");
const quotePrepPage = read("app/guides/how-to-prepare-for-a-roofing-quote/page.tsx");

let checks = 0;
const failures = [];
function assert(condition, message) { checks++; if (!condition) failures.push(message); }

function blockText(block) {
  if (block.type === "paragraph" || block.type === "notice") return block.text;
  if (block.type === "checklist") return block.items.join(" ");
  if (block.type === "table") return [block.caption, ...block.heads, ...block.rows.flatMap(row => row.cells)].join(" ");
  if (block.type === "details") return [block.title, ...block.blocks.map(blockText)].join(" ");
  if (block.type === "action") return `${block.title} ${block.text} ${block.label}`;
  return "";
}

const wave1 = {
  "reroof-consent": "/guides/reroof-building-consent",
  "repair-or-replace": "/guides/roof-repair-or-replace",
  "leak-condensation": "/guides/roof-leak-or-condensation",
  "roof-underlay": "/guides/roof-underlay",
  "roof-flashings": "/guides/roof-flashings",
  "choose-roofer": "/guides/how-to-choose-a-roofer",
  "roof-warranties": "/guides/roof-warranties",
  "metal-roof-maintenance": "/guides/metal-roof-maintenance",
  "coastal-roofing": "/guides/coastal-roofing",
  "gutters-downpipes": "/guides/gutters-and-downpipes",
  "quote-prep": "/guides/how-to-prepare-for-a-roofing-quote"
};

for (const [id, path] of Object.entries(wave1)) {
  const article = articles[id];
  assert(article?.path === path, `${id} path missing or changed`);
  assert(article?.updatedAt === "2026-10-21", `${id} review date is not release date`);
  assert(Array.isArray(article?.aliases) && article.aliases.length > 0, `${id} lacks retrieval aliases`);
  assert(Array.isArray(article?.intents) && article.intents.length > 0, `${id} lacks assistant intents`);
  assert(Array.isArray(article?.topics) && article.topics.length > 0, `${id} lacks knowledge topics`);
  assert(existsSync(`app${path}/page.tsx`), `${path} page missing`);
  assert(routesText.includes(`path: "${path}"`), `${path} missing from route registry`);
}

// Knowledge drift boundary: every indexable substantive leaf in the three public
// knowledge namespaces must be backed by a structured article. Hub pages are explicit.
const hubPaths = new Set(["/guides", "/pricing", "/roofing"]);
const articlePaths = new Set(Object.values(articles).map(article => article.path));
const publicKnowledgeRoutes = [...routesText.matchAll(/path: "(\/(?:guides|pricing|roofing)(?:\/[^\"]*)?)"[^\n}]*/g)]
  .map(match => ({ path: match[1], row: match[0] }))
  .filter(route => !route.row.includes("indexable: false"));
for (const route of publicKnowledgeRoutes) {
  if (hubPaths.has(route.path)) continue;
  assert(articlePaths.has(route.path), `Indexable knowledge route is invisible to Assistant corpus: ${route.path}`);
}

assert(quotePrepPage.includes('getArticle("quote-prep")') && quotePrepPage.includes("ResearchArticlePage"), "quote-prep page is not driven by structured research");
assert(!quotePrepPage.includes("TECHNICAL_SOURCES"), "quote-prep legacy standalone knowledge remains in route");
assert(articleComponent.includes("citations={sources.map(s => s.url)}"), "article schema does not expose source citations across the research library");
assert(sourcePage.includes("latestReview") && !sourcePage.includes("Reviewed 28 September 2026"), "sources page review date is hardcoded/stale");
assert(methodology.includes("AI can organise the work. It is not treated as a roofing source."), "methodology lacks AI/editorial transparency");
assert(methodology.includes("the assistant uses the same knowledge library") || methodology.includes("The assistant uses the same knowledge library"), "methodology does not explain shared Assistant knowledge");
assert(knowledgeSource.includes("rankArticles") && knowledgeSource.includes("rankSections"), "assistant knowledge does not use relevance-ranked pages and sections");
assert(knowledgeSource.includes("articleIds"), "assistant retrieval lacks auditable article IDs");
assert(knowledgeSource.includes("URL: ${source.url}"), "assistant knowledge context does not expose exact registered evidence URLs");
assert(knowledgeSource.includes('kind: "external"'), "assistant does not expose bounded external authority links alongside RoofHub pages");
const launcherSource = read("components/assistant/AssistantLauncher.tsx");
assert(launcherSource.includes("<summary>Sources used</summary>"), "assistant source disclosure label does not cover RoofHub and external evidence links");

for (const id of [
  "bp-consents-2026", "bp-repair-exemption-2026", "bp-rbw-2026", "bp-choose-practitioner-2026",
  "bp-implied-warranties-2026", "ranz-choose-roofer-2026", "ranz-maintenance-2026", "ranz-reroof-guide-2026",
  "mrm-internal-moisture-2026", "mrm-underlay-2026", "mrm-ventilation-2026", "mrm-flashings-2026",
  "mrm-compatibility-2026", "mrm-maintenance-2026", "colorsteel-warranty-2026", "branz-roof-ventilation",
  "codehub-e1as1-2026", "branz-roof-drainage-2026"
]) {
  assert(Boolean(sources[id]), `authority source missing: ${id}`);
  assert(sources[id]?.reviewedAt === "2026-10-21", `authority source review date mismatch: ${id}`);
}

const retrievalCases = [
  ["Do I need council consent to replace my old metal roof?", "reroof-consent"],
  ["Should I repair this roof or replace the whole thing?", "repair-or-replace"],
  ["Is the water in my ceiling a roof leak or condensation?", "leak-condensation"],
  ["Can new roofing paper just go over the old underlay?", "roof-underlay"],
  ["What is a barge flashing and where is the valley?", "roof-flashings"],
  ["How do I check if a roofing contractor is properly licensed?", "choose-roofer"],
  ["What is the difference between a product warranty and workmanship warranty?", "roof-warranties"],
  ["How often should I clean and inspect a COLORSTEEL roof?", "metal-roof-maintenance"],
  ["What roof should I use near the sea with salt exposure?", "coastal-roofing"],
  ["How many downpipes and what size spouting do I need?", "gutters-downpipes"],
  ["What should I get ready before asking roofers for quotes?", "quote-prep"],
  ["Does decromastic roofing contain asbestos and can I waterblast it?", "decramastic"],
  ["How much does it cost to replace a roof in NZ?", "reroof-cost"],
  ["What is the surface area of my 25 degree roof?", "roof-area"],
  ["Corrugated iron or 5 rib for my house?", "corrugate-vs-five"]
];
const articleValues = Object.values(articles);
for (const [query, expected] of retrievalCases) {
  const ranked = rankArticles(articleValues, query, "", blockText, 4);
  const ids = ranked.map(item => item.article.id);
  assert(ids.slice(0, 2).includes(expected), `Retrieval miss for "${query}": expected ${expected} in top 2, got ${ids.join(", ")}`);
}

// Current-page context must win even for a vague follow-up.
const currentPage = rankArticles(articleValues, "Can you explain that?", "/guides/roof-underlay", blockText, 4);
assert(currentPage[0]?.article.id === "roof-underlay", "current-page relevance boost regressed");

// Fresh safety update remains on the established URL rather than creating a competing page.
assert(articles.decramastic.updatedAt === "2026-10-21", "Decramastic safety page was not refreshed");
assert(JSON.stringify(articles.decramastic).includes("20 August 2026"), "Fresh WorkSafe asbestos alert not reflected in Decramastic guide");
assert(sources.asbestos?.publishedAt === "2026-08-20", "WorkSafe alert publication date missing");

if (failures.length) {
  console.error(failures.join("\n"));
  console.error(`${failures.length}/${checks} Knowledge & Authority checks failed`);
  process.exit(1);
}
console.log(`${checks} Knowledge & Authority checks passed; ${Object.keys(articles).length} structured articles and ${Object.keys(sources).length} registered sources.`);
