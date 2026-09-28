import articleData from './articles.json';
import sourceData from './sources.json';
import projectData from './projects.json';
import type { ResearchArticle, ResearchSource, ResearchProject } from './types';

// JSON is validated in check:research before publication; it is never user input.
export const ARTICLES = articleData as Record<string, ResearchArticle>;
export const RESEARCH_SOURCES = sourceData as Record<string, ResearchSource>;
export const RESEARCH_PROJECTS = projectData as Record<string, ResearchProject>;
export function getArticle(id: string): ResearchArticle {
  const article = ARTICLES[id];
  if (!article) throw new Error(`Unknown research article: ${id}`);
  return article;
}
export function getSource(id: string): ResearchSource {
  const source = RESEARCH_SOURCES[id];
  if (!source) throw new Error(`Unknown research source: ${id}`);
  return source;
}
export function getProject(id: string): ResearchProject {
  const project = RESEARCH_PROJECTS[id];
  if (!project) throw new Error(`Unknown research project: ${id}`);
  return project;
}
export function articleSourceIds(article: ResearchArticle): string[] {
  const ids = new Set(article.answerSources);
  for (const section of article.sections) for (const block of section.blocks) {
    if ('sources' in block) block.sources.forEach(id => ids.add(id));
    if (block.type === 'table') block.rows.forEach(row => row.sources.forEach(id => ids.add(id)));
    if (block.type === 'projects') block.ids.forEach(id => ids.add(getProject(id).sourceId));
  }
  article.faqs.forEach(faq => faq.sources.forEach(id => ids.add(id)));
  return [...ids];
}
export function articleObservationIds(article: ResearchArticle): string[] {
  return [...new Set(article.sections.flatMap(s => s.blocks.flatMap(b => b.type === 'prices' ? b.ids : [])))];
}
