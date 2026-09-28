import marketJson from './corrugated.json';
import { OBSERVATIONS } from '../observations';
import { normaliseListing, type CoverBasis } from '../../lib/corrugated-maths';

export type CorrugatedListing = {
  observationId: string; supplierKey: string; sourceIds: string[];
  thickness: string; finish: string; coverMm: number | null; coverBasis: CoverBasis;
  coverNote: string; minimumOrderLm: number | null; fixedLengthM: number | null; note: string;
};
export type CorrugatedMarket = {
  reviewedAt: string; methodologyVersion: string; retail: CorrugatedListing[];
  held: { supplierKey: string; name: string; sourceIds: string[]; reason: string }[];
};
export const CORRUGATED_MARKET = marketJson as CorrugatedMarket;
export function corrugatedListing(id: string) {
  const meta = CORRUGATED_MARKET.retail.find(row => row.observationId === id);
  const observation = OBSERVATIONS.find(row => row.id === id);
  if (!meta || !observation) throw new Error(`Unknown corrugated listing: ${id}`);
  return { meta, observation, calculated: normaliseListing(observation, meta) };
}
export type SheetBudgetPreset = {
  id: string; label: string; pricePerLm: number; gstBasis: 'incl' | 'excl'; coverMm: number;
  minimumOrderLm: number; sourceUrl: string; sourceName: string; reviewedAt: string; note: string;
};
export function corrugatedBudgetPresets(): SheetBudgetPreset[] {
  // Source examples are deliberately separate. Neither is promoted to an estimator rate.
  return ['corr-rc-maxam-20260928', 'lr-18'].map(id => {
    const { meta, observation, calculated } = corrugatedListing(id);
    if (observation.gstBasis === 'unknown' || meta.coverMm === null || calculated.inclGstPerM2 === null) throw new Error('Incomplete budget example.');
    return { id, label: `${observation.sourceName}: ${meta.finish}`, pricePerLm: calculated.originalPerLm,
      gstBasis: observation.gstBasis, coverMm: meta.coverMm, minimumOrderLm: meta.minimumOrderLm ?? 0,
      sourceUrl: observation.sourceUrl, sourceName: observation.sourceName, reviewedAt: observation.lastCheckedAt!,
      note: `${meta.coverNote} ${meta.note}` };
  });
}
