export type RoofHubAnalyticsEvent =
  | "estimate_start"
  | "estimate_step_complete"
  | "estimate_result"
  | "estimate_refine"
  | "advanced_estimator_open"
  | "quote_checker_start"
  | "quote_checker_result"
  | "assistant_open"
  | "assistant_question"
  | "assistant_project_update"
  | "assistant_estimate"
  | "enquiry_start"
  | "enquiry_submit"
  | "cta_click"
  | "product_compare";

export type AnalyticsTool = "none" | "quick-estimate" | "detailed-estimate" | "quote-checker" | "assistant";
export type AnalyticsProjectType = "new" | "reroof" | "unknown";
export type AnalyticsRoofSystem = "corrugate" | "five-rib" | "pressed-metal-tile" | "tray-standing-seam" | "membrane" | "undecided" | "unknown";
export type AnalyticsDetailLevel = "basic" | "improved" | "detailed" | "measured" | "unknown";

export type RoofHubAnalyticsContext = {
  path?: string;
  entryPoint?: string;
  ctaLocation?: string;
  tool?: AnalyticsTool;
  projectType?: AnalyticsProjectType;
  roofSystem?: AnalyticsRoofSystem;
  detailLevel?: AnalyticsDetailLevel;
  step?: string;
};
