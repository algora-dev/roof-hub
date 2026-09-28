import type { GstBasis, PriceUnit, PricingObservation, RateBasis, RoofHubRate } from "./types";

export const METHODOLOGY_VERSION = "2026.09-v2";

export type DeriveRateInput = {
  /** Pre-filtered observations for this rate (caller selects system/basis/category). */
  observations: PricingObservation[];
  key: string;
  label: string;
  basis: RateBasis;
  unit: PriceUnit;
  /** Published ranges only mix observations with a known, matching GST basis. */
  gstBasis: GstBasis;
  reviewedAt: string;
  notes?: string;
};

/**
 * Derives an observed span, NOT a statistically typical range, from observations: low = minimum observed low/exact,
 * high = maximum observed high/exact. Observations flagged provisional/stale/excluded
 * or with unknown GST never contribute to published ranges. n is kept in the rate's
 * source list so every figure stays traceable.
 */
export function deriveRate({
  observations, key, label, basis, unit, gstBasis, reviewedAt, notes
}: DeriveRateInput): RoofHubRate {
  if (gstBasis === "unknown") throw new Error("deriveRate: unknown GST cannot produce a GST-normalised range");
  const usable = observations.filter(
    (o) => o.status === "verified" && o.unit === unit && o.gstBasis === gstBasis
      && o.priceContext !== "historical-guide" && o.priceContext !== "research-only"
      && o.rangeEligible !== false
  );
  const signatures = new Set(usable.map(o => [o.category, o.roofSystem ?? "unspecified", o.priceBasis, o.areaBasis ?? "unknown"].join("|")));
  if (signatures.size > 1) throw new Error(`deriveRate: mixed price scopes or area bases for "${key}"`);
  if ((unit === "m2" || unit === "m2-week") && usable.some(o => !o.areaBasis || o.areaBasis === "unknown")) {
    throw new Error(`deriveRate: area basis must be known for "${key}"`);
  }
  const expected = basis === "material" ? "material-only" : basis === "labour" ? "labour-only" : basis === "supply-install" ? "supply-install" : null;
  if (expected && usable.some(o => o.priceBasis !== expected)) throw new Error(`deriveRate: rate basis does not match observations for "${key}"`);
  if (basis === "removal" && usable.some(o => o.category !== "removal")) throw new Error("deriveRate: removal requires removal observations");
  if (basis === "access" && usable.some(o => o.category !== "scaffold")) throw new Error("deriveRate: access requires scaffold observations");
  if (usable.some(o => [o.amountLow, o.amountHigh, o.amountExact].some(v => v !== undefined && (!Number.isFinite(v) || v < 0)))) {
    throw new Error("deriveRate: invalid numeric observation");
  }
  if (usable.some(o => o.amountLow !== undefined && o.amountHigh !== undefined && o.amountLow > o.amountHigh)) {
    throw new Error("deriveRate: observation low exceeds high");
  }
  if (usable.some(o => o.amountExact === undefined && (o.amountLow === undefined || o.amountHigh === undefined))) {
    throw new Error("deriveRate: a complete range or exact price is required");
  }
  const lows = usable
    .map((o) => o.amountLow ?? o.amountExact)
    .filter((v): v is number => typeof v === "number");
  const highs = usable
    .map((o) => o.amountHigh ?? o.amountExact)
    .filter((v): v is number => typeof v === "number");
  if (lows.length === 0 && highs.length === 0) {
    throw new Error(`deriveRate: no usable observations for "${key}" (unit=${unit}, gst=${gstBasis})`);
  }
  return {
    key,
    label,
    low: lows.length ? Math.min(...lows) : Math.min(...highs),
    high: highs.length ? Math.max(...highs) : Math.max(...lows),
    unit,
    basis,
    gstBasis,
    reviewedAt,
    methodologyVersion: METHODOLOGY_VERSION,
    sourceObservationIds: usable.map((o) => o.id),
    notes
  };
}

/** Formats an NZD range for display, e.g. "$45–$65 / m²". */
export function formatRate(rate: { low: number; high: number; unit: string; gstBasis: string }): string {
  const gst = rate.gstBasis === "incl" ? " incl GST" : rate.gstBasis === "excl" ? " excl GST" : "";
  const unit = rate.unit === "m2" ? "m²" : rate.unit === "lm" ? "linear m" : rate.unit;
  return `$${Math.round(rate.low)}–$${Math.round(rate.high)} / ${unit}${gst}`;
}
