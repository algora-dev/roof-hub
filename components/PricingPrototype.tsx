"use client";

import { useMemo, useState } from "react";

const materialFactors = { "Long-run steel": 1, "Metal tile": 1.12, "Concrete tile": 1.18, "Membrane / low-slope": 1.28 } as const;
const complexityFactors = { Simple: 1, Moderate: 1.18, Complex: 1.38 } as const;

type Material = keyof typeof materialFactors;
type Complexity = keyof typeof complexityFactors;

export function PricingPrototype() {
  const [area, setArea] = useState(160);
  const [material, setMaterial] = useState<Material>("Long-run steel");
  const [complexity, setComplexity] = useState<Complexity>("Moderate");

  const estimate = useMemo(() => {
    // Prototype-only demo arithmetic. This deliberately does NOT claim to be NZ market pricing.
    const base = area * 170 * materialFactors[material] * complexityFactors[complexity];
    return { low: Math.round(base * 0.86 / 500) * 500, high: Math.round(base * 1.16 / 500) * 500 };
  }, [area, material, complexity]);

  return (
    <div className="pricing-prototype">
      <div className="prototype-controls">
        <div className="field-group"><label htmlFor="area">Approximate roof area</label><div className="range-value">{area} m²</div><input id="area" type="range" min="70" max="420" step="10" value={area} onChange={(e) => setArea(Number(e.target.value))}/></div>
        <div className="field-group"><label htmlFor="material">Roofing system</label><select id="material" value={material} onChange={(e) => setMaterial(e.target.value as Material)}>{Object.keys(materialFactors).map((item) => <option key={item}>{item}</option>)}</select></div>
        <div className="field-group"><label>Roof complexity</label><div className="segmented">{Object.keys(complexityFactors).map((item) => <button type="button" className={complexity === item ? "is-active" : ""} key={item} onClick={() => setComplexity(item as Complexity)}>{item}</button>)}</div></div>
      </div>
      <div className="prototype-result">
        <p className="eyebrow">Prototype estimate layout</p>
        <p className="result-number">${estimate.low.toLocaleString()}–${estimate.high.toLocaleString()}</p>
        <p className="result-unit">Illustrative project range only</p>
        <div className="notice notice--limitation"><strong>Demo data — not publishable pricing.</strong><span>This prototype exists to test the RoofHub result experience. Real formulas, GST treatment, regional factors, exclusions and evidence will replace it after the existing pricing tools are audited.</span></div>
        <dl className="result-meta"><div><dt>Area supplied</dt><dd>{area} m²</dd></div><div><dt>System</dt><dd>{material}</dd></div><div><dt>Complexity</dt><dd>{complexity}</dd></div></dl>
      </div>
    </div>
  );
}
