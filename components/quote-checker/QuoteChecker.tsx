"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AskRoofHubButton } from "@/components/assistant/AskRoofHubButton";
import { trackRoofHubEvent } from "@/lib/client/analytics";
import { getRoofProject, setRoofProject } from "@/lib/client/roof-project-store";
import { registerToolContext, setToolContext } from "@/lib/client/tool-context-store";
import type { RoofProject } from "@/lib/roof-project";
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
import { applyQuoteCheckerState, quoteCheckerReference } from "@/lib/quote-checker/project-adapter";
import styles from "./QuoteChecker.module.css";

type Step = "amount" | "product" | "scope" | "result";
const order: Step[] = ["amount", "product", "scope", "result"];
const productLabels: Record<string,string> = {
  corrugate: "Corrugated long-run",
  "five-rib": "Five-rib / trapezoidal",
  "pressed-metal-tile": "Pressed metal tile",
  "tray-standing-seam": "Tray / standing seam",
  membrane: "Membrane roofing",
  undecided: "Not selected"
};

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
  return "Not directly comparable yet";
}
function statusTitle(value: string) {
  if (value === "within-range") return "The quote sits within the RoofHub range";
  if (value === "below-range") return "The quote sits below the RoofHub range";
  if (value === "above-range") return "The quote sits above the RoofHub range";
  return "A price position is not shown yet";
}
function statusCopy(value: string) {
  if (value === "within-range") return "That does not make it the right quote by itself. Check product, scope, contractor capability, timing and the written terms.";
  if (value === "below-range") return "A lower headline price can be legitimate, but first check whether the quote covers the same product, access, removal and roof details.";
  if (value === "above-range") return "A higher headline price can reflect broader scope, harder access, specification, warranty, programme or site conditions. Ask what explains the difference.";
  return "RoofHub will not force a price comparison when the tax basis, product or reference range is not sufficiently aligned.";
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

export default function QuoteChecker() {
  const initialized = useRef(false);
  const [project, setProject] = useState<RoofProject | null>(null);
  const [step, setStep] = useState<Step>("amount");
  const [quotedAmount, setQuotedAmount] = useState<number | null>(null);
  const [gstBasis, setGstBasis] = useState<QuoteGstBasis>("unknown");
  const [productMatch, setProductMatch] = useState<QuoteProductMatch>("unknown");
  const [knownInclusions, setKnownInclusions] = useState<string[]>([]);
  const [knownExclusions, setKnownExclusions] = useState<string[]>([]);
  const reviewMode = process.env.NEXT_PUBLIC_ROOFHUB_QUICK_ESTIMATE_REVIEW === "1";
  const reference = useMemo(() => quoteCheckerReference(project, reviewMode), [project, reviewMode]);
  const result = useMemo(() => compareRoofingQuote({
    quotedAmount, gstBasis, productMatch, projectType: project?.projectType ?? "unknown",
    knownInclusions, knownExclusions, referenceEstimate: reference.estimate
  }), [quotedAmount, gstBasis, productMatch, project, knownInclusions, knownExclusions, reference]);
  const index = order.indexOf(step);
  const progress = step === "result" ? 100 : Math.round(index / (order.length - 1) * 100);
  const scopeItems = useMemo(() => applicableScope(project?.projectType ?? "unknown"), [project?.projectType]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const existing = getRoofProject();
    setProject(existing);
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

  function persist() {
    const inclusions = [...knownInclusions, ...(productMatch === "same" ? ["quote-product-same"] : [])];
    const exclusions = [...knownExclusions, ...(productMatch === "different" ? ["quote-product-different"] : [])];
    const next = applyQuoteCheckerState({
      project: getRoofProject() ?? project,
      quotedAmount,
      gstBasis,
      knownInclusions: inclusions,
      knownExclusions: exclusions,
      comparisonStatus: result.comparisonStatus,
      comparability: result.comparability,
      originatingPath: "/tools/quote-checker"
    });
    setRoofProject(next);
    setProject(next);
  }

  function go(delta: -1 | 1) {
    persist();
    const next = order[Math.max(0, Math.min(order.length - 1, index + delta))];
    setStep(next);
    if (next === "result") trackRoofHubEvent("quote_checker_result", {
      tool: "quote-checker", projectType: project?.projectType ?? "unknown", roofSystem: project?.desiredRoof ?? "unknown", step: result.comparability
    });
  }

  function startOver() {
    if (!window.confirm("Clear the quote-checker answers in this tab? Your roof project and estimate will stay saved.")) return;
    setQuotedAmount(null); setGstBasis("unknown"); setProductMatch("unknown"); setKnownInclusions([]); setKnownExclusions([]); setStep("amount");
  }

  const amountIncl = result.amountInclGst;
  const badgeClass = result.comparability === "good" ? styles.badgeGood : result.comparability === "partial" ? styles.badgePartial : styles.badgeNo;
  return <div className={styles.app}>
    <div className={styles.topline}><div><span>RoofHub Quote Checker</span><strong>Compare scope before price.</strong></div><button className={styles.textButton} type="button" onClick={startOver}>Clear quote answers</button></div>
    <div className={styles.progress} aria-hidden="true"><span style={{width:`${progress}%`}} /></div>
    <section className={styles.panel}>
      {step === "amount" && <>
        <div className={styles.heading}><p className={styles.eyebrow}>Step 1</p><h1>What amount is on the roofing quote?</h1><p>Enter the headline amount exactly as shown and tell RoofHub whether GST is included. RoofHub uses the NZ 15% GST rate only to put comparable totals on the same basis.</p></div>
        <div className={styles.projectCard}><div><span>Saved project</span><strong>{projectLabel(project)}</strong></div><div><span>Roof system</span><strong>{project ? productLabels[project.desiredRoof] ?? project.desiredRoof : "Not selected"}</strong></div><div><span>RoofHub range</span><strong>{detailLabel(project)}</strong></div><div><span>Comparison pricing</span><strong>{reference.available ? reference.reviewOnly ? "Calibration preview" : reference.publicationVersion ? `Available (${reference.publicationVersion} indicative pricing)` : "Available" : "Withheld / not ready"}</strong></div></div>
        {!reference.available && <div className={styles.notice}><strong>You can still check the quote's scope.</strong><p>{reference.reason} RoofHub will not invent or expose a project range to make the checker look complete.</p></div>}
        {reference.reviewOnly && <div className={styles.reviewNotice}><strong>Calibration preview is on.</strong><p>{reference.reason} These figures are for RoofHub review, not an approved public tariff.</p></div>}
        <div className={styles.amountGrid}>
          <div className={styles.fieldBox}><label htmlFor="quote-amount">Quoted amount</label><div className={styles.moneyInput}><span>$</span><input id="quote-amount" inputMode="decimal" type="number" min="1" step="100" placeholder="e.g. 28500" value={quotedAmount ?? ""} onChange={e => setQuotedAmount(e.target.value ? Number(e.target.value) : null)} /></div><p className={styles.fieldHint}>Use the total for the roofing scope you want to compare, not a deposit or progress payment.</p></div>
          <div className={styles.fieldBox}><label>GST basis</label><div className={styles.segmented}>{(["incl","excl","unknown"] as QuoteGstBasis[]).map(value => <button type="button" key={value} className={gstBasis === value ? styles.selected : ""} onClick={() => setGstBasis(value)}>{value === "incl" ? "GST included" : value === "excl" ? "Plus GST" : "Not sure"}</button>)}</div>{gstBasis === "excl" && quotedAmount && <p className={styles.fieldHint}>Comparable incl-GST total: <strong>{formatNzd(quotedAmount * 1.15)}</strong>.</p>}</div>
        </div>
      </>}

      {step === "product" && <>
        <div className={styles.heading}><p className={styles.eyebrow}>Step 2</p><h1>Is the quote for the same roofing system?</h1><p>A five-rib quote should not be treated as directly equivalent to a tray, membrane or pressed-metal-tile allowance. If the specification is vague, choose “not sure”.</p></div>
        <div className={styles.choiceGrid}>
          <button type="button" className={`${styles.choice} ${productMatch === "same" ? styles.selected : ""}`} onClick={() => setProductMatch("same")}><strong>Yes, same system</strong><span>The quote matches the roof product or system stored in this RoofHub project.</span></button>
          <button type="button" className={`${styles.choice} ${productMatch === "different" ? styles.selected : ""}`} onClick={() => setProductMatch("different")}><strong>No, different system</strong><span>Useful context, but RoofHub will not label the headline price as directly comparable.</span></button>
          <button type="button" className={`${styles.choice} ${productMatch === "unknown" ? styles.selected : ""}`} onClick={() => setProductMatch("unknown")}><strong>I'm not sure</strong><span>RoofHub will keep the comparison partial until the quoted specification is clearer.</span></button>
        </div>
      </>}

      {step === "scope" && <>
        <div className={styles.heading}><p className={styles.eyebrow}>Step 3</p><h1>What does the quote actually include?</h1><p>Mark each item as included, excluded or unclear. This is where apparently similar roofing quotes often stop being like-for-like.</p></div>
        <div className={styles.scopeList}>{scopeItems.map((item: QuoteScopeItem) => {
          const state = scopeState(item.id, knownInclusions, knownExclusions) as QuoteScopeState;
          return <div className={styles.scopeRow} key={item.id}><div><strong>{item.label}</strong><span>{referenceScopeCopy(item.id, project?.projectType ?? "unknown")}</span></div><div className={styles.segmented}>{(["included","excluded","unknown"] as QuoteScopeState[]).map(value => <button type="button" key={value} className={state === value ? styles.selected : ""} onClick={() => setScope(item.id, value)}>{value === "included" ? "Included" : value === "excluded" ? "Excluded" : "Not sure"}</button>)}</div></div>;
        })}</div>
        <p className={styles.scopeFoot}>This checker deliberately does not assign made-up dollar values to unknown scope items. If a quote includes work that RoofHub's reference excludes, the checker lowers comparability instead.</p>
      </>}

      {step === "result" && <>
        <div className={styles.heading}><p className={styles.eyebrow}>Quote check</p><h1>Here's how comparable this quote is.</h1><p>The result describes price position and scope alignment. It does not decide whether a roofer is good, fair or suitable for the job.</p></div>
        <div className={styles.resultTop}>
          <div className={styles.resultHero}><span className={`${styles.badge} ${badgeClass}`}>{comparabilityTitle(result.comparability)}</span><h2>{statusTitle(result.comparisonStatus)}</h2><p>{statusCopy(result.comparisonStatus)}</p></div>
          <div className={styles.amountPosition}><span>Quote on incl-GST basis</span><strong>{amountIncl ? formatNzd(amountIncl) : "GST basis needed"}</strong><small>{reference.estimate ? `RoofHub reference ${formatNzd(reference.estimate.low)} to ${formatNzd(reference.estimate.high)} incl GST${reference.reviewOnly ? " (review only)" : reference.publicationVersion ? `, based on RoofHub's ${reference.publicationVersion} indicative pricing model` : ""}.` : reference.reason}</small></div>
        </div>
        <div className={styles.resultGrid}><div><span>Comparison quality</span><strong>{comparabilityTitle(result.comparability)}</strong></div><div><span>Product match</span><strong>{productMatch === "same" ? "Same system" : productMatch === "different" ? "Different system" : "Not confirmed"}</strong></div><div><span>Scope questions unresolved</span><strong>{result.scope.unknown.length}</strong></div></div>
        <div className={styles.explainGrid}>
          <div className={styles.explainCard}><h3>Why RoofHub gave this comparison</h3><ul>{result.reasons.length ? result.reasons.map(reason => <li key={reason}>{reason}</li>) : <li>The GST basis, roofing system and selected scope items line up well enough for a direct project-range comparison.</li>}</ul></div>
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
          <Link className={styles.primary} href="/tools/roof-estimate?from=quote-checker" onClick={() => trackRoofHubEvent("estimate_refine", {tool:"quote-checker",ctaLocation:"quote-result-refine"})}>{reference.available ? "Refine the RoofHub estimate" : "Build a RoofHub estimate"}</Link>
          <AskRoofHubButton className={styles.secondary} label="Ask RoofHub about this quote" prompt={`Help me understand this roofing quote comparison. RoofHub marked it ${comparabilityTitle(result.comparability).toLowerCase()} and the price position is ${result.comparisonStatus.replaceAll("-"," ")}. Explain what I should clarify without making a contractor-quality or value judgement from price alone.`} />
          <Link className={styles.secondary} href="/guides/compare-roofing-quotes">How to compare roofing quotes</Link>
        </div>
        <p className={styles.finePrint}>RoofHub compares only the information supplied. Site inspection, exact quantities, structural condition, compliance requirements, product suitability and contractor-specific commercial terms can change the final scope and price.</p>
      </>}

      {step !== "result" && <div className={styles.actions}><button type="button" className={styles.secondary} onClick={() => go(-1)} disabled={index === 0}>Back</button><span>Step {index + 1} of {order.length - 1}</span><button type="button" className={styles.primary} onClick={() => go(1)}>{index === order.length - 2 ? "Check this quote" : "Continue"}</button></div>}
      {step === "result" && <div className={styles.actions}><button type="button" className={styles.secondary} onClick={() => setStep("scope")}>Edit scope</button><span>Saved to this roof project</span><button type="button" className={styles.primary} onClick={() => window.print()}>Print result</button></div>}
    </section>
  </div>;
}
