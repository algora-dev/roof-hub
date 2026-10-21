import type { RoofSystem } from "@/data/types";

export type EstimatorRateCardStatus = "draft" | "approved" | "retired";
export type EstimatorProductCoverage = "configured" | "not-configured";

export type EstimatorRateCardRecord = {
  id: string;
  schemaVersion: 1;
  methodologyVersion: string;
  status: EstimatorRateCardStatus;
  reviewedAt: string;
  sourceTaxConfirmed: boolean;
  productCoverage: Record<RoofSystem, EstimatorProductCoverage>;
  evidenceObservationIds: string[];
  notes: string[];
};

const CURRENT_DETAILED_RATE_CARD: EstimatorRateCardRecord = {
  id: "roofhub-nz-draft-2026-09-22",
  schemaVersion: 1,
  methodologyVersion: "2026.10-foundation-v1",
  status: "draft",
  reviewedAt: "2026-10-20",
  sourceTaxConfirmed: false,
  productCoverage: {
    corrugate: "configured",
    "five-rib": "configured",
    "pressed-metal-tile": "configured",
    "tray-standing-seam": "configured",
    membrane: "not-configured"
  },
  evidenceObservationIds: [],
  notes: [
    "This registry describes estimator approval state only. Price values remain owned by the deterministic estimator rate card.",
    "The current detailed rate card remains a draft and is not approved for a public quick-estimate result.",
    "Membrane requires an approved calculation pathway before it can be priced by a public RoofHub estimator."
  ]
};

export const ESTIMATOR_RATE_CARD_REGISTRY: Readonly<Record<string, EstimatorRateCardRecord>> = Object.freeze({
  [CURRENT_DETAILED_RATE_CARD.id]: CURRENT_DETAILED_RATE_CARD
});

export function getEstimatorRateCardRecord(id: string): EstimatorRateCardRecord | null {
  return ESTIMATOR_RATE_CARD_REGISTRY[id] ?? null;
}

export function isRateCardApprovedForPublicEstimate(id: string): boolean {
  const record = getEstimatorRateCardRecord(id);
  return Boolean(record && record.status === "approved" && record.sourceTaxConfirmed);
}

export function assertRateCardApprovedForPublicEstimate(id: string): EstimatorRateCardRecord {
  const record = getEstimatorRateCardRecord(id);
  if (!record) throw new Error(`Unknown RoofHub estimator rate card: ${id}`);
  if (record.status !== "approved" || !record.sourceTaxConfirmed) {
    throw new Error(`RoofHub estimator rate card ${id} is not approved for public estimating.`);
  }
  return record;
}
