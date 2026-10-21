import { measureQuickRoof, priceQuickEstimate, estimateDetailLevel } from '../quick-estimate/index.mjs';
import { newProject, newEntry } from '../../public/roofhub-estimator/src/core/model.mjs';
import { calculateEstimate } from '../../public/roofhub-estimator/src/core/pricing.mjs';
import { DEFAULT_RATE_CARD } from '../../public/roofhub-estimator/src/core/rates.mjs';

const estimatorModule = { newProject, newEntry, calculateEstimate, DEFAULT_RATE_CARD };

function inputFromProject(project, desiredRoofOverride = null) {
  const geometry = project?.geometry ?? {};
  let areaInputM2 = null;
  let areaSource = 'unknown';
  if (Number.isFinite(geometry.roofAreaM2)) {
    areaInputM2 = geometry.roofAreaM2;
    areaSource = 'roof-area';
  } else if (Number.isFinite(geometry.footprintAreaM2)) {
    areaInputM2 = geometry.footprintAreaM2;
    areaSource = 'building-footprint';
  } else if (Number.isFinite(geometry.floorAreaM2)) {
    areaInputM2 = geometry.floorAreaM2;
    areaSource = 'total-floor-area';
  }
  return {
    projectType: project?.projectType ?? 'unknown',
    existingRoof: project?.existingRoofDetail === 'decramastic' ? 'decramastic' : project?.existingRoof ?? 'unknown',
    roofShape: geometry.roofShape ?? 'unknown',
    sizeBand: geometry.sizeBand ?? 'unknown',
    areaInputM2,
    areaSource,
    pitchBand: geometry.pitchBand ?? 'unknown',
    exactPitchDegrees: Number.isFinite(geometry.exactPitchDegrees) ? geometry.exactPitchDegrees : null,
    desiredRoof: desiredRoofOverride ?? project?.desiredRoof ?? 'undecided',
    storeys: geometry.storeys ?? null,
    complexities: Array.isArray(geometry.complexities) ? geometry.complexities : []
  };
}

export function estimateProjectForAssistant(project, desiredRoofOverride = null, allowReviewPricing = false) {
  const input = inputFromProject(project, desiredRoofOverride);
  if (input.desiredRoof === 'undecided') {
    return { ok: false, reason: 'A roof product is needed before RoofHub can calculate a project range.', needs: ['desired roof product'] };
  }
  const measurements = measureQuickRoof(input);
  const result = priceQuickEstimate(input, measurements, input.desiredRoof, estimatorModule);
  const publicApproved = Boolean(result.approved && DEFAULT_RATE_CARD.approved);
  const exposable = publicApproved || allowReviewPricing;
  const estimate = result.low !== null && result.high !== null && exposable
    ? {
        low: result.low,
        high: result.high,
        gstBasis: 'incl',
        detailLevel: estimateDetailLevel(input),
        quantityModelVersion: measurements.modelVersion,
        rateCardId: result.rateCardId,
        rateCardVersion: DEFAULT_RATE_CARD.updatedAt,
        assumptions: result.assumptions,
        exclusions: result.exclusions,
        createdAt: new Date().toISOString()
      }
    : null;
  return {
    ok: true,
    input,
    measurementModelVersion: measurements.modelVersion,
    result: {
      product: result.product,
      status: result.status,
      low: exposable ? result.low : null,
      high: exposable ? result.high : null,
      approved: publicApproved,
      reviewOnly: !publicApproved && allowReviewPricing,
      publicationVersion: publicApproved && DEFAULT_RATE_CARD.publication?.version ? DEFAULT_RATE_CARD.publication.version : null,
      detailLevel: estimateDetailLevel(input),
      missing: result.missing,
      assumptions: result.assumptions,
      exclusions: result.exclusions,
      compatibilityMessage: result.compatibility?.message ?? ''
    },
    projectEstimate: estimate,
    pricingAvailable: exposable
  };
}
