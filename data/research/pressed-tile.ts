import raw from './pressed-tile.json';
import { OBSERVATIONS } from '../observations';
import { getSource } from './index';

export type TileProfile = {
  id: string; name: string; sourceId: string; coverLengthMm: number; coverWidthMm: number;
  panelsPerM2: number; minimumPitch: number; finish: string; weight: string; support: string;
  presetEligible: boolean; note: string;
};
export type TilePriceRow = { observationId: string; sourceIds: string[]; label: string; scope: string; note: string };
export type TileMarket = { reviewedAt: string; methodologyVersion: string; profiles: TileProfile[];
  priceRows: TilePriceRow[]; held: { name: string; sourceIds: string[]; reason: string }[];
  newProjectIds: string[]; replacementProjectIds: string[] };
export const PRESSED_TILE = raw as TileMarket;
export type TileWorksheetProfile = TileProfile & { sourceUrl: string; reviewedAt: string };
export function tileWorksheetProfiles(): TileWorksheetProfile[] {
  return PRESSED_TILE.profiles.map(p => ({ ...p, sourceUrl: getSource(p.sourceId).url, reviewedAt: PRESSED_TILE.reviewedAt }));
}
export function tilePrice(id: string) {
  const meta = PRESSED_TILE.priceRows.find(row => row.observationId === id);
  const observation = OBSERVATIONS.find(o => o.id === id);
  if (!meta || !observation || observation.status !== 'verified' || observation.unit !== 'm2' || !['supply-install','complete-project'].includes(observation.priceBasis)) {
    throw new Error(`Unverified pressed-tile guide price: ${id}`);
  }
  const low = observation.amountExact ?? observation.amountLow;
  const high = observation.amountExact ?? observation.amountHigh;
  if (typeof low !== 'number' || typeof high !== 'number' || !Number.isFinite(low) || !Number.isFinite(high) || low <= 0 || high < low) {
    throw new Error(`Invalid pressed-tile guide amount: ${id}`);
  }
  return { meta, observation };
}
