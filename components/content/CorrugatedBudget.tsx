"use client";

import Link from 'next/link';
import { useId, useState } from 'react';
import type { SheetBudgetPreset } from '@/data/research/corrugated';
import { sheetBudget } from '@/lib/corrugated-maths';
import { numberInput } from '@/lib/roof-maths';

const money = (n: number) => n.toLocaleString('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 });
const decimal = (n: number) => n.toLocaleString('en-NZ', { maximumFractionDigits: 2 });

/** Arithmetic from a selected observation or the reader's quote, never a market-rate model. */
export function CorrugatedBudget({ presets }: { presets: SheetBudgetPreset[] }) {
  const uid = useId();
  const [selected, setSelected] = useState(presets[0]?.id ?? 'custom');
  const [area, setArea] = useState('200');
  const [basis, setBasis] = useState<'actual' | 'plan'>('actual');
  const [pitch, setPitch] = useState('25');
  const [extra, setExtra] = useState('0');
  const [customPrice, setCustomPrice] = useState('');
  const [customCover, setCustomCover] = useState('');
  const [customGst, setCustomGst] = useState<'incl' | 'excl' | 'unknown'>('unknown');
  const [minimum, setMinimum] = useState('0');
  const [downloadMessage, setDownloadMessage] = useState('');
  const preset = presets.find(option => option.id === selected);
  const getNumber = (value: string, label: string) => {
    const n = numberInput(value);
    if (n === null) throw new Error(`Enter ${label}.`);
    return n;
  };
  let result: ReturnType<typeof sheetBudget> | null = null;
  let error = '';
  try {
    if (!preset && customGst === 'unknown') throw new Error('Confirm your quote’s GST basis before calculating.');
    result = sheetBudget({ area: getNumber(area, 'your roof area'), basis,
      pitchDegrees: basis === 'plan' ? getNumber(pitch, 'the roof pitch') : 0,
      pricePerLm: preset?.pricePerLm ?? getNumber(customPrice, 'a price per lineal metre'),
      gstBasis: preset?.gstBasis ?? (customGst as 'incl' | 'excl'),
      coverMm: preset?.coverMm ?? getNumber(customCover, 'confirmed effective cover'),
      extraPercent: getNumber(extra, 'an extra material allowance, or 0'),
      minimumOrderLm: preset?.minimumOrderLm ?? getNumber(minimum, 'a minimum order, or 0') });
  } catch (cause) { error = cause instanceof Error ? cause.message : 'Check the inputs.'; }
  const field = (label: string, key: string, value: string, update: (next: string) => void, min: number, max?: number) =>
    <label htmlFor={`${uid}-${key}`}><span>{label}</span><input id={`${uid}-${key}`} type="number" inputMode="decimal" step="any" min={min} max={max} value={value} onChange={e => { update(e.target.value); setDownloadMessage(''); }} /></label>;
  const download = () => {
    if (!result) return;
    try {
      const text = [
        'RoofHub corrugated sheet calculation', 'Planning arithmetic only. Not an installed quote.',
        `Source: ${preset?.label ?? 'Reader-provided quote'}`, ...(preset ? [`Source page: ${preset.sourceUrl}`, `Source checked: ${preset.reviewedAt}`, `Source note: ${preset.note}`] : []),
        `Input area: ${area} m² (${basis})`, ...(basis === 'plan' ? [`Pitch: ${pitch} degrees`] : []),
        `Input rate: NZD ${preset?.pricePerLm ?? customPrice}/lm, ${preset?.gstBasis ?? customGst} GST`,
        `Effective cover: ${preset?.coverMm ?? customCover} mm`, `Extra material allowance selected: ${extra}%`,
        `Sloping surface: ${decimal(result.surfaceM2)} m²`, `Continuous-length allowance: ${decimal(result.billedLm)} lm`,
        `Minimum order applied: ${result.minimumApplies ? 'yes' : 'no'}`, `Approximate sheet subtotal: ${money(result.totalInclGst)} including GST`,
        'Excludes labour, accessories, underlay, freight, removal, access and any unentered cutting allowance.',
        'Not a full-sheet count, cutting schedule or product approval. Confirm cover, lengths, quantity and availability with the supplier.'
      ].join('\n');
      const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'roofhub-sheet-calculation.txt';
      document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDownloadMessage('Calculation file prepared. It is not a roofing quote.');
    } catch { setDownloadMessage('The calculation could not be saved by this browser. Your inputs remain on this page.'); }
  };
  return <div className="rh-sheet-tool" aria-labelledby={`${uid}-title`}>
    <div className="rh-sheet-tool__heading"><p className="eyebrow">Apply the evidence</p><h3 id={`${uid}-title`}>Your sheet-only budget</h3><p>Start with the illustrative 200 m² input, then change it to your measurements. This is not an installed roof price.</p></div>
    <label className="rh-sheet-tool__source" htmlFor={`${uid}-source`}><span>Price to calculate with</span><select id={`${uid}-source`} value={selected} onChange={e => {setSelected(e.target.value);setDownloadMessage('');}}>{presets.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}<option value="custom">Enter my own sheet quote</option></select></label>
    {preset && <p className="rh-sheet-source-note"><strong>NZD ${decimal(preset.pricePerLm)}/lm {preset.gstBasis === 'excl' ? 'excluding' : 'including'} GST; {preset.coverMm} mm cover.</strong> {preset.note} <a href={preset.sourceUrl} target="_blank" rel="noopener noreferrer">Check source</a>. Checked {preset.reviewedAt}.</p>}
    <div className="rh-sheet-tool__fields">
      {field('Roof area (m²)', 'area', area, setArea, 0.01)}
      <label htmlFor={`${uid}-basis`}><span>This area is</span><select id={`${uid}-basis`} value={basis} onChange={e => {setBasis(e.target.value as 'actual' | 'plan');setDownloadMessage('');}}><option value="actual">Actual sloping roof area</option><option value="plan">Horizontal roof projection</option></select></label>
      {basis === 'plan' && field('Pitch (degrees)', 'pitch', pitch, setPitch, 0, 89.99)}
      {field('Extra material allowance (%)', 'extra', extra, setExtra, 0, 100)}
      {!preset && <>
        {field('Your price (NZD / lm)', 'price', customPrice, setCustomPrice, 0.01)}
        {field('Confirmed effective cover (mm)', 'cover', customCover, setCustomCover, 1)}
        <label htmlFor={`${uid}-gst`}><span>Your quoted price is</span><select id={`${uid}-gst`} value={customGst} onChange={e => {setCustomGst(e.target.value as 'incl'|'excl'|'unknown');setDownloadMessage('');}}><option value="unknown">GST not confirmed</option><option value="incl">Including GST</option><option value="excl">Excluding GST</option></select></label>
        {field('Minimum order (lm, or 0)', 'minimum', minimum, setMinimum, 0)}
      </>}
    </div>
    <p className="rh-sheet-input-help">Plan input assumes one pitch and a roof outline including eaves. Actual input is not pitch-adjusted. Side laps are already in effective cover; extra material is your own allowance, not an automatic recommendation.</p>
    <div className="rh-sheet-result" role="status" aria-live="polite" aria-atomic="true">
      {result ? <><p>Approximate sheet-only subtotal</p><strong>{money(result.totalInclGst)}</strong><span>NZD, including GST</span><dl><div><dt>Sloping area</dt><dd>{decimal(result.surfaceM2)} m²</dd></div><div><dt>Length allowance</dt><dd>{decimal(result.billedLm)} lm</dd></div></dl>{result.minimumApplies && <p className="rh-sheet-minimum">The supplier’s minimum order, not just your roof area, determines this subtotal.</p>}</> : <p className="rh-input-error">{error}</p>}
    </div>
    <p className="rh-sheet-exclusions"><strong>Not included:</strong> labour, flashings, underlay, fixings, delivery, removal or access. This continuous-length calculation is not a cut-to-length order. Sheet counts and offcuts still need a roof-plane takeoff.</p>
    <div className="button-row"><Link className="button button--primary" href="/tools/detailed-roof-estimator">Open the full roof estimator →</Link><button type="button" className="button button--outline" disabled={!result} onClick={download}>Save this calculation</button></div>
    <p className="rh-review-note">Save your calculation before opening the detailed tool. These inputs are not transferred automatically.</p>
    {downloadMessage && <p className="rh-review-note" role="status">{downloadMessage}</p>}
    <noscript>The default example and evidence remain visible. JavaScript is needed to change inputs; the calculation rules are explained below.</noscript>
  </div>;
}
