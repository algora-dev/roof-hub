import type { PricingObservation } from '../data/types';

export type CoverBasis = 'confirmed' | 'approximate' | 'archived-seller' | 'unknown';
export type ListingMetadata = {
  coverMm: number | null;
  coverBasis: CoverBasis;
  fixedLengthM: number | null;
};
export type NormalisedListing = {
  originalPerLm: number;
  inclGstPerLm: number | null;
  inclGstPerM2: number | null;
  conditionalCover: boolean;
};
function positive(value: number, label: string): number {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} must be a positive, finite number.`);
  return value;
}
/** Unknown tax or cover stays unknown. This function never estimates a market range. */
export function normaliseListing(observation: PricingObservation, meta: ListingMetadata): NormalisedListing {
  if (observation.status !== 'verified' || observation.priceBasis !== 'material-only') {
    throw new Error('Only checked material-only observations can be converted.');
  }
  const amount = positive(observation.amountExact ?? NaN, 'Listed price');
  if (observation.unit !== 'lm' && observation.unit !== 'each') throw new Error('Unsupported listing unit.');
  const originalPerLm = observation.unit === 'lm' ? amount : amount / positive(meta.fixedLengthM ?? NaN, 'Sheet length');
  if (!['incl', 'excl', 'unknown'].includes(observation.gstBasis)) throw new Error('Invalid GST basis.');
  const inclGstPerLm = observation.gstBasis === 'unknown' ? null : originalPerLm * (observation.gstBasis === 'excl' ? 1.15 : 1);
  if (!['confirmed', 'approximate', 'archived-seller', 'unknown'].includes(meta.coverBasis)) throw new Error('Invalid cover basis.');
  const hasCover = meta.coverBasis !== 'unknown' && meta.coverMm !== null;
  const inclGstPerM2 = inclGstPerLm === null || !hasCover ? null : inclGstPerLm / (positive(meta.coverMm!, 'Effective cover') / 1000);
  for (const n of [originalPerLm, inclGstPerLm, inclGstPerM2]) if (n !== null && !Number.isFinite(n)) throw new Error('Conversion exceeds the supported numeric range.');
  return { originalPerLm, inclGstPerLm, inclGstPerM2, conditionalCover: hasCover && meta.coverBasis !== 'confirmed' };
}
export type SheetBudgetInput = {
  area: number; basis: 'actual' | 'plan'; pitchDegrees: number;
  pricePerLm: number; gstBasis: 'incl' | 'excl'; coverMm: number;
  extraPercent: number; minimumOrderLm: number;
};
/** Continuous-length allowance only. This is deliberately not a sheet cutting schedule. */
export function sheetBudget(input: SheetBudgetInput) {
  positive(input.area, 'Roof area'); positive(input.pricePerLm, 'Price'); positive(input.coverMm, 'Effective cover');
  if (input.basis !== 'actual' && input.basis !== 'plan') throw new Error('Choose plan or actual area.');
  if (input.gstBasis !== 'incl' && input.gstBasis !== 'excl') throw new Error('Confirm whether your price includes GST.');
  if (!Number.isFinite(input.extraPercent) || input.extraPercent < 0 || input.extraPercent > 100) throw new Error('Extra material allowance must be between 0% and 100%.');
  if (!Number.isFinite(input.minimumOrderLm) || input.minimumOrderLm < 0) throw new Error('Minimum order cannot be negative.');
  if (input.basis === 'plan' && (!Number.isFinite(input.pitchDegrees) || input.pitchDegrees < 0 || input.pitchDegrees >= 90)) throw new Error('Pitch must be between 0° and less than 90°.');
  const surfaceM2 = input.basis === 'actual' ? input.area : input.area / Math.cos(input.pitchDegrees * Math.PI / 180);
  const coverageLm = surfaceM2 / (input.coverMm / 1000);
  const withAllowanceLm = coverageLm * (1 + input.extraPercent / 100);
  const billedLm = Math.max(withAllowanceLm, input.minimumOrderLm);
  const inclGstPerLm = input.pricePerLm * (input.gstBasis === 'excl' ? 1.15 : 1);
  const totalInclGst = billedLm * inclGstPerLm;
  if (![surfaceM2, coverageLm, withAllowanceLm, billedLm, inclGstPerLm, totalInclGst].every(Number.isFinite)) throw new Error('Calculation exceeds the supported numeric range.');
  return { surfaceM2, coverageLm, withAllowanceLm, billedLm, inclGstPerLm, totalInclGst,
    minimumApplies: input.minimumOrderLm > withAllowanceLm };
}
export function sheetCount(widthMetres: number, coverMm: number): number {
  positive(widthMetres, 'Plane width'); positive(coverMm, 'Effective cover');
  const count = Math.ceil(widthMetres / (coverMm / 1000));
  if (!Number.isSafeInteger(count)) throw new Error('Sheet count exceeds the supported numeric range.');
  return count;
}

export type SheetQuote = Pick<SheetBudgetInput, 'pricePerLm' | 'gstBasis' | 'coverMm' | 'minimumOrderLm'>;
export type SheetComparisonInput = Pick<SheetBudgetInput, 'area' | 'basis' | 'pitchDegrees' | 'extraPercent'> & {
  quoteA: SheetQuote; quoteB: SheetQuote;
};
/** Compare only confirmed sheet inputs. These totals never rank complete roof systems. */
export function compareSheetQuotes(input: SheetComparisonInput) {
  const common = { area: input.area, basis: input.basis, pitchDegrees: input.pitchDegrees, extraPercent: input.extraPercent };
  const a = sheetBudget({ ...common, ...input.quoteA });
  const b = sheetBudget({ ...common, ...input.quoteB });
  const deltaInclGst = b.totalInclGst - a.totalInclGst;
  const aPerCoveredM2 = a.inclGstPerLm / (input.quoteA.coverMm / 1000);
  const bPerCoveredM2 = b.inclGstPerLm / (input.quoteB.coverMm / 1000);
  if (![deltaInclGst, aPerCoveredM2, bPerCoveredM2].every(Number.isFinite)) throw new Error('Comparison exceeds the supported numeric range.');
  return { a, b, deltaInclGst, aPerCoveredM2, bPerCoveredM2 };
}
