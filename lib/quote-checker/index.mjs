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

export function normalizeQuoteAmount(amount, gstBasis) {
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (!validGst.has(gstBasis) || gstBasis === 'unknown') return null;
  return Math.round((gstBasis === 'incl' ? amount : amount * (1 + NZ_GST_RATE)) * 100) / 100;
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
  if (!reference || !Number.isFinite(reference.low) || !Number.isFinite(reference.high)) return 'not-comparable';
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
  const amountIncl = normalizeQuoteAmount(quotedAmount, gstBasis);
  const reasons = [];

  let comparability = 'good';
  if (!reference) {
    comparability = 'not-directly-comparable';
    reasons.push('RoofHub does not have an approved or review-enabled project range to compare with yet.');
  }
  if (quotedAmount === null || quotedAmount <= 0) {
    comparability = 'not-directly-comparable';
    reasons.push('Enter the quoted amount before comparing price.');
  }
  if (gstBasis === 'unknown') {
    comparability = 'not-directly-comparable';
    reasons.push('The quote GST basis is unknown, so RoofHub cannot put both totals on the same tax basis.');
  }
  if (productMatch === 'different') {
    comparability = 'not-directly-comparable';
    reasons.push('The quote is for a different roofing product or system from the RoofHub project range.');
  }

  if (comparability !== 'not-directly-comparable') {
    if (productMatch === 'unknown') reasons.push('Confirm that the quote and RoofHub project use the same roofing product or system.');
    if (scope.unknown.length) reasons.push('Some important quote inclusions are still unknown.');
    if (scope.differences.length) reasons.push('The quote and RoofHub reference range do not currently cover the same scope.');
    if (productMatch === 'unknown' || scope.unknown.length || scope.differences.length) comparability = 'partial';
  }

  const comparisonStatus = comparability === 'not-directly-comparable'
    ? 'not-comparable'
    : amountPosition(amountIncl, reference);

  return {
    quotedAmount,
    gstBasis,
    amountInclGst: amountIncl,
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
