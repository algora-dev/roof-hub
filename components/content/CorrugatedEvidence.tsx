import Link from 'next/link';
import { OBSERVATIONS } from '@/data/observations';
import { getSource, getArticle, flattenBlocks, getProject } from '@/data/research';
import { CORRUGATED_MARKET, corrugatedListing } from '@/data/research/corrugated';

const number = (n: number, digits = 2) => n.toLocaleString('en-NZ', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const dollars = (n: number, digits = 2) => `$${number(n, digits)}`;
function Links({ ids }: { ids: string[] }) {return <span className="rh-inline-sources"> {ids.map((id,i) => {const s=getSource(id);return <span key={id}>{i ? '; ' : ''}<a href={s.url} title={s.title} target="_blank" rel="noopener noreferrer">{i === 0 ? s.publisher : s.shortLabel ?? s.title}</a></span>;})}</span>;}

export function CorrugatedGuideStart() {
  const count = CORRUGATED_MARKET.retail.length;
  const projectIds = [...new Set(getArticle('corrugated').sections.flatMap(s => flattenBlocks(s.blocks).flatMap(b => b.type === 'projects' ? b.ids : [])))];
  const projectPublishers = new Set(projectIds.map(id => getSource(getProject(id).sourceId).publisher)).size;
  const suppliers = new Set(CORRUGATED_MARKET.retail.map(r=>r.supplierKey)).size;
  return <div className="container rh-guide-start">
    <nav className="rh-guide-shortcuts" aria-label="Find your corrugated roofing answer">
      <a href="#prices"><span>01 / Price</span><strong>What will it cost?</strong><small>Read prices with their scope attached →</small></a>
      <a href="#your-budget"><span>02 / Calculate</span><strong>Apply my measurements</strong><small>Try a sheet budget, then a full estimate →</small></a>
      <a href="#profiles"><span>03 / Choose</span><strong>Compare specifications</strong><small>Profiles, thickness, pitch and coating →</small></a>
      <a href="#projects"><span>04 / Check</span><strong>See actual projects</strong><small>Different roofs, different decisions →</small></a>
    </nav>
    <p className="rh-guide-signature"><strong>Inside this review:</strong> {count} priced listings from {suppliers} suppliers, {CORRUGATED_MARKET.held.length} further supplier listings not converted, and {projectIds.length} project accounts from {projectPublishers} publishers. Source pages are evidence to inspect, not independent votes or product endorsements. <a href="#method">How we checked →</a></p>
  </div>;
}
export function CorrugatedPriceLedger({ ids }: { ids: string[] }) {
  return <>
    <p>Checked {CORRUGATED_MARKET.reviewedAt}. All amounts are NZD. Original listing units are retained. A check is not a guarantee of stock, delivery or product suitability.</p>
    <p className="rh-table-help">On a small screen, scroll the table sideways to compare the columns.</p>
    <div className="table-wrap rh-comparison-wrap" tabIndex={0} role="region" aria-label="Corrugated sheet supply observations">
      <table className="evidence-table rh-supply-table"><caption>Named supplier listings, with RoofHub arithmetic shown separately</caption><thead><tr><th scope="col">Supplier / specification</th><th scope="col">Original listing</th><th scope="col">Metre equivalent</th><th scope="col">Per covered m², incl GST</th></tr></thead><tbody>
        {ids.map(id=>{const {meta,observation:o,calculated:c}=corrugatedListing(id); const tax=o.gstBasis==='incl'?'incl GST':o.gstBasis==='excl'?'excl GST':'GST unconfirmed';return <tr key={id}>
          <th scope="row"><a href={o.sourceUrl} target="_blank" rel="noopener noreferrer">{o.sourceName} ↗</a><span>{meta.finish}</span><small>{meta.thickness}</small></th>
          <td><strong>{dollars(o.amountExact!)} / {o.unit==='lm'?'lm':`${meta.fixedLengthM} m sheet`}</strong><small>{tax}</small></td>
          <td>{dollars(c.originalPerLm)}/lm<small>{tax}</small>{o.gstBasis==='excl' && <small>{dollars(c.inclGstPerLm!)} incl GST</small>}</td>
          <td>{c.inclGstPerM2!==null ? <><strong>≈ {dollars(c.inclGstPerM2)}/m²</strong><small>{meta.coverMm} mm {meta.coverBasis==='archived-seller'?'seller-listed cover; conditional':'approximate cover'}</small></> : <><strong>Not calculated</strong><small>Missing or conflicting cover{ o.gstBasis==='unknown'?' and tax basis':''}</small></>}</td>
        </tr>;})}
      </tbody></table>
    </div>
    <details className="rh-evidence-detail rh-evidence-detail--nested"><summary>Read the conditions behind each price</summary><div>{ids.map(id=>{const {meta,observation}=corrugatedListing(id);return <p key={id}><strong>{observation.sourceName}, {meta.finish}:</strong> {meta.note} {meta.coverNote}{meta.minimumOrderLm && ` Minimum order: ${meta.minimumOrderLm} lm.`}<Links ids={meta.sourceIds}/></p>;})}</div></details>
    <h3>Two listings we did not turn into a rate</h3>
    {CORRUGATED_MARKET.held.map(row=><p key={row.supplierKey}><strong>{row.name}:</strong> {row.reason}<Links ids={row.sourceIds}/></p>)}
    <p className="rh-review-note">A missing conversion is intentional. Substituting total sheet width for usable cover, assuming GST, or choosing an unexplained lower price would make the comparison look stronger than the evidence allows.</p>
  </>;
}
export function CorrugatedSizeExamples() {
  const maxam=corrugatedListing('corr-rc-maxam-20260928').calculated.inclGstPerM2!;
  const bitz=corrugatedListing('lr-18').calculated.inclGstPerM2!;
  const delta=OBSERVATIONS.find(o=>o.id==='rr-02');
  if (!delta || delta.status!=='verified' || delta.gstBasis!=='incl' || delta.amountLow===undefined || delta.amountHigh===undefined) throw new Error('Historical example evidence is incomplete.');
  return <>
    <div className="table-wrap rh-comparison-wrap" role="region" tabIndex={0} aria-label="Source-specific roof size arithmetic"><table className="evidence-table"><caption>Illustrative arithmetic, not completed projects or interchangeable scopes. All totals include GST.</caption><thead><tr><th scope="col">Actual roof area</th><th scope="col">R&amp;C MAXAM sheets only</th><th scope="col">Bitz &amp; Piecez sheets only</th><th scope="col">Delta 2025 reroof guide</th></tr></thead><tbody>{[100,150,200,250].map(area=><tr key={area}><th scope="row">{area} m²</th><td>≈ {dollars(area*maxam,0)}</td><td>≈ {dollars(area*bitz,0)}</td><td>{dollars(area*delta.amountLow!,0)} to {dollars(area*delta.amountHigh!,0)}</td></tr>)}</tbody></table></div>
    <p>Supply columns use the unrounded coverage conversions from the ledger, with no extra waste, labour or accessories. MAXAM cover is approximate; the Bitz conversion is conditional on its seller-listed cover. They are different specifications, not endpoints of one market range.<Links ids={['rc-maxam','bitz','bitz-cover']}/></p>
    <p>The final column applies Delta’s historical {delta.sourceDate ?? '2025'} guide, including scaffold and removal. It is not an updated 2026 rate or an additional charge to add on top of the sheet columns.<Links ids={['delta']}/></p>
  </>;
}
export function CorrugatedCoverDiagram() {
  return <figure className="rh-cover-diagram">
    <figcaption><strong>Width on the listing is not always width on the roof.</strong> Metalcraft example, schematic rather than a manufacturing drawing.</figcaption>
    <div className="rh-cover-diagram__row"><span>Overall sheet width: 851 mm</span><div className="rh-cover-diagram__overall" aria-hidden="true" /></div>
    <div className="rh-cover-diagram__row"><span>Effective cover: 760 mm</span><div className="rh-cover-diagram__effective" aria-hidden="true" /></div>
    <p>For area and price calculations, use the second dimension. At $30/lm, $30 ÷ 0.760 = $39.47 per covered m² on the same GST basis. $30 is an illustrative rate, not a supplier quote.<Links ids={['mc-corr']}/></p>
    <Link className="text-link" href="/guides/roof-area">Understand roof measurement →</Link>
  </figure>;
}
