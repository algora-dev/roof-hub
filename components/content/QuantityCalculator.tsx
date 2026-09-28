'use client';
import { useId, useState } from 'react';
import { budgetRange, numberInput, pitchFromRiseRun, roofSurfaceArea, sheetAreaRate } from '@/lib/roof-maths';

/** Small article utilities, not the questionnaire estimator or a replacement rate engine. */
export function QuantityCalculator({ mode }: {mode: 'area' | 'pitch' | 'sheet' | 'budget'}) {
  const id = useId();
  const [area, setArea] = useState('200');
  const [pitch, setPitch] = useState('25');
  const [basis, setBasis] = useState<'plan' | 'actual'>('plan');
  const [rise, setRise] = useState('1.5');
  const [run, setRun] = useState('3');
  const [price, setPrice] = useState('');
  const [cover, setCover] = useState('');
  const [low, setLow] = useState('');
  const [high, setHigh] = useState('');
  const [gst, setGst] = useState('GST basis not confirmed');
  let result: string | null = null;
  let detail = '';
  let invalid = '';
  const number = (raw: string, name: string): number => {
    const n = numberInput(raw);
    if (n === null) throw new Error(`Enter ${name}.`);
    return n;
  };
  const formatted = (n: number, digits = 1) => n.toLocaleString('en-NZ', {maximumFractionDigits: digits});
  try {
    if (mode === 'area') {
      const a = number(area, 'an area');
      const deg = basis === 'actual' ? 0 : number(pitch, 'a pitch');
      result = `${formatted(roofSurfaceArea(a, deg, basis))} m²`;
      detail = basis === 'actual' ? 'Actual area retained. No pitch conversion or wastage added.' : 'Calculated sloping area. Assumes the projected roof outline already includes eaves and has one pitch. No wastage added.';
    } else if (mode === 'pitch') {
      result = `${formatted(pitchFromRiseRun(number(rise, 'a rise'), number(run, 'a horizontal run')), 2)}°`;
      detail = 'Geometry only. Use the same units for rise and run; this does not approve a roofing product.';
    } else if (mode === 'sheet' && price && cover) {
      result = `$${formatted(sheetAreaRate(number(price, 'a lineal price'), number(cover, 'an effective cover')), 2)}/m²`;
      detail = `Sheet only; ${gst.toLowerCase()}. No installation, waste, accessories or freight added.`;
    } else if (mode === 'budget' && low && high) {
      const total = budgetRange(number(area, 'actual roof area'), number(low, 'a low rate'), number(high, 'a high rate'));
      result = `$${formatted(total.low, 0)}–$${formatted(total.high, 0)}`;
      detail = `Arithmetic from your rates; ${gst.toLowerCase()}. Scope is whatever your rates include. Not a RoofHub market quote.`;
    }
  } catch (error) { invalid = error instanceof Error ? error.message : 'Check the values.'; }
  const input = (label: string, suffix: string, value: string, update: (v: string) => void, min: string, max?: string) => <label htmlFor={`${id}-${suffix}`}><span>{label}</span><input id={`${id}-${suffix}`} type="number" inputMode="decimal" value={value} min={min} max={max} step="any" onChange={e => update(e.target.value)} /></label>;
  const titles = {area: 'Roof-area converter', pitch: 'Rise-and-run pitch calculator', sheet: 'Convert a sheet price', budget: 'Calculate using your own rates'};
  return <div className="rh-quantity" aria-label={titles[mode]}>
    <p className="eyebrow">Use the numbers you know</p><h3>{titles[mode]}</h3>
    <div className="rh-quantity__fields">
      {(mode === 'area' || mode === 'budget') && input(mode === 'budget' ? 'Actual roof area (m²)' : 'Area (m²)', 'area', area, setArea, '0.01')}
      {mode === 'area' && <><label htmlFor={`${id}-basis`}><span>This measurement is</span><select id={`${id}-basis`} value={basis} onChange={e => setBasis(e.target.value as 'plan' | 'actual')}><option value="plan">Horizontal roof projection</option><option value="actual">Actual sloping roof area</option></select></label>{basis === 'plan' && input('Pitch (degrees)', 'pitch', pitch, setPitch, '0', '89.99')}</>}
      {mode === 'pitch' && <>{input('Vertical rise (m)', 'rise', rise, setRise, '0')}{input('Horizontal run (m)', 'run', run, setRun, '0.01')}</>}
      {mode === 'sheet' && <>{input('Your sheet price (NZD / lm)', 'price', price, setPrice, '0.01')}{input('Confirmed effective cover (mm)', 'cover', cover, setCover, '1')}</>}
      {mode === 'budget' && <>{input('Your low rate (NZD / m²)', 'low', low, setLow, '0.01')}{input('Your high rate (NZD / m²)', 'high', high, setHigh, '0.01')}</>}
      {(mode === 'sheet' || mode === 'budget') && <label htmlFor={`${id}-gst`}><span>Your input prices are</span><select id={`${id}-gst`} value={gst} onChange={e => setGst(e.target.value)}><option>GST basis not confirmed</option><option>Including GST</option><option>Excluding GST</option></select></label>}
    </div>
    <div className="rh-quantity__result" role="status" aria-live="polite" aria-atomic="true">{invalid ? <p>{invalid}</p> : result ? <><strong>{result}</strong><p>{detail}</p></> : <p>Enter your own prices and dimensions to calculate. This tool does not supply a market rate or add GST.</p>}</div>
    <noscript>Interactive calculation needs JavaScript. The formula and worked examples on this page remain available without it.</noscript>
  </div>;
}
