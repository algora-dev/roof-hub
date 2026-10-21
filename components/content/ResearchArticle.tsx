import Link from 'next/link';
import { CornerstoneHeader } from '@/components/evidence/CornerstoneHeader';
import { ArticleSchema } from '@/components/evidence/ArticleSchema';
import { PriceTable } from '@/components/evidence/PriceTable';
import { Sources, type SourceEntry } from '@/components/evidence/Sources';
import { evidenceRows, observationSourceEntries } from '@/data/content';
import { articleObservationIds, articleSourceIds, getArticle, getProject, getSource } from '@/data/research';
import type { ResearchBlock, ResearchSource } from '@/data/research/types';
import { PressedTileBudget } from './PressedTileBudget';
import { PressedTileGuideStart, PressedTilePriceLedger, PressedTileProfiles, PressedTileSizeExamples } from './PressedTileEvidence';
import { tileWorksheetProfiles } from '@/data/research/pressed-tile';
import { QuantityCalculator } from './QuantityCalculator';
import { CorrugatedBudget } from './CorrugatedBudget';
import { CorrugatedGuideStart, CorrugatedPriceLedger, CorrugatedSizeExamples, CorrugatedCoverDiagram } from './CorrugatedEvidence';
import { FiveRibGuideStart, FiveRibPriceLedger, FiveRibProfiles, FiveRibSizeExamples } from './FiveRibEvidence';
import { fiveRibBudgetPresets } from '@/data/research/five-rib';
import { SheetQuoteComparison } from './SheetQuoteComparison';
import { corrugatedBudgetPresets } from '@/data/research/corrugated';
import { articleAction } from '@/lib/article-actions';
import { AskRoofHubButton } from '@/components/assistant/AskRoofHubButton';

function reviewDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return `${day} ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month - 1]} ${year}`;
}

function InlineSources({ ids }: { ids: string[] }) {
  if (!ids.length) return null;
  return <span className="rh-inline-sources"> Sources: {ids.map((id, index) => {
    const source = getSource(id);
    return <span key={id}>{index > 0 ? '; ' : ''}<a href={source.url} target="_blank" rel="noopener noreferrer" title={source.title}>{source.shortLabel ?? source.publisher}</a></span>;
  })}.</span>;
}
function sourceEntry(source: ResearchSource): SourceEntry {
  return {
    name: `${source.publisher}: ${source.title}`, url: source.url,
    tier: ['government', 'manufacturer', 'industry-technical'].includes(source.kind) ? 'primary' : source.kind === 'designer' ? 'editorial' : 'market',
    type: source.kind, date: source.publishedAt ?? undefined,
    note: [source.note, `Page checked ${source.reviewedAt}. Publication date ${source.publishedAt ? 'shown above' : 'not stated'}.`].filter(Boolean).join(' ')
  };
}
function ContentBlock({ block }: { block: ResearchBlock }) {
  switch (block.type) {
    case 'details': return <details className="rh-evidence-detail"><summary>{block.title}</summary><div>{block.blocks.map((child,i)=><ContentBlock block={child} key={i}/>)}</div></details>;
    case 'action': return <aside className="rh-inline-action"><div><h3>{block.title}</h3><p>{block.text}</p></div><Link className="text-link" href={block.href}>{block.label} →</Link></aside>;
    case 'corrugated-prices': return <CorrugatedPriceLedger ids={block.ids}/>;
    case 'corrugated-examples': return <CorrugatedSizeExamples/>;
    case 'corrugated-budget': return <CorrugatedBudget presets={corrugatedBudgetPresets()}/>;
    case 'corrugated-cover': return <CorrugatedCoverDiagram/>;
    case 'five-rib-prices': return <FiveRibPriceLedger ids={block.ids}/>;
    case 'five-rib-profiles': return <FiveRibProfiles/>;
    case 'five-rib-examples': return <FiveRibSizeExamples/>;
    case 'five-rib-budget': return <CorrugatedBudget presets={fiveRibBudgetPresets()} systemLabel="five-rib"/>;
    case 'pressed-tile-prices': return <PressedTilePriceLedger ids={block.ids}/>;
    case 'pressed-tile-profiles': return <PressedTileProfiles/>;
    case 'pressed-tile-examples': return <PressedTileSizeExamples/>;
    case 'pressed-tile-budget': return <PressedTileBudget profiles={tileWorksheetProfiles()}/>;
    case 'sheet-quote-compare': return <SheetQuoteComparison/>;
    case 'paragraph': return <p>{block.text}<InlineSources ids={block.sources} /></p>;
    case 'notice': return <aside className="rh-article-note"><p>{block.text}<InlineSources ids={block.sources} /></p></aside>;
    case 'checklist': return <ul className="rh-article-checklist">{block.items.map(item => <li key={item}>{item}</li>)}</ul>;
    case 'calculator': return <QuantityCalculator mode={block.mode} />;
    case 'prices': return <PriceTable caption="Source-specific NZD pricing observations with original scope, dates and GST" rows={evidenceRows(block.ids)} />;
    case 'table': return <div className="table-wrap rh-comparison-wrap" tabIndex={0} role="region" aria-label={block.caption}>
      <table className="evidence-table rh-comparison"><caption>{block.caption}</caption>
        <thead><tr>{block.heads.map(h => <th key={h} scope="col">{h}</th>)}</tr></thead>
        <tbody>{block.rows.map((row, i) => <tr key={i}>{row.cells.map((cell, col) => col === 0
          ? <th key={col} scope="row">{cell}{row.cells.length === 1 && <InlineSources ids={row.sources} />}</th>
          : <td key={col}>{cell}{col === row.cells.length - 1 && <InlineSources ids={row.sources} />}</td>)}</tr>)}</tbody>
      </table>
    </div>;
    case 'projects': return <div className="rh-project-grid">{block.ids.map(id => {
      const project = getProject(id); const source = getSource(project.sourceId);
      return <article className="rh-project" key={id}>
        <p className="eyebrow">{project.evidence}</p><h3>{project.title}</h3>
        <p className="rh-project__place">{project.location} · {project.system}</p>
        <p>{project.summary}</p><p><strong>What it illustrates:</strong> {project.lesson}</p>
        <dl><div><dt>Roof price</dt><dd>{project.price === null ? 'Not published' : `NZD ${project.price}`}</dd></div><div><dt>Measured area</dt><dd>{project.areaM2 === null ? 'Not published' : `${project.areaM2} m²`}</dd></div></dl>
        <a className="rh-project__link" href={source.url} target="_blank" rel="noopener noreferrer">View {source.publisher}’s project and photographs ↗</a>
      </article>;
    })}</div>;
  }
}

/** Server component: all substantive answers, tables and citations are delivered in HTML. */
export function ResearchArticlePage({ articleId }: { articleId: string }) {
  const article = getArticle(articleId);
  const referenceGuide = article.presentation === 'reference-guide';
  const sourceIds = articleSourceIds(article);
  const observationIds = articleObservationIds(article);
  const uniqueSources = new Map<string, SourceEntry>();
  sourceIds.forEach(id => { const s = sourceEntry(getSource(id)); uniqueSources.set(s.url, s); });
  observationSourceEntries(observationIds).forEach(s => {
    // Richer research records win when both registries describe the same URL.
    if (!uniqueSources.has(s.url)) uniqueSources.set(s.url, s);
  });
  const sources = [...uniqueSources.values()];
  const parentPath = article.path.startsWith('/pricing/') ? '/pricing' : article.path.startsWith('/roofing/') ? '/roofing' : '/guides';
  const parentLabel = parentPath === '/pricing' ? 'Pricing' : parentPath === '/roofing' ? 'Roofing systems' : 'Guides & answers';
  const context = `?topic=${encodeURIComponent('Roofing quote enquiry')}&page=${encodeURIComponent(article.path)}`;
  const action = articleAction(article);
  let questionId = 'questions';
  while (article.sections.some(section => section.id === questionId)) questionId = `related-${questionId}`;
  const contents = <nav aria-label="On this page"><ol>{article.sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}<li><a href="#sources">Sources and review notes</a></li></ol></nav>;
  return <div className={referenceGuide ? 'rh-reference-guide' : undefined}>
    <ArticleSchema headline={article.title} description={article.description} path={article.path} datePublished={article.publishedAt} dateModified={article.updatedAt} citations={referenceGuide ? sources.map(s => s.url) : undefined} />
    <CornerstoneHeader crumbs={[{ label: 'Home', href: '/' }, { label: parentLabel, href: parentPath }, { label: article.title }]}
      eyebrow={article.category} title={article.title}
      answer={<p>{article.answer}<InlineSources ids={article.answerSources} /></p>}
      facts={[{ label: 'Applies to', value: 'New Zealand' }, { label: 'Reviewed', value: reviewDate(article.updatedAt) }, { label: 'Evidence', value: `${sources.length} linked source pages` }, { label: 'Price convention', value: 'NZD; GST shown by source' }]} />
    {referenceGuide && article.id === 'corrugated' && <CorrugatedGuideStart/>}
    {referenceGuide && article.id === 'five-rib' && <FiveRibGuideStart/>}
    {referenceGuide && article.id === 'pressed-tile' && <PressedTileGuideStart/>}
    <div className="container rh-reading-layout">
      <aside className="rh-toc">{referenceGuide ? <><div className="rh-toc-desktop"><strong>On this page</strong>{contents}</div><details className="rh-toc-mobile"><summary>Jump to a section</summary>{contents}</details></> : <details open><summary>On this page</summary>{contents}</details>}<p>Don't have measurements? That's fine. Start with what you know, or use the detailed tool if you already have quantities.</p><Link className="text-link" href={action.estimateHref}>Estimate a roof →</Link><br/><Link className="text-link" href="/tools/detailed-roof-estimator">Use measurements →</Link></aside>
      <article className="rh-reading-body" aria-label={article.title}>
        <section className="rh-contextual-action"><div><p className="eyebrow">{action.eyebrow}</p><h2>{action.title}</h2><p>{action.copy}</p></div><div className="button-row"><Link className="button button--primary" href={action.estimateHref}>{action.estimateLabel}</Link><AskRoofHubButton prompt={action.assistantPrompt} label={action.assistantLabel} /></div></section>
        {article.sections.map(section => <section className="rh-article-section" id={section.id} key={section.id}><h2>{section.title}</h2>{section.blocks.map((block, i) => <ContentBlock block={block} key={i} />)}</section>)}
        {article.faqs.length > 0 && <section className="rh-article-section" id={questionId}><h2>Related questions</h2><div className="faq-list">{article.faqs.map(faq => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}<InlineSources ids={faq.sources} /></p></details>)}</div></section>}
        <section className="rh-article-section" id="sources"><h2>Sources and review notes</h2><p className="rh-review-note">Prepared by {article.editor}. Reviewed <time dateTime={article.updatedAt}>{reviewDate(article.updatedAt)}</time>. A source check confirms what a page states, not an independent inspection or invoice audit. Published project accounts are attributed to their publishers.</p>{referenceGuide ? <details className="rh-evidence-detail"><summary>Open all {sources.length} source pages and review notes</summary><div><Sources sources={sources}/></div></details> : <Sources sources={sources} />}<p className="rh-review-note">Original calculations are labelled as examples. Historical prices stay dated, missing fields stay unknown, and conflicting specifications are flagged. Sources are not endorsements or paid rankings. <Link href="/methodology">Read our methodology</Link> or <Link href={`/contact?topic=${encodeURIComponent('Report a correction')}&page=${encodeURIComponent(article.path)}`}>report a correction</Link>.</p></section>
        <section className="rh-article-section"><h2>Keep exploring</h2><div className="rh-related-grid">{article.related.map(id => { const related = getArticle(id); return <Link key={id} href={related.path}><span>{related.category}</span><strong>{related.title}</strong><small>Read the answer →</small></Link>; })}</div></section>
        <section className="rh-answer-cta"><p className="eyebrow">Next step</p><h2>Estimate it, refine it, or ask RoofHub.</h2><p>Start with approximate information, use actual measurements when you have them, or ask RoofHub to explain the decision. A roofing contractor still needs to confirm the site, specification and final quotation.</p><div className="button-row"><Link className="button button--primary" href={action.estimateHref}>{action.estimateLabel}</Link><Link className="button button--secondary" href="/tools/detailed-roof-estimator">Use measurements</Link><AskRoofHubButton prompt={action.assistantPrompt} label="Ask RoofHub" className="button button--secondary" /></div><p className="rh-review-note"><Link href={`/contact${context}`}>Prefer a person? Send the project to RoofHub.</Link></p></section>
      </article>
    </div>
  </div>;
}
