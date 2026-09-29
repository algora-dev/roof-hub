import { getSource, getArticle, getProject, flattenBlocks } from '@/data/research';
import { FIVE_RIB_MARKET, fiveRibListing } from '@/data/research/five-rib';

const dollars = (value: number, digits = 2) => value.toLocaleString('en-NZ', {
  style: 'currency', currency: 'NZD', minimumFractionDigits: digits, maximumFractionDigits: digits
});
function Links({ ids }: { ids: string[] }) {
  return <span className="rh-inline-sources"> Sources: {ids.map((id, i) => {
    const source = getSource(id);
    return <span key={id}>{i ? '; ' : ''}<a href={source.url} title={source.title} target="_blank" rel="noopener noreferrer">{source.shortLabel ?? source.publisher}</a></span>;
  })}.</span>;
}
export function FiveRibGuideStart() {
  const projects = [...new Set(getArticle('five-rib').sections.flatMap(section => flattenBlocks(section.blocks).flatMap(block => block.type === 'projects' ? block.ids : [])))];
  const publishers = new Set(projects.map(id => getSource(getProject(id).sourceId).publisher)).size;
  const suppliers = new Set(FIVE_RIB_MARKET.retail.map(row => row.supplierKey)).size;
  const manufacturers = new Set(FIVE_RIB_MARKET.profiles.map(row => row.manufacturer)).size;
  return <div className="container rh-guide-start">
    <nav className="rh-guide-shortcuts" aria-label="Find your five-rib roofing answer">
      <a href="#prices"><span>01 / Price</span><strong>What do the sheets cost?</strong><small>Named listings, GST and usable cover →</small></a>
      <a href="#your-budget"><span>02 / Calculate</span><strong>Apply my measurements</strong><small>Sheets first, then the whole project →</small></a>
      <a href="#profiles"><span>03 / Compare</span><strong>Which five-rib profile?</strong><small>Names, dimensions and conditions →</small></a>
      <a href="#projects"><span>04 / Inspect</span><strong>See actual projects</strong><small>Seven different scope lessons →</small></a>
    </nav>
    <p className="rh-guide-signature"><strong>Inside this review:</strong> {FIVE_RIB_MARKET.profiles.length} profile entries from {manufacturers} manufacturers, {FIVE_RIB_MARKET.retail.length} priced listings from {suppliers} businesses, and {projects.length} project accounts from {publishers} publishers. Multiple pages by one business are not independent confirmations. <a href="#method">Review method →</a></p>
  </div>;
}
export function FiveRibPriceLedger({ ids }: { ids: string[] }) {
  return <>
    <p className="rh-review-note">Checked {FIVE_RIB_MARKET.reviewedAt}. NZD, material supply only. Listing prices are not stock or checkout guarantees.</p>
    <p className="rh-table-help">On a small screen, scroll the table sideways to compare all four columns.</p>
    <div className="table-wrap rh-comparison-wrap" tabIndex={0} role="region" aria-label="Five-rib supplier price evidence">
      <table className="evidence-table rh-supply-table"><caption>Source prices and separate RoofHub conversions, with missing fields left unknown</caption>
        <thead><tr><th scope="col">Supplier / specification</th><th scope="col">Original listing</th><th scope="col">Per lineal metre</th><th scope="col">Per covered m², incl GST</th></tr></thead>
        <tbody>{ids.map(id => {
          const { meta, observation: o, calculated: c } = fiveRibListing(id);
          const tax = o.gstBasis === 'incl' ? 'including GST' : o.gstBasis === 'excl' ? 'excluding GST' : 'GST unconfirmed';
          return <tr key={id}>
            <th scope="row"><a href={o.sourceUrl} target="_blank" rel="noopener noreferrer">{o.sourceName} ↗</a><span>{meta.finish}</span><small>{meta.thickness}</small></th>
            <td><strong>{dollars(o.amountExact!)} / {o.unit === 'lm' ? 'lm' : `${meta.fixedLengthM} m sheet`}</strong><small>{tax}</small></td>
            <td>{dollars(c.originalPerLm)}/lm<small>{tax}</small>{o.unit === 'each' && <small>Sheet price divided by length</small>}</td>
            <td>{c.inclGstPerM2 !== null ? <><strong>≈ {dollars(c.inclGstPerM2)}/m²</strong><small>{meta.coverMm} mm seller-listed cover</small><small>{c.conditionalCover ? 'Conditional: confirm current stock' : 'Cover confirmed in listing'}</small></> : <><strong>Not calculated</strong><small>{o.gstBasis === 'unknown' ? 'GST basis is unconfirmed' : 'Effective cover is unconfirmed'}</small></>}</td>
          </tr>;
        })}</tbody>
      </table>
    </div>
    <details className="rh-evidence-detail rh-evidence-detail--nested"><summary>Read each listing’s conditions and tax evidence</summary><div>{ids.map(id => {
      const { meta, observation } = fiveRibListing(id);
      return <p key={id}><strong>{observation.sourceName}, {meta.finish}:</strong> {meta.note} {meta.coverNote}<Links ids={meta.sourceIds}/></p>;
    })}</div></details>
    <details className="rh-evidence-detail rh-evidence-detail--nested"><summary>{FIVE_RIB_MARKET.held.length} further listings kept out of the price calculation</summary><div>{FIVE_RIB_MARKET.held.map(row => <p key={row.supplierKey}><strong>{row.name}:</strong> {row.reason}<Links ids={row.sourceIds}/></p>)}</div></details>
  </>;
}
export function FiveRibProfiles() {
  return <>
    <p className="rh-table-help">Published starting minima are not design approvals. Scroll sideways on small screens.</p>
    <div className="table-wrap rh-comparison-wrap" tabIndex={0} role="region" aria-label="NZ five-rib manufacturer profile comparison">
      <table className="evidence-table rh-profile-table"><caption>Manufacturer-specific dimensions and conditions, not a universal five-rib specification</caption>
        <thead><tr><th scope="col">Manufacturer / profile</th><th scope="col">Effective cover</th><th scope="col">Thickness reference</th><th scope="col">Pitch reference</th></tr></thead>
        <tbody>{FIVE_RIB_MARKET.profiles.map(row => <tr key={row.id}>
          <th scope="row">{row.profile}<small>{row.manufacturer}</small></th><td>{row.cover}</td><td>{row.thickness}</td><td>{row.pitch}<Links ids={row.sources}/></td>
        </tr>)}</tbody>
      </table>
    </div>
    <details className="rh-evidence-detail rh-evidence-detail--nested"><summary>Branch, variant and overall-width notes</summary><div>{FIVE_RIB_MARKET.profiles.map(row => <p key={row.id}><strong>{row.manufacturer} {row.profile}:</strong> Overall width: {row.overall}. {row.note}<Links ids={row.sources}/></p>)}</div></details>
  </>;
}
export function FiveRibSizeExamples() {
  const { meta, calculated } = fiveRibListing('lr-18');
  if (calculated.inclGstPerM2 === null || meta.coverMm === null) throw new Error('Five-rib size example lacks conversion evidence.');
  return <>
    <div className="table-wrap rh-comparison-wrap" role="region" tabIndex={0} aria-label="Five-rib sheet-only area examples">
      <table className="evidence-table"><caption>Bitz &amp; Piecez source example only: {dollars(calculated.originalPerLm)}/lm incl GST and conditional {meta.coverMm} mm cover, no extra allowance</caption>
        <thead><tr><th scope="col">Actual roof area</th><th scope="col">Continuous-length allowance</th><th scope="col">Approx. sheet subtotal incl GST</th></tr></thead>
        <tbody>{[100,150,200,250].map(area => <tr key={area}><th scope="row">{area} m²</th><td>{(area / (meta.coverMm! / 1000)).toLocaleString('en-NZ', { maximumFractionDigits: 2 })} lm</td><td>{dollars(area * calculated.inclGstPerM2!, 0)}</td></tr>)}</tbody>
      </table>
    </div>
    <p>Calculations use unrounded numbers. The cover comes from an archived listing by the same seller and must be confirmed for the ordered sheet. No labour, accessories, freight, removal or access is included. Stock-length cuts and whole-sheet purchasing can change the order total.<Links ids={['bitz','bitz-cover']}/></p>
  </>;
}
