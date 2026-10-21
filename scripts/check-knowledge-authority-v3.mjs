import { existsSync, readFileSync } from "node:fs";
import { assessRoofCondition } from "../lib/assistant/roof-condition-triage.mjs";
import { isRoofingContextPath, isRoofingDomainQuery, rankArticles, retrievalDiagnostics } from "../lib/assistant/knowledge-ranker.mjs";

const read = path => readFileSync(path, "utf8");
const json = path => JSON.parse(read(path));
const articles = json("data/research/articles.json");
const sources = json("data/research/sources.json");
const practitioner = json("data/research/practitioner-observations.json");
const manufacturer = json("data/research/manufacturer-constraints.json");
const evalCases = json("data/assistant/knowledge-eval.json");
const routes = read("data/siteRoutes.ts");
const component = read("components/content/ResearchArticle.tsx");
const methodology = read("app/methodology/page.tsx");
const sourcesPage = read("app/sources/page.tsx");
const orchestrator = read("lib/assistant/orchestrator.ts");
const knowledge = read("lib/assistant/knowledge.ts");
const navigation = read("lib/assistant/navigation.ts");

let checks = 0;
const failures = [];
const assert = (condition, message) => { checks += 1; if (!condition) failures.push(message); };

function blockText(block) {
  if (block.type === "paragraph" || block.type === "notice") return block.text;
  if (block.type === "checklist") return block.items.join(" ");
  if (block.type === "table") return [block.caption, ...block.heads, ...block.rows.flatMap(row => row.cells)].join(" ");
  if (block.type === "details") return [block.title, ...block.blocks.map(blockText)].join(" ");
  if (block.type === "action") return `${block.title} ${block.text} ${block.label}`;
  if (block.type === "evidence-lens") {
    return [
      block.title,
      ...block.practitionerIds.map(id => practitioner[id]?.claim ?? ""),
      ...(block.manufacturerIds ?? []).map(id => manufacturer[id]?.claim ?? ""),
      block.synthesis
    ].join(" ");
  }
  return "";
}

const v3Articles = {
  "rusting-metal-roof": "/guides/rusting-metal-roof-repair-or-replace",
  "recurring-roof-leaks": "/guides/roof-keeps-leaking-after-repair",
  "concrete-tile-decision": "/guides/concrete-tile-roof-repair-restoration-or-replace",
  "decramastic-decision": "/guides/decramastic-roof-repair-restore-or-replace",
  "hidden-reroof-problems": "/guides/hidden-problems-found-during-reroof",
  "roof-condition-assessment": "/guides/roof-condition-assessment"
};

assert(Object.keys(articles).length >= 47, `Expected at least 47 articles, got ${Object.keys(articles).length}`);
assert(Object.keys(sources).length >= 189, `Expected at least 189 sources, got ${Object.keys(sources).length}`);
assert(Object.keys(practitioner).length >= 17, `Expected at least 17 practitioner observations, got ${Object.keys(practitioner).length}`);
assert(Object.keys(manufacturer).length === 10, `Expected 10 manufacturer constraints, got ${Object.keys(manufacturer).length}`);
assert(evalCases.length >= 290, `Expected at least 290 Assistant eval cases, got ${evalCases.length}`);

for (const [id, path] of Object.entries(v3Articles)) {
  const article = articles[id];
  assert(article?.path === path, `${id} path missing or changed`);
  assert(article?.publishedAt === "2026-10-21" && article?.updatedAt === "2026-10-21", `${id} date mismatch`);
  assert(Array.isArray(article?.answerSources) && article.answerSources.length >= 2, `${id} direct answer lacks authority sources`);
  assert((article?.aliases ?? []).length >= 4, `${id} retrieval aliases too thin`);
  assert((article?.intents ?? []).length >= 3, `${id} retrieval intents too thin`);
  assert((article?.topics ?? []).length >= 4, `${id} topics too thin`);
  assert((article?.sections ?? []).length >= 4, `${id} content too thin`);
  assert(existsSync(`app${path}/page.tsx`), `${path} page missing`);
  assert(routes.includes(`path: "${path}"`), `${path} route registry entry missing`);
  assert(navigation.includes(path), `${path} missing from Assistant destination list`);
}

for (const [id, observation] of Object.entries(practitioner)) {
  assert(observation.id === id, `Practitioner observation key mismatch ${id}`);
  assert(Boolean(sources[observation.sourceId]), `${id} source missing: ${observation.sourceId}`);
  assert(sources[observation.sourceId]?.evidenceRole === "practitioner-observation", `${id} source role is not practitioner-observation`);
  assert(sources[observation.sourceId]?.commercialInterest && sources[observation.sourceId].commercialInterest !== "none", `${id} practitioner source commercial interest is not disclosed`);
  assert(["repair", "restore", "replace", "investigate", "reroof-prep"].includes(observation.pathway), `${id} pathway invalid`);
  assert(["low", "medium", "high"].includes(observation.confidence), `${id} confidence invalid`);
  assert(observation.limitations?.length > 35, `${id} limitations are too thin`);
  for (const sid of observation.corroboratingSourceIds ?? []) assert(Boolean(sources[sid]), `${id} corroborating source missing: ${sid}`);
}

for (const [id, constraint] of Object.entries(manufacturer)) {
  assert(constraint.id === id, `Manufacturer constraint key mismatch ${id}`);
  const source = sources[constraint.sourceId];
  assert(Boolean(source), `${id} source missing: ${constraint.sourceId}`);
  assert(["manufacturer", "industry-technical"].includes(source?.kind), `${id} is not tied to manufacturer/technical material`);
  assert(["manufacturer-technical", "industry-guidance"].includes(source?.evidenceRole ?? "manufacturer-technical"), `${id} source evidence role is inappropriate`);
  assert(constraint.applicability?.length > 25, `${id} lacks product/system applicability limits`);
}

let lensCount = 0;
for (const article of Object.values(articles)) for (const section of article.sections ?? []) for (const block of section.blocks ?? []) {
  if (block.type !== "evidence-lens") continue;
  lensCount += 1;
  assert(block.synthesis?.length > 80, `${article.id}/${section.id} evidence lens lacks independent synthesis`);
  for (const id of block.practitionerIds ?? []) assert(Boolean(practitioner[id]), `${article.id} references unknown practitioner observation ${id}`);
  for (const id of block.manufacturerIds ?? []) assert(Boolean(manufacturer[id]), `${article.id} references unknown manufacturer constraint ${id}`);
}
assert(lensCount >= 8, `Expected at least eight practitioner/manufacturer evidence lenses, got ${lensCount}`);
assert(component.includes("What NZ roofing practitioners report") && component.includes("RoofHub synthesis"), "Public evidence-lens renderer is missing evidence separation");
assert(component.includes("Commercial interest") || component.includes("Commercial source"), "Research source UI does not disclose commercial interest");
assert(knowledge.includes('block.type === "evidence-lens"'), "Assistant retrieval ignores evidence-lens content");

// Deterministic neutral triage: it should choose direction from condition facts, not age or pricing.
const triageCases = [
  [{ roofSystem: "metal", issueSpread: "localised", recurrence: "first-time", surfaceCondition: "local-damage", activeLeaks: "one-area", suspectedAsbestos: "no" }, "repair-plausible"],
  [{ roofSystem: "metal", issueSpread: "multiple-areas", recurrence: "first-time", surfaceCondition: "surface-wear", activeLeaks: "none", suspectedAsbestos: "no" }, "restoration-plausible"],
  [{ roofSystem: "metal", issueSpread: "widespread", recurrence: "repeated-different-areas", surfaceCondition: "perforation-or-missing-material", activeLeaks: "multiple-areas", suspectedAsbestos: "no" }, "replacement-plausible"],
  [{ roofSystem: "pressed-metal-tile", issueSpread: "unknown", recurrence: "unknown", surfaceCondition: "unknown", activeLeaks: "unknown", suspectedAsbestos: "yes" }, "safety-first"],
  [{ roofSystem: "metal", issueSpread: "localised", recurrence: "first-time", surfaceCondition: "sagging-or-structural-movement", activeLeaks: "one-area", suspectedAsbestos: "no" }, "inspection-needed"],
  [{ roofSystem: "unknown", issueSpread: "unknown", recurrence: "unknown", surfaceCondition: "unknown", activeLeaks: "unknown", suspectedAsbestos: "unknown" }, "inspection-needed"]
];
for (const [input, expected] of triageCases) {
  const result = assessRoofCondition(input);
  assert(result.direction === expected, `Triage expected ${expected}, got ${result.direction}`);
  assert(["low", "medium"].includes(result.confidence), "Triage confidence must stay conservative");
  assert(!("price" in result) && !("cost" in result), "Triage must not emit pricing");
  assert(typeof result.caution === "string" && result.caution.length > 45, "Triage must include a meaningful scope/diagnostic caution");
}
assert(assessRoofCondition({ roofSystem: "metal", issueSpread: "localised", recurrence: "first-time", surfaceCondition: "local-damage", activeLeaks: "none", suspectedAsbestos: "no", age: 80 }).direction === "repair-plausible", "Triage must not convert age into an automatic reroof rule");

assert(orchestrator.includes('name: "assess_roof_condition"'), "Assistant condition-triage tool is missing");
assert(orchestrator.includes("lowest adequate intervention"), "Assistant instructions do not state the neutral decision objective");
assert(orchestrator.includes("Never claim Google Earth") && orchestrator.includes("aerial imagery"), "Assistant instructions lack aerial-condition limits");
assert(orchestrator.includes("do not ask a user to climb onto a roof") || orchestrator.includes("Do not ask users to climb onto a roof"), "Assistant roof-access safety rule missing");

assert(methodology.includes("Manufacturer constraints and practitioner observations answer different questions"), "Methodology does not separate manufacturer/practitioner evidence");
assert(methodology.includes("commercial interest") && methodology.includes("lowest adequate intervention"), "Methodology lacks commercial-bias/neutrality method");
assert(sourcesPage.includes("Contractor and restoration-business material is used as practitioner evidence"), "Sources page does not explain practitioner evidence role");
assert(sourcesPage.includes("manufacturer") && sourcesPage.includes("commercial interest"), "Sources page lacks source-role separation");

const articleValues = Object.values(articles);
for (const test of evalCases.filter(test => test.id.startsWith("v3-"))) {
  const domain = isRoofingDomainQuery(test.query) || isRoofingContextPath(test.currentPath ?? "");
  assert(domain === test.domain, `${test.id} domain gate mismatch`);
  const ranked = rankArticles(articleValues, test.query, test.currentPath ?? "", blockText, Math.max(4, test.maxRank ?? 3));
  const rank = ranked.findIndex(item => item.article.id === test.expectedArticle) + 1;
  assert(rank > 0 && rank <= test.maxRank, `${test.id} retrieval miss: ${test.expectedArticle} rank ${rank || "none"}; ${ranked.map(x => x.article.id).join(", ")}`);
  const diagnostic = retrievalDiagnostics(ranked, domain);
  assert(diagnostic.confidence !== "none", `${test.id} returned no confidence`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  console.error(`${failures.length}/${checks} Knowledge & Authority v3 checks failed`);
  process.exit(1);
}
console.log(`${checks} Knowledge & Authority v3 checks passed; ${Object.keys(articles).length} articles, ${Object.keys(sources).length} sources, ${Object.keys(practitioner).length} practitioner observations, ${Object.keys(manufacturer).length} manufacturer constraints, ${evalCases.length} Assistant eval cases.`);
