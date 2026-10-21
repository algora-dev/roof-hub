import type { EstimateSuccess, Measurement, Project } from "@/components/roofhub-types";
import { createRoofProject, type RoofProject, type RoofProjectMeasurement } from "@/lib/roof-project";
import { getEstimatorRateCardRecord } from "@/lib/estimator/rate-card";

const groupMap: Record<Measurement["group"], RoofProjectMeasurement["group"]> = {
  roofAreas: "roof-area",
  ridges: "ridge",
  hips: "hip",
  valleys: "valley",
  barges: "barge",
  aprons: "apron",
  spouting: "spouting",
  downpipes: "downpipe"
};

function desiredRoof(system: Project["roofSystem"]): RoofProject["desiredRoof"] {
  if (system === "pressed-metal") return "pressed-metal-tile";
  if (system === "tray") return "tray-standing-seam";
  if (system === "corrugate" || system === "five-rib") return system;
  return "undecided";
}

function existingRoof(project: Project): Pick<RoofProject, "existingRoof" | "existingRoofDetail"> {
  switch (project.existingRoof) {
    case "long-run": return { existingRoof: "long-run-metal", existingRoofDetail: null };
    case "pressed-metal": return { existingRoof: "pressed-metal-tile", existingRoofDetail: null };
    case "decramastic": return { existingRoof: "pressed-metal-tile", existingRoofDetail: "decramastic" };
    case "concrete": return { existingRoof: "concrete-tile", existingRoofDetail: null };
    default: return { existingRoof: "unknown", existingRoofDetail: null };
  }
}

function measurementUnit(group: Measurement["group"]): RoofProjectMeasurement["unit"] {
  if (group === "roofAreas") return "m2";
  if (group === "downpipes") return "each";
  return "lm";
}

function mapMeasurements(measurements: Measurement[]): RoofProjectMeasurement[] {
  return measurements
    .filter((item) => item.value !== null && Number.isFinite(item.value) && item.value >= 0)
    .map((item) => ({
      id: item.id,
      group: groupMap[item.group],
      label: item.label,
      value: item.value as number,
      unit: measurementUnit(item.group),
      quantity: item.quantity,
      basis: item.basis,
      pitchDegrees: item.pitch,
      source: "detailed-estimator"
    }));
}

export function sharedProjectFromDetailedProject(
  detailed: Project,
  estimate?: EstimateSuccess | null,
  previous?: RoofProject | null,
  originatingPath = "/tools/detailed-roof-estimator"
): RoofProject {
  const shared = previous ? structuredClone(previous) : createRoofProject("detailed-estimate");
  const existing = existingRoof(detailed);
  const complexities = new Set(shared.geometry.complexities);
  if (detailed.storeys === 2) complexities.add("two-storey");
  else complexities.delete("two-storey");
  if (detailed.site === "difficult") complexities.add("difficult-access");
  else complexities.delete("difficult-access");

  shared.entryPoint = shared.entryPoint === "unknown" ? "detailed-estimate" : shared.entryPoint;
  shared.projectType = detailed.projectType === "new" || detailed.projectType === "reroof" ? detailed.projectType : "unknown";
  shared.existingRoof = existing.existingRoof;
  shared.existingRoofDetail = existing.existingRoofDetail;
  shared.desiredRoof = desiredRoof(detailed.roofSystem);
  shared.geometry.exactPitchDegrees = Number.isFinite(detailed.pitch) ? detailed.pitch : null;
  shared.geometry.storeys = detailed.storeys;
  shared.geometry.complexities = [...complexities];
  shared.geometry.roofAreaM2 = estimate?.roofArea ?? shared.geometry.roofAreaM2;
  if (estimate?.roofArea) shared.geometry.areaSource = "roof-area";
  shared.measurements = mapMeasurements(detailed.measurements);
  shared.context = {
    currentTool: "detailed-estimate",
    currentStep: String(detailed.step),
    originatingPath: shared.context.originatingPath || originatingPath
  };

  if (estimate) {
    const registry = getEstimatorRateCardRecord(estimate.rateCardId);
    shared.estimate = {
      low: estimate.total.min,
      high: estimate.total.max,
      gstBasis: "incl",
      detailLevel: "measured",
      quantityModelVersion: `detailed-estimator-v${estimate.version}`,
      rateCardId: estimate.rateCardId,
      rateCardVersion: registry?.methodologyVersion ?? "unregistered",
      assumptions: estimate.assumptions,
      exclusions: estimate.exclusions,
      createdAt: estimate.createdAt
    };
  }

  shared.updatedAt = new Date().toISOString();
  return shared;
}
