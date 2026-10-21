import type { Project } from "@/components/roofhub-types";
import {
  createRoofProject,
  type RoofProject,
  type RoofProjectMeasurement
} from "@/lib/roof-project";
import type { DetailedEstimatorModule } from "@/lib/estimator/detailed-adapter";
import {
  estimateDetailLevel,
  measureQuickRoof,
  midpointQuantities,
  type QuickEstimateInput,
  type QuickMeasurementRange,
  type QuickPriceResult
} from "@/lib/quick-estimate/index.mjs";
import { getEstimatorRateCardRecord } from "@/lib/estimator/rate-card";

const existingToShared: Record<QuickEstimateInput["existingRoof"], Pick<RoofProject, "existingRoof" | "existingRoofDetail">> = {
  "long-run-metal": { existingRoof: "long-run-metal", existingRoofDetail: null },
  "pressed-metal-tile": { existingRoof: "pressed-metal-tile", existingRoofDetail: null },
  decramastic: { existingRoof: "pressed-metal-tile", existingRoofDetail: "decramastic" },
  "concrete-tile": { existingRoof: "concrete-tile", existingRoofDetail: null },
  membrane: { existingRoof: "membrane", existingRoofDetail: null },
  other: { existingRoof: "other", existingRoofDetail: null },
  unknown: { existingRoof: "unknown", existingRoofDetail: null }
};

function sharedExistingToQuick(project: RoofProject): QuickEstimateInput["existingRoof"] {
  if (project.existingRoof === "pressed-metal-tile" && project.existingRoofDetail === "decramastic") return "decramastic";
  return project.existingRoof;
}

export function defaultQuickEstimateInput(): QuickEstimateInput {
  return {
    projectType: "unknown",
    existingRoof: "unknown",
    roofShape: "unknown",
    sizeBand: "unknown",
    areaInputM2: null,
    areaSource: "unknown",
    pitchBand: "unknown",
    exactPitchDegrees: null,
    desiredRoof: "undecided",
    storeys: null,
    complexities: []
  };
}

export function quickInputFromRoofProject(project: RoofProject | null): QuickEstimateInput {
  if (!project) return defaultQuickEstimateInput();
  let areaInputM2: number | null = null;
  let areaSource: QuickEstimateInput["areaSource"] = "unknown";
  if (project.geometry.areaSource === "roof-area" && project.geometry.roofAreaM2) {
    areaInputM2 = project.geometry.roofAreaM2;
    areaSource = "roof-area";
  } else if (project.geometry.areaSource === "building-footprint" && project.geometry.footprintAreaM2) {
    areaInputM2 = project.geometry.footprintAreaM2;
    areaSource = "building-footprint";
  } else if (project.geometry.areaSource === "total-floor-area" && project.geometry.floorAreaM2) {
    areaInputM2 = project.geometry.floorAreaM2;
    areaSource = "total-floor-area";
  }
  return {
    projectType: project.projectType,
    existingRoof: sharedExistingToQuick(project),
    roofShape: project.geometry.roofShape,
    sizeBand: project.geometry.sizeBand,
    areaInputM2,
    areaSource,
    pitchBand: project.geometry.pitchBand,
    exactPitchDegrees: project.geometry.exactPitchDegrees,
    desiredRoof: project.desiredRoof,
    storeys: project.geometry.storeys,
    complexities: [...project.geometry.complexities]
  };
}

function measurement(id: string, group: RoofProjectMeasurement["group"], label: string, value: number, unit: RoofProjectMeasurement["unit"], pitch: number | null): RoofProjectMeasurement {
  return { id, group, label, value, unit, quantity: 1, basis: "estimated", pitchDegrees: pitch, source: "quick-estimate" };
}

export function quickMeasurementsToShared(range: QuickMeasurementRange): RoofProjectMeasurement[] {
  const q = midpointQuantities(range);
  const pitch = (range.low.pitchDegrees + range.high.pitchDegrees) / 2;
  const items: RoofProjectMeasurement[] = [measurement("quick-roof-area", "roof-area", "Approximate roof area", q.roofAreaM2, "m2", pitch)];
  if (q.ridgeM > 0) items.push(measurement("quick-ridge", "ridge", "Approximate ridge", q.ridgeM, "lm", null));
  if (q.hipM > 0) items.push(measurement("quick-hips", "hip", "Approximate hips", q.hipM, "lm", pitch));
  if (q.valleyM > 0) items.push(measurement("quick-valleys", "valley", "Approximate valleys", q.valleyM, "lm", pitch));
  if (q.vergeM > 0) items.push(measurement("quick-barges", "barge", "Approximate barges", q.vergeM, "lm", pitch));
  return items;
}

export function applyQuickEstimateToRoofProject(
  input: QuickEstimateInput,
  range: QuickMeasurementRange,
  price: QuickPriceResult | null,
  previous: RoofProject | null,
  options: { allowReviewPricing?: boolean; originatingPath?: string } = {}
): RoofProject {
  const project = previous ? structuredClone(previous) : createRoofProject("quick-estimate");
  const existing = existingToShared[input.existingRoof];
  const q = midpointQuantities(range);
  project.entryPoint = project.entryPoint === "unknown" ? "quick-estimate" : project.entryPoint;
  project.projectType = input.projectType;
  project.existingRoof = input.projectType === "reroof" ? existing.existingRoof : "unknown";
  project.existingRoofDetail = input.projectType === "reroof" ? existing.existingRoofDetail : null;
  project.desiredRoof = input.desiredRoof;
  project.geometry.roofShape = input.roofShape;
  project.geometry.sizeBand = input.sizeBand;
  project.geometry.pitchBand = input.pitchBand;
  project.geometry.exactPitchDegrees = input.exactPitchDegrees;
  project.geometry.storeys = input.storeys;
  project.geometry.complexities = [...input.complexities];
  project.geometry.floorAreaM2 = input.areaSource === "total-floor-area" ? input.areaInputM2 : null;
  project.geometry.footprintAreaM2 = input.areaSource === "building-footprint" ? input.areaInputM2 : null;
  project.geometry.roofAreaM2 = input.areaSource === "roof-area" && input.areaInputM2 ? input.areaInputM2 : q.roofAreaM2;
  project.geometry.areaSource = input.areaInputM2 ? input.areaSource : "estimated";
  project.measurements = quickMeasurementsToShared(range);
  project.context = {
    currentTool: "quick-estimate",
    currentStep: "result",
    originatingPath: project.context.originatingPath || options.originatingPath || "/tools/roof-estimate"
  };

  const canStorePricing = Boolean(price && price.low !== null && price.high !== null && (price.approved || options.allowReviewPricing));
  if (canStorePricing && price) {
    const registry = getEstimatorRateCardRecord(price.rateCardId);
    project.estimate = {
      low: price.low!,
      high: price.high!,
      gstBasis: "incl",
      detailLevel: estimateDetailLevel(input),
      quantityModelVersion: range.modelVersion,
      rateCardId: price.rateCardId,
      rateCardVersion: registry?.methodologyVersion ?? "unregistered",
      assumptions: price.assumptions,
      exclusions: price.exclusions,
      createdAt: new Date().toISOString()
    };
  } else {
    project.estimate = null;
  }
  project.updatedAt = new Date().toISOString();
  return project;
}

function detailedRoofSystem(desired: RoofProject["desiredRoof"]): Project["roofSystem"] {
  if (desired === "pressed-metal-tile") return "pressed-metal";
  if (desired === "tray-standing-seam") return "tray";
  if (desired === "corrugate" || desired === "five-rib") return desired;
  return null;
}

function detailedExisting(project: RoofProject): Project["existingRoof"] {
  if (project.existingRoof === "long-run-metal") return "long-run";
  if (project.existingRoof === "concrete-tile") return "concrete";
  if (project.existingRoof === "pressed-metal-tile" && project.existingRoofDetail === "decramastic") return "decramastic";
  if (project.existingRoof === "pressed-metal-tile") return "pressed-metal";
  if (project.existingRoof === "unknown" || project.existingRoof === "other" || project.existingRoof === "membrane") return "unknown";
  return null;
}

const detailedGroup: Partial<Record<RoofProjectMeasurement["group"], "roofAreas" | "ridges" | "hips" | "valleys" | "barges">> = {
  "roof-area": "roofAreas",
  ridge: "ridges",
  hip: "hips",
  valley: "valleys",
  barge: "barges"
};

export function detailedProjectFromQuickProject(shared: RoofProject, module: DetailedEstimatorModule): Project | null {
  const quickMeasurements = shared.measurements.filter(item => item.source === "quick-estimate" && detailedGroup[item.group]);
  if (!quickMeasurements.some(item => item.group === "roof-area")) return null;
  const detailed = module.newProject();
  detailed.projectType = shared.projectType === "new" || shared.projectType === "reroof" ? shared.projectType : null;
  detailed.existingRoof = shared.projectType === "reroof" ? detailedExisting(shared) : null;
  detailed.asbestos = shared.existingRoofDetail === "decramastic" ? "unknown" : "unknown";
  detailed.storeys = shared.geometry.storeys === 2 ? 2 : 1;
  detailed.site = shared.geometry.complexities.includes("difficult-access") ? "difficult" : "flat";
  detailed.roofSystem = detailedRoofSystem(shared.desiredRoof);
  detailed.entryMode = "manual";
  detailed.measurementBasis = "actual";
  detailed.pitch = shared.geometry.exactPitchDegrees ?? ({ low: 10, typical: 22.5, steep: 37.5, unknown: 22.5 }[shared.geometry.pitchBand]);
  detailed.measurements = quickMeasurements.map(item => module.newEntry(detailedGroup[item.group]!, "actual", {
    label: item.label,
    value: item.value,
    quantity: item.quantity,
    pitch: null,
    source: "quick-estimate",
    regularGeometry: false
  })) as Project["measurements"];
  detailed.reviewedComponents = false;
  detailed.underlay = true;
  detailed.fixings = true;
  detailed.battenMaterials = true;
  detailed.wastePct = 5;
  detailed.pricingMode = "guide";
  detailed.rateOverrides = {};
  detailed.customItems = [];
  detailed.access = {
    choice: "unsure",
    system: "full",
    perimeter: null,
    perimeterSource: "quick-estimate",
    weeks: 4,
    assessmentAccepted: false
  };
  detailed.displayTax = "incl";
  detailed.step = 0;
  detailed.maxStep = 0;
  return detailed;
}

export function ensureQuickRange(input: QuickEstimateInput): QuickMeasurementRange {
  return measureQuickRoof(input);
}
