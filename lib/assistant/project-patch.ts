import { parseRoofProject, touchRoofProject, type RoofProject } from "@/lib/roof-project";
import type { AssistantProjectPatch } from "@/lib/assistant/types";

const projectTypes = new Set(["new", "reroof", "unknown"]);
const existingRoofs = new Set(["long-run-metal", "pressed-metal-tile", "concrete-tile", "membrane", "other", "unknown"]);
const desiredRoofs = new Set(["corrugate", "five-rib", "pressed-metal-tile", "tray-standing-seam", "membrane", "undecided"]);
const shapes = new Set(["skillion", "gable", "hip", "gable-valley", "hip-valley", "multi-section", "dormer-complex", "flat-low-slope", "unknown"]);
const sizes = new Set(["small", "small-medium", "medium", "medium-large", "large", "very-large", "unknown"]);
const areaSources = new Set(["building-footprint", "total-floor-area", "roof-area", "estimated", "unknown"]);
const pitchBands = new Set(["low", "typical", "steep", "unknown"]);
const complexityValues = new Set(["two-storey", "difficult-access", "dormers", "multiple-sections", "skylights-or-chimneys", "attached-flat-section"]);

function enumValue<T extends string>(value: unknown, allowed: Set<string>): T | undefined {
  return typeof value === "string" && allowed.has(value) ? value as T : undefined;
}

function finite(value: unknown, min: number, max: number): number | null | undefined {
  if (value === null) return null;
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max ? value : undefined;
}

export function normaliseAssistantProjectPatch(value: unknown): AssistantProjectPatch | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const patch: AssistantProjectPatch = {};

  const projectType = enumValue<RoofProject["projectType"]>(raw.projectType, projectTypes);
  if (projectType) patch.projectType = projectType;
  const existingRoof = enumValue<RoofProject["existingRoof"]>(raw.existingRoof, existingRoofs);
  if (existingRoof) patch.existingRoof = existingRoof;
  const desiredRoof = enumValue<RoofProject["desiredRoof"]>(raw.desiredRoof, desiredRoofs);
  if (desiredRoof) patch.desiredRoof = desiredRoof;

  if (raw.geometry && typeof raw.geometry === "object" && !Array.isArray(raw.geometry)) {
    const geometryRaw = raw.geometry as Record<string, unknown>;
    const geometry: NonNullable<AssistantProjectPatch["geometry"]> = {};
    const shape = enumValue<RoofProject["geometry"]["roofShape"]>(geometryRaw.roofShape, shapes);
    if (shape) geometry.roofShape = shape;
    const sizeBand = enumValue<RoofProject["geometry"]["sizeBand"]>(geometryRaw.sizeBand, sizes);
    if (sizeBand) geometry.sizeBand = sizeBand;
    const areaSource = enumValue<RoofProject["geometry"]["areaSource"]>(geometryRaw.areaSource, areaSources);
    if (areaSource) geometry.areaSource = areaSource;
    const pitchBand = enumValue<RoofProject["geometry"]["pitchBand"]>(geometryRaw.pitchBand, pitchBands);
    if (pitchBand) geometry.pitchBand = pitchBand;
    const floorAreaM2 = finite(geometryRaw.floorAreaM2, 20, 2_000);
    if (floorAreaM2 !== undefined) geometry.floorAreaM2 = floorAreaM2;
    const footprintAreaM2 = finite(geometryRaw.footprintAreaM2, 20, 1_200);
    if (footprintAreaM2 !== undefined) geometry.footprintAreaM2 = footprintAreaM2;
    const roofAreaM2 = finite(geometryRaw.roofAreaM2, 20, 1_500);
    if (roofAreaM2 !== undefined) geometry.roofAreaM2 = roofAreaM2;
    const exactPitchDegrees = finite(geometryRaw.exactPitchDegrees, 0, 50);
    if (exactPitchDegrees !== undefined) geometry.exactPitchDegrees = exactPitchDegrees;
    if (geometryRaw.storeys === 1 || geometryRaw.storeys === 2 || geometryRaw.storeys === null) geometry.storeys = geometryRaw.storeys;
    if (Array.isArray(geometryRaw.complexities)) {
      geometry.complexities = [...new Set(geometryRaw.complexities.filter((item): item is RoofProject["geometry"]["complexities"][number] => typeof item === "string" && complexityValues.has(item)))];
    }
    if (Object.keys(geometry).length) patch.geometry = geometry;
  }
  return Object.keys(patch).length ? patch : null;
}

export function applyAssistantProjectPatch(project: RoofProject, patch: AssistantProjectPatch): RoofProject {
  const next: RoofProject = structuredClone(project);
  if (patch.projectType) next.projectType = patch.projectType;
  if (patch.existingRoof) next.existingRoof = patch.existingRoof;
  if (patch.existingRoofDetail !== undefined) next.existingRoofDetail = patch.existingRoofDetail;
  if (patch.desiredRoof) next.desiredRoof = patch.desiredRoof;
  if (patch.estimate !== undefined) next.estimate = patch.estimate;
  if (patch.geometry) next.geometry = { ...next.geometry, ...patch.geometry };
  next.entryPoint = next.entryPoint === "unknown" ? "assistant" : next.entryPoint;
  const parsed = parseRoofProject(touchRoofProject(next));
  if (!parsed) throw new Error("Assistant produced an invalid project update.");
  return parsed;
}
