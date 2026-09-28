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
  | { type: 'calculator'; mode: 'area' | 'pitch' | 'sheet' | 'budget' };
export type ResearchArticle = {
  id: string; path: string; title: string; description: string; answer: string;
  answerSources: string[]; category: string; publishedAt: string; updatedAt: string;
  editor: string; sections: { id: string; title: string; blocks: ResearchBlock[] }[];
  related: string[]; faqs: { q: string; a: string; sources: string[] }[];
};
