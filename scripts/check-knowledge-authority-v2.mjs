import { existsSync, readFileSync } from "node:fs";
import { classifyKnowledgeTopic, isRoofingContextPath, isRoofingDomainQuery, rankArticles, retrievalDiagnostics } from "../lib/assistant/knowledge-ranker.mjs";

const read = path => readFileSync(path, "utf8");
const json = path => JSON.parse(read(path));
const articles = json("data/research/articles.json");
const sources = json("data/research/sources.json");
const evalCases = json("data/assistant/knowledge-eval.json");
const routesText = read("data/siteRoutes.ts");
const knowledgeSource = read("lib/assistant/knowledge.ts");
const analyticsEvents = read("lib/analytics-events.ts");
const analyticsClient = read("lib/client/analytics.ts");
const launcher = read("components/assistant/AssistantLauncher.tsx");
const navigation = read("lib/assistant/navigation.ts");
const schema = read("components/evidence/ArticleSchema.tsx");
const articleComponent = read("components/content/ResearchArticle.tsx");
const privacy = read("app/privacy/page.tsx");

let checks = 0;
const failures = [];
function assert(condition, message) { checks += 1; if (!condition) failures.push(message); }

function blockText(block) {
  if (block.type === "paragraph" || block.type === "notice") return block.text;
  if (block.type === "checklist") return block.items.join(" ");
  if (block.type === "table") return [block.caption, ...block.heads, ...block.rows.flatMap(row => row.cells)].join(" ");
  if (block.type === "details") return [block.title, ...block.blocks.map(blockText)].join(" ");
  if (block.type === "action") return `${block.title} ${block.text} ${block.label}`;
  if (block.type === "evidence-lens") return `${block.title} ${block.synthesis}`;
  return "";
}

function sourceIdsFromBlock(block, out) {
  if (Array.isArray(block.sources)) block.sources.forEach(id => out.add(id));
  if (block.type === "table") block.rows.forEach(row => row.sources.forEach(id => out.add(id)));
  if (block.type === "details") block.blocks.forEach(child => sourceIdsFromBlock(child, out));
}

const wave2 = {
  "roof-parts": "/guides/roof-parts",
  "reroof-process": "/guides/reroof-process",
  "roofing-contracts": "/guides/roofing-contracts-deposits-variations",
  "roof-penetrations": "/guides/roof-penetrations-skylights-flues",
  "roof-painting": "/guides/roof-painting-or-replacement",
  "roof-ventilation": "/guides/roof-ventilation",
  "roof-problems": "/guides/roof-problems",
  "solar-roof": "/guides/solar-panels-and-roofing",
  "roof-insulation-reroof": "/guides/roof-insulation-when-reroofing",
  "roof-insurance": "/guides/roof-insurance-storm-damage"
};

assert(Object.keys(articles).length >= 41, `Expected at least 41 structured articles, got ${Object.keys(articles).length}`);
assert(Object.keys(sources).length >= 168, `Expected at least 168 registered sources, got ${Object.keys(sources).length}`);
assert(evalCases.length >= 210, `Expected at least 210 Assistant retrieval cases, got ${evalCases.length}`);

for (const [id, path] of Object.entries(wave2)) {
  const article = articles[id];
  assert(article?.path === path, `${id} path missing or changed`);
  assert(article?.publishedAt === "2026-10-21" && article?.updatedAt === "2026-10-21", `${id} release/review date mismatch`);
  assert(Array.isArray(article?.answerSources) && article.answerSources.length > 0, `${id} direct answer is not source-backed`);
  assert(Array.isArray(article?.aliases) && article.aliases.length >= 3, `${id} lacks retrieval aliases`);
  assert(Array.isArray(article?.intents) && article.intents.length >= 3, `${id} lacks retrieval intents`);
  assert(Array.isArray(article?.topics) && article.topics.length >= 3, `${id} lacks knowledge topics`);
  assert(article?.sections?.length >= 3, `${id} is too thin for authority release`);
  assert(existsSync(`app${path}/page.tsx`), `${path} route page missing`);
  assert(routesText.includes(`path: "${path}"`), `${path} missing from route registry`);
}

// Every evidence citation inside every structured article must resolve through the source registry.
for (const article of Object.values(articles)) {
  const ids = new Set(article.answerSources ?? []);
  for (const section of article.sections ?? []) for (const block of section.blocks ?? []) sourceIdsFromBlock(block, ids);
  for (const faq of article.faqs ?? []) for (const id of faq.sources ?? []) ids.add(id);
  for (const id of ids) assert(Boolean(sources[id]), `${article.id} references unknown source ID ${id}`);
}

// V2 retrieval fixture: generated breadth + hand-written ambiguous/synonym/current-page cases.
const articleValues = Object.values(articles);
for (const test of evalCases) {
  const domainRelevant = isRoofingDomainQuery(test.query) || isRoofingContextPath(test.currentPath ?? "");
  assert(domainRelevant === test.domain, `${test.id} domain gate mismatch for: ${test.query}`);
  if (!test.domain) continue;
  const ranked = rankArticles(articleValues, test.query, test.currentPath ?? "", blockText, Math.max(4, test.maxRank ?? 3));
  const rank = ranked.findIndex(item => item.article.id === test.expectedArticle) + 1;
  assert(rank > 0 && rank <= test.maxRank, `${test.id} retrieval miss: expected ${test.expectedArticle} <= ${test.maxRank}; got ${rank || "none"} (${ranked.map(item => item.article.id).join(", ")})`);
  const diagnostics = retrievalDiagnostics(ranked, domainRelevant);
  assert(diagnostics.confidence !== "none", `${test.id} returned no knowledge confidence despite a roofing-domain match`);
  assert(["matched", "ambiguous", "weak_match"].includes(diagnostics.gapReason), `${test.id} returned invalid matched diagnostics: ${diagnostics.gapReason}`);
}

for (const query of [
  "Should I buy a blue car?",
  "Give me a chicken curry recipe",
  "Help me choose a laptop for video editing",
  "What is the capital of Peru?"
]) assert(!isRoofingDomainQuery(query), `Out-of-domain query incorrectly admitted: ${query}`);

assert(isRoofingDomainQuery("Can I replace tiles with metal?"), "NZ shorthand tile-to-metal query is not admitted");
assert(isRoofingDomainQuery("How many downpipes do I need?"), "NZ drainage query is not admitted");
assert(isRoofingDomainQuery("Do all roofs need vents?"), "ventilation query is not admitted");
assert(isRoofingDomainQuery("I have water in the ceiling"), "common leak symptom query is not admitted");
assert(isRoofingDomainQuery("What is a soffit?"), "roof terminology query is not admitted");
assert(Boolean(sources["mrm-glossary-definitions-2026"]), "Current NZMRM roof-parts glossary source is missing");
for (const [query, expected] of [
  ["I have water in the ceiling", "leaks-moisture"],
  ["Do I need building consent to reroof?", "consent-compliance"],
  ["The roofer wants a 50% deposit", "quotes-contracts"],
  ["Can solar panels go on this roof?", "solar"],
  ["How much is a 200 square metre roof?", "cost-pricing"],
  ["What is a soffit?", "flashings-penetrations"],
  ["Should I buy a blue car?", "unknown"]
]) assert(classifyKnowledgeTopic(query) === expected, `Knowledge topic classification mismatch for ${query}`);

// Current-page context is allowed to resolve intentionally vague follow-ups.
for (const [id, path] of Object.entries({
  "roof-underlay": "/guides/roof-underlay",
  "roofing-contracts": wave2["roofing-contracts"],
  "roof-ventilation": wave2["roof-ventilation"],
  "roof-parts": wave2["roof-parts"]
})) {
  const ranked = rankArticles(articleValues, "Can you explain that?", path, blockText, 4);
  assert(ranked[0]?.article.id === id, `Current-page boost failed for ${id}`);
}

assert(knowledgeSource.includes("isRoofingDomainQuery") && knowledgeSource.includes("isRoofingContextPath"), "Assistant retrieval lacks out-of-domain gate");
assert(knowledgeSource.includes("retrievalDiagnostics"), "Assistant retrieval does not use deterministic confidence diagnostics");
assert(knowledgeSource.includes("classifyKnowledgeTopic") && knowledgeSource.includes("topic: knowledgeTopic"), "Assistant diagnostics lack a privacy-safe topic bucket");
const outDiagnostics = retrievalDiagnostics([], false);
assert(outDiagnostics.confidence === "none" && outDiagnostics.gapReason === "out_of_domain", "Out-of-domain diagnostics are unsafe");
const weakDiagnostics = retrievalDiagnostics([{ article: articleValues[0], score: 12 }], true);
assert(weakDiagnostics.confidence === "weak" && weakDiagnostics.gapReason === "weak_match", "Weak-match diagnostics are not deterministic");
assert(knowledgeSource.includes("domainRelevant && pricingIntent"), "Published price observations can bypass the domain gate");
assert(analyticsEvents.includes('"assistant_knowledge_gap"') && analyticsEvents.includes('"assistant_feedback"'), "Knowledge feedback analytics events missing");
assert(launcher.includes('trackRoofHubEvent("assistant_knowledge_gap"'), "Assistant does not emit privacy-safe knowledge gap events");
assert(launcher.includes('trackRoofHubEvent("assistant_feedback"'), "Assistant answer feedback is not instrumented");
assert(launcher.includes("knowledgeTopic: diagnostics.topic") && launcher.includes("knowledgeTopic: turn.knowledgeDiagnostics?.topic"), "Assistant feedback/gap events omit safe knowledge topics");
assert(launcher.includes('data-clarity-mask="true"'), "Ask RoofHub conversation DOM is not explicitly masked from Clarity session replay");
assert(privacy.includes("explicitly masked from Microsoft Clarity session replay") && privacy.includes("privacy-safe knowledge topic"), "Privacy page does not explain Assistant replay masking and coarse feedback analytics");
assert(!analyticsClient.includes("message:"), "General analytics client accepts raw message text");
assert(!analyticsClient.includes("conversation:"), "General analytics client accepts raw conversation text");
assert(!analyticsClient.includes("query:"), "General analytics client accepts raw query text");
for (const key of ["knowledge_confidence", "knowledge_match", "gap_reason", "knowledge_topic", "feedback"]) assert(analyticsClient.includes(key), `Safe Assistant analytics field missing: ${key}`);

assert(schema.includes("about?: string[]") && schema.includes("keywords?: string[]"), "Article schema lacks topic/keyword metadata");
assert(articleComponent.includes("about={article.topics}"), "Research pages do not pass topics into Article schema");
assert(articleComponent.includes("{action.estimateLabel} →"), "Article sidebar still hard-codes an estimate CTA regardless of article intent");

const guides = read("app/guides/page.tsx");
for (const id of Object.keys(wave2)) assert(guides.includes(`'${id}'`), `${id} is not linked from the Guides topic hub`);
for (const path of Object.values(wave2)) assert(navigation.includes(path), `${path} is missing from common Assistant destinations`);

if (failures.length) {
  console.error(failures.join("\n"));
  console.error(`${failures.length}/${checks} Knowledge & Authority v2 checks failed`);
  process.exit(1);
}
console.log(`${checks} Knowledge & Authority v2 checks passed; ${Object.keys(articles).length} articles, ${Object.keys(sources).length} sources, ${evalCases.length} Assistant retrieval cases.`);
