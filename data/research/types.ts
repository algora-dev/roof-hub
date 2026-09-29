/** Editorial evidence is separate from the estimator's provisional rate card. */
export type ResearchSource = {
  id: string; publisher: string; title: string; url: string; shortLabel?: string;
  kind: 'manufacturer' | 'supplier' | 'contractor' | 'designer' | 'government' | 'industry-technical';
  reviewedAt: string; publishedAt: string | null; note: string;
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
  | { type: 'corrugated-budget' | 'corrugated-cover' | 'five-rib-budget' | 'five-rib-profiles' | 'sheet-quote-compare' | 'pressed-tile-budget' | 'pressed-tile-profiles' | 'pressed-tile-examples'; sources: string[] };
export type ResearchArticle = {
  id: string; path: string; title: string; description: string; answer: string;
  answerSources: string[]; category: string; publishedAt: string; updatedAt: string;
  editor: string; presentation?: 'reference-guide'; sections: { id: string; title: string; blocks: ResearchBlock[] }[];
  related: string[]; faqs: { q: string; a: string; sources: string[] }[];
};
