"use client";

import Link from 'next/link';
import { useId, useState } from 'react';
import type { TileWorksheetProfile } from '@/data/research/pressed-tile';
import { panelQuantity, panelSubtotal, battenAllowance } from '@/lib/pressed-tile-maths';
import { numberInput } from '@/lib/roof-maths';
const num = (n: number, digits = 2) => n.toLocaleString('en-NZ', { maximumFractionDigits: digits });
const money = (n: number) => n.toLocaleString('en-NZ', { style: 'currency', currency: 'NZD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** No retailer rates are bundled into this component. Prices are supplied by the reader. */
export function PressedTileBudget({ profiles }: { profiles: TileWorksheetProfile[] }) {
  const uid = useId();
  const [selected, setSelected] = useState('classic');
  const [area, setArea] = useState('200');
  const [basis, setBasis] = useState<'actual'|'plan'>('actual');
  const [pitch, setPitch] = useState('25');
  const [density, setDensity] = useState('');
  const [extra, setExtra] = useState('0');
  const [pack, setPack] = useState('1');
  const [minimum, setMinimum] = useState('0');
  const [price, setPrice] = useState('');
  const [gst, setGst] = useState<'incl'|'excl'|'unknown'>('unknown');
  const [showBattens, setShowBattens] = useState(false);
  const [gauge, setGauge] = useState('');
  const [saved, setSaved] = useState('');
  const profile = profiles.find(p => p.id === selected);
  const required = (value: string, label: string) => {
    const n = numberInput(value); if (n === null) throw new Error(`Enter ${label}.`); return n;
  };
  let result: ReturnType<typeof panelQuantity> | null = null;
  let cost: ReturnType<typeof panelSubtotal> | null = null;
  let battenLm: number | null = null;
  let error = '', priceError = '', battenError = '';
  const chosenDensity = profile?.presetEligible ? profile.panelsPerM2 : numberInput(density);
  try {
    if (chosenDensity === null) throw new Error('Enter the confirmed panel density from your supplier.');
    result = panelQuantity({ area: required(area, 'your roof area'), basis,
      pitchDegrees: basis === 'plan' ? required(pitch, 'the roof pitch') : 0,
      panelsPerM2: chosenDensity, extraPercent: required(extra, 'an extra allowance, or 0'),
      packSize: required(pack, 'the pack size, or 1'), minimumPanels: required(minimum, 'a minimum quantity, or 0') });
  } catch (cause) { error = cause instanceof Error ? cause.message : 'Check your quantities.'; }
  if (result && price.trim()) {
    try { cost = panelSubtotal(result.purchasePanels, required(price, 'a valid per-panel price'), gst); }
    catch (cause) { priceError = cause instanceof Error ? cause.message : 'Check the price.'; }
  }
  if (result && showBattens) {
    try { battenLm = battenAllowance(result.surfaceM2, required(gauge, 'the installer-provided batten gauge')); }
    catch (cause) { battenError = cause instanceof Error ? cause.message : 'Check the gauge.'; }
  }
  const belowPitch = basis === 'plan' && profile && numberInput(pitch) !== null && Number(pitch) < profile.minimumPitch;
  const field = (key: string, label: string, value: string, set: (s: string) => void, min = 0, step = 'any', max?: number) =>
    <label htmlFor={`${uid}-${key}`}><span>{label}</span><input id={`${uid}-${key}`} type="number" inputMode={step === '1' ? 'numeric' : 'decimal'} step={step} min={min} max={max} value={value} onChange={e => { set(e.target.value); setSaved(''); }}/></label>;
  const changeProfile = (value: string) => {
    setSelected(value); setDensity(''); setPrice(''); setGst('unknown'); setPack('1'); setMinimum('0'); setGauge(''); setShowBattens(false); setSaved('');
  };
  const download = () => {
    if (!result || priceError || battenError) return;
    try {
      const text = [
        'RoofHub pressed-metal panel worksheet', 'Planning arithmetic, not a cutting schedule or an installed quote.',
        `Profile: ${profile?.name ?? 'Reader-specified product'}`,
        `Density: ${chosenDensity} panels/m² (${profile?.presetEligible ? 'published planning density' : 'reader-confirmed density'})`,
        ...(profile ? [`Specification source: ${profile.sourceUrl}`, `Source checked: ${profile.reviewedAt}`, `Source note: ${profile.note || 'Confirm the current project panel schedule.'}`] : []),
        `Entered roof area: ${area} m², ${basis}`, ...(basis === 'plan' ? [`Pitch: ${pitch} degrees`] : ['Actual area used without pitch conversion.']),
        `Sloping area: ${num(result.surfaceM2)} m²`, `Extra panel allowance: ${extra}%`,
        `Required panels before pack/minimum: ${result.requiredPanels}`, `Pack size: ${pack}; minimum quantity: ${minimum}`,
        `Planning purchase quantity: ${result.purchasePanels} panels`,
        ...(cost ? [`Reader quote: NZD ${price}/panel (${gst} GST)`, `Quoted-basis subtotal: ${money(cost.quotedSubtotal)}`, cost.inclGst !== null ? `Panel subtotal including GST: ${money(cost.inclGst)}` : 'GST not confirmed; no tax-inclusive subtotal calculated.'] : ['No panel price entered; no monetary estimate calculated.']),
        ...(battenLm !== null ? [`Optional area/gauge check: ${num(battenLm)} lm at ${gauge} mm. Not a cutting list or support design; no batten cost included.`] : []),
        ...(belowPitch ? ['WARNING: entered pitch is below the selected product’s published minimum. This is not a suitable-roof approval.'] : []),
        'Excludes all trims, flashings, fixings, underlay, support materials, labour, delivery, removal, asbestos work and access.',
        'Confirm all order quantities and product suitability with the installer. Measurements are not transferred into the detailed estimator.'
      ].join('\n');
      const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
      const a = document.createElement('a'); a.href = url; a.download = 'roofhub-metal-tile-panel-worksheet.txt';
      try { document.body.appendChild(a); a.click(); }
      finally { a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
      setSaved('Worksheet file prepared. Keep its assumptions with any quote request.');
    } catch { setSaved('This browser could not save the worksheet. Your entries remain on this page.'); }
  };
  return <div className="rh-sheet-tool rh-tile-tool" aria-labelledby={`${uid}-title`}>
    <div className="rh-sheet-tool__heading"><p className="eyebrow">From profile to quantity</p><h3 id={`${uid}-title`}>Your metal-tile panel worksheet</h3><p>Start with the illustrative 200 m² roof. No supplier price is pre-filled, and no personal details are needed.</p></div>
    <label className="rh-sheet-tool__source" htmlFor={`${uid}-profile`}><span>Profile / coverage basis</span><select id={`${uid}-profile`} value={selected} onChange={e => changeProfile(e.target.value)}>
      {profiles.map(p => <option key={p.id} value={p.id}>{p.name}{p.presetEligible ? ` · ${p.panelsPerM2} panels/m²` : ' · supplier confirmation needed'}</option>)}
      <option value="custom">My own product and confirmed panel density</option>
    </select></label>
    {profile && <p className="rh-sheet-source-note"><strong>{profile.presetEligible ? `${profile.panelsPerM2} panels/m², as published.` : 'Automatic density disabled for this profile.'}</strong>{profile.note || 'Published planning density, before your allowance and supplier order rules.'} <a href={profile.sourceUrl} target="_blank" rel="noopener noreferrer">Check product specification ↗</a> Checked {profile.reviewedAt}. Changing profile clears the previous quote and support inputs.</p>}
    <div className="rh-sheet-tool__fields">
      {field('area','Roof area (m²)',area,setArea,0.01,'any',1000000)}
      <label htmlFor={`${uid}-basis`}><span>This measurement is</span><select id={`${uid}-basis`} value={basis} onChange={e => {setBasis(e.target.value as 'actual'|'plan');setSaved('');}}><option value="actual">Actual sloping roof area</option><option value="plan">Horizontal roof projection</option></select></label>
      {basis === 'plan' && field('pitch','Roof pitch (degrees)',pitch,setPitch,0,'any',89.99)}
      {!profile?.presetEligible && field('density','Confirmed panels per m²',density,setDensity,0.01,'any',1000)}
      {field('extra','Your extra panel allowance (%)',extra,setExtra,0,'any',100)}
    </div>
    <p className="rh-sheet-input-help">Use a roof outline including eaves, not total household floor area. Plan conversion assumes one pitch; actual area is not converted again. A 0% allowance means no extra panels, not a recommended ordering margin.</p>
    {belowPitch && <p className="rh-tile-warning" role="status"><strong>Pitch needs review.</strong> The entered pitch is below {profile.minimumPitch}°, the selected product’s published starting minimum. The arithmetic below is not approval to use it on this roof.</p>}
    <details className="rh-evidence-detail rh-evidence-detail--nested rh-tile-options"><summary>Add a supplier price, pack rules or a batten check</summary><div>
      <div className="rh-sheet-tool__fields">
        {field('price','Your quote (NZD per panel, optional)',price,setPrice,0.01)}
        <label htmlFor={`${uid}-gst`}><span>Your quoted price is</span><select id={`${uid}-gst`} value={gst} onChange={e => {setGst(e.target.value as 'incl'|'excl'|'unknown');setSaved('');}}><option value="unknown">GST not confirmed</option><option value="incl">Including GST</option><option value="excl">Excluding GST</option></select></label>
        {field('pack','Panels per pack (1 if sold individually)',pack,setPack,1,'1',1000000)}
        {field('minimum','Supplier minimum panels (0 if none)',minimum,setMinimum,0,'1',1000000000)}
      </div>
      <p className="rh-review-note">A pack price must first be divided by its panel count. Prices are reader inputs, not RoofHub market observations. GST conversion uses 15% where you select excluding GST.</p>
      {profile?.id !== 'calibre' ? <label className="rh-tile-checkbox" htmlFor={`${uid}-battens`}><input id={`${uid}-battens`} type="checkbox" checked={showBattens} onChange={e => {setShowBattens(e.target.checked);setSaved('');}}/><span>I have a batten gauge from my installer and want an area/gauge quantity check</span></label> : <p className="rh-review-note">The cited Calibre appraisal description uses plywood support. This worksheet does not substitute a batten arrangement.</p>}
      {showBattens && <><div className="rh-sheet-tool__fields">{field('gauge','Installer-provided batten gauge (mm)',gauge,setGauge,1,'any',5000)}</div><p className="rh-review-note">Only for a confirmed batten-supported system, not plywood decking. No spacing is recommended or supplied automatically. Excludes perimeter/support details, extra battens, cuts, stock lengths and fixings.</p></>}
    </div></details>
    <div className="rh-sheet-result" role="status" aria-live="polite" aria-atomic="true">
      {result ? <><p>Planning panel quantity</p><strong>{num(result.purchasePanels,0)} panels</strong><span>Rounded for your allowance, minimum and pack size</span>
        <dl><div><dt>Actual roof area</dt><dd>{num(result.surfaceM2)} m²</dd></div><div><dt>Before order rules</dt><dd>{num(result.requiredPanels,0)} panels</dd></div></dl>
        {(result.minimumApplies || result.packExtraPanels > 0) && <p className="rh-sheet-minimum">Your supplier minimum or whole-pack rule increases this quantity.</p>}
        <div className="rh-tile-cost">{cost ? <><span>Panel-only subtotal</span><strong>{money(cost.inclGst ?? cost.quotedSubtotal)}</strong><small>{cost.inclGst === null ? 'NZD, quoted basis only. GST unconfirmed.' : 'NZD, including GST.'}</small></> : <p>{priceError || 'No price entered. Add your supplier’s panel quote to see a subtotal.'}</p>}</div>
        {showBattens && <p className="rh-review-note">{battenError || `Separate rough batten check: ${num(battenLm!)} lm. No batten cost included.`}</p>}
      </> : <p className="rh-input-error">{error}</p>}
    </div>
    <p className="rh-sheet-exclusions"><strong>Not a full roof price:</strong> trims, valleys, fixings, underlay, battens/decking, labour, delivery, removal and access remain outside the panel subtotal. Ask the installer to confirm the panel schedule and complete system price.</p>
    <div className="button-row"><Link className="button button--primary" href="/tools/detailed-roof-estimator">Price the rest of my roof →</Link><button type="button" className="button button--outline" disabled={!result || !!priceError || !!battenError} onClick={download}>Save my worksheet</button></div>
    <p className="rh-review-note">These measurements are not transferred automatically. Save the worksheet before opening the detailed estimator.</p>
    {saved && <p role="status" className="rh-review-note">{saved}</p>}
    <noscript>The default quantity and worked examples are available without JavaScript. Enable JavaScript to change inputs and save the worksheet.</noscript>
  </div>;
}
