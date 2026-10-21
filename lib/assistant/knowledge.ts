import { OBSERVATIONS } from "@/data/observations";
import { ARTICLES, articleSourceIds, flattenBlocks, getManufacturerConstraint, getPractitionerObservation, getSource } from "@/data/research";
import type { ResearchArticle, ResearchBlock } from "@/data/research/types";
import type { AssistantSource } from "@/lib/assistant/types";
import { classifyKnowledgeTopic, expandedQueryTokens, isRoofingContextPath, isRoofingDomainQuery, rankArticles, rankFaqs, rankSections, retrievalDiagnostics, textScore } from "@/lib/assistant/knowledge-ranker.mjs";

export type AssistantKnowledgeConfidence = "strong" | "medium" | "weak" | "none";
export type AssistantKnowledgeGapReason = "matched" | "no_match" | "weak_match" | "ambiguous" | "out_of_domain";
export type AssistantKnowledgeTopic =
  | "cost-pricing" | "quotes-contracts" | "measurements-geometry" | "consent-compliance"
  | "roofers-project-planning" | "leaks-moisture" | "drainage" | "flashings-penetrations"
  | "materials-systems" | "maintenance-restoration" | "insulation-ventilation" | "solar"
  | "insurance" | "warranties" | "safety-asbestos" | "unknown";

export type AssistantKnowledgeDiagnostics = {
  confidence: AssistantKnowledgeConfidence;
  matchArticleId: string | null;
  gapReason: AssistantKnowledgeGapReason;
  topic: AssistantKnowledgeTopic;
};

export type AssistantKnowledgeBundle = {
  contextText: string;
  sources: AssistantSource[];
  hasPricingEvidence: boolean;
  /** Useful for QA and server logs. Never treated as a model-generated citation. */
  articleIds: string[];
  diagnostics: AssistantKnowledgeDiagnostics;
};

function blockText(block: ResearchBlock): string {
  if (block.type === "paragraph" || block.type === "notice") return block.text;
  if (block.type === "checklist") return block.items.join(" ");
  if (block.type === "table") return [block.caption, ...block.heads, ...block.rows.flatMap(row => row.cells)].join(" ");
  if (block.type === "details") return [block.title, ...block.blocks.map(blockText)].join(" ");
  if (block.type === "action") return `${block.title} ${block.text} ${block.label}`;
  if (block.type === "evidence-lens") {
    const practitioner = block.practitionerIds.map(id => getPractitionerObservation(id).claim);
    const manufacturer = (block.manufacturerIds ?? []).map(id => getManufacturerConstraint(id).claim);
    return [block.title, ...practitioner, ...manufacturer, `RoofHub synthesis: ${block.synthesis}`].join(" ");
  }
  return "";
}

function articleSnippet(article: ResearchArticle, queryTokens: string[]): string {
  const selectedSections = rankSections(article, queryTokens, blockText);
  const sectionSummaries = selectedSections.map(({ section }) => {
    const prose = flattenBlocks(section.blocks)
      .map(blockText)
      .filter(Boolean)
      .join(" ")
      .slice(0, 950);
    return `${section.title}: ${prose}`;
  });
  const selectedFaqs = rankFaqs(article, queryTokens).map(({ faq }) => `Q: ${faq.q} A: ${faq.a}`);
  return [
    `ROOFHUB PAGE: ${article.title}`,
    `Path: ${article.path}`,
    `Direct answer: ${article.answer}`,
    ...sectionSummaries,
    ...selectedFaqs
  ].join("\n");
}

function moneyValue(value: number | null | undefined): string {
  return value == null ? "unknown" : value.toLocaleString("en-NZ", { maximumFractionDigits: 2 });
}

function observationText(index: number): string {
  const observation = OBSERVATIONS[index];
  const amount = observation.amountExact != null
    ? moneyValue(observation.amountExact)
    : `${moneyValue(observation.amountLow)} to ${moneyValue(observation.amountHigh)}`;
  return [
    `VERIFIED PUBLISHED PRICE OBSERVATION: ${observation.item}`,
    `Amount: NZD ${amount} per ${observation.unit}`,
    `Basis: ${observation.priceBasis}; GST ${observation.gstBasis}; ${observation.region}.`,
    `Source: ${observation.sourceName}; source date ${observation.sourceDate ?? "not stated"}; last checked ${observation.lastCheckedAt}.`,
    `Context: ${observation.notes}`
  ].join(" ");
}

function pricingIntent(value: string): boolean {
  return /\b(cost|costs|price|prices|pricing|quote|quoted|estimate|allowance|per m2|per square|dollar|\$|nzd)\b/i.test(value);
}

function observationScore(index: number, queryTokens: string[]): number {
  const observation = OBSERVATIONS[index];
  if (observation.status !== "verified") return -1;
  const corpus = `${observation.item} ${observation.category} ${observation.roofSystem ?? ""} ${observation.priceBasis} ${observation.notes} ${observation.sourceName}`;
  return textScore(queryTokens, corpus, 3);
}

export function retrieveAssistantKnowledge(query: string, currentPath = "", topic = ""): AssistantKnowledgeBundle {
  const combined = `${query} ${topic}`.trim();
  const queryTokens = expandedQueryTokens(combined);
  const domainRelevant = isRoofingDomainQuery(combined) || isRoofingContextPath(currentPath);
  const rankedArticles = domainRelevant ? rankArticles(Object.values(ARTICLES), combined, currentPath, blockText, 4) : [];
  const baseDiagnostics = retrievalDiagnostics(rankedArticles, domainRelevant);
  const queryTopic = classifyKnowledgeTopic(combined);
  const matchedArticle = rankedArticles[0]?.article;
  const knowledgeTopic = queryTopic !== "unknown"
    ? queryTopic as AssistantKnowledgeTopic
    : matchedArticle
      ? classifyKnowledgeTopic(`${matchedArticle.title} ${(matchedArticle.topics ?? []).join(" ")}`) as AssistantKnowledgeTopic
      : "unknown";
  const diagnostics: AssistantKnowledgeDiagnostics = { ...baseDiagnostics, topic: knowledgeTopic };

  const sources = new Map<string, AssistantSource>();
  for (const { article } of rankedArticles) {
    sources.set(article.path, { label: article.title, href: article.path, kind: "roofhub" });
  }

  // Surface a small number of the primary/industry sources behind the most relevant
  // RoofHub pages. The article remains the curated answer, while these links let a
  // visitor inspect the underlying NZ evidence without asking the model to invent URLs.
  for (const { article } of rankedArticles.slice(0, 2)) {
    for (const id of articleSourceIds(article).slice(0, 2)) {
      const source = getSource(id);
      sources.set(source.url, { label: `${source.publisher}: ${source.title}`, href: source.url, kind: "external" });
    }
  }

  const priceIndexes = domainRelevant && pricingIntent(combined)
    ? OBSERVATIONS.map((_, index) => ({ index, score: observationScore(index, queryTokens) }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map(item => item.index)
    : [];

  for (const index of priceIndexes.slice(0, 3)) {
    const observation = OBSERVATIONS[index];
    sources.set(observation.sourceUrl, { label: observation.sourceName, href: observation.sourceUrl, kind: "external" });
  }

  const pageSourceNotes = rankedArticles.flatMap(({ article }) => articleSourceIds(article).slice(0, 4).map(id => {
    const source = getSource(id);
    return `EVIDENCE SOURCE: ${source.publisher}: ${source.title}. URL: ${source.url}. Reviewed ${source.reviewedAt}. ${source.note}`;
  }));

  const contextText = [
    ...rankedArticles.map(({ article }) => articleSnippet(article, queryTokens)),
    ...priceIndexes.map(observationText),
    ...pageSourceNotes.slice(0, 8)
  ].join("\n\n").slice(0, 16_000);

  return {
    contextText,
    sources: [...sources.values()].slice(0, 8),
    hasPricingEvidence: priceIndexes.length > 0,
    articleIds: rankedArticles.map(item => item.article.id),
    diagnostics
  };
}
