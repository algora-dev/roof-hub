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
  /**
   * Non-null while an approved card is published as a provisional version (e.g. "V1").
   * Drives the visible "V1 RoofHub estimate" disclosure on public results.
   */
  publicationVersion: string | null;
  productCoverage: Record<RoofSystem, EstimatorProductCoverage>;
  evidenceObservationIds: string[];
  notes: string[];
};

const CURRENT_DETAILED_RATE_CARD: EstimatorRateCardRecord = {
  id: "roofhub-nz-draft-2026-09-22",
  schemaVersion: 1,
  methodologyVersion: "2026.10-foundation-v1",
  status: "approved",
  reviewedAt: "2026-10-21",
  sourceTaxConfirmed: true,
  publicationVersion: "V1",
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
    "Published as V1 indicative pricing on 2026-10-21 (owner decision) ahead of full NZ pricing calibration. The deterministic rate values are unchanged from the 2026-09-22 draft; results must carry the V1 disclosure while calibration continues.",
    "Membrane requires an approved calculation pathway before it can be priced by a public RoofHub estimator. Membrane stays unpriced; no membrane rate exists in the card."
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

/**
 * Publication version label (e.g. "V1") for an approved-but-provisional rate card,
 * or null for a fully calibrated card. UIs use this to render the V1 disclosure
 * next to public estimates instead of hard-coding version state.
 */
export function rateCardPublicationVersion(id: string): string | null {
  const record = getEstimatorRateCardRecord(id);
  return record?.publicationVersion ?? null;
}
