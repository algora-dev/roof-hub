import { OBSERVATIONS } from "@/data/observations";
import { ARTICLES, articleSourceIds, flattenBlocks, getSource } from "@/data/research";
import type { ResearchArticle, ResearchBlock } from "@/data/research/types";
import type { AssistantSource } from "@/lib/assistant/types";

export type AssistantKnowledgeBundle = {
  contextText: string;
  sources: AssistantSource[];
  hasPricingEvidence: boolean;
};

const stopWords = new Set([
  "a", "about", "an", "and", "are", "as", "at", "be", "can", "do", "for", "from", "how", "i", "in", "is", "it", "me", "my", "of", "on", "or", "roof", "roofing", "the", "this", "to", "what", "with"
]);

function tokens(value: string): string[] {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(/\s+/).filter(token => token.length > 1 && !stopWords.has(token));
}

function blockText(block: ResearchBlock): string {
  if (block.type === "paragraph" || block.type === "notice") return block.text;
  if (block.type === "checklist") return block.items.join(" ");
  if (block.type === "table") return [block.caption, ...block.heads, ...block.rows.flatMap(row => row.cells)].join(" ");
  if (block.type === "details") return [block.title, ...block.blocks.map(blockText)].join(" ");
  if (block.type === "action") return `${block.title} ${block.text} ${block.label}`;
  return "";
}

function articleCorpus(article: ResearchArticle): string {
  return [
    article.title,
    article.description,
    article.answer,
    article.category,
    ...article.sections.flatMap(section => [section.title, ...flattenBlocks(section.blocks).map(blockText)]),
    ...article.faqs.flatMap(faq => [faq.q, faq.a])
  ].join(" ");
}

const articleIndex = Object.values(ARTICLES).map(article => ({ article, corpus: articleCorpus(article), tokenSet: new Set(tokens(articleCorpus(article))) }));

function scoreTokens(queryTokens: string[], corpus: string, tokenSet: Set<string>): number {
  const lower = corpus.toLowerCase();
  let score = 0;
  for (const token of queryTokens) {
    if (tokenSet.has(token)) score += 3;
    if (lower.includes(token)) score += 1;
  }
  return score;
}

function articleSnippet(article: ResearchArticle): string {
  const sectionSummaries = article.sections.slice(0, 5).map(section => {
    const prose = flattenBlocks(section.blocks)
      .map(blockText)
      .filter(Boolean)
      .join(" ")
      .slice(0, 900);
    return `${section.title}: ${prose}`;
  });
  const faqs = article.faqs.slice(0, 4).map(faq => `Q: ${faq.q} A: ${faq.a}`);
  return [
    `ROOFHUB PAGE: ${article.title}`,
    `Path: ${article.path}`,
    `Direct answer: ${article.answer}`,
    ...sectionSummaries,
    ...faqs
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
  return scoreTokens(queryTokens, corpus, new Set(tokens(corpus)));
}

export function retrieveAssistantKnowledge(query: string, currentPath = "", topic = ""): AssistantKnowledgeBundle {
  const combined = `${query} ${topic}`.trim();
  const queryTokens = tokens(combined);
  const rankedArticles = articleIndex
    .map(item => ({ ...item, score: scoreTokens(queryTokens, item.corpus, item.tokenSet) + (item.article.path === currentPath ? 50 : 0) }))
    .sort((a, b) => b.score - a.score)
    .filter(item => item.score > 0 || item.article.path === currentPath)
    .slice(0, 4);


  const sources = new Map<string, AssistantSource>();
  for (const { article } of rankedArticles) {
    sources.set(article.path, { label: article.title, href: article.path, kind: "roofhub" });
  }

  const priceIndexes = pricingIntent(combined)
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
    return `EVIDENCE SOURCE: ${source.publisher}: ${source.title}. Reviewed ${source.reviewedAt}. ${source.note}`;
  }));

  const contextText = [
    ...rankedArticles.map(({ article }) => articleSnippet(article)),
    ...priceIndexes.map(observationText),
    ...pageSourceNotes.slice(0, 8)
  ].join("\n\n").slice(0, 16_000);

  return { contextText, sources: [...sources.values()].slice(0, 8), hasPricingEvidence: priceIndexes.length > 0 };
}
