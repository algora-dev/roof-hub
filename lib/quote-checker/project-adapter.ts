import { isRateCardApprovedForPublicEstimate, getEstimatorRateCardRecord } from "@/lib/estimator/rate-card";
import { createRoofProject, type RoofProject } from "@/lib/roof-project";
import type { QuoteProductMatch, QuoteReferenceEstimate } from "@/lib/quote-checker/index.mjs";

export type QuoteCheckerReference = {
  available: boolean;
  estimate: QuoteReferenceEstimate | null;
  reviewOnly: boolean;
  publicationVersion: string | null;
  reason: string;
};

export function quoteCheckerReference(project: RoofProject | null, allowReviewPricing = false): QuoteCheckerReference {
  if (!project?.estimate) return { available: false, estimate: null, reviewOnly: false, publicationVersion: null, reason: "Build a RoofHub project estimate before comparing the headline price." };
  const record = getEstimatorRateCardRecord(project.estimate.rateCardId);
  if (!record) return { available: false, estimate: null, reviewOnly: false, publicationVersion: null, reason: "The saved estimate uses an unregistered RoofHub rate card." };
  const approved = isRateCardApprovedForPublicEstimate(project.estimate.rateCardId);
  if (!approved && !allowReviewPricing) return { available: false, estimate: null, reviewOnly: false, publicationVersion: null, reason: "RoofHub's current project rate card is still in calibration review, so public quote-price comparison is withheld." };
  const multiplier = project.estimate.gstBasis === "incl" ? 1 : 1.15;
  const publicationVersion = approved ? record.publicationVersion : null;
  return {
    available: true,
    estimate: {
      low: Math.round(project.estimate.low * multiplier * 100) / 100,
      high: Math.round(project.estimate.high * multiplier * 100) / 100,
      gstBasis: "incl",
      detailLevel: project.estimate.detailLevel,
      rateCardId: project.estimate.rateCardId,
      reviewOnly: !approved
    },
    reviewOnly: !approved,
    publicationVersion,
    reason: !approved ? "Calibration preview: draft RoofHub pricing is visible for review only." : publicationVersion ? `Based on RoofHub's ${publicationVersion} indicative pricing model.` : "Approved RoofHub project range available."
  };
}

export function applyQuoteCheckerState(input: {
  project: RoofProject | null;
  quotedAmount: number | null;
  gstBasis: "incl" | "excl" | "unknown";
  knownInclusions: string[];
  knownExclusions: string[];
  comparisonStatus: RoofProject["quoteCheck"]["comparisonStatus"];
  comparability: RoofProject["quoteCheck"]["comparability"];
  originatingPath?: string;
}): RoofProject {
  const project = input.project ? structuredClone(input.project) : createRoofProject("quote-checker");
  if (project.entryPoint === "unknown" || project.entryPoint === "direct") project.entryPoint = "quote-checker";
  project.quoteCheck = {
    quotedAmount: input.quotedAmount,
    gstBasis: input.gstBasis,
    knownInclusions: [...new Set(input.knownInclusions)],
    knownExclusions: [...new Set(input.knownExclusions)],
    comparisonStatus: input.comparisonStatus,
    comparability: input.comparability
  };
  project.context = {
    currentTool: "quote-checker",
    currentStep: "result",
    originatingPath: project.context.originatingPath || input.originatingPath || "/tools/quote-checker"
  };
  project.updatedAt = new Date().toISOString();
  return project;
}

export function quoteProductMatchFromToken(token: string | null): QuoteProductMatch {
  return token === "same" || token === "different" ? token : "unknown";
}
