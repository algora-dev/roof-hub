const stopWords = new Set([
  "a", "about", "an", "and", "are", "as", "at", "be", "can", "do", "for", "from", "how", "i", "in", "is", "it", "me", "my", "of", "on", "or", "re", "roof", "roofing", "the", "this", "to", "what", "with"
]);

/** NZ roofing terms that visitors commonly use interchangeably in questions. */
const synonymGroups = [
  ["reroof", "reroofing", "re roof", "re roofing", "roof replacement", "replace roof"],
  ["spouting", "gutter", "gutters"],
  ["downpipe", "downpipes", "rainwater pipe"],
  ["long run", "longrun", "metal roof", "steel roof", "iron roof"],
  ["barge", "verge"],
  ["roofer", "roofers", "roofing contractor", "roofing company", "installer", "tradesperson"],
  ["consent", "council", "exempt", "exemption", "schedule 1"],
  ["damp", "moisture", "condensation", "condensate", "sweating"],
  ["leak", "leaking", "water ingress"],
  ["warranty", "warranties", "guarantee", "guarantees"],
  ["underlay", "roofing underlay", "roofing paper", "building paper"],
  ["flashing", "flashings", "ridge", "hip", "valley", "apron", "barge", "verge"],
  ["coastal", "coast", "marine", "sea spray", "seaspray", "salt exposure"],
  ["decramastic", "decromastic", "asbestos roof tile", "asbestos tile"],
  ["five rib", "5 rib", "trapezoidal"],
  ["standing seam", "tray roof", "euro tray"],
  ["pitch", "slope", "roof angle"],
  ["area", "square metres", "square meters", "m2"],
  ["solar", "solar panel", "solar panels", "pv", "photovoltaic"],
  ["paint", "painting", "roof coating", "recoat", "recoating", "restore", "restoration"],
  ["insurance", "insured", "claim", "storm damage", "weather damage"],
  ["ventilation", "ventilate", "roof vent", "roof vents", "roof cavity ventilation"],
  ["insulation", "insulate", "ceiling insulation", "roof insulation", "skillion insulation"],
  ["penetration", "penetrations", "skylight", "rooflight", "flue", "pipe boot", "roof vent"],
  ["contract", "contracts", "deposit", "progress payment", "variation", "variations"],
  ["ridge", "hip", "valley", "barge", "verge", "eaves", "apron", "roof parts", "roof anatomy"],
  ["repeat leak", "recurring leak", "keeps leaking", "leak came back", "still leaking", "same leak"],
  ["rust", "rusty", "rusting", "corrosion", "corroded", "rust hole", "rust holes", "pinholes", "perforated", "perforation"],
  ["repair or replace", "repair restore replace", "restore or replace", "does roof need replacing", "roof condition", "condition assessment"],
  ["repoint", "repointing", "rebed", "rebedding", "ridge mortar", "hip mortar"],
  ["hidden damage", "concealed damage", "rotten purlin", "rotten purlins", "opening up", "strip off", "stripping roof", "unforeseen work"]
];

const knowledgeTopicGroups = [
  ["safety-asbestos", ["asbestos", "decramastic", "decromastic", "brittle roof", "fall", "working at height", "roof safety"]],
  ["consent-compliance", ["consent", "council", "exemption", "schedule 1", "lbp", "restricted building work", "building code", "compliance"]],
  ["insurance", ["insurance", "claim", "storm damage", "weather damage", "insured"]],
  ["solar", ["solar", "photovoltaic", "pv"]],
  ["insulation-ventilation", ["insulation", "insulate", "ventilation", "ventilate", "roof vent", "roof cavity", "skillion", "condensation"]],
  ["leaks-moisture", ["leak", "leaking", "water ingress", "water in ceiling", "water in the ceiling", "wet ceiling", "ceiling stain", "drip from ceiling", "damp", "moisture", "keeps leaking", "recurring leak", "leak came back"]],
  ["drainage", ["spouting", "gutter", "downpipe", "rainwater", "internal gutter", "secret gutter"]],
  ["flashings-penetrations", ["flashing", "ridge", "hip", "valley", "barge", "verge", "apron", "penetration", "skylight", "rooflight", "flue", "pipe boot", "soffit", "fascia", "purlin", "rafter"]],
  ["warranties", ["warranty", "guarantee", "workmanship warranty", "product warranty"]],
  ["quotes-contracts", ["quote", "quoted", "contract", "deposit", "progress payment", "variation", "estimate", "scope", "allowance"]],
  ["measurements-geometry", ["roof area", "area", "square metres", "m2", "pitch", "slope", "roof angle", "measurement", "measurements"]],
  ["maintenance-restoration", ["maintenance", "maintain", "paint", "painting", "recoat", "coating", "restore", "restoration", "rust", "rusting", "corrosion", "perforation", "repair or replace", "roof condition", "moss", "lichen"]],
  ["roofers-project-planning", ["roofer", "roofing contractor", "roofing company", "reroof process", "reroofing process", "hidden damage", "concealed damage", "rotten purlin", "opening up", "how long", "timeline", "scaffold", "scaffolding"]],
  ["materials-systems", ["corrugate", "corrugated", "five rib", "trapezoidal", "standing seam", "tray roof", "membrane", "pressed metal tile", "concrete tile", "long run", "colorsteel", "zincalume", "coastal"]],
  ["cost-pricing", ["how much", "cost", "costs", "price", "prices", "pricing", "budget", "dollar", "nzd", "per m2", "per square"]]
];

export function classifyKnowledgeTopic(value) {
  const normalized = ` ${normalise(value)} `;
  for (const [topic, signals] of knowledgeTopicGroups) {
    if (signals.some(signal => {
      const phrase = normalise(signal);
      return normalized.includes(` ${phrase} `);
    })) return topic;
  }
  return "unknown";
}

const roofingDomainSignals = [
  "roof", "roofs", "roofing", "reroof", "reroofing", "roofer", "roofers", "corrugate", "corrugated", "colorsteel", "zincalume", "decramastic", "decromastic",
  "five rib", "5 rib", "trapezoidal", "standing seam", "tray roof", "membrane roof", "pressed metal tile", "pressed metal tiles", "metal tile", "metal tiles", "textured metal tile", "textured metal tiles", "concrete tile", "concrete tiles", "roof tile", "roof tiles", "replace tiles with metal",
  "ridge", "hip", "valley", "barge", "verge", "eaves", "flashing", "flashings", "underlay", "spouting", "gutter", "gutters", "downpipe", "downpipes",
  "skylight", "skylights", "rooflight", "flue", "pitch", "scaffold", "scaffolding", "purlin", "fascia", "soffit", "cladding",
  "ventilation", "vent", "vents", "condensation", "leak", "leaks", "leaking", "moisture", "water in ceiling", "water in the ceiling", "wet ceiling", "ceiling stain", "ceiling stains", "drip from ceiling", "corrosion", "rust", "rusty", "asbestos", "coastal", "marine",
  "insulation", "solar", "warranty", "contract", "deposit", "variation", "consent", "lbp", "storm damage", "insurance claim", "repointing", "ridge mortar", "hidden damage", "rotten purlin", "opening up", "condition assessment", "perforated"
];

export function isRoofingDomainQuery(value) {
  const normalized = ` ${normalise(value)} `;
  return roofingDomainSignals.some(signal => {
    const phrase = normalise(signal);
    return phrase.includes(" ") ? normalized.includes(` ${phrase} `) : normalized.includes(` ${phrase} `);
  });
}

export function isRoofingContextPath(path) {
  return /^(?:\/(?:guides|pricing|roofing|tools)(?:\/|$)|\/methodology$|\/sources$)/.test(String(path ?? ""));
}


export function normalise(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

export function tokens(value, keepStopWords = false) {
  return normalise(value).split(/\s+/).filter(token => token.length > 1 && (keepStopWords || !stopWords.has(token)));
}

export function expandedQueryTokens(value) {
  const normalized = ` ${normalise(value)} `;
  const result = new Set(tokens(value));
  for (const group of synonymGroups) {
    const matched = group.some(term => {
      const phrase = normalise(term);
      return phrase.includes(" ") ? normalized.includes(` ${phrase} `) : result.has(phrase);
    });
    if (matched) for (const term of group) for (const token of tokens(term)) result.add(token);
  }
  return [...result];
}

export function textScore(queryTokens, value, weight) {
  if (!value || queryTokens.length === 0) return 0;
  const set = new Set(tokens(value));
  const lower = normalise(value);
  let score = 0;
  for (const token of queryTokens) {
    if (set.has(token)) score += weight;
    else if (token.length >= 5 && lower.includes(token)) score += Math.max(1, Math.floor(weight / 3));
  }
  return score;
}

function phraseBoost(query, values, weight) {
  if (!values?.length) return 0;
  const normalizedQuery = ` ${normalise(query)} `;
  return values.reduce((total, value) => {
    const phrase = normalise(value);
    return total + (phrase && normalizedQuery.includes(` ${phrase} `) ? weight : 0);
  }, 0);
}

export function articleScore(article, query, queryTokens, blockText) {
  const directTokens = tokens(query);
  const metadata = [...(article.aliases ?? []), ...(article.intents ?? []), ...(article.topics ?? [])].join(" ");
  const faqQuestions = article.faqs.map(faq => faq.q).join(" ");
  const sectionTitles = article.sections.map(section => section.title).join(" ");
  const sectionBody = article.sections.flatMap(section => section.blocks.map(blockText)).join(" ");
  // Expanded NZ synonyms improve recall, but the words the visitor actually typed
  // retain more weight so a generic synonym family cannot swamp a specific intent.
  return (
    textScore(queryTokens, article.title, 4) + textScore(directTokens, article.title, 10) +
    textScore(queryTokens, metadata, 4) + textScore(directTokens, metadata, 9) +
    phraseBoost(query, article.aliases, 30) +
    phraseBoost(query, article.intents, 36) +
    textScore(queryTokens, article.answer, 3) + textScore(directTokens, article.answer, 6) +
    textScore(queryTokens, article.description, 3) + textScore(directTokens, article.description, 5) +
    textScore(queryTokens, faqQuestions, 3) + textScore(directTokens, faqQuestions, 5) +
    textScore(queryTokens, sectionTitles, 2) + textScore(directTokens, sectionTitles, 4) +
    textScore(queryTokens, sectionBody, 1) + textScore(directTokens, sectionBody, 1)
  );
}

export function rankArticles(articles, query, currentPath, blockText, limit = 4) {
  const queryTokens = expandedQueryTokens(query);
  return articles
    .map(article => ({
      article,
      score: articleScore(article, query, queryTokens, blockText) + (article.path === currentPath ? 120 : 0)
    }))
    .sort((a, b) => b.score - a.score)
    .filter(item => item.score > 0 || item.article.path === currentPath)
    .slice(0, limit);
}

export function retrievalDiagnostics(rankedArticles, domainRelevant) {
  if (!domainRelevant) return { confidence: "none", matchArticleId: null, gapReason: "out_of_domain" };
  const top = rankedArticles[0];
  if (!top || top.score < 8) return { confidence: "none", matchArticleId: null, gapReason: "no_match" };
  const second = rankedArticles[1];
  const ambiguous = Boolean(second && top.score >= 20 && second.score >= 20 && top.score - second.score <= 4);
  if (ambiguous) return { confidence: "medium", matchArticleId: top.article.id, gapReason: "ambiguous" };
  if (top.score < 20) return { confidence: "weak", matchArticleId: top.article.id, gapReason: "weak_match" };
  if (top.score < 45) return { confidence: "medium", matchArticleId: top.article.id, gapReason: "matched" };
  return { confidence: "strong", matchArticleId: top.article.id, gapReason: "matched" };
}

export function rankSections(article, queryTokens, blockText, limit = 4) {
  const ranked = article.sections
    .map((section, index) => {
      const body = section.blocks.map(blockText).join(" ");
      return { section, index, score: textScore(queryTokens, section.title, 6) + textScore(queryTokens, body, 1) };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index);
  return (ranked.some(item => item.score > 0) ? ranked.filter(item => item.score > 0).slice(0, limit) : ranked.slice(0, 3))
    .sort((a, b) => a.index - b.index);
}

export function rankFaqs(article, queryTokens, limit = 3) {
  return article.faqs
    .map((faq, index) => ({ faq, index, score: textScore(queryTokens, `${faq.q} ${faq.a}`, 4) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .filter((item, index) => item.score > 0 || index < 2)
    .slice(0, limit);
}
