export type RoofConditionInput = {
  roofSystem?: "metal" | "concrete-tile" | "pressed-metal-tile" | "membrane" | "other" | "unknown";
  issueSpread?: "localised" | "multiple-areas" | "widespread" | "unknown";
  recurrence?: "first-time" | "repeated-same-area" | "repeated-different-areas" | "unknown";
  surfaceCondition?: "surface-wear" | "local-damage" | "perforation-or-missing-material" | "sagging-or-structural-movement" | "unknown";
  activeLeaks?: "none" | "one-area" | "multiple-areas" | "unknown";
  suspectedAsbestos?: "yes" | "no" | "unknown";
};

export type RoofConditionResult = {
  direction: "repair-plausible" | "restoration-plausible" | "replacement-plausible" | "inspection-needed" | "safety-first";
  confidence: "low" | "medium";
  plausibleOptions: string[];
  reasons: string[];
  nextQuestions: string[];
  caution: string;
};

export function assessRoofCondition(input?: RoofConditionInput): RoofConditionResult;
