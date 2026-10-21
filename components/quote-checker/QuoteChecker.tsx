"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AskRoofHubButton } from "@/components/assistant/AskRoofHubButton";
import { trackRoofHubEvent } from "@/lib/client/analytics";
import { getRoofProject, setRoofProject } from "@/lib/client/roof-project-store";
import { registerToolContext, setToolContext } from "@/lib/client/tool-context-store";
import type { RoofComplexity, RoofProject, RoofShape } from "@/lib/roof-project";
import {
  applicableScope,
  compareRoofingQuote,
  formatNzd,
  scopeState,
  type QuoteGstBasis,
  type QuoteProductMatch,
  type QuoteScopeItem,
  type QuoteScopeState
} from "@/lib/quote-checker/index.mjs";
import { buildQuoteCheckerBaseline, quoteBaselineMissing } from "@/lib/quote-checker/baseline";
import { applyQuoteCheckerState, quoteCheckerReference } from "@/lib/quote-checker/project-adapter";
import {
  PITCH_BANDS,
  ROOF_TEMPLATES,
  SIZE_BANDS,
  type QuickDesiredRoof,
  type QuickEstimateInput
} from "@/lib/quick-estimate/index.mjs";
import { defaultQuickEstimateInput, quickInputFromRoofProject } from "@/lib/quick-estimate/project-adapter";
import styles from "./QuoteChecker.module.css";

type Step = "amount" | "product" | "baseline" | "scope" | "result";
type BaselineState = "idle" | "loading" | "error";
const order: Step[] = ["amount", "product", "baseline", "scope", "result"];

const productLabels: Record<string,string> = {
  corrugate: "Corrugated long-run",
  "five-rib": "Five-rib / trapezoidal",
  "pressed-metal-tile": "Pressed metal tile",
  "tray-standing-seam": "Tray / standing seam",
  membrane: "Membrane roofing",
  undecided: "Not selected"
};
const baselineProducts: Array<{value: QuickDesiredRoof; label: string}> = [
  { value: "corrugate", label: "Corrugated long-run" },
  { value: "five-rib", label: "Five-rib / trapezoidal" },
  { value: "tray-standing-seam", label: "Tray / standing seam" },
  { value: "pressed-metal-tile", label: "Pressed metal tile" },
  { value: "membrane", label: "Membrane" },
  { value: "undecided", label: "Not sure" }
];
const existingRoofOptions: Array<{value: QuickEstimateInput["existingRoof"]; label: string}> = [
  { value: "long-run-metal", label: "Long-run metal" },
  { value: "concrete-tile", label: "Concrete tile" },
  { value: "pressed-metal-tile", label: "Pressed metal tile" },
  { value: "decramastic", label: "Older coated / Decramastic" },
  { value: "membrane", label: "Membrane" },
  { value: "other", label: "Other" },
  { value: "unknown", label: "Not sure" }
];
const shapeOptions: RoofShape[] = ["skillion", "gable", "hip", "gable-valley", "hip-valley", "multi-section", "dormer-complex", "flat-low-slope", "unknown"];

function projectLabel(project: RoofProject | null) {
  if (!project) return "No saved RoofHub project";
  return project.projectType === "new" ? "New roof" : project.projectType === "reroof" ? "Re-roof" : "Project type not confirmed";
}
function detailLabel(project: RoofProject | null) {
  if (!project?.estimate) return "No price range saved";
  return `${project.estimate.detailLevel[0].toUpperCase()}${project.estimate.detailLevel.slice(1)} estimate`;
}
function comparabilityTitle(value: string) {
  if (value === "good") return "Good comparison";
  if (value === "partial") return "Partial comparison";
  return "Price comparison incomplete";
}
function positionTitle(value: string) {
  if (value === "within-range") return "Within RoofHub range";
  if (value === "below-range") return "Below RoofHub range";
  if (value === "above-range") return "Above RoofHub range";
  return "Position not available";
}
function resultTitle(result: ReturnType<typeof compareRoofingQuote>, referenceAvailable: boolean) {
  if (!referenceAvailable) return "Price comparison needs a RoofHub baseline";
  if (result.productMatch === "different") return "The saved baseline is for a different roof system";
  if (result.gstAffectsPosition) return "GST changes where this quote sits";
  if (result.comparisonStatus === "within-range") return "The quote sits within the RoofHub range";
  if (result.comparisonStatus === "below-range") return "The quote sits below the RoofHub range";
  if (result.comparisonStatus === "above-range") return "The quote sits above the RoofHub range";
  if (result.scope.differences.length) return `${result.scope.differences.length} scope difference${result.scope.differences.length === 1 ? "" : "s"} need context`;
  return "Here's what RoofHub could compare";
}
function resultCopy(result: ReturnType<typeof compareRoofingQuote>, referenceAvailable: boolean) {
  if (!referenceAvailable) return "Your quote details are saved. Build a Quick Estimate, use the Detailed Estimator, or create a quick baseline inside this checker so RoofHub has a like-for-like roof range to compare against.";
  if (result.productMatch === "different") return "Price comparison is withheld because the quote and saved RoofHub estimate are for different roofing systems. You can build a matching baseline for the quoted system.";
  if (result.gstAffectsPosition) return "RoofHub cannot tell whether GST is already included, so both valid incl-GST interpretations are shown below rather than throwing away the comparison.";
  if (result.comparisonStatus === "within-range") return "That does not make it the right quote by itself. Check product, scope, contractor capability, timing and the written terms.";
  if (result.comparisonStatus === "below-range") return "A lower headline price can be legitimate, but first check whether the quote covers the same product, access, removal and roof details.";
  if (result.comparisonStatus === "above-range") return "A higher headline price can reflect broader scope, harder access, specification, warranty, programme or site conditions. Ask what explains the difference.";
  return "RoofHub can still show scope alignment and the information that needs clarifying without making a contractor-quality judgement.";
}
function referenceScopeCopy(id: string, projectType: RoofProject["projectType"]) {
  if (id === "removal-disposal") return projectType === "reroof" ? "RoofHub reference: included where the existing roof has a configured removal allowance." : "Not part of a new-roof comparison.";
  if (id === "access-scaffold") return "RoofHub reference: access/scaffold allowance included.";
  if (id === "underlay") return "RoofHub reference: underlay included.";
  if (id === "flashings") return "RoofHub reference: configured/measured flashings included; specialist details can remain excluded.";
  if (id === "gutters-downpipes") return "RoofHub reference: gutters/downpipes excluded unless separately added.";
  if (id === "structural-repairs") return "RoofHub reference: structural/timber repairs excluded.";
  if (id === "asbestos") return "RoofHub reference: testing and specialist asbestos removal excluded.";
  return "RoofHub reference: consent/design/engineering fees excluded.";
}
function setDifficultAccess(input: QuickEstimateInput, checked: boolean): QuickEstimateInput {
  const complexities = new Set<RoofComplexity>(input.complexities);
  if (checked) complexities.add("difficult-access"); else complexities.delete("difficult-access");
  return { ...input, complexities: [...complexities] };
}

export default function QuoteChecker() {
  const initialized = useRef(false);
  const [project, setProject] = useState<RoofProject | null>(null);
  const [step, setStep] = useState<Step>("amount");
  const [quotedAmount, setQuotedAmount] = useState<number | null>(null);
  const [gstBasis, setGstBasis] = useState<QuoteGstBasis>("unknown");
  const [productMatch, setProductMatch] = useState<QuoteProductMatch>("unknown");
  const [knownInclusions, setKnownInclusions] = useState<string[]>([]);
  const [knownExclusions, setKnownExclusions] = useState<string[]>([]);
  const [baselineInput, setBaselineInput] = useState<QuickEstimateInput>(() => defaultQuickEstimateInput());
  const [baselineState, setBaselineState] = useState<BaselineState>("idle");
  const [baselineError, setBaselineError] = useState("");
  const reviewMode = process.env.NEXT_PUBLIC_ROOFHUB_QUICK_ESTIMATE_REVIEW === "1";
  const reference = useMemo(() => quoteCheckerReference(project, reviewMode), [project, reviewMode]);
  const effectiveProjectType = project?.projectType && project.projectType !== "unknown" ? project.projectType : baselineInput.projectType;
  const baselineReadyForQuote = reference.available && productMatch !== "different";
  const result = useMemo(() => compareRoofingQuote({
    quotedAmount, gstBasis, productMatch, projectType: effectiveProjectType,
    knownInclusions, knownExclusions, referenceEstimate: reference.estimate
  }), [quotedAmount, gstBasis, productMatch, effectiveProjectType, knownInclusions, knownExclusions, reference]);
  const index = order.indexOf(step);
  const progress = step === "result" ? 100 : Math.round(index / (order.length - 1) * 100);
  const scopeProjectType = effectiveProjectType;
  const scopeItems = useMemo(() => applicableScope(scopeProjectType), [scopeProjectType]);
  const baselineMissing = useMemo(() => quoteBaselineMissing(baselineInput), [baselineInput]);
  const savedSystem = project?.desiredRoof && project.desiredRoof !== "undecided" ? project.desiredRoof : null;

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const existing = getRoofProject();
    setProject(existing);
    setBaselineInput(quickInputFromRoofProject(existing));
    if (existing?.quoteCheck.quotedAmount) setQuotedAmount(existing.quoteCheck.quotedAmount);
    setGstBasis(existing?.quoteCheck.gstBasis ?? "unknown");
    const savedInclusions = existing?.quoteCheck.knownInclusions ?? [];
    const savedExclusions = existing?.quoteCheck.knownExclusions ?? [];
    setKnownInclusions(savedInclusions.filter(item => !item.startsWith("quote-product-")));
    setKnownExclusions(savedExclusions.filter(item => !item.startsWith("quote-product-")));
    setProductMatch(savedInclusions.includes("quote-product-same") ? "same" : savedExclusions.includes("quote-product-different") ? "different" : "unknown");
    const unregister = registerToolContext("quote-checker", "amount", "Check a roofing quote");
    trackRoofHubEvent("quote_checker_start", { tool: "quote-checker", projectType: existing?.projectType ?? "unknown", roofSystem: existing?.desiredRoof ?? "unknown" });
    return unregister;
  }, []);

  useEffect(() => { setToolContext({ activeTool: "quote-checker", step, topic: "Check a roofing quote" }); }, [step]);

  function setScope(id: string, state: QuoteScopeState) {
    setKnownInclusions(current => state === "included" ? [...new Set([...current, id])] : current.filter(item => item !== id));
    setKnownExclusions(current => state === "excluded" ? [...new Set([...current, id])] : current.filter(item => item !== id));
  }

  function persist(currentStep = step, forcedMatch: QuoteProductMatch = productMatch): RoofProject {
    const inclusions = [...knownInclusions, ...(forcedMatch === "same" ? ["quote-product-same"] : [])];
    const exclusions = [...knownExclusions, ...(forcedMatch === "different" ? ["quote-product-different"] : [])];
    const next = applyQuoteCheckerState({
      project: getRoofProject() ?? project,
      quotedAmount,
      gstBasis,
      knownInclusions: inclusions,
      knownExclusions: exclusions,
      comparisonStatus: result.comparisonStatus,
      comparability: result.comparability,
      originatingPath: "/tools/quote-checker",
      currentStep
    });
    setRoofProject(next);
    setProject(next);
    return next;
  }

  function go(delta: -1 | 1) {
    persist(step);
    const next = order[Math.max(0, Math.min(order.length - 1, index + delta))];
    setStep(next);
    if (next === "result") trackRoofHubEvent("quote_checker_result", {
      tool: "quote-checker", projectType: effectiveProjectType, roofSystem: project?.desiredRoof ?? baselineInput.desiredRoof, step: result.comparability
    });
  }

  async function createBaseline() {
    setBaselineState("loading");
    setBaselineError("");
    try {
      const saved = persist("baseline");
      const built = await buildQuoteCheckerBaseline(baselineInput, saved, reviewMode);
      const finalProject = applyQuoteCheckerState({
        project: built.project,
        quotedAmount,
        gstBasis,
        knownInclusions: [...knownInclusions, "quote-product-same"],
        knownExclusions,
        comparisonStatus: "unknown",
        comparability: "unknown",
        originatingPath: "/tools/quote-checker",
        currentStep: "scope"
      });
      setRoofProject(finalProject);
      setProject(finalProject);
      setProductMatch("same");
      setBaselineState("idle");
      trackRoofHubEvent("estimate_result", { tool: "quote-checker", projectType: baselineInput.projectType, roofSystem: baselineInput.desiredRoof, detailLevel: finalProject.estimate?.detailLevel ?? "basic" });
      setStep("scope");
    } catch (error) {
      setBaselineState("error");
      setBaselineError(error instanceof Error ? error.message : "RoofHub could not build this baseline.");
    }
  }

  function startOver() {
    if (!window.confirm("Clear the quote-checker answers in this tab? Your roof project and estimate will stay saved.")) return;
    setQuotedAmount(null); setGstBasis("unknown"); setProductMatch("unknown"); setKnownInclusions([]); setKnownExclusions([]); setStep("amount"); setBaselineState("idle"); setBaselineError("");
  }

  const amountIncl = result.amountInclGst;
  const badgeClass = result.comparability === "good" ? styles.badgeGood : result.comparability === "partial" ? styles.badgePartial : styles.badgeNo;
  const baselinePriceLabel = reference.available && reference.estimate ? `${formatNzd(reference.estimate.low)} to ${formatNzd(reference.estimate.high)} incl GST` : null;

  return <div className={styles.app}>
    <div className={styles.topline}><div><span>RoofHub Quote Checker</span><strong>Compare the same roof, price and scope.</strong></div><button className={styles.textButton} type="button" onClick={startOver}>Clear quote answers</button></div>
    <div className={styles.progress} aria-hidden="true"><span style={{width:`${progress}%`}} /></div>
    <section className={styles.panel}>
      {step === "amount" && <>
        <div className={styles.heading}><p className={styles.eyebrow}>Step 1</p><h1>What amount is on the roofing quote?</h1><p>Enter the headline amount exactly as shown. If you are not sure whether GST is included, that's okay. RoofHub can show both valid interpretations instead of blocking the result.</p></div>
        <div className={styles.projectCard}><div><span>Saved project</span><strong>{projectLabel(project)}</strong></div><div><span>Roof system</span><strong>{project ? productLabels[project.desiredRoof] ?? project.desiredRoof : "Not selected"}</strong></div><div><span>RoofHub baseline</span><strong>{detailLabel(project)}</strong></div><div><span>Price comparison</span><strong>{reference.available ? reference.publicationVersion ? `Ready (${reference.publicationVersion} indicative pricing)` : "Ready" : project?.estimate ? "Needs pricing alignment" : "Needs a baseline"}</strong></div></div>
        {!reference.available && <div className={styles.notice}><strong>To compare the price, RoofHub needs an estimate of this same roof.</strong><p>Your quote answers stay saved. Before the final result, you can answer a few roof questions here, use the normal Quick Estimate, or use the Detailed Estimator if you already have measurements.</p></div>}
        {reference.reviewOnly && <div className={styles.reviewNotice}><strong>Calibration preview is on.</strong><p>{reference.reason} These figures are for RoofHub review, not an approved public tariff.</p></div>}
        <div className={styles.amountGrid}>
          <div className={styles.fieldBox}><label htmlFor="quote-amount">Quoted amount</label><div className={styles.moneyInput}><span>$</span><input id="quote-amount" inputMode="decimal" type="number" min="1" step="100" placeholder="e.g. 28500" value={quotedAmount ?? ""} onChange={e => setQuotedAmount(e.target.value ? Number(e.target.value) : null)} /></div><p className={styles.fieldHint}>Use the total for the roofing scope you want to compare, not a deposit or progress payment.</p></div>
          <div className={styles.fieldBox}><label>GST basis</label><div className={styles.segmented}>{(["incl","excl","unknown"] as QuoteGstBasis[]).map(value => <button type="button" key={value} className={gstBasis === value ? styles.selected : ""} onClick={() => setGstBasis(value)}>{value === "incl" ? "GST included" : value === "excl" ? "Plus GST" : "Not sure"}</button>)}</div>{gstBasis === "excl" && quotedAmount && <p className={styles.fieldHint}>Comparable incl-GST total: <strong>{formatNzd(quotedAmount * 1.15)}</strong>.</p>}{gstBasis === "unknown" && quotedAmount && <p className={styles.fieldHint}>RoofHub will test both <strong>{formatNzd(quotedAmount)}</strong> incl GST and <strong>{formatNzd(quotedAmount * 1.15)}</strong> if GST is extra.</p>}</div>
        </div>
      </>}

      {step === "product" && <>
        {savedSystem ? <>
          <div className={styles.heading}><p className={styles.eyebrow}>Step 2</p><h1>Is the quote for the same roofing system?</h1><p>Your saved RoofHub project uses <strong>{productLabels[savedSystem]}</strong>. A different roof system needs its own baseline before the headline prices are treated as like-for-like.</p></div>
          <div className={styles.choiceGrid}>
            <button type="button" className={`${styles.choice} ${productMatch === "same" ? styles.selected : ""}`} onClick={() => { setProductMatch("same"); setBaselineInput(current => ({...current, desiredRoof: savedSystem as QuickDesiredRoof})); }}><strong>Yes, same system</strong><span>The quote matches the roofing system in the saved RoofHub estimate.</span></button>
            <button type="button" className={`${styles.choice} ${productMatch === "different" ? styles.selected : ""}`} onClick={() => setProductMatch("different")}><strong>No, different system</strong><span>Build a fresh baseline for the quoted system before interpreting the price.</span></button>
            <button type="button" className={`${styles.choice} ${productMatch === "unknown" ? styles.selected : ""}`} onClick={() => setProductMatch("unknown")}><strong>I'm not sure</strong><span>RoofHub will keep the comparison partial until the specification is clearer.</span></button>
          </div>
        </> : <>
          <div className={styles.heading}><p className={styles.eyebrow}>Step 2</p><h1>What roofing system is the quote for?</h1><p>There is no saved RoofHub roofing system yet. Choose the closest system from the quote; the next step will use it to build the comparison baseline.</p></div>
          <div className={styles.productGrid}>{baselineProducts.map(option => <button type="button" key={option.value} className={`${styles.compactChoice} ${baselineInput.desiredRoof === option.value ? styles.selected : ""}`} onClick={() => { setBaselineInput(current => ({...current, desiredRoof: option.value})); setProductMatch(option.value === "undecided" ? "unknown" : "same"); }}><strong>{option.label}</strong></button>)}</div>
        </>}
      </>}

      {step === "baseline" && <>
        <div className={styles.heading}><p className={styles.eyebrow}>Step 3</p><h1>{baselineReadyForQuote ? "RoofHub already has a baseline for this roof." : productMatch === "different" && reference.available ? "Build a matching baseline for the quoted roof system." : "Build the roof baseline before comparing the price."}</h1><p>{baselineReadyForQuote ? "This can come from either Quick Estimate or the Detailed Estimator. You can use the saved range now or replace/refine it with better measurements." : productMatch === "different" && reference.available ? "The saved estimate is for a different roofing system. Choose the system on this quote below and RoofHub will build a matching baseline using the same deterministic estimator." : "RoofHub needs enough information to estimate the same roof independently. The fast option below uses the exact same deterministic Quick Estimate engine; this is not a second pricing model."}</p></div>
        {baselineReadyForQuote && reference.estimate ? <div className={styles.baselineReady}><div><span>Saved RoofHub range</span><strong>{baselinePriceLabel}</strong><small>{reference.estimate.detailLevel ? `${reference.estimate.detailLevel} estimate` : "Saved project estimate"}{reference.publicationVersion && !reference.reviewOnly ? ` (${reference.publicationVersion} indicative pricing)` : ""}{reference.reviewOnly ? " · review pricing" : ""}</small></div><button type="button" className={styles.primary} onClick={() => go(1)}>Use this baseline</button></div> : <>
          <div className={styles.baselineIntro}><strong>Fastest option: answer the roof basics here.</strong><p>Unknown shape, pitch or storeys are allowed and widen the range. RoofHub does need the job type, quoted roof system, and at least an approximate size.</p></div>
          <div className={styles.baselineForm}>
            <div className={styles.baselineField}><label>Job type</label><div className={styles.segmented}>{(["new","reroof"] as const).map(value => <button type="button" key={value} className={baselineInput.projectType === value ? styles.selected : ""} onClick={() => setBaselineInput(current => ({...current, projectType:value}))}>{value === "new" ? "New roof" : "Re-roof"}</button>)}</div></div>
            <div className={styles.baselineField}><label>Roofing system on the quote</label><select value={baselineInput.desiredRoof} onChange={event => { const value = event.target.value as QuickDesiredRoof; setBaselineInput(current => ({...current, desiredRoof:value})); setProductMatch(value === "undecided" ? "unknown" : "same"); }}>{baselineProducts.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{baselineInput.desiredRoof === "membrane" && <small>Membrane geometry is supported, but public membrane pricing is not configured yet.</small>}</div>
            {baselineInput.projectType === "reroof" && <div className={styles.baselineField}><label>Existing roof</label><select value={baselineInput.existingRoof} onChange={event => setBaselineInput(current => ({...current, existingRoof:event.target.value as QuickEstimateInput["existingRoof"]}))}>{existingRoofOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><small>Not sure is okay. Removal may stay partially unresolved.</small></div>}
            <div className={styles.baselineField}><label>Approximate roof size</label><select value={baselineInput.sizeBand} onChange={event => setBaselineInput(current => ({...current, sizeBand:event.target.value as QuickEstimateInput["sizeBand"]}))}><option value="unknown">Choose a size</option>{Object.entries(SIZE_BANDS).filter(([value]) => value !== "unknown").map(([value, option]) => <option key={value} value={value}>{option.label}: {option.hint}</option>)}</select><small>Or enter an area below if you know one.</small></div>
            <div className={styles.baselineField}><label>Known area (optional)</label><div className={styles.areaPair}><input type="number" min="20" max="1200" step="1" placeholder="e.g. 180" value={baselineInput.areaInputM2 ?? ""} onChange={event => setBaselineInput(current => ({...current, areaInputM2:event.target.value ? Number(event.target.value) : null}))} /><select value={baselineInput.areaSource} onChange={event => setBaselineInput(current => ({...current, areaSource:event.target.value as QuickEstimateInput["areaSource"]}))}><option value="unknown">What does the area mean?</option><option value="building-footprint">Building / roof footprint</option><option value="total-floor-area">Total floor area</option><option value="roof-area">Actual sloping roof area</option></select></div></div>
            <div className={styles.baselineField}><label>Roof shape</label><select value={baselineInput.roofShape} onChange={event => setBaselineInput(current => ({...current, roofShape:event.target.value as RoofShape}))}>{shapeOptions.map(value => <option key={value} value={value}>{value === "unknown" ? "Not sure: use wider range" : ROOF_TEMPLATES[value].label}</option>)}</select></div>
            {baselineInput.roofShape !== "flat-low-slope" && <div className={styles.baselineField}><label>Pitch</label><select value={baselineInput.pitchBand} onChange={event => setBaselineInput(current => ({...current, pitchBand:event.target.value as QuickEstimateInput["pitchBand"]}))}>{Object.entries(PITCH_BANDS).map(([value, option]) => <option key={value} value={value}>{option.label}: {option.description}</option>)}</select></div>}
            <div className={styles.baselineField}><label>Storeys</label><div className={styles.segmented}>{([1,2,null] as const).map(value => <button type="button" key={value ?? "unknown"} className={baselineInput.storeys === value ? styles.selected : ""} onClick={() => setBaselineInput(current => ({...current, storeys:value}))}>{value === 1 ? "One" : value === 2 ? "Two" : "Not sure"}</button>)}</div></div>
            <label className={styles.baselineCheck}><input type="checkbox" checked={baselineInput.complexities.includes("difficult-access")} onChange={event => setBaselineInput(current => setDifficultAccess(current, event.target.checked))} /><span><strong>Difficult access / steep site</strong><small>Use the configured difficult-access allowance.</small></span></label>
          </div>
          {baselineMissing.length > 0 && <div className={styles.baselineMissing}><strong>Before RoofHub can create the baseline:</strong><ul>{baselineMissing.map(item => <li key={item}>{item}</li>)}</ul></div>}
          {baselineState === "error" && <div role="alert" className={styles.errorBox}><strong>Baseline not created.</strong><p>{baselineError}</p></div>}
          <div className={styles.baselineActions}><button type="button" className={styles.primary} disabled={baselineState === "loading" || baselineMissing.length > 0} onClick={() => void createBaseline()}>{baselineState === "loading" ? "Building baseline…" : "Create baseline & continue"}</button><button type="button" className={styles.textButton} onClick={() => { persist("scope"); setStep("scope"); }}>Continue with scope only</button></div>
        </>}
        <div className={styles.estimatorChoices}><div><strong>Prefer the full Quick Estimate?</strong><p>Use the normal step-by-step estimator. Your quote answers stay saved in this tab.</p><Link className={styles.secondary} href="/tools/roof-estimate?from=quote-checker">Open Quick Estimate</Link></div><div><strong>Already have measurements?</strong><p>Use the Detailed Estimator for a measured baseline, then return to Quote Checker.</p><Link className={styles.secondary} href="/tools/detailed-roof-estimator?from=quote-checker">Open Detailed Estimator</Link></div></div>
      </>}

      {step === "scope" && <>
        <div className={styles.heading}><p className={styles.eyebrow}>Step 4</p><h1>What does the quote actually include?</h1><p>Mark each item as included, excluded or unclear. RoofHub keeps scope differences separate from the headline price instead of pretending every quote contains the same work.</p></div>
        <div className={styles.scopeList}>{scopeItems.map((item: QuoteScopeItem) => {
          const state = scopeState(item.id, knownInclusions, knownExclusions) as QuoteScopeState;
          return <div className={styles.scopeRow} key={item.id}><div><strong>{item.label}</strong><span>{referenceScopeCopy(item.id, scopeProjectType)}</span></div><div className={styles.segmented}>{(["included","excluded","unknown"] as QuoteScopeState[]).map(value => <button type="button" key={value} className={state === value ? styles.selected : ""} onClick={() => setScope(item.id, value)}>{value === "included" ? "Included" : value === "excluded" ? "Excluded" : "Not sure"}</button>)}</div></div>;
        })}</div>
        <p className={styles.scopeFoot}>This checker deliberately does not assign made-up dollar values to unknown scope items. It shows the differences so you know what needs clarification before treating two totals as like-for-like.</p>
      </>}

      {step === "result" && <>
        <div className={styles.heading}><p className={styles.eyebrow}>Quote check</p><h1>Here's what RoofHub found.</h1><p>Price position, GST uncertainty and scope alignment are shown separately. The result does not decide whether a roofer is good, fair or suitable for the job.</p></div>
        <div className={styles.resultTop}>
          <div className={styles.resultHero}><span className={`${styles.badge} ${badgeClass}`}>{comparabilityTitle(result.comparability)}</span><h2>{resultTitle(result, reference.available)}</h2><p>{resultCopy(result, reference.available)}</p></div>
          <div className={styles.amountPosition}><span>{gstBasis === "unknown" ? "Quote GST scenarios" : "Quote on incl-GST basis"}</span>{gstBasis === "unknown" ? <div className={styles.gstScenarioStack}>{result.gstScenarios.map(scenario => <div key={scenario.id}><small>{scenario.label}</small><strong>{formatNzd(scenario.amountInclGst)}</strong><em>{reference.available ? positionTitle(scenario.position) : "Baseline needed"}</em></div>)}</div> : <><strong>{amountIncl ? formatNzd(amountIncl) : "Amount needed"}</strong><small>{reference.estimate ? `RoofHub reference ${formatNzd(reference.estimate.low)} to ${formatNzd(reference.estimate.high)} incl GST${reference.reviewOnly ? " (review only)" : reference.publicationVersion ? `, based on RoofHub's ${reference.publicationVersion} indicative pricing model` : ""}.` : reference.reason}</small></>}</div>
        </div>
        {gstBasis === "unknown" && reference.estimate && <p className={styles.scenarioNote}>RoofHub reference: <strong>{formatNzd(reference.estimate.low)} to {formatNzd(reference.estimate.high)} incl GST</strong>${reference.reviewOnly ? " (review only)" : reference.publicationVersion ? `, based on RoofHub's ${reference.publicationVersion} indicative pricing model` : ""}. Confirming the quote's GST basis will turn the two scenarios into one.</p>}
        <div className={styles.resultGrid}><div><span>Comparison quality</span><strong>{comparabilityTitle(result.comparability)}</strong></div><div><span>Product match</span><strong>{productMatch === "same" ? "Same system" : productMatch === "different" ? "Different system" : "Not confirmed"}</strong></div><div><span>Scope differences</span><strong>{result.scope.differences.length}</strong></div><div><span>Scope questions unresolved</span><strong>{result.scope.unknown.length}</strong></div></div>
        <div className={styles.explainGrid}>
          <div className={styles.explainCard}><h3>Why RoofHub gave this result</h3><ul>{result.reasons.length ? result.reasons.map(reason => <li key={reason}>{reason}</li>) : <li>The GST basis, roofing system and selected scope items line up well enough for a direct project-range comparison.</li>}</ul></div>
          <div className={styles.explainCard}><h3>What to check before choosing a quote</h3><ul><li>Named product/profile, coating, thickness and manufacturer requirements.</li><li>Removal, access, underlay, flashings and disposal on the same scope.</li><li>What triggers a variation and how extra work is approved.</li><li>Contractor experience, references, programme, warranties and completion documents.</li></ul></div>
        </div>
        <div className={styles.scopeTable}>{scopeItems.map((item: QuoteScopeItem) => {
          const state = scopeState(item.id, knownInclusions, knownExclusions) as QuoteScopeState;
          const expected = result.scope.expected[item.id];
          const className = state === "unknown" ? styles.unknown : state === expected ? styles.match : styles.difference;
          return <div key={item.id}><strong>{item.label}</strong><span className={className}>Quote: {state}</span><span>RoofHub: {expected}</span></div>;
        })}</div>
        <div className={styles.legalNote}><strong>Quote Checker is decision support, not a legal or quality ruling.</strong><p>NZ consumer guidance recommends comparing more than price and checking the work, costs and scope in writing. For residential building work of $30,000 or more including GST, separate statutory contract/disclosure requirements can apply.</p></div>
        <div className={styles.resultActions}>
          {!reference.available ? <button type="button" className={styles.primary} onClick={() => setStep("baseline")}>Build the missing RoofHub baseline</button> : <Link className={styles.primary} href="/tools/roof-estimate?from=quote-checker" onClick={() => trackRoofHubEvent("estimate_refine", {tool:"quote-checker",ctaLocation:"quote-result-refine"})}>Refine with Quick Estimate</Link>}
          <Link className={styles.secondary} href="/tools/detailed-roof-estimator?from=quote-checker">Use detailed measurements</Link>
          <AskRoofHubButton className={styles.secondary} label="Ask RoofHub about this quote" prompt={`Help me understand this roofing quote comparison. RoofHub marked it ${comparabilityTitle(result.comparability).toLowerCase()} and the price position is ${result.comparisonStatus.replaceAll("-"," ")}. There are ${result.scope.differences.length} scope differences and ${result.scope.unknown.length} unresolved scope questions. Explain what I should clarify without making a contractor-quality or value judgement from price alone.`} />
          <Link className={styles.secondary} href="/guides/compare-roofing-quotes">How to compare roofing quotes</Link>
        </div>
        <p className={styles.finePrint}>RoofHub compares only the information supplied. Site inspection, exact quantities, structural condition, compliance requirements, product suitability and contractor-specific commercial terms can change the final scope and price.</p>
      </>}

      {step !== "result" && step !== "baseline" && <div className={styles.actions}><button type="button" className={styles.secondary} onClick={() => go(-1)} disabled={index === 0}>Back</button><span>Step {index + 1} of {order.length - 1}</span><button type="button" className={styles.primary} disabled={step === "amount" && (!quotedAmount || quotedAmount <= 0)} onClick={() => go(1)}>{step === "scope" ? "Check this quote" : "Continue"}</button></div>}
      {step === "baseline" && <div className={styles.actions}><button type="button" className={styles.secondary} onClick={() => go(-1)}>Back</button><span>Step {index + 1} of {order.length - 1}</span>{baselineReadyForQuote ? <button type="button" className={styles.primary} onClick={() => go(1)}>Continue</button> : <span />}</div>}
      {step === "result" && <div className={styles.actions}><button type="button" className={styles.secondary} onClick={() => setStep("scope")}>Edit scope</button><span>Saved to this roof project</span><button type="button" className={styles.primary} onClick={() => window.print()}>Print result</button></div>}
    </section>
  </div>;
}
