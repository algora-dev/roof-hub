"use client";

import { loadDetailedEstimatorModule } from "@/lib/estimator/detailed-adapter";
import type { RoofProject } from "@/lib/roof-project";
import {
  measureQuickRoof,
  priceQuickEstimate,
  type QuickDesiredRoof,
  type QuickEstimateInput,
  type QuickMeasurementRange,
  type QuickPriceResult
} from "@/lib/quick-estimate/index.mjs";
import { applyQuickEstimateToRoofProject } from "@/lib/quick-estimate/project-adapter";

export type QuoteBaselineBuild = {
  project: RoofProject;
  range: QuickMeasurementRange;
  price: QuickPriceResult;
};

export function quoteBaselineMissing(input: QuickEstimateInput): string[] {
  const missing: string[] = [];
  if (input.projectType !== "new" && input.projectType !== "reroof") missing.push("Choose whether this is a new roof or a re-roof.");
  if (input.desiredRoof === "undecided") missing.push("Choose the roofing system on the quote.");
  if (input.desiredRoof === "membrane") missing.push("RoofHub does not yet publish a membrane baseline price.");
  if (!input.areaInputM2 && input.sizeBand === "unknown") missing.push("Choose an approximate roof size or enter an area.");
  if (input.areaInputM2 && input.areaSource === "unknown") missing.push("Tell RoofHub what the entered area represents.");
  return missing;
}

export async function buildQuoteCheckerBaseline(
  input: QuickEstimateInput,
  previous: RoofProject | null,
  allowReviewPricing = false
): Promise<QuoteBaselineBuild> {
  const missing = quoteBaselineMissing(input);
  if (missing.length) throw new Error(missing[0]);
  const product = input.desiredRoof as QuickDesiredRoof;
  const range = measureQuickRoof(input);
  const module = await loadDetailedEstimatorModule();
  const price = priceQuickEstimate(input, range, product, module);
  if (price.low === null || price.high === null) {
    const detail = price.missing[0] || price.compatibility.message || "This roof selection cannot be priced yet.";
    throw new Error(detail);
  }
  const project = applyQuickEstimateToRoofProject(input, range, price, previous, {
    allowReviewPricing,
    originatingPath: "/tools/quote-checker"
  });
  project.entryPoint = previous?.entryPoint && previous.entryPoint !== "unknown" ? previous.entryPoint : "quote-checker";
  project.context = {
    currentTool: "quote-checker",
    currentStep: "baseline",
    originatingPath: previous?.context.originatingPath || "/tools/quote-checker"
  };
  if (!project.estimate) {
    throw new Error("The roof geometry was calculated, but the current RoofHub price card is not available for public comparison. Preserve the live V1 pricing activation when merging this patch.");
  }
  return { project, range, price };
}
