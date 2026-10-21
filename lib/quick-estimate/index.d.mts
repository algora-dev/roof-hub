import type { DetailedEstimatorModule } from '../estimator/detailed-adapter';
import type { RoofComplexity, RoofPitchBand, RoofShape, RoofSizeBand } from '../roof-project';

export type QuickExistingRoof = 'long-run-metal' | 'pressed-metal-tile' | 'decramastic' | 'concrete-tile' | 'membrane' | 'other' | 'unknown';
export type QuickDesiredRoof = 'corrugate' | 'five-rib' | 'pressed-metal-tile' | 'tray-standing-seam' | 'membrane' | 'undecided';
export type QuickAreaSource = 'building-footprint' | 'total-floor-area' | 'roof-area' | 'unknown';

export type QuickEstimateInput = {
  projectType: 'new' | 'reroof' | 'unknown';
  existingRoof: QuickExistingRoof;
  roofShape: RoofShape;
  sizeBand: RoofSizeBand;
  areaInputM2: number | null;
  areaSource: QuickAreaSource;
  pitchBand: RoofPitchBand;
  exactPitchDegrees: number | null;
  desiredRoof: QuickDesiredRoof;
  storeys: 1 | 2 | null;
  complexities: RoofComplexity[];
};

export type QuickQuantities = {
  footprintM2: number; roofAreaM2: number; ridgeM: number; hipM: number; valleyM: number;
  vergeM: number; eavesM: number; highEdgeM: number; flashingM: number; flatEdgeM: number; dormerCount: number;
};
export type QuickScenario = { endpoint: 'low' | 'high'; shape: Exclude<RoofShape, 'unknown'>; pitchDegrees: number; quantities: QuickQuantities; access: { storeys: 1 | 2 | null; perimeterM: number } };
export type QuickMeasurementRange = { schemaVersion: 'roofhub-quick/v1'; modelVersion: string; source: 'estimated_geometry'; input: QuickEstimateInput; low: QuickScenario; high: QuickScenario; assumptions: string[]; exclusions: string[] };
export type QuickCompatibility = { status: 'compatible' | 'needs-confirmation' | 'incompatible' | 'supported-unpriced' | 'unknown'; message: string };
export type QuickPriceResult = { product: QuickDesiredRoof; status: 'complete' | 'partial' | 'unpriced' | 'incompatible' | 'error'; compatibility: QuickCompatibility; low: number | null; high: number | null; approved: boolean; rateCardId: string; estimates: unknown[]; missing: string[]; assumptions: string[]; exclusions: string[] };

export const QUICK_ESTIMATE_MODEL_VERSION: string;
export const SIZE_BANDS: Record<RoofSizeBand, { label: string; min: number; max: number; hint: string }>;
export const PITCH_BANDS: Record<RoofPitchBand, { label: string; min: number; max: number; description: string }>;
export const PRODUCT_MIN_PITCH: Record<Exclude<QuickDesiredRoof, 'membrane' | 'undecided'>, { degrees: number; basis: string }>;
export const ROOF_TEMPLATES: Record<Exclude<RoofShape, 'unknown'>, { id: Exclude<RoofShape, 'unknown'>; label: string; description: string; complexity: string; dormerCount: number; blocks: unknown[]; note?: string }>;
export const ROOF_SHAPE_OPTIONS: RoofShape[];
export function shapeScenario(shape: RoofShape, endpoint: 'low' | 'high'): Exclude<RoofShape, 'unknown'>;
export function productPitchAssessment(product: QuickDesiredRoof, shape: RoofShape, pitchBand: RoofPitchBand, exactPitchDegrees: number | null): QuickCompatibility;
export function getRoofMesh(shape: Exclude<RoofShape, 'unknown'>): { faces: { points: [number, number, number][]; gradient: [number, number]; planArea: number }[]; edges: { kind: string; start: [number, number, number]; end: [number, number, number] }[]; walls: [number, number, number][][]; footprintM2: number };
export function measureSection(shape: Exclude<RoofShape, 'unknown'>, footprintM2: number, pitchDegrees: number): { shape: string; pitchDegrees: number; quantities: QuickQuantities; edges: unknown[] };
export function measureQuickRoof(input: QuickEstimateInput): QuickMeasurementRange;
export function estimateDetailLevel(input: QuickEstimateInput): 'basic' | 'improved' | 'detailed';
export function midpointQuantities(range: QuickMeasurementRange): QuickQuantities;
export function priceQuickEstimate(input: QuickEstimateInput, measurements: QuickMeasurementRange, product: QuickDesiredRoof, module: DetailedEstimatorModule): QuickPriceResult;
