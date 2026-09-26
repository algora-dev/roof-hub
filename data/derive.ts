import type { GstBasis, PriceUnit, PricingObservation, RateBasis, RoofHubRate } from "./types";

export const METHODOLOGY_VERSION = "2026.09-v1";

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
 * Derives a low/high range from observations: low = minimum observed low/exact,
 * high = maximum observed high/exact. Observations flagged provisional/stale/excluded
 * or with unknown GST never contribute to published ranges. n is kept in the rate's
 * source list so every figure stays traceable.
 */
export function deriveRate({
  observations, key, label, basis, unit, gstBasis, reviewedAt, notes
}: DeriveRateInput): RoofHubRate {
  const usable = observations.filter(
    (o) => o.status === "verified" && o.unit === unit && o.gstBasis === gstBasis
  );
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
