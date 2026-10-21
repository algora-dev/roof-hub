import type { ResearchArticle } from "@/data/research/types";

export type ArticleAction = {
  estimateHref: string;
  estimateLabel: string;
  assistantPrompt: string;
  assistantLabel: string;
  eyebrow: string;
  title: string;
  copy: string;
};

function query(values: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value) params.set(key, value);
  const result = params.toString();
  return result ? `?${result}` : "";
}

export function articleAction(article: ResearchArticle): ArticleAction {
  let project: "new" | "reroof" | undefined;
  let product: string | undefined;
  let existing: string | undefined;
  let title = "Put this into a real roof estimate.";
  let copy = "Start with what you know. Measurements are optional, and you can refine the same project later.";
  let estimateLabel = "Estimate a roof";

  if (["reroof-cost", "timeline", "tile-to-metal", "decramastic", "reroof-consent", "repair-or-replace", "roof-underlay", "reroof-process", "roof-insulation-reroof", "roof-insurance"].includes(article.id)) project = "reroof";
  if (article.id === "new-roof-cost") project = "new";
  if (article.id === "tile-to-metal") existing = "concrete-tile";
  if (article.id === "decramastic") existing = "decramastic";
  if (["corrugated"].includes(article.id)) product = "corrugate";
  if (["five-rib"].includes(article.id)) product = "five-rib";
  if (article.id === "pressed-tile") product = "pressed-metal-tile";
  if (article.id === "tray") product = "tray-standing-seam";
  if (article.id === "membrane") product = "membrane";
  if (article.id === "corrugate-vs-five") {
    title = "Compare the options on a roof like yours.";
    copy = "Start a roof estimate, then compare common metal roofing choices using the same project information.";
    estimateLabel = "Compare roof options";
  }
  if (article.id === "roof-area" || article.id === "roof-pitch") {
    title = "Use what you know, even if it is approximate.";
    copy = "A rough size or pitch is enough to start. If you have real measurements, carry them into the detailed estimator.";
  }
  if (["roofing-costs", "cost-200", "new-roof-cost"].includes(article.id)) {
    title = "Turn market pricing into a project range.";
    copy = "Published market evidence is useful context. The estimator applies RoofHub's calculation model to a roof you describe.";
  }
  if (article.id === "compare-quotes") {
    title = "Check the scope before judging the price.";
    copy = "Put GST, product and major inclusions on the same basis first. RoofHub will tell you when the comparison is incomplete rather than forcing a verdict.";
    estimateLabel = "Check a roofing quote";
  }
  if (article.id === "membrane") {
    title = "Capture the roof without inventing membrane pricing.";
    copy = "Save the membrane system choice and roof geometry now. RoofHub will keep pricing unconfigured until an approved membrane rate path exists.";
    estimateLabel = "Start a membrane project";
  }

  let estimateHref = article.id === "compare-quotes"
    ? "/tools/quote-checker"
    : `/tools/roof-estimate${query({ project, product, existing, from: article.path })}`;
  if (article.id === "roof-flashings") {
    title = "Turn roof lines into measured quantities.";
    copy = "If you already have plans or measurements, keep ridges, hips, valleys, barges and other components separate from roof area.";
    estimateLabel = "Use measurements";
    estimateHref = "/tools/detailed-roof-estimator";
  }
  if (article.id === "quote-prep") {
    title = "Prepare one clear project before collecting prices.";
    copy = "Start with the roof information you know, then give each contractor a similar brief so scope differences are easier to spot.";
    estimateLabel = "Prepare a roof estimate";
  }
  if (["choose-roofer", "roof-warranties"].includes(article.id)) {
    title = "Use the checklist on a real quote.";
    copy = "Check the contractor and warranty separately from the price, then use Quote Checker to line up the major written scope.";
    estimateLabel = "Check a roofing quote";
    estimateHref = "/tools/quote-checker";
  }

  if (["roofing-contracts", "roof-painting", "roof-problems"].includes(article.id)) {
    title = article.id === "roofing-contracts" ? "Check the written scope against the contract." : article.id === "roof-painting" ? "Compare restoration with replacement on the same facts." : "Turn the symptoms into the next useful check.";
    copy = article.id === "roofing-contracts" ? "Use Quote Checker to line up GST, roof system and major inclusions before accepting a price or variation." : article.id === "roof-painting" ? "If you have a quote for coating, repair or replacement, compare what each option actually includes before judging the headline price." : "RoofHub can help separate likely roof, moisture, drainage and maintenance issues before you decide whether pricing is the next step.";
    estimateLabel = article.id === "roof-problems" ? "Compare leak vs condensation" : "Check a roofing quote";
    estimateHref = article.id === "roof-problems" ? "/guides/roof-leak-or-condensation" : "/tools/quote-checker";
  }
  if (["roof-parts", "roof-penetrations"].includes(article.id)) {
    title = "Use the roof details as measured quantities.";
    copy = "Keep roof area, roof lines and individual penetrations separate when you have plans or measurements.";
    estimateLabel = "Use measurements";
    estimateHref = "/tools/detailed-roof-estimator";
  }
  if (article.id === "solar-roof") {
    title = "Check the roof before adding another system to it.";
    copy = "If the existing roof may need repair or replacement, coordinate that decision before committing to an array that may need to be removed later.";
    estimateLabel = "Estimate roof replacement";
  }
  if (article.id === "roof-ventilation") {
    title = "Diagnose the moisture pathway before buying a fix.";
    copy = "Ask RoofHub about the symptoms, roof build-up and room moisture before assuming roof-space ventilation is the answer.";
    estimateLabel = "Compare leak vs condensation";
    estimateHref = "/guides/roof-leak-or-condensation";
  }
  if (["repair-or-replace", "rusting-metal-roof", "recurring-roof-leaks", "concrete-tile-decision", "decramastic-decision"].includes(article.id)) {
    title = "Work through the condition before choosing the scope.";
    copy = "Use the symptoms, spread and repeat history first. RoofHub can help separate a plausible local repair from restoration, replacement or a case that needs inspection.";
    estimateLabel = "Assess roof condition";
    estimateHref = "/guides/roof-condition-assessment";
  }
  if (article.id === "roof-condition-assessment") {
    title = "Turn what you know into a neutral next step.";
    copy = "Describe the roof system, where the problem is, whether it is recurring and what you can see safely. Ask RoofHub to work through the decision without assuming a full reroof.";
    estimateLabel = "Repair or replace guide";
    estimateHref = "/guides/roof-repair-or-replace";
  }
  if (article.id === "hidden-reroof-problems") {
    title = "Keep hidden work separate from the known reroof scope.";
    copy = "Use Quote Checker to see whether timber/structural repairs and other opening-up items are included, excluded or still unknown.";
    estimateLabel = "Check the quote";
    estimateHref = "/tools/quote-checker";
  }
  return {
    estimateHref,
    estimateLabel,
    assistantPrompt: `I'm reading "${article.title}". Help me apply this to a roofing project or explain anything I'm missing.`,
    assistantLabel: "Ask RoofHub about this",
    eyebrow: "Apply the answer",
    title,
    copy
  };
}
