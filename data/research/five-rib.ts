import marketJson from './five-rib.json';
import { OBSERVATIONS } from '../observations';
import { normaliseListing } from '../../lib/corrugated-maths';
import type { CorrugatedListing, SheetBudgetPreset } from './corrugated';

export type FiveRibProfile = {
  id: string; manufacturer: string; profile: string; cover: string; overall: string;
  thickness: string; pitch: string; note: string; sources: string[];
};
export type FiveRibMarket = {
  reviewedAt: string; methodologyVersion: string; profiles: FiveRibProfile[];
  retail: CorrugatedListing[];
  held: { supplierKey: string; name: string; sourceIds: string[]; reason: string }[];
};
export const FIVE_RIB_MARKET = marketJson as FiveRibMarket;
export function fiveRibListing(id: string) {
  const meta = FIVE_RIB_MARKET.retail.find(row => row.observationId === id);
  const observation = OBSERVATIONS.find(row => row.id === id);
  if (!meta || !observation) throw new Error(`Unknown five-rib listing: ${id}`);
  return { meta, observation, calculated: normaliseListing(observation, meta) };
}
export function fiveRibBudgetPresets(): SheetBudgetPreset[] {
  // Only this source supports a tax-inclusive area conversion. Its cover stays conditional.
  // A fixed-sheet price must not become a continuous-length purchase preset.
  const { meta, observation, calculated } = fiveRibListing('lr-18');
  if (observation.gstBasis === 'unknown' || meta.coverMm === null || meta.fixedLengthM !== null || calculated.inclGstPerM2 === null) {
    throw new Error('Incomplete five-rib budget example.');
  }
  return [{ id: observation.id, label: 'Bitz & Piecez: five-rib, conditional seller cover',
    pricePerLm: calculated.originalPerLm, gstBasis: observation.gstBasis, coverMm: meta.coverMm,
    minimumOrderLm: meta.minimumOrderLm ?? 0, sourceUrl: observation.sourceUrl,
    sourceName: observation.sourceName, reviewedAt: observation.lastCheckedAt!,
    note: `${meta.coverNote} ${meta.note}` }];
}
