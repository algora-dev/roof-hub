import { getSource, getProject } from '@/data/research';
import { PRESSED_TILE, tilePrice } from '@/data/research/pressed-tile';
import { panelQuantity } from '@/lib/pressed-tile-maths';

const dollars = (value: number) => value.toLocaleString('en-NZ', {
  style: 'currency', currency: 'NZD', minimumFractionDigits: 0, maximumFractionDigits: 2
});
function Links({ ids }: { ids: string[] }) {
  return <span className="rh-inline-sources"> Sources: {ids.map((id, index) => {
    const source = getSource(id);
    return <span key={id}>{index ? '; ' : ''}<a href={source.url} target="_blank" rel="noopener noreferrer" title={source.title}>{source.shortLabel ?? source.publisher}</a></span>;
  })}.</span>;
}
export function PressedTileGuideStart() {
  const projects = [...PRESSED_TILE.newProjectIds, ...PRESSED_TILE.replacementProjectIds];
  const publishers = new Set(projects.map(id => getSource(getProject(id).sourceId).publisher)).size;
  const pricePublishers = new Set(PRESSED_TILE.priceRows.flatMap(row => row.sourceIds.map(id => getSource(id).publisher))).size;
  return <div className="container rh-guide-start">
    <nav className="rh-guide-shortcuts" aria-label="Find your pressed metal tile answer">
      <a href="#prices"><span>01 / Price</span><strong>What will the roof cost?</strong><small>Published guide prices, with their scope →</small></a>
      <a href="#panel-calculator"><span>02 / Calculate</span><strong>How many panels?</strong><small>Use your area and an optional supplier quote →</small></a>
      <a href="#profiles"><span>03 / Compare</span><strong>Which tile system?</strong><small>Cover, pitch and support differences →</small></a>
      <a href="#new-homes"><span>04 / Explore</span><strong>See it on new homes</strong><small>Builder examples and residential galleries →</small></a>
    </nav>
    <p className="rh-guide-signature"><strong>Inside this review:</strong> {PRESSED_TILE.profiles.length} profiles in Gerard's current NZ family, {PRESSED_TILE.priceRows.length} published guide-price observations from {pricePublishers} publishers, and {projects.length} project accounts from {publishers} publishers. No current per-panel retail price is verified here. <a href="#method">What these sources establish →</a></p>
  </div>;
}
export function PressedTilePriceLedger({ ids }: { ids: string[] }) {
  return <>
    <p className="rh-review-note">Source pages checked 29 September 2026. A current page check does not make a historical or undated price a current quotation.</p>
    <p className="rh-table-help">On a small screen, scroll sideways to compare the original prices and inclusions.</p>
    <div className="table-wrap rh-comparison-wrap" tabIndex={0} role="region" aria-label="Pressed metal tile published price evidence">
      <table className="evidence-table rh-supply-table"><caption>NZD guide prices kept separate by date, tax and project scope</caption>
        <thead><tr><th scope="col">Publisher / roof description</th><th scope="col">Original price</th><th scope="col">Date and context</th><th scope="col">What it does and does not include</th></tr></thead>
        <tbody>{ids.map(id => {
          const { meta, observation: o } = tilePrice(id);
          return <tr key={id}>
            <th scope="row"><a href={o.sourceUrl} target="_blank" rel="noopener noreferrer">{o.sourceName} ↗</a><span>{meta.label}</span></th>
            <td><strong>{o.amountExact !== undefined ? dollars(o.amountExact) : `${dollars(o.amountLow!)} to ${dollars(o.amountHigh!)}`} / m²</strong><small>{o.gstBasis === 'incl' ? 'GST included' : o.gstBasis === 'excl' ? 'GST excluded' : 'GST not stated'}</small></td>
            <td>{meta.scope}</td><td>{meta.note}</td>
          </tr>;
        })}</tbody>
      </table>
    </div>
    <aside className="rh-article-note"><p><strong>These are not panel purchase prices.</strong> They cannot be used to infer a current supply-only rate, prove a national cheapest roof, or give a complete project total without checking the scope. We do not average them.</p></aside>
    <details className="rh-evidence-detail"><summary>Why no automatic material price is filled in</summary><div>
      {PRESSED_TILE.held.map(item => <p key={item.name}><strong>{item.name}.</strong> {item.reason}<Links ids={item.sourceIds}/></p>)}
      <p>The worksheet below prices panels only when you enter a supplier's per-panel figure. An installed $/m² quote belongs in a like-for-like project comparison, not in that field.</p>
    </div></details>
  </>;
}
export function PressedTileProfiles() {
  return <>
    <p className="rh-table-help">Scroll sideways on smaller screens. Cover dimensions are the published effective dimensions, not overall panel size.</p>
    <div className="table-wrap rh-comparison-wrap" tabIndex={0} role="region" aria-label="Pressed metal tile profile specifications">
      <table className="evidence-table rh-tile-profile-table"><caption>Gerard NZ published profile figures, checked 29 September 2026</caption>
        <thead><tr><th scope="col">Profile / source</th><th scope="col">Cover length × width</th><th scope="col">Published panels per m²</th><th scope="col">Published minimum pitch</th><th scope="col">Support and confirmation</th></tr></thead>
        <tbody>{PRESSED_TILE.profiles.map(profile => <tr key={profile.id}>
          <th scope="row"><a href={getSource(profile.sourceId).url} target="_blank" rel="noopener noreferrer">{profile.name} ↗</a><small>{profile.finish}</small></th>
          <td>{profile.coverLengthMm.toLocaleString('en-NZ')} × {profile.coverWidthMm} mm</td>
          <td>{profile.panelsPerM2.toFixed(2)}{!profile.presetEligible && <small className="rh-tile-confirm">Confirm set-out before use</small>}</td>
          <td>{profile.minimumPitch}°<small>System conditions apply</small></td>
          <td>{profile.support}{profile.note && <small>{profile.note}</small>}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <p className="rh-review-note">One product family is not nine independent manufacturers. The density figures are published approximations, not cutting schedules. The worksheet does not automatically apply CF Slate or Calibre's conflicting figures. Appraisal scope and the current installation instructions still govern support and minimum pitch.<Links ids={['gerard-brand','tile-appraisal','cf-appraisal']}/></p>
    <details className="rh-evidence-detail"><summary>Panel weight, finish and interpreting these figures</summary><div>
      <p>Published panel weights do not include the complete timber, deck, underlay or accessory package. Textured and satin versions of the same profile need not weigh the same.</p>
      <ul className="rh-article-checklist">{PRESSED_TILE.profiles.map(profile => <li key={profile.id}><strong>{profile.name}:</strong> {profile.weight}.<Links ids={[profile.sourceId]}/></li>)}</ul>
      <p>Use the published panel-density field for an approximate first pass. Do not divide by a rounded cover-area label and call the result more precise. Where the published dimensions and density disagree materially, ask the supplier for a confirmed quantity and set-out.</p>
    </div></details>
  </>;
}
export function PressedTileSizeExamples() {
  const count = (area: number, density: number, allowance: number) => panelQuantity({
    area, basis: 'actual', pitchDegrees: 0, panelsPerM2: density,
    extraPercent: allowance, packSize: 1, minimumPanels: 0
  }).requiredPanels;
  return <>
    <div className="table-wrap rh-comparison-wrap" tabIndex={0} role="region" aria-label="Illustrative metal tile quantities by actual roof area">
      <table className="evidence-table"><caption>RoofHub calculations, whole panels rounded up; no price, pack rule or minimum order assumed</caption>
        <thead><tr><th scope="col">Actual roof surface</th><th scope="col">2.15 panels/m², no allowance</th><th scope="col">2.20 panels/m², no allowance</th><th scope="col">2.15 panels/m² plus an illustrative 5%</th></tr></thead>
        <tbody>{[100,150,200,250].map(area => <tr key={area}><th scope="row">{area} m²</th><td>{count(area,2.15,0)} panels</td><td>{count(area,2.2,0)} panels</td><td>{count(area,2.15,5)} panels</td></tr>)}</tbody>
      </table>
    </div>
    <p>For example, 200 m² × 2.15 = 430 panels before any allowance. Adding an illustrative 5% gives 451.5, rounded up to 452 whole panels. That 5% is not a recommended waste rate; the installer must allow for the actual cuts, hips, valleys and reusable offcuts.<Links ids={['bond','gerard-classic','gerard-shake']}/></p>
    <p>The cost is not shown because a verified per-panel purchase price is missing. Enter a real supplier quote in the worksheet to price the quantity, then add the remaining roof-system items separately.</p>
  </>;
}
