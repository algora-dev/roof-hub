export const NZ_GST_RATE = 0.15;

export const QUOTE_SCOPE_ITEMS = Object.freeze([
  { id: 'removal-disposal', label: 'Existing roof removal and disposal', applies: ['reroof'], reference: 'included' },
  { id: 'access-scaffold', label: 'Scaffold, edge protection or assessed roof access', applies: ['new', 'reroof', 'unknown'], reference: 'included' },
  { id: 'underlay', label: 'Roof underlay', applies: ['new', 'reroof', 'unknown'], reference: 'included' },
  { id: 'flashings', label: 'New flashings required by the roof scope', applies: ['new', 'reroof', 'unknown'], reference: 'included' },
  { id: 'gutters-downpipes', label: 'Gutters and downpipes', applies: ['new', 'reroof', 'unknown'], reference: 'excluded' },
  { id: 'structural-repairs', label: 'Timber, framing or structural repairs', applies: ['new', 'reroof', 'unknown'], reference: 'excluded' },
  { id: 'asbestos', label: 'Asbestos testing or specialist removal', applies: ['reroof', 'unknown'], reference: 'excluded' },
  { id: 'consents-engineering', label: 'Consent, design or engineering fees', applies: ['new', 'reroof', 'unknown'], reference: 'excluded' }
]);

const validGst = new Set(['incl', 'excl', 'unknown']);
const validMatch = new Set(['same', 'different', 'unknown']);

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

export function normalizeQuoteAmount(amount, gstBasis) {
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (!validGst.has(gstBasis) || gstBasis === 'unknown') return null;
  return roundMoney(gstBasis === 'incl' ? amount : amount * (1 + NZ_GST_RATE));
}

/**
 * Return every defensible incl-GST interpretation of the amount on the quote.
 * Unknown GST is no longer a dead end: RoofHub shows both scenarios rather than
 * pretending it knows which tax basis the contractor used.
 */
export function quoteAmountScenarios(amount, gstBasis) {
  if (!Number.isFinite(amount) || amount <= 0) return [];
  const basis = validGst.has(gstBasis) ? gstBasis : 'unknown';
  if (basis === 'incl') {
    return [{ id: 'gst-included', label: 'GST included', amountInclGst: roundMoney(amount) }];
  }
  if (basis === 'excl') {
    return [{ id: 'plus-gst', label: 'Plus 15% GST', amountInclGst: roundMoney(amount * (1 + NZ_GST_RATE)) }];
  }
  return [
    { id: 'if-included', label: 'If the quoted amount includes GST', amountInclGst: roundMoney(amount) },
    { id: 'if-extra', label: 'If GST is extra', amountInclGst: roundMoney(amount * (1 + NZ_GST_RATE)) }
  ];
}

export function scopeState(itemId, knownInclusions = [], knownExclusions = []) {
  if (knownInclusions.includes(itemId)) return 'included';
  if (knownExclusions.includes(itemId)) return 'excluded';
  return 'unknown';
}

export function applicableScope(projectType = 'unknown') {
  return QUOTE_SCOPE_ITEMS.filter(item => item.applies.includes(projectType));
}

export function expectedReferenceScope(projectType = 'unknown') {
  return Object.fromEntries(applicableScope(projectType).map(item => [item.id, item.reference]));
}

export function scopeAssessment({ projectType = 'unknown', knownInclusions = [], knownExclusions = [] }) {
  const expected = expectedReferenceScope(projectType);
  const differences = [];
  const unknown = [];
  const matched = [];

  for (const item of applicableScope(projectType)) {
    const state = scopeState(item.id, knownInclusions, knownExclusions);
    if (state === 'unknown') {
      unknown.push(item.id);
      continue;
    }
    if (state === expected[item.id]) matched.push(item.id);
    else differences.push({ id: item.id, quote: state, reference: expected[item.id] });
  }
  return { expected, differences, unknown, matched };
}

function amountPosition(amountIncl, reference) {
  if (!Number.isFinite(amountIncl) || !reference || !Number.isFinite(reference.low) || !Number.isFinite(reference.high)) return 'not-comparable';
  if (amountIncl < reference.low) return 'below-range';
  if (amountIncl > reference.high) return 'above-range';
  return 'within-range';
}

export function compareRoofingQuote(input) {
  const quotedAmount = Number.isFinite(input?.quotedAmount) ? input.quotedAmount : null;
  const gstBasis = validGst.has(input?.gstBasis) ? input.gstBasis : 'unknown';
  const productMatch = validMatch.has(input?.productMatch) ? input.productMatch : 'unknown';
  const reference = input?.referenceEstimate ?? null;
  const projectType = ['new', 'reroof', 'unknown'].includes(input?.projectType) ? input.projectType : 'unknown';
  const knownInclusions = Array.isArray(input?.knownInclusions) ? [...new Set(input.knownInclusions)] : [];
  const knownExclusions = Array.isArray(input?.knownExclusions) ? [...new Set(input.knownExclusions)] : [];
  const scope = scopeAssessment({ projectType, knownInclusions, knownExclusions });
  const gstScenarios = quoteAmountScenarios(quotedAmount, gstBasis).map(scenario => ({
    ...scenario,
    position: amountPosition(scenario.amountInclGst, reference)
  }));
  const amountIncl = normalizeQuoteAmount(quotedAmount, gstBasis);
  const reasons = [];

  let comparability = 'good';
  if (!reference) {
    comparability = 'not-directly-comparable';
    reasons.push('RoofHub needs a project estimate for this roof before it can compare the headline price. Use a saved Quick Estimate, Detailed Estimate or create a quick baseline in Quote Checker.');
  }
  if (quotedAmount === null || quotedAmount <= 0) {
    comparability = 'not-directly-comparable';
    reasons.push('Enter the quoted amount before comparing price.');
  }
  if (productMatch === 'different') {
    comparability = 'not-directly-comparable';
    reasons.push('The quote is for a different roofing product or system from the RoofHub project range. Build a matching RoofHub baseline before comparing price.');
  }

  if (comparability !== 'not-directly-comparable') {
    if (gstBasis === 'unknown') reasons.push('GST is not confirmed, so RoofHub shows both possible incl-GST totals instead of blocking the comparison.');
    if (productMatch === 'unknown') reasons.push('Confirm that the quote and RoofHub project use the same roofing product or system.');
    if (scope.unknown.length) reasons.push('Some important quote inclusions are still unknown.');
    if (scope.differences.length) reasons.push('The quote and RoofHub reference range do not currently cover the same scope.');
    if (gstBasis === 'unknown' || productMatch === 'unknown' || scope.unknown.length || scope.differences.length) comparability = 'partial';
  }

  const scenarioPositions = [...new Set(gstScenarios.map(item => item.position).filter(value => value !== 'not-comparable'))];
  const comparisonStatus = comparability === 'not-directly-comparable' || scenarioPositions.length !== 1
    ? 'not-comparable'
    : scenarioPositions[0];
  const gstAffectsPosition = gstBasis === 'unknown' && scenarioPositions.length > 1;

  return {
    quotedAmount,
    gstBasis,
    amountInclGst: amountIncl,
    gstScenarios,
    gstAffectsPosition,
    productMatch,
    projectType,
    comparability,
    comparisonStatus,
    reasons,
    scope,
    referenceEstimate: reference
  };
}

export function formatNzd(value) {
  return Number.isFinite(value) ? new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 }).format(value) : '';
}
