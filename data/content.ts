import { OBSERVATIONS } from "@/data/observations";
import type { PricingObservation } from "@/data/types";
import type { SourceEntry } from "@/components/evidence/Sources";

const byId = new Map(OBSERVATIONS.map((o) => [o.id, o] as const));

export function observationsByIds(ids: string[]): PricingObservation[] {
  // This helper is intentionally strict: anything requested for a published
  // evidence block must exist and already be verified. Research-only records
  // remain available through OBSERVATIONS but cannot silently leak to a page.
  return ids.map((id) => {
    const observation = byId.get(id);
    if (!observation) throw new Error(`Unknown pricing observation: ${id}`);
    if (observation.status !== "verified") {
      throw new Error(`Pricing observation ${id} is ${observation.status}; published evidence requires verified status.`);
    }
    return observation;
  });
}

export function observationSourceEntries(ids: string[]): SourceEntry[] {
  const seen = new Set<string>();
  return observationsByIds(ids).flatMap((o) => {
    if (seen.has(o.sourceUrl)) return [];
    seen.add(o.sourceUrl);
    return [{
      name: o.sourceName,
      url: o.sourceUrl,
      tier: o.evidenceTier,
      type: o.sourceType,
      date: o.sourceDate,
      note: o.gstBasis === "unknown" ? "GST treatment not stated by source" : `GST ${o.gstBasis === "incl" ? "included" : "excluded"}`
    } satisfies SourceEntry];
  });
}

export function observationCount(ids: string[]): number {
  return observationsByIds(ids).length;
}

export function formatObservationPrice(o: PricingObservation): string {
  const money = (n: number) => `$${n.toLocaleString("en-NZ", { maximumFractionDigits: 2 })}`;
  const low = o.amountLow ?? o.amountExact;
  const high = o.amountHigh ?? o.amountExact;
  const range = low != null && high != null && low !== high ? `${money(low)}–${money(high)}` : low != null ? money(low) : high != null ? money(high) : "—";
  const unit = o.unit === "m2" ? "/m²" : o.unit === "lm" ? "/lm" : o.unit === "week" ? "/week" : o.unit === "each" ? "/item" : "/job";
  return `${range}${unit}`;
}

export function gstLabel(o: PricingObservation): string {
  return o.gstBasis === "incl" ? "incl GST" : o.gstBasis === "excl" ? "excl GST" : "GST not stated";
}

export function evidenceRows(ids: string[]) {
  return observationsByIds(ids).map((o) => ({
    label: o.item,
    range: formatObservationPrice(o),
    basis: `${o.priceBasis.replaceAll("-", " ")} · ${gstLabel(o)}`,
    notes: `${o.region} · ${o.sourceName}`
  }));
}
