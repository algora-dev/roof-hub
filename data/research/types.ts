/** Editorial evidence is separate from the estimator's provisional rate card. */
export type ResearchSource = {
  id: string; publisher: string; title: string; url: string; shortLabel?: string;
  kind: 'manufacturer' | 'supplier' | 'contractor' | 'designer' | 'government' | 'industry-technical';
  /** What role this source is allowed to play in RoofHub synthesis. */
  evidenceRole?: 'regulatory' | 'industry-guidance' | 'manufacturer-technical' | 'practitioner-observation' | 'market' | 'editorial';
  /** Commercial interest is disclosed rather than treated as a reason to discard useful field evidence. */
  commercialInterest?: 'none' | 'sells-product' | 'sells-service' | 'marketplace' | 'unknown';
  reviewedAt: string; publishedAt: string | null; note: string;
};

export type PractitionerObservation = {
  id: string;
  topic: string;
  problem: string;
  pathway: 'repair' | 'restore' | 'replace' | 'investigate' | 'reroof-prep';
  claim: string;
  sourceId: string;
  evidenceType: 'case-study' | 'project-portfolio' | 'comparison-guide' | 'service-guide';
  roofSystem: string[];
  region: string;
  projectSpecific: boolean;
  reviewedAt: string;
  confidence: 'low' | 'medium' | 'high';
  commercialInterest: 'sells-repair' | 'sells-restoration' | 'sells-replacement' | 'sells-multiple' | 'marketplace';
  limitations: string;
  corroboratingSourceIds?: string[];
};

export type ManufacturerConstraint = {
  id: string;
  topic: string;
  system: string;
  claim: string;
  sourceId: string;
  applicability: string;
  reviewedAt: string;
  confidence: 'medium' | 'high';
};

export type ResearchProject = {
  id: string; sourceId: string; title: string; location: string; system: string;
  summary: string; lesson: string; price: number | null; areaM2: number | null;
  evidence: string; imagePermission: 'not-obtained';
};
export type ParagraphBlock = { type: 'paragraph' | 'notice'; text: string; sources: string[] };
export type TableBlock = { type: 'table'; caption: string; heads: string[]; rows: { cells: string[]; sources: string[] }[] };
export type ResearchBlock = ParagraphBlock | TableBlock
  | { type: 'checklist'; items: string[] }
  | { type: 'prices' | 'projects'; ids: string[] }
  | { type: 'calculator'; mode: 'area' | 'pitch' | 'sheet' | 'budget' }
  | { type: 'details'; title: string; blocks: ResearchBlock[] }
  | { type: 'action'; title: string; text: string; label: string; href: string }
  | { type: 'corrugated-prices' | 'corrugated-examples' | 'five-rib-prices' | 'five-rib-examples' | 'pressed-tile-prices'; ids: string[]; sources: string[] }
  | { type: 'corrugated-budget' | 'corrugated-cover' | 'five-rib-budget' | 'five-rib-profiles' | 'sheet-quote-compare' | 'pressed-tile-budget' | 'pressed-tile-profiles' | 'pressed-tile-examples'; sources: string[] }
  | { type: 'evidence-lens'; title: string; practitionerIds: string[]; manufacturerIds?: string[]; synthesis: string };
export type ResearchArticle = {
  id: string; path: string; title: string; description: string; answer: string;
  answerSources: string[]; category: string; publishedAt: string; updatedAt: string;
  editor: string; presentation?: 'reference-guide';
  /** Retrieval-only language. These fields do not create additional public pages. */
  aliases?: string[]; intents?: string[]; topics?: string[];
  sections: { id: string; title: string; blocks: ResearchBlock[] }[];
  related: string[]; faqs: { q: string; a: string; sources: string[] }[];
};
