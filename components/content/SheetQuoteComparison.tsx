"use client";

import Link from 'next/link';
import { useId, useState } from 'react';
import { compareSheetQuotes } from '@/lib/corrugated-maths';
import { numberInput } from '@/lib/roof-maths';

type QuoteFields = { price: string; cover: string; gst: 'incl' | 'excl' | 'unknown'; minimum: string };
const blankQuote = (): QuoteFields => ({ price: '', cover: '', gst: 'unknown', minimum: '0' });
const money = (n: number, digits = 0) => n.toLocaleString('en-NZ', { style: 'currency', currency: 'NZD', minimumFractionDigits: digits, maximumFractionDigits: digits });

/** The starting numbers are explicitly hypothetical, not fetched prices or estimator rates. */
export function SheetQuoteComparison() {
  const uid = useId();
  const [example, setExample] = useState(true);
  const [area, setArea] = useState('200');
  const [basis, setBasis] = useState<'actual' | 'plan'>('actual');
  const [pitch, setPitch] = useState('25');
  const [extra, setExtra] = useState('0');
  const [a, setA] = useState<QuoteFields>({ price: '25', cover: '760', gst: 'incl', minimum: '0' });
  const [b, setB] = useState<QuoteFields>({ price: '25', cover: '840', gst: 'incl', minimum: '0' });
  const number = (value: string, label: string): number => {
    const parsed = numberInput(value);
    if (parsed === null) throw new Error(`Enter ${label}.`);
    return parsed;
  };
  const parseQuote = (quote: QuoteFields, label: string) => {
    if (quote.gst === 'unknown') throw new Error(`Confirm the GST basis for ${label}.`);
    return { pricePerLm: number(quote.price, `${label}'s lineal price`), coverMm: number(quote.cover, `${label}'s effective cover`),
      gstBasis: quote.gst, minimumOrderLm: number(quote.minimum, `${label}'s minimum order, or 0`) };
  };
  let result: ReturnType<typeof compareSheetQuotes> | null = null;
  let error = '';
  try {
    result = compareSheetQuotes({ area: number(area, 'roof area'), basis,
      pitchDegrees: basis === 'plan' ? number(pitch, 'pitch') : 0, extraPercent: number(extra, 'extra material allowance, or 0'),
      quoteA: parseQuote(a, 'Quote A'), quoteB: parseQuote(b, 'Quote B') });
  } catch (cause) { error = cause instanceof Error ? cause.message : 'Check both quotes.'; }
  const field = (label: string, key: string, value: string, update: (value: string) => void, min: number, max?: number) =>
    <label htmlFor={`${uid}-${key}`}><span>{label}</span><input id={`${uid}-${key}`} value={value} type="number" step="any" inputMode="decimal" min={min} max={max} onChange={event => update(event.target.value)} /></label>;
  const quoteFields = (label: string, key: string, quote: QuoteFields, update: (value: QuoteFields) => void) => {
    const change = (name: keyof QuoteFields, value: string) => { setExample(false); update({ ...quote, [name]: value }); };
    return <fieldset className="rh-quote-inputs"><legend>{label}</legend>
      {field('Price (NZD / lm)', `${key}-price`, quote.price, value => change('price', value), 0.01)}
      {field('Effective cover (mm)', `${key}-cover`, quote.cover, value => change('cover', value), 1)}
      <label htmlFor={`${uid}-${key}-gst`}><span>Quoted GST basis</span><select id={`${uid}-${key}-gst`} value={quote.gst} onChange={e => change('gst', e.target.value)}><option value="unknown">Not confirmed</option><option value="incl">Including GST</option><option value="excl">Excluding GST</option></select></label>
      {field('Minimum order (lm, or 0)', `${key}-minimum`, quote.minimum, value => change('minimum', value), 0)}
    </fieldset>;
  };
  return <section className="rh-sheet-tool rh-quote-comparison" aria-labelledby={`${uid}-title`}>
    <div className="rh-sheet-tool__heading"><p className="eyebrow">Compare like for like</p><h3 id={`${uid}-title`}>Put two sheet quotes on the same basis</h3>
      <p>Compare confirmed lineal prices and effective cover. This worksheet does not compare labour, coatings, warranties or structural suitability.</p></div>
    <div className="rh-quote-mode"><p role="status"><strong>{example ? 'Illustrative prices and covers, not supplier offers.' : 'Editable inputs, not independently verified.'}</strong> {example ? 'Both example rates are $25/lm including GST. Replace them with your quoted specifications.' : 'Confirm every field in both columns. Any values you have not replaced remain from the example.'}</p>
      <button type="button" className="button button--outline" onClick={() => {setExample(false);setA(blankQuote());setB(blankQuote());}}>Clear both quotes</button></div>
    <div className="rh-sheet-tool__fields">
      {field('Roof area (m²)', 'area', area, setArea, 0.01)}
      <label htmlFor={`${uid}-basis`}><span>This area is</span><select id={`${uid}-basis`} value={basis} onChange={e => setBasis(e.target.value as 'actual' | 'plan')}><option value="actual">Actual sloping roof area</option><option value="plan">Horizontal roof projection</option></select></label>
      {basis === 'plan' && field('Pitch (degrees)', 'pitch', pitch, setPitch, 0, 89.99)}
      {field('Extra material allowance (%)', 'extra', extra, setExtra, 0, 100)}
    </div>
    <div className="rh-quote-columns">{quoteFields('Quote A', 'a', a, setA)}{quoteFields('Quote B', 'b', b, setB)}</div>
    <div className="rh-quote-output" aria-live="polite" aria-atomic="true" role="status">{result ? <>
      <p><strong>{example ? 'Illustrative sheet-only totals' : 'Calculated sheet-only totals'}</strong>, NZD including GST</p>
      <div className="rh-quote-totals"><div><span>Quote A</span><strong>{money(result.a.totalInclGst)}</strong><small>{money(result.aPerCoveredM2, 2)}/covered m² before extra material or minimum order</small></div><div><span>Quote B</span><strong>{money(result.b.totalInclGst)}</strong><small>{money(result.bPerCoveredM2, 2)}/covered m² before extra material or minimum order</small></div></div>
      <p>On these inputs, {Math.abs(result.deltaInclGst) < 0.005 ? 'both sheet subtotals are equal.' : `Quote B is ${money(Math.abs(result.deltaInclGst))} ${result.deltaInclGst < 0 ? 'lower' : 'higher'} than Quote A.`} This is not a recommendation of either product.</p>
      {(result.a.minimumApplies || result.b.minimumApplies) && <p>A minimum order affects {result.a.minimumApplies && result.b.minimumApplies ? 'both totals' : result.a.minimumApplies ? 'Quote A' : 'Quote B'}.</p>}
    </> : <p className="rh-input-error">{error}</p>}</div>
    <p className="rh-sheet-exclusions">For a single-pitch roof, plan area is converted once. Include the eaves in the horizontal roof projection. Both totals are continuous-length allowances, not cutting schedules. Labour, flashings, underlay, fixings, freight, removal and access are excluded.</p>
    <Link className="text-link" href="/tools/detailed-roof-estimator">Add the rest of the roof in the detailed estimator →</Link>
    <p className="rh-review-note">Inputs stay in this worksheet and are not transferred into the estimator.</p>
    <noscript>The illustrative comparison remains readable. JavaScript is needed to change the inputs.</noscript>
  </section>;
}
