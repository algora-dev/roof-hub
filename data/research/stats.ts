import { ARTICLES, articleObservationIds, articleSourceIds, flattenBlocks, getProject, getSource } from './index';
import { OBSERVATIONS } from '../observations';

/** Count cited records, not every stored row, and never label URLs independent businesses. */
export function researchLibraryStats() {
  const sourceUrls = new Set<string>();
  const priceIds = new Set<string>();
  const projectIds = new Set<string>();
  for (const article of Object.values(ARTICLES)) {
    articleSourceIds(article).forEach(id => sourceUrls.add(getSource(id).url));
    articleObservationIds(article).forEach(id => {
      const row = OBSERVATIONS.find(observation => observation.id === id);
      if (!row || row.status !== 'verified') throw new Error(`Unverified public price record: ${id}`);
      priceIds.add(id); sourceUrls.add(row.sourceUrl);
    });
    for (const section of article.sections) for (const block of flattenBlocks(section.blocks)) {
      if (block.type === 'projects') block.ids.forEach(id => {projectIds.add(id);sourceUrls.add(getSource(getProject(id).sourceId).url);});
    }
  }
  return { articles: Object.keys(ARTICLES).length, sourcePages: sourceUrls.size,
    priceObservations: priceIds.size, projectAccounts: projectIds.size };
}
