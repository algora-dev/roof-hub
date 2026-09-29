import { researchLibraryStats } from '@/data/research/stats';

export function ResearchLibraryStats() {
  const stats = researchLibraryStats();
  const items = [[stats.sourcePages, 'Cited source pages'], [stats.priceObservations, 'Referenced price records'], [stats.projectAccounts, 'Attributed project accounts'], [stats.articles, 'Research-led articles']] as const;
  return <aside className="rh-library-stats" aria-label="RoofHub research library coverage">
    <p className="eyebrow">Research library</p>
    <dl>{items.map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <p>Counts reflect records cited by our published articles, not independent confirmations, customer reviews or projects we inspected. A historical price stays historical. Several source pages may belong to one business.</p>
  </aside>;
}
