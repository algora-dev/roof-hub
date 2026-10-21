const ROOF_SYSTEMS = new Set(["metal", "concrete-tile", "pressed-metal-tile", "membrane", "other", "unknown"]);
const SPREAD = new Set(["localised", "multiple-areas", "widespread", "unknown"]);
const RECURRENCE = new Set(["first-time", "repeated-same-area", "repeated-different-areas", "unknown"]);
const SURFACE = new Set(["surface-wear", "local-damage", "perforation-or-missing-material", "sagging-or-structural-movement", "unknown"]);
const LEAKS = new Set(["none", "one-area", "multiple-areas", "unknown"]);
const YES_NO_UNKNOWN = new Set(["yes", "no", "unknown"]);

function oneOf(value, allowed, fallback = "unknown") {
  return allowed.has(value) ? value : fallback;
}

function questionsFor(input) {
  const questions = [];
  if (input.issueSpread === "unknown") questions.push("Is the problem localised to one area, present in several areas, or widespread across the roof?");
  if (input.recurrence === "unknown") questions.push("Is this the first occurrence, or has the same or a different roof area needed repeated repairs?");
  if (input.surfaceCondition === "unknown") questions.push("From a safe location, is the visible issue mainly surface wear, local damage, holes/missing material, or sagging/movement?");
  if (input.activeLeaks === "unknown") questions.push("Are there no active leaks, one known leak area, or leaks in multiple areas?");
  return questions.slice(0, 2);
}

/**
 * Neutral directional triage for repair / restoration / replacement conversations.
 * This is intentionally conservative: it never diagnoses a roof, prices work, or
 * converts roof age into an automatic replacement rule.
 */
export function assessRoofCondition(raw = {}) {
  const input = {
    roofSystem: oneOf(raw.roofSystem, ROOF_SYSTEMS),
    issueSpread: oneOf(raw.issueSpread, SPREAD),
    recurrence: oneOf(raw.recurrence, RECURRENCE),
    surfaceCondition: oneOf(raw.surfaceCondition, SURFACE),
    activeLeaks: oneOf(raw.activeLeaks, LEAKS),
    suspectedAsbestos: oneOf(raw.suspectedAsbestos, YES_NO_UNKNOWN)
  };

  const base = {
    direction: "inspection-needed",
    confidence: "low",
    plausibleOptions: ["targeted investigation", "site inspection"],
    reasons: [],
    nextQuestions: questionsFor(input),
    caution: "This is directional decision support from the facts supplied, not a roof inspection or diagnosis. Do not climb onto the roof to gather more information."
  };

  if (input.suspectedAsbestos === "yes") {
    return {
      ...base,
      direction: "safety-first",
      confidence: "medium",
      plausibleOptions: ["asbestos identification/testing where appropriate", "competent roofing/asbestos assessment before disturbance"],
      reasons: ["Suspected asbestos changes how the roof can be inspected, cleaned, repaired or removed."],
      nextQuestions: [],
      caution: "Do not pressure-wash, drill, cut, scrape or otherwise disturb roofing suspected of containing asbestos. This result is not an asbestos identification."
    };
  }

  if (input.surfaceCondition === "sagging-or-structural-movement") {
    return {
      ...base,
      direction: "inspection-needed",
      confidence: "medium",
      plausibleOptions: ["prompt competent site assessment", "temporary risk controls if advised by a professional"],
      reasons: ["Sagging or structural movement can involve more than the roof covering and should not be reduced to a repair-vs-reroof decision remotely."],
      nextQuestions: [],
      caution: "Avoid the affected roof area and do not climb onto it. A competent on-site assessment is needed before choosing a repair or replacement scope."
    };
  }

  const broadFailure = input.issueSpread === "widespread" && (
    input.surfaceCondition === "perforation-or-missing-material" ||
    input.activeLeaks === "multiple-areas" ||
    input.recurrence === "repeated-different-areas"
  );
  if (broadFailure) {
    return {
      ...base,
      direction: "replacement-plausible",
      confidence: "medium",
      plausibleOptions: ["whole-roof condition assessment", "replacement/reroof scope", "limited temporary repair only where appropriate"],
      reasons: ["The supplied facts describe widespread deterioration plus another system-level failure signal, so repeated local repairs may leave unresolved defects."],
      nextQuestions: [],
      caution: "Replacement is plausible, not proven. A site inspection should confirm the roof covering, flashings, substrate/structure and hidden conditions before work is scoped."
    };
  }

  const localRepair = input.issueSpread === "localised" &&
    input.recurrence !== "repeated-different-areas" &&
    input.activeLeaks !== "multiple-areas" &&
    ["local-damage", "unknown"].includes(input.surfaceCondition);
  if (localRepair) {
    return {
      ...base,
      direction: "repair-plausible",
      confidence: input.surfaceCondition === "local-damage" && input.recurrence === "first-time" ? "medium" : "low",
      plausibleOptions: ["targeted diagnosis", "local repair if surrounding roof is serviceable", "wider condition check if the defect recurs"],
      reasons: ["The reported problem is localised and there is no supplied evidence of widespread failure."],
      nextQuestions: questionsFor(input),
      caution: "A local symptom can be caused by water entry elsewhere. Confirm the actual failure point and surrounding roof condition before repairing it."
    };
  }

  const restorationCandidate = ["metal", "concrete-tile", "pressed-metal-tile"].includes(input.roofSystem) &&
    input.surfaceCondition === "surface-wear" &&
    input.issueSpread !== "widespread" &&
    input.activeLeaks !== "multiple-areas" &&
    input.recurrence !== "repeated-different-areas";
  if (restorationCandidate) {
    return {
      ...base,
      direction: "restoration-plausible",
      confidence: "medium",
      plausibleOptions: ["condition assessment", "repair defects first", "restoration/recoating if the roof system remains suitable", "replacement comparison if hidden/system failures are found"],
      reasons: ["The issue is described as surface wear without a supplied system-wide leak or perforation signal."],
      nextQuestions: questionsFor(input),
      caution: "Coating is not a substitute for failed roofing, perforation, structural problems or defective details. Suitability depends on the actual roof system and condition."
    };
  }

  if (input.surfaceCondition === "perforation-or-missing-material" && input.issueSpread === "localised" && input.activeLeaks !== "multiple-areas") {
    return {
      ...base,
      direction: "repair-plausible",
      confidence: "low",
      plausibleOptions: ["local component/sheet/tile replacement if compatible", "wider condition assessment", "replacement comparison if similar defects exist elsewhere"],
      reasons: ["The reported material failure is localised, so component-level replacement may still be possible if the surrounding system is serviceable."],
      nextQuestions: questionsFor(input),
      caution: "Compatibility, hidden deterioration and the remaining condition of the roof need confirmation on site."
    };
  }

  return {
    ...base,
    reasons: ["The supplied information is incomplete or points in different directions, so a repair/restoration/replacement recommendation would be false precision."],
    nextQuestions: questionsFor(input)
  };
}
