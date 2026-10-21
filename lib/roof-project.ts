import type { RoofSystem } from "@/data/types";

export const ROOF_PROJECT_SCHEMA_VERSION = 1 as const;
export const ROOF_PROJECT_STORAGE_KEY = "roofhub.roof-project.v1";

export type RoofProjectEntryPoint =
  | "direct"
  | "content"
  | "quick-estimate"
  | "detailed-estimate"
  | "quote-checker"
  | "assistant"
  | "unknown";

export type RoofProjectType = "new" | "reroof" | "unknown";
export type ExistingRoof =
  | "long-run-metal"
  | "pressed-metal-tile"
  | "concrete-tile"
  | "membrane"
  | "other"
  | "unknown";
export type ExistingRoofDetail = "decramastic" | null;
export type DesiredRoof = RoofSystem | "undecided";
export type RoofShape =
  | "skillion"
  | "gable"
  | "hip"
  | "gable-valley"
  | "hip-valley"
  | "multi-section"
  | "dormer-complex"
  | "flat-low-slope"
  | "unknown";
export type RoofSizeBand = "small" | "small-medium" | "medium" | "medium-large" | "large" | "very-large" | "unknown";
export type RoofAreaSource = "building-footprint" | "total-floor-area" | "roof-area" | "estimated" | "unknown";
export type RoofPitchBand = "low" | "typical" | "steep" | "unknown";
export type RoofComplexity =
  | "two-storey"
  | "difficult-access"
  | "dormers"
  | "multiple-sections"
  | "skylights-or-chimneys"
  | "attached-flat-section";

export type RoofMeasurementGroup =
  | "roof-area"
  | "ridge"
  | "hip"
  | "valley"
  | "barge"
  | "apron"
  | "spouting"
  | "downpipe"
  | "other";
export type RoofMeasurementUnit = "m2" | "lm" | "each";
export type RoofMeasurementBasis = "actual" | "plan" | "estimated";
export type RoofMeasurementSource = "quick-estimate" | "manual" | "plan-takeoff" | "detailed-estimator" | "unknown";

export type RoofProjectMeasurement = {
  id: string;
  group: RoofMeasurementGroup;
  label: string;
  value: number;
  unit: RoofMeasurementUnit;
  quantity: number;
  basis: RoofMeasurementBasis;
  pitchDegrees: number | null;
  source: RoofMeasurementSource;
};

export type EstimateDetailLevel = "basic" | "improved" | "detailed" | "measured";

export type RoofProjectEstimate = {
  low: number;
  high: number;
  gstBasis: "incl" | "excl";
  detailLevel: EstimateDetailLevel;
  quantityModelVersion: string;
  rateCardId: string;
  rateCardVersion: string;
  assumptions: string[];
  exclusions: string[];
  createdAt: string;
};

export type QuoteComparisonStatus = "within-range" | "below-range" | "above-range" | "not-comparable" | "unknown";
export type QuoteComparability = "good" | "partial" | "not-directly-comparable" | "unknown";

export type RoofProjectQuoteCheck = {
  quotedAmount: number | null;
  gstBasis: "incl" | "excl" | "unknown";
  knownInclusions: string[];
  knownExclusions: string[];
  comparisonStatus: QuoteComparisonStatus;
  comparability: QuoteComparability;
};

export type RoofProjectContext = {
  currentTool: "none" | "quick-estimate" | "detailed-estimate" | "quote-checker";
  currentStep: string;
  originatingPath: string;
};

export type RoofProject = {
  schemaVersion: typeof ROOF_PROJECT_SCHEMA_VERSION;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  entryPoint: RoofProjectEntryPoint;
  projectType: RoofProjectType;
  existingRoof: ExistingRoof;
  existingRoofDetail: ExistingRoofDetail;
  desiredRoof: DesiredRoof;
  geometry: {
    roofShape: RoofShape;
    sizeBand: RoofSizeBand;
    areaSource: RoofAreaSource;
    floorAreaM2: number | null;
    footprintAreaM2: number | null;
    roofAreaM2: number | null;
    pitchBand: RoofPitchBand;
    exactPitchDegrees: number | null;
    storeys: 1 | 2 | null;
    complexities: RoofComplexity[];
  };
  measurements: RoofProjectMeasurement[];
  estimate: RoofProjectEstimate | null;
  quoteCheck: RoofProjectQuoteCheck;
  context: RoofProjectContext;
};

function nowIso(): string {
  return new Date().toISOString();
}

function projectId(): string {
  const value = globalThis.crypto?.randomUUID?.();
  return value ? `rh-project-${value}` : `rh-project-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function createRoofProject(entryPoint: RoofProjectEntryPoint = "unknown"): RoofProject {
  const now = nowIso();
  return {
    schemaVersion: ROOF_PROJECT_SCHEMA_VERSION,
    projectId: projectId(),
    createdAt: now,
    updatedAt: now,
    entryPoint,
    projectType: "unknown",
    existingRoof: "unknown",
    existingRoofDetail: null,
    desiredRoof: "undecided",
    geometry: {
      roofShape: "unknown",
      sizeBand: "unknown",
      areaSource: "unknown",
      floorAreaM2: null,
      footprintAreaM2: null,
      roofAreaM2: null,
      pitchBand: "unknown",
      exactPitchDegrees: null,
      storeys: null,
      complexities: []
    },
    measurements: [],
    estimate: null,
    quoteCheck: {
      quotedAmount: null,
      gstBasis: "unknown",
      knownInclusions: [],
      knownExclusions: [],
      comparisonStatus: "unknown",
      comparability: "unknown"
    },
    context: {
      currentTool: "none",
      currentStep: "",
      originatingPath: ""
    }
  };
}

const entryPoints = new Set<RoofProjectEntryPoint>(["direct", "content", "quick-estimate", "detailed-estimate", "quote-checker", "assistant", "unknown"]);
const projectTypes = new Set<RoofProjectType>(["new", "reroof", "unknown"]);
const existingRoofs = new Set<ExistingRoof>(["long-run-metal", "pressed-metal-tile", "concrete-tile", "membrane", "other", "unknown"]);
const roofSystems = new Set<DesiredRoof>(["corrugate", "five-rib", "pressed-metal-tile", "tray-standing-seam", "membrane", "undecided"]);
const roofShapes = new Set<RoofShape>(["skillion", "gable", "hip", "gable-valley", "hip-valley", "multi-section", "dormer-complex", "flat-low-slope", "unknown"]);
const sizeBands = new Set<RoofSizeBand>(["small", "small-medium", "medium", "medium-large", "large", "very-large", "unknown"]);
const areaSources = new Set<RoofAreaSource>(["building-footprint", "total-floor-area", "roof-area", "estimated", "unknown"]);
const pitchBands = new Set<RoofPitchBand>(["low", "typical", "steep", "unknown"]);
const complexities = new Set<RoofComplexity>(["two-storey", "difficult-access", "dormers", "multiple-sections", "skylights-or-chimneys", "attached-flat-section"]);
const measurementGroups = new Set<RoofMeasurementGroup>(["roof-area", "ridge", "hip", "valley", "barge", "apron", "spouting", "downpipe", "other"]);
const measurementUnits = new Set<RoofMeasurementUnit>(["m2", "lm", "each"]);
const measurementBases = new Set<RoofMeasurementBasis>(["actual", "plan", "estimated"]);
const measurementSources = new Set<RoofMeasurementSource>(["quick-estimate", "manual", "plan-takeoff", "detailed-estimator", "unknown"]);
const detailLevels = new Set<EstimateDetailLevel>(["basic", "improved", "detailed", "measured"]);
const comparisonStatuses = new Set<QuoteComparisonStatus>(["within-range", "below-range", "above-range", "not-comparable", "unknown"]);
const comparabilityValues = new Set<QuoteComparability>(["good", "partial", "not-directly-comparable", "unknown"]);
const currentTools = new Set<RoofProjectContext["currentTool"]>(["none", "quick-estimate", "detailed-estimate", "quote-checker"]);

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function finiteNumber(value: unknown, min = 0, max = 1_000_000): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max ? value : null;
}

function cleanString(value: unknown, max = 200): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function enumValue<T extends string>(value: unknown, allowed: Set<T>, fallback: T): T {
  return typeof value === "string" && allowed.has(value as T) ? value as T : fallback;
}

function stringArray(value: unknown, maxItems = 20, maxLength = 120): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").slice(0, maxItems).map((item) => item.trim().slice(0, maxLength)).filter(Boolean)
    : [];
}

function parseMeasurement(value: unknown): RoofProjectMeasurement | null {
  const item = record(value);
  if (!item) return null;
  const unit = enumValue(item.unit, measurementUnits, "lm");
  const raw = finiteNumber(item.value, 0, unit === "each" ? 10_000 : 1_000_000);
  if (raw === null) return null;
  return {
    id: cleanString(item.id, 120) || projectId(),
    group: enumValue(item.group, measurementGroups, "other"),
    label: cleanString(item.label, 160),
    value: raw,
    unit,
    quantity: finiteNumber(item.quantity, 0, 10_000) ?? 1,
    basis: enumValue(item.basis, measurementBases, "actual"),
    pitchDegrees: finiteNumber(item.pitchDegrees, 0, 89.9),
    source: enumValue(item.source, measurementSources, "unknown")
  };
}

function parseEstimate(value: unknown): RoofProjectEstimate | null {
  const item = record(value);
  if (!item) return null;
  const low = finiteNumber(item.low, 0, 100_000_000);
  const high = finiteNumber(item.high, 0, 100_000_000);
  if (low === null || high === null || low > high) return null;
  const gstBasis = item.gstBasis === "excl" ? "excl" : "incl";
  return {
    low,
    high,
    gstBasis,
    detailLevel: enumValue(item.detailLevel, detailLevels, "basic"),
    quantityModelVersion: cleanString(item.quantityModelVersion, 80),
    rateCardId: cleanString(item.rateCardId, 120),
    rateCardVersion: cleanString(item.rateCardVersion, 80),
    assumptions: stringArray(item.assumptions, 30, 400),
    exclusions: stringArray(item.exclusions, 30, 400),
    createdAt: cleanString(item.createdAt, 40) || nowIso()
  };
}

export function parseRoofProject(value: unknown): RoofProject | null {
  const input = record(value);
  if (!input || input.schemaVersion !== ROOF_PROJECT_SCHEMA_VERSION) return null;
  const geometry = record(input.geometry) ?? {};
  const quote = record(input.quoteCheck) ?? {};
  const context = record(input.context) ?? {};
  const measurements = Array.isArray(input.measurements)
    ? input.measurements.map(parseMeasurement).filter((item): item is RoofProjectMeasurement => item !== null).slice(0, 500)
    : [];
  const createdAt = cleanString(input.createdAt, 40) || nowIso();
  const project = createRoofProject(enumValue(input.entryPoint, entryPoints, "unknown"));

  project.projectId = cleanString(input.projectId, 120) || project.projectId;
  project.createdAt = createdAt;
  project.updatedAt = cleanString(input.updatedAt, 40) || createdAt;
  project.projectType = enumValue(input.projectType, projectTypes, "unknown");
  project.existingRoof = enumValue(input.existingRoof, existingRoofs, "unknown");
  project.existingRoofDetail = input.existingRoofDetail === "decramastic" ? "decramastic" : null;
  project.desiredRoof = enumValue(input.desiredRoof, roofSystems, "undecided");
  project.geometry = {
    roofShape: enumValue(geometry.roofShape, roofShapes, "unknown"),
    sizeBand: enumValue(geometry.sizeBand, sizeBands, "unknown"),
    areaSource: enumValue(geometry.areaSource, areaSources, "unknown"),
    floorAreaM2: finiteNumber(geometry.floorAreaM2),
    footprintAreaM2: finiteNumber(geometry.footprintAreaM2),
    roofAreaM2: finiteNumber(geometry.roofAreaM2),
    pitchBand: enumValue(geometry.pitchBand, pitchBands, "unknown"),
    exactPitchDegrees: finiteNumber(geometry.exactPitchDegrees, 0, 89.9),
    storeys: geometry.storeys === 1 || geometry.storeys === 2 ? geometry.storeys : null,
    complexities: Array.isArray(geometry.complexities)
      ? geometry.complexities.filter((item): item is RoofComplexity => typeof item === "string" && complexities.has(item as RoofComplexity)).slice(0, complexities.size)
      : []
  };
  project.measurements = measurements;
  project.estimate = parseEstimate(input.estimate);
  project.quoteCheck = {
    quotedAmount: finiteNumber(quote.quotedAmount, 0, 100_000_000),
    gstBasis: quote.gstBasis === "incl" || quote.gstBasis === "excl" ? quote.gstBasis : "unknown",
    knownInclusions: stringArray(quote.knownInclusions),
    knownExclusions: stringArray(quote.knownExclusions),
    comparisonStatus: enumValue(quote.comparisonStatus, comparisonStatuses, "unknown"),
    comparability: enumValue(quote.comparability, comparabilityValues, "unknown")
  };
  project.context = {
    currentTool: enumValue(context.currentTool, currentTools, "none"),
    currentStep: cleanString(context.currentStep, 120),
    originatingPath: cleanString(context.originatingPath, 500)
  };
  return project;
}

export function touchRoofProject(project: RoofProject): RoofProject {
  return { ...project, updatedAt: nowIso() };
}

export function isRoofProject(value: unknown): value is RoofProject {
  return parseRoofProject(value) !== null;
}
