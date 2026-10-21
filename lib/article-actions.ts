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

  if (["reroof-cost", "timeline", "tile-to-metal", "decramastic"].includes(article.id)) project = "reroof";
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

  const estimateHref = article.id === "compare-quotes"
    ? "/tools/quote-checker"
    : `/tools/roof-estimate${query({ project, product, existing, from: article.path })}`;
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
