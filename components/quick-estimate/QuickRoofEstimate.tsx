"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { trackRoofHubEvent } from "@/lib/client/analytics";
import { getRoofProject, setRoofProject } from "@/lib/client/roof-project-store";
import { registerToolContext, setToolContext } from "@/lib/client/tool-context-store";
import { loadDetailedEstimatorModule } from "@/lib/estimator/detailed-adapter";
import { isRateCardApprovedForPublicEstimate } from "@/lib/estimator/rate-card";
import type { RoofComplexity, RoofShape } from "@/lib/roof-project";
import {
  PITCH_BANDS,
  ROOF_TEMPLATES,
  SIZE_BANDS,
  estimateDetailLevel,
  measureQuickRoof,
  priceQuickEstimate,
  productPitchAssessment,
  type QuickDesiredRoof,
  type QuickEstimateInput,
  type QuickMeasurementRange,
  type QuickPriceResult
} from "@/lib/quick-estimate/index.mjs";
import {
  applyQuickEstimateToRoofProject,
  defaultQuickEstimateInput,
  quickInputFromRoofProject
} from "@/lib/quick-estimate/project-adapter";
import { PitchIllustration, RoofAreaRange, RoofIllustration } from "./RoofIllustration";
import { QuickEstimateEnquiry } from "./QuickEstimateEnquiry";
import styles from "./QuickRoofEstimate.module.css";

type StepId = "project" | "existing" | "shape" | "size" | "pitch" | "product" | "complexity" | "result";

const productLabels: Record<QuickDesiredRoof, string> = {
  corrugate: "Corrugated long-run",
  "five-rib": "Five-rib / trapezoidal",
  "pressed-metal-tile": "Pressed metal tile",
  "tray-standing-seam": "Tray / standing seam",
  membrane: "Membrane roofing",
  undecided: "Not sure yet"
};

const shapeOptions: { value: RoofShape; label: string; copy: string }[] = [
  ["skillion", "Skillion", "One main slope"],
  ["gable", "Simple gable", "Two slopes and one ridge"],
  ["hip", "Hip roof", "Slopes on all four sides"],
  ["gable-valley", "Gable with valley", "Joined gable sections"],
  ["hip-valley", "Hip and valley", "Joined hipped sections"],
  ["multi-section", "Multiple sections", "Several ridges, hips or valleys"],
  ["dormer-complex", "Dormers / complex", "Projecting roof sections"],
  ["flat-low-slope", "Flat / membrane", "Nearly level roof"],
  ["unknown", "I don't know", "RoofHub will use a wider range"]
].map(([value, label, copy]) => ({ value: value as RoofShape, label, copy }));

const existingOptions: { value: QuickEstimateInput["existingRoof"]; label: string; copy: string }[] = [
  { value: "long-run-metal", label: "Long-run metal", copy: "Corrugate, five-rib or similar sheet metal" },
  { value: "concrete-tile", label: "Concrete tile", copy: "Heavy concrete roof tiles" },
  { value: "pressed-metal-tile", label: "Pressed metal tile", copy: "Lightweight metal tiles" },
  { value: "decramastic", label: "Older coated / Decramastic", copy: "May need asbestos assessment" },
  { value: "membrane", label: "Membrane", copy: "Flat-roof membrane system" },
  { value: "other", label: "Something else", copy: "RoofHub will leave removal unpriced" },
  { value: "unknown", label: "I don't know", copy: "You can still continue" }
];

const productOptions: { value: QuickDesiredRoof; label: string; copy: string }[] = [
  { value: "corrugate", label: "Corrugated", copy: "Classic long-run profile" },
  { value: "five-rib", label: "Five-rib", copy: "Trapezoidal long-run profile" },
  { value: "tray-standing-seam", label: "Tray / standing seam", copy: "Architectural concealed-fix systems" },
  { value: "pressed-metal-tile", label: "Pressed metal tile", copy: "Lightweight tiled metal profile" },
  { value: "membrane", label: "Membrane", copy: "For suitable flat / low-slope roofs" },
  { value: "undecided", label: "Not sure", copy: "Compare common options first" }
];

const complexityOptions: { value: RoofComplexity; label: string; copy: string }[] = [
  { value: "difficult-access", label: "Difficult access / steep site", copy: "Uses the configured difficult-access scaffold allowance" },
  { value: "dormers", label: "Extra dormers", copy: "Flagged for site-specific detailing" },
  { value: "multiple-sections", label: "Several roof sections", copy: "Useful if the shape card was only approximate" },
  { value: "skylights-or-chimneys", label: "Skylights or chimneys", copy: "Their flashings stay outside the automatic price" },
  { value: "attached-flat-section", label: "Attached flat section", copy: "Priced separately once its scope is known" }
];

function steps(input: QuickEstimateInput): StepId[] {
  return ["project", ...(input.projectType === "reroof" ? ["existing" as const] : []), "shape", "size", ...(input.roofShape === "flat-low-slope" ? [] : ["pitch" as const]), "product", "complexity", "result"];
}

function money(value: number): string {
  return new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD", maximumFractionDigits: 0 }).format(value);
}

function areaSourceLabel(source: QuickEstimateInput["areaSource"]): string {
  if (source === "roof-area") return "Actual roof area";
  if (source === "building-footprint") return "Building / roof footprint";
  if (source === "total-floor-area") return "Total floor area";
  return "Approximate size band";
}

function ResultCard({ result, reviewMode }: { result: QuickPriceResult; reviewMode: boolean }) {
  const approved = result.approved && Boolean(result.rateCardId) && isRateCardApprovedForPublicEstimate(result.rateCardId);
  const showPrice = result.low !== null && result.high !== null && (approved || reviewMode);
  const label = result.status === "complete" ? "Indicative roofing range" : "Configured subtotal range";
  return <article className={styles.resultPriceCard}>
    <div className={styles.resultPriceHead}><div><span className={styles.resultProduct}>{productLabels[result.product]}</span><strong>{label}</strong></div><span className={`${styles.statusPill} ${result.status === "complete" ? styles.statusComplete : styles.statusPartial}`}>{result.status === "complete" ? "Full configured scope" : result.status === "incompatible" ? "Pitch mismatch" : result.status === "unpriced" ? "Pricing pending" : "Partial scope"}</span></div>
    {showPrice ? <>
      <div className={styles.priceRange}>{money(result.low!)} <span>to</span> {money(result.high!)}</div>
      <p className={styles.priceBasis}>{approved ? "Incl. GST using the approved RoofHub estimator rate card." : "Calibration preview only. Includes GST using the current draft card's tax assumption."}</p>
    </> : result.status === "incompatible" ? <div className={styles.noPrice}><strong>This product needs a different roof pitch or shape.</strong><p>{result.compatibility.message}</p></div>
      : <div className={styles.noPrice}><strong>RoofHub is not publishing a price for this selection yet.</strong><p>{result.product === "membrane" ? "The membrane geometry pathway is ready, but an approved membrane estimator rate card has not been configured." : "The current RoofHub rate card is still marked as draft. The flow and quantities are ready for calibration without exposing an unapproved public number."}</p></div>}
    {result.compatibility.message && result.status !== "incompatible" && <p className={styles.compatibilityNote}>{result.compatibility.message}</p>}
    {result.missing.length > 0 && <details className={styles.scopeDetails}><summary>Items that still need checking</summary><ul>{result.missing.map(item => <li key={item}>{item}</li>)}</ul></details>}
  </article>;
}

export default function QuickRoofEstimate() {
  const [input, setInput] = useState<QuickEstimateInput>(() => defaultQuickEstimateInput());
  const [current, setCurrent] = useState<StepId>("project");
  const [range, setRange] = useState<QuickMeasurementRange | null>(null);
  const [prices, setPrices] = useState<QuickPriceResult[]>([]);
  const [pricingState, setPricingState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [pricingError, setPricingError] = useState("");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const reviewMode = process.env.NEXT_PUBLIC_ROOFHUB_QUICK_ESTIMATE_REVIEW === "1";
  const order = useMemo(() => steps(input), [input]);
  const stepIndex = Math.max(0, order.indexOf(current));
  const progress = current === "result" ? 100 : Math.round((stepIndex / Math.max(order.length - 1, 1)) * 100);

  useEffect(() => {
    const existing = getRoofProject();
    if (existing) setInput(quickInputFromRoofProject(existing));
    const unregister = registerToolContext("quick-estimate");
    trackRoofHubEvent("estimate_start", { tool: "quick-estimate", entryPoint: existing?.entryPoint ?? "direct" });
    return unregister;
  }, []);

  useEffect(() => {
    setToolContext({ activeTool: "quick-estimate", step: current });
  }, [current]);

  useEffect(() => {
    if (current !== "result") return;
    let cancelled = false;
    setPricingState("loading");
    setPricingError("");
    try {
      const nextRange = measureQuickRoof(input);
      setRange(nextRange);
      void loadDetailedEstimatorModule().then(module => {
        if (cancelled) return;
        const products: QuickDesiredRoof[] = input.desiredRoof === "undecided"
          ? (input.roofShape === "flat-low-slope" ? ["membrane", "five-rib", "tray-standing-seam"] : ["corrugate", "five-rib", "pressed-metal-tile", "tray-standing-seam"])
          : [input.desiredRoof];
        const nextPrices = products.map(product => priceQuickEstimate(input, nextRange, product, module));
        setPrices(nextPrices);
        setPricingState("ready");
        const selected = input.desiredRoof === "undecided" ? null : nextPrices[0] ?? null;
        const shared = applyQuickEstimateToRoofProject(input, nextRange, selected, getRoofProject(), { allowReviewPricing: reviewMode });
        setRoofProject(shared);
        trackRoofHubEvent("estimate_result", { tool: "quick-estimate", projectType: input.projectType, roofSystem: input.desiredRoof, detailLevel: estimateDetailLevel(input) });
      }).catch(error => {
        if (cancelled) return;
        setPricingState("error");
        setPricingError(error instanceof Error ? error.message : "Pricing could not be loaded.");
      });
    } catch (error) {
      setPricingState("error");
      setPricingError(error instanceof Error ? error.message : "This combination could not be estimated.");
    }
    return () => { cancelled = true; };
  }, [current, input, reviewMode]);

  function persistProgress(nextInput = input) {
    try {
      const nextRange = measureQuickRoof(nextInput);
      const shared = applyQuickEstimateToRoofProject(nextInput, nextRange, null, getRoofProject());
      shared.context.currentStep = current;
      setRoofProject(shared);
    } catch {
      // The interface still works if a partially entered value cannot yet be modelled.
    }
  }

  function patch(patchValue: Partial<QuickEstimateInput>) {
    const next = { ...input, ...patchValue };
    setInput(next);
    persistProgress(next);
  }

  function toggleComplexity(value: RoofComplexity) {
    const set = new Set(input.complexities);
    if (set.has(value)) set.delete(value); else set.add(value);
    patch({ complexities: [...set] });
  }

  function go(delta: -1 | 1) {
    persistProgress();
    if (delta === 1) trackRoofHubEvent("estimate_step_complete", { tool: "quick-estimate", projectType: input.projectType, roofSystem: input.desiredRoof, step: current });
    const next = order[Math.max(0, Math.min(order.length - 1, stepIndex + delta))];
    setCurrent(next);
    if (next !== "result") setEnquiryOpen(false);
  }

  function startOver() {
    if (!window.confirm("Start a new roof estimate? This replaces the quick-estimate choices in this tab.")) return;
    const fresh = defaultQuickEstimateInput();
    setInput(fresh);
    setCurrent("project");
    setRange(null);
    setPrices([]);
    setEnquiryOpen(false);
    persistProgress(fresh);
  }

  return <div className={styles.app}>
    <div className={styles.topline}><div><span>Quick Roof Estimate</span><strong>Start with what you know.</strong></div><button type="button" className={styles.textButton} onClick={startOver}>Start over</button></div>
    <div className={styles.progressTrack} aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>

    <section className={styles.panel}>
      {current === "project" && <>
        <div className={styles.heading}><p className={styles.eyebrow}>Step 1</p><h1>What are you pricing?</h1><p>You can use this for an early allowance or a real roofing project. Choose the closest answer.</p></div>
        <div className={styles.choiceGrid}>
          <Choice selected={input.projectType === "new"} title="A new roof" copy="New build or a roof where removal is not part of this allowance" onClick={() => patch({ projectType: "new", existingRoof: "unknown" })} />
          <Choice selected={input.projectType === "reroof"} title="Replacing an existing roof" copy="Includes removal where RoofHub has a compatible configured allowance" onClick={() => patch({ projectType: "reroof" })} />
          <Choice selected={input.projectType === "unknown"} title="I'm not sure" copy="RoofHub will show what has and has not been included" onClick={() => patch({ projectType: "unknown", existingRoof: "unknown" })} />
        </div>
      </>}

      {current === "existing" && <>
        <div className={styles.heading}><p className={styles.eyebrow}>Existing roof</p><h1>What's on the roof now?</h1><p>Removal can change the result. If you are unsure, say so rather than guessing.</p></div>
        <div className={styles.choiceGrid}>{existingOptions.map(option => <Choice key={option.value} selected={input.existingRoof === option.value} title={option.label} copy={option.copy} onClick={() => patch({ existingRoof: option.value })} />)}</div>
      </>}

      {current === "shape" && <>
        <div className={styles.heading}><p className={styles.eyebrow}>Roof shape</p><h1>Which picture is closest?</h1><p>This controls approximate ridges, hips, valleys, barges and roof area. It does not pretend to be a measured takeoff.</p></div>
        <div className={styles.shapeGrid}>{shapeOptions.map(option => <button type="button" key={option.value} className={`${styles.shapeCard} ${input.roofShape === option.value ? styles.selected : ""}`} onClick={() => patch({ roofShape: option.value })}><RoofIllustration shape={option.value} /><strong>{option.label}</strong><span>{option.copy}</span></button>)}</div>
      </>}

      {current === "size" && <>
        <div className={styles.heading}><p className={styles.eyebrow}>Approximate size</p><h1>How big is the roof or building?</h1><p>A size band is enough. If you know an area, add it and tell RoofHub what that number represents.</p></div>
        <div className={styles.sizeGrid}>{Object.entries(SIZE_BANDS).map(([value, option]) => <button type="button" key={value} className={`${styles.sizeCard} ${input.sizeBand === value ? styles.selected : ""}`} onClick={() => patch({ sizeBand: value as QuickEstimateInput["sizeBand"] })}><strong>{option.label}</strong><span>{option.hint}</span></button>)}</div>
        <div className={styles.optionalBox}><div><strong>Know an area?</strong><span>Optional. Leave blank if you don't.</span></div><div className={styles.areaInputRow}><input aria-label="Area in square metres" type="number" min="20" max="1200" step="1" placeholder="e.g. 180" value={input.areaInputM2 ?? ""} onChange={event => patch({ areaInputM2: event.target.value ? Number(event.target.value) : null })} /><span>m²</span><select aria-label="What the area represents" value={input.areaSource} onChange={event => patch({ areaSource: event.target.value as QuickEstimateInput["areaSource"] })}><option value="unknown">What does this area represent?</option><option value="building-footprint">Building / roof footprint</option><option value="total-floor-area">Total floor area</option><option value="roof-area">Actual sloping roof area</option></select></div>{input.areaInputM2 && input.areaSource === "unknown" && <p className={styles.fieldHint}>Choose what the area represents so RoofHub does not apply the wrong conversion.</p>}</div>
      </>}

      {current === "pitch" && <>
        <div className={styles.heading}><p className={styles.eyebrow}>Roof pitch</p><h1>How steep is the roof?</h1><p>You do not need to measure it. Choose the closest picture or enter degrees if you already know them.</p></div>
        <div className={styles.pitchGrid}>{Object.entries(PITCH_BANDS).map(([value, option]) => <button type="button" key={value} className={`${styles.pitchCard} ${input.pitchBand === value ? styles.selected : ""}`} onClick={() => patch({ pitchBand: value as QuickEstimateInput["pitchBand"] })}><PitchIllustration degrees={value === "unknown" ? 22 : (option.min + option.max) / 2} /><strong>{option.label}</strong><span>{option.description}</span></button>)}</div>
        <div className={styles.optionalBox}><div><strong>Know the pitch?</strong><span>Optional.</span></div><div className={styles.degreeInput}><input aria-label="Pitch in degrees" type="number" min="1" max="50" step="0.5" placeholder="e.g. 25" value={input.exactPitchDegrees ?? ""} onChange={event => patch({ exactPitchDegrees: event.target.value ? Number(event.target.value) : null })} /><span>degrees</span></div></div>
      </>}

      {current === "product" && <>
        <div className={styles.heading}><p className={styles.eyebrow}>Roofing product</p><h1>What roof are you considering?</h1><p>If you are not sure, RoofHub can compare several common options using the same roof.</p></div>
        <div className={styles.choiceGrid}>{productOptions.map(option => {
          const assessment = productPitchAssessment(option.value, input.roofShape, input.pitchBand, input.exactPitchDegrees);
          return <Choice key={option.value} selected={input.desiredRoof === option.value} title={option.label} copy={option.copy} note={assessment.status === "incompatible" ? "May not suit the selected pitch" : undefined} onClick={() => patch({ desiredRoof: option.value })} />;
        })}</div>
      </>}

      {current === "complexity" && <>
        <div className={styles.heading}><p className={styles.eyebrow}>Last question</p><h1>Anything else RoofHub should know?</h1><p>Only configured rules change the automatic number. Other items are flagged for checking instead of getting an invented multiplier.</p></div>
        <div className={styles.storeyRow}><button type="button" className={`${styles.storeyCard} ${input.storeys === 1 ? styles.selected : ""}`} onClick={() => patch({ storeys: 1, complexities: input.complexities.filter(item => item !== "two-storey") })}><strong>One storey</strong><span>Typical single-storey roof access</span></button><button type="button" className={`${styles.storeyCard} ${input.storeys === 2 ? styles.selected : ""}`} onClick={() => patch({ storeys: 2, complexities: [...new Set<RoofComplexity>([...input.complexities, "two-storey"])] })}><strong>Two storeys</strong><span>Uses the two-storey access allowance</span></button><button type="button" className={`${styles.storeyCard} ${input.storeys === null ? styles.selected : ""}`} onClick={() => patch({ storeys: null, complexities: input.complexities.filter(item => item !== "two-storey") })}><strong>Not sure</strong><span>Keeps the access assumption visible</span></button></div>
        <div className={styles.checkGrid}>{complexityOptions.map(option => <label key={option.value} className={`${styles.checkCard} ${input.complexities.includes(option.value) ? styles.selected : ""}`}><input type="checkbox" checked={input.complexities.includes(option.value)} onChange={() => toggleComplexity(option.value)} /><span><strong>{option.label}</strong><small>{option.copy}</small></span></label>)}</div>
      </>}

      {current === "result" && <>
        <div className={styles.heading}><p className={styles.eyebrow}>Your RoofHub estimate</p><h1>Here's what RoofHub can tell you from those answers.</h1><p>The range gets narrower as the inputs become more specific. It is an indicative planning estimate, not a contractor quote.</p></div>
        {reviewMode && <div className={styles.reviewBanner}><strong>Calibration preview is on.</strong> Draft RoofHub pricing is visible for review. Do not treat these figures as an approved public tariff.</div>}
        {pricingState === "loading" && <div className={styles.loadingBox}>Calculating the lower and upper roof scenarios…</div>}
        {pricingState === "error" && <div role="alert" className={styles.errorBox}>The estimate could not be calculated. {pricingError}</div>}
        {range && <>
          <div className={styles.resultSummary}><div><span>Modelled roof area</span><strong><RoofAreaRange low={range.low} high={range.high} /></strong></div><div><span>Estimate detail</span><strong>{estimateDetailLevel(input)[0].toUpperCase() + estimateDetailLevel(input).slice(1)}</strong></div><div><span>Area basis</span><strong>{areaSourceLabel(input.areaSource)}</strong></div><div><span>Roof shape</span><strong>{input.roofShape === "unknown" ? "Unknown, widened range" : ROOF_TEMPLATES[input.roofShape].label}</strong></div></div>
          <div className={styles.priceStack}>{prices.map(result => <ResultCard key={result.product} result={result} reviewMode={reviewMode} />)}</div>
          <div className={styles.primaryActions}><button type="button" className={styles.primaryButton} onClick={() => { setEnquiryOpen(true); trackRoofHubEvent("cta_click", { tool: "quick-estimate", ctaLocation: "quick-result-enquiry", projectType: input.projectType, roofSystem: input.desiredRoof }); }}>Get help with a written quote</button><Link className={styles.secondaryButton} href="/tools/detailed-roof-estimator?from=quick-estimate" onClick={() => trackRoofHubEvent("estimate_refine", { tool: "quick-estimate", projectType: input.projectType, roofSystem: input.desiredRoof })}>Make this estimate more accurate</Link></div>
          <details className={styles.assumptionDetails}><summary>How RoofHub built this range</summary><ul>{range.assumptions.map(item => <li key={item}>{item}</li>)}</ul><strong>Not automatically included</strong><ul>{range.exclusions.map(item => <li key={item}>{item}</li>)}</ul></details>
          {enquiryOpen && <QuickEstimateEnquiry onClose={() => setEnquiryOpen(false)} />}
        </>}
      </>}

      {current !== "result" && <div className={styles.actions}><button type="button" className={styles.textButton} disabled={stepIndex === 0} onClick={() => go(-1)}>← Back</button><span>No measurements required. No sign-up.</span><button type="button" className={styles.primaryButton} onClick={() => go(1)}>Continue <span aria-hidden="true">→</span></button></div>}
      {current === "result" && <div className={styles.resultFooterActions}><button type="button" className={styles.textButton} onClick={() => setCurrent(order[Math.max(0, order.length - 2)])}>← Change answers</button><button type="button" className={styles.textButton} onClick={() => window.print()}>Print result</button></div>}
    </section>
  </div>;
}

function Choice({ selected, title, copy, note, onClick }: { selected: boolean; title: string; copy: string; note?: string; onClick: () => void }) {
  return <button type="button" className={`${styles.choiceCard} ${selected ? styles.selected : ""}`} onClick={onClick}><span className={styles.choiceMark} aria-hidden="true">{selected ? "✓" : ""}</span><strong>{title}</strong><span>{copy}</span>{note && <small>{note}</small>}</button>;
}
