import type { RoofProject } from '../roof-project';
import type { QuickDesiredRoof } from '../quick-estimate/index.mjs';

export type AssistantPricingResult = {
  ok: true;
  input: unknown;
  measurementModelVersion: string;
  result: {
    product: QuickDesiredRoof;
    status: 'complete' | 'partial' | 'unpriced' | 'incompatible' | 'error';
    low: number | null;
    high: number | null;
    approved: boolean;
    reviewOnly: boolean;
    detailLevel: 'basic' | 'improved' | 'detailed';
    missing: string[];
    assumptions: string[];
    exclusions: string[];
    compatibilityMessage: string;
  };
  projectEstimate: RoofProject['estimate'];
  pricingAvailable: boolean;
} | { ok: false; reason: string; needs: string[] };

export function estimateProjectForAssistant(project: RoofProject, desiredRoofOverride?: QuickDesiredRoof | null, allowReviewPricing?: boolean): AssistantPricingResult;
