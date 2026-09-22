/**
 * DEVELOPMENT RATE CARD — not a verified NZ market tariff.
 * Source values below come from the supplied conversation. Owner labour /
 * removal inputs are retained exactly. Earlier material and scaffold
 * estimates are PROVISIONAL and must be approved before public launch.
 * Source GST basis was not consistently specified: this implementation
 * provisionally treats the figures as EXCLUSIVE; approval is REQUIRED.
 */
const R = (min, max = min) => ({ min, max });
const split = (id, label, unit, material, labour, status='provisional', note='Working material allowance from the prior discussion; not a verified supplier price.') => ({ id, label, unit, kind:'split', material, labour, status, taxBasis:'excl', note });
const bundled = (id,label,unit,installed,status='owner',note='Owner-supplied installed range.') => ({ id,label,unit,kind:'installed',installed,status,taxBasis:'excl',note });
const missing = (id,label,unit,labour=null) => split(id,label,unit,null,labour,'missing','No approved supply price has been provided. This is not zero cost.');
const rates = {};
const add = rate => { rates[rate.id] = rate; };
add(split('corrugate.covering','Corrugated long-run','m2',R(24,35),R(6.5,8.5)));
add(split('five-rib.covering','Five-rib / trapezoidal','m2',R(24,35),R(6.5,9),'provisional','Uses the same provisional material band as corrugate; the owner-supplied labour bands differ. No artificial premium is added.'));
add(split('pressed-metal.covering','Pressed metal tile','m2',R(22,27.5),R(8,10.5),'illustrative','Material allowance BACK-SOLVED from the earlier $30–$38/m² installed TARGET. NOT supplier evidence. Includes underlay and batten installation labour, not batten materials. Must be replaced/approved.'));
add(bundled('tray.covering','Architectural tray / standing seam','m2',R(120,250),'owner','Owner-supplied covering supply-and-install range. Accessories/underlay/support substrates are separate. Standard system clips are assumed within this bundle; confirm with supplier.'));
for (const roof of ['corrugate','five-rib']) {
  const labour=roof==='corrugate'?R(13,17):R(15.6,20.4);
  add(split(`${roof}.ridges`,`${roof==='corrugate'?'Corrugate':'Five-rib'} ridge`,'lm',R(25,40),labour));
  add(split(`${roof}.hips`,`${roof==='corrugate'?'Corrugate':'Five-rib'} hip`,'lm',R(25,40),labour));
  add(split(`${roof}.valleys`,'Valley flashing','lm',R(25,45),R(8,11)));
  add(split(`${roof}.barges`,'Barge flashing','lm',R(18,30),R(14,18)));
  add(missing(`${roof}.aprons`,'Apron / wall flashing','lm',R(15.6,20.4)));
}
for (const roof of ['pressed-metal','tray']) for(const group of ['ridges','hips','valleys','barges','aprons']) add(missing(`${roof}.${group}`,`${roof==='tray'?'Tray':'Metal tile'} ${group}`,'lm'));
add(split('common.underlay','Roof underlay','m2',R(3.4,4.5),R(3.5,4.5)));
add(missing('common.fixings','Standard roof fixings','m2',R(0)));
add(missing('pressed-metal.battens','Tile batten materials','m2',R(0)));
add(missing('common.spouting','Spouting','lm'));
add(missing('common.downpipes','Downpipes','each'));
add(bundled('removal.long-run','Remove existing long-run metal','m2',R(4,8)));
add(bundled('removal.pressed-metal','Remove existing pressed metal tile','m2',R(5,9)));
add(bundled('removal.concrete','Remove existing concrete tile','m2',R(6,11)));
add(bundled('removal.decramastic','Remove non-asbestos Decramastic','m2',R(5,9)));
export const DEFAULT_RATE_CARD = {
  schemaVersion:1, id:'roofhub-nz-draft-2026-09-22', currency:'NZD', gstRate:0.15,
  title:'RoofHub working price guide', approved:false, approvedAt:null,
  sourceTaxConfirmed:false, updatedAt:'2026-09-22', rates,
  scaffold: {
    includedWeeks:4,
    'edge-1-flat': { base:R(20,35), weekly:R(2,4), minimum:R(600,800), status:'provisional', taxBasis:'excl' },
    // Hillside edge protection deliberately has no automatic uplift: quote separately.
    'full-1-flat': { base:R(45,70), weekly:R(3,5), minimum:R(1500,2000), status:'provisional', taxBasis:'excl' },
    'full-1-difficult': { base:R(60,95), weekly:R(3,5), minimum:R(2000,2500), status:'provisional', taxBasis:'excl' },
    'full-2-flat': { base:R(75,120), weekly:R(5,8), minimum:R(0), status:'provisional', taxBasis:'excl' },
    'full-2-difficult': { base:R(95,150), weekly:R(5,8), minimum:R(0), status:'provisional', taxBasis:'excl' },
  },
  exclusions: [
    'Structural repairs, framing/purlin supply, timber replacement and engineering.',
    'Consent fees, special penetrations, skylights, insulation, freight and craneage unless individually added.',
    'Asbestos testing, specialist removal and contaminated-waste disposal.',
    'Extra support substrates, ventilation layers and specialist details required by the chosen tray system.',
    'Product suitability, wind-zone design, coastal exposure and minimum-pitch requirements need supplier/installer confirmation.',
  ],
};
export function componentRateId(roof, group) {
  if (group==='roofAreas') return `${roof}.covering`;
  if (group==='spouting' || group==='downpipes') return `common.${group}`;
  return `${roof}.${group}`;
}
export function resolveRate(project, id, card=DEFAULT_RATE_CARD) {
  return project.pricingMode==='custom' && project.rateOverrides[id] ? project.rateOverrides[id] : card.rates[id];
}
