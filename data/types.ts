/** Shared RoofHub data model. Raw observations are the source of truth; derived rates
 *  are computed from them so methodology can evolve without losing provenance. */

export type ObservationCategory =
  | "roof-covering"
  | "flashing"
  | "underlay"
  | "removal"
  | "scaffold"
  | "labour"
  | "other";

export type RoofSystem = "pressed-metal-tile" | "corrugate" | "five-rib" | "tray-standing-seam";

export type PriceUnit = "m2" | "lm" | "each" | "week" | "job";
export type PriceBasis = "material-only" | "labour-only" | "supply-install" | "complete-project";
export type GstBasis = "incl" | "excl" | "unknown";
export type SourceType =
  | "manufacturer"
  | "supplier"
  | "government"
  | "technical"
  | "roofer"
  | "scaffolder"
  | "other";
export type EvidenceTier = "primary" | "market" | "editorial";
export type ObservationStatus = "verified" | "provisional" | "stale" | "excluded";

/** A raw pricing observation captured from a public source. Never hand-edited into pages. */
export type PricingObservation = {
  id: string;
  category: ObservationCategory;
  roofSystem?: RoofSystem;
  item: string;
  amountLow?: number;
  amountHigh?: number;
  amountExact?: number;
  unit: PriceUnit;
  priceBasis: PriceBasis;
  gstBasis: GstBasis;
  region: string;
  /** ISO date RoofHub observed/captured this. */
  observedAt: string;
  /** Publication/update date on the source page, if visible. */
  sourceDate?: string;
  sourceUrl: string;
  sourceName: string;
  sourceType: SourceType;
  evidenceTier: EvidenceTier;
  status: ObservationStatus;
  notes?: string;
};

export type RateBasis = "material" | "labour" | "supply-install" | "removal" | "access";

/** A RoofHub-published range derived from a set of observations. */
export type RoofHubRate = {
  key: string;
  label: string;
  low: number;
  high: number;
  unit: PriceUnit;
  basis: RateBasis;
  gstBasis: GstBasis;
  reviewedAt: string;
  methodologyVersion: string;
  sourceObservationIds: string[];
  notes?: string;
};

/** A real project example captured from a public source. */
export type ProjectObservation = {
  id: string;
  sourceUrl: string;
  sourceName: string;
  sourceType: SourceType;
  evidenceTier: EvidenceTier;
  observedAt: string;
  sourceDate?: string;
  region: string;
  roofAreaM2?: number;
  roofSystem?: RoofSystem;
  newOrReroof: "new" | "reroof";
  existingRoof?: string;
  storeys?: number;
  pitch?: string;
  totalPrice?: number;
  perM2?: number;
  includesScaffold: boolean;
  includesRemoval: boolean;
  gstBasis: GstBasis;
  confidence: "high" | "medium" | "low";
  notes?: string;
};

export const SYSTEM_LABELS: Record<RoofSystem, string> = {
  corrugate: "Corrugated steel",
  "five-rib": "Five-rib / trapezoidal",
  "pressed-metal-tile": "Pressed metal tile",
  "tray-standing-seam": "Tray / standing seam"
};
