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
  | "assistant_knowledge_gap"
  | "assistant_feedback"
  | "enquiry_start"
  | "enquiry_submit"
  | "cta_click"
  | "product_compare";

export type AnalyticsTool = "none" | "quick-estimate" | "detailed-estimate" | "quote-checker" | "assistant";
export type AnalyticsProjectType = "new" | "reroof" | "unknown";
export type AnalyticsRoofSystem = "corrugate" | "five-rib" | "pressed-metal-tile" | "tray-standing-seam" | "membrane" | "undecided" | "unknown";
export type AnalyticsDetailLevel = "basic" | "improved" | "detailed" | "measured" | "unknown";

export type AnalyticsKnowledgeConfidence = "strong" | "medium" | "weak" | "none";
export type AnalyticsGapReason = "matched" | "no_match" | "weak_match" | "ambiguous" | "out_of_domain";
export type AnalyticsAssistantFeedback = "helpful" | "needs_more_detail";
export type AnalyticsKnowledgeTopic =
  | "cost-pricing" | "quotes-contracts" | "measurements-geometry" | "consent-compliance"
  | "roofers-project-planning" | "leaks-moisture" | "drainage" | "flashings-penetrations"
  | "materials-systems" | "maintenance-restoration" | "insulation-ventilation" | "solar"
  | "insurance" | "warranties" | "safety-asbestos" | "unknown";

export type RoofHubAnalyticsContext = {
  path?: string;
  entryPoint?: string;
  ctaLocation?: string;
  tool?: AnalyticsTool;
  projectType?: AnalyticsProjectType;
  roofSystem?: AnalyticsRoofSystem;
  detailLevel?: AnalyticsDetailLevel;
  step?: string;
  knowledgeConfidence?: AnalyticsKnowledgeConfidence;
  knowledgeMatch?: string;
  gapReason?: AnalyticsGapReason;
  knowledgeTopic?: AnalyticsKnowledgeTopic;
  feedback?: AnalyticsAssistantFeedback;
};
