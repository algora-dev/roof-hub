import { PRODUCT_MIN_PITCH, productPitchAssessment } from './model.mjs';
import { measureSection } from './engine.mjs';

const productMap = {
  corrugate: 'corrugate',
  'five-rib': 'five-rib',
  'pressed-metal-tile': 'pressed-metal',
  'tray-standing-seam': 'tray'
};
const existingMap = {
  'long-run-metal': 'long-run',
  'pressed-metal-tile': 'pressed-metal',
  decramastic: 'decramastic',
  'concrete-tile': 'concrete',
  membrane: 'unknown',
  other: 'unknown',
  unknown: 'unknown'
};

function entry(module, group, label, value) {
  return module.newEntry(group, 'actual', { label, value, quantity: 1, pitch: null, source: 'quick-estimate', regularGeometry: false });
}

export function buildDetailedProjectForQuickScenario(input, scenario, product, module) {
  const project = module.newProject();
  project.projectType = input.projectType === 'reroof' ? 'reroof' : 'new';
  project.existingRoof = input.projectType === 'reroof' ? existingMap[input.existingRoof] ?? 'unknown' : null;
  project.asbestos = input.existingRoof === 'decramastic' ? 'unknown' : 'unknown';
  project.storeys = scenario.access.storeys === 2 ? 2 : 1;
  project.site = input.complexities?.includes('difficult-access') ? 'difficult' : 'flat';
  project.roofSystem = productMap[product] ?? null;
  project.entryMode = 'manual';
  project.measurementBasis = 'actual';
  project.pitch = scenario.pitchDegrees || 1;
  project.measurements = [];
  const q = scenario.quantities;
  project.measurements.push(entry(module, 'roofAreas', 'Estimated roof area', q.roofAreaM2));
  if (q.ridgeM > 0) project.measurements.push(entry(module, 'ridges', 'Estimated ridge', q.ridgeM));
  if (q.hipM > 0) project.measurements.push(entry(module, 'hips', 'Estimated hips', q.hipM));
  if (q.valleyM > 0) project.measurements.push(entry(module, 'valleys', 'Estimated valleys', q.valleyM));
  if (q.vergeM > 0) project.measurements.push(entry(module, 'barges', 'Estimated barges', q.vergeM));
  project.reviewedComponents = true;
  project.underlay = true;
  project.fixings = product !== 'tray-standing-seam';
  project.battenMaterials = true;
  project.wastePct = 5;
  project.pricingMode = 'guide';
  project.rateOverrides = {};
  project.customItems = [];
  project.access = {
    choice: 'include',
    system: 'full',
    perimeter: Math.max(1, scenario.access.perimeterM),
    perimeterSource: 'quick-estimate',
    weeks: 4,
    assessmentAccepted: true
  };
  project.displayTax = 'incl';
  return project;
}

function scenarioForProduct(scenario, product) {
  const rule = PRODUCT_MIN_PITCH[product];
  if (!rule || scenario.shape === 'flat-low-slope' || scenario.pitchDegrees >= rule.degrees) return scenario;
  const measured = measureSection(scenario.shape, scenario.quantities.footprintM2, rule.degrees);
  const q = measured.quantities;
  return {
    ...scenario,
    pitchDegrees: rule.degrees,
    quantities: q,
    access: { ...scenario.access, perimeterM: q.eavesM + q.vergeM + q.highEdgeM }
  };
}

function extraMissing(input, range) {
  const missing = [];
  const max = range.high.quantities;
  if (max.highEdgeM > 0) missing.push('High-edge / wall-junction flashing');
  if (max.flashingM > 0) missing.push('Complex junction flashings');
  if (max.dormerCount > 0) missing.push('Dormer windows, cheek cladding and structural detailing');
  if (input.complexities?.includes('skylights-or-chimneys')) missing.push('Skylights / chimneys and their flashings');
  if (input.complexities?.includes('attached-flat-section')) missing.push('Attached flat-roof section');
  if (input.projectType === 'reroof') {
    if (input.existingRoof === 'membrane') missing.push('Existing membrane removal');
    if (input.existingRoof === 'other' || input.existingRoof === 'unknown') missing.push('Existing roof removal');
    if (input.existingRoof === 'decramastic') missing.push('Asbestos testing and any specialist removal');
  }
  if (input.projectType === 'unknown') missing.push('Existing-roof removal if this is a replacement project');
  return [...new Set(missing)];
}

export function priceQuickEstimate(input, measurements, product, module) {
  const compatibility = productPitchAssessment(product, input.roofShape, input.pitchBand, input.exactPitchDegrees);
  if (product === 'membrane') {
    return { product, status: 'unpriced', compatibility, low: null, high: null, approved: false, rateCardId: '', estimates: [], missing: ['Approved membrane estimator pricing'], assumptions: [], exclusions: measurements.exclusions };
  }
  if (product === 'undecided') throw new Error('Price a specific roof product, not undecided.');
  if (compatibility.status === 'incompatible') {
    return { product, status: 'incompatible', compatibility, low: null, high: null, approved: false, rateCardId: module.DEFAULT_RATE_CARD.id, estimates: [], missing: [], assumptions: [], exclusions: measurements.exclusions };
  }
  const pricedScenarios = [scenarioForProduct(measurements.low, product), scenarioForProduct(measurements.high, product)];
  const projects = [
    buildDetailedProjectForQuickScenario(input, pricedScenarios[0], product, module),
    buildDetailedProjectForQuickScenario(input, pricedScenarios[1], product, module)
  ];
  const estimates = projects.map(project => module.calculateEstimate(project));
  const failures = estimates.filter(result => !result.ok);
  if (failures.length) {
    return { product, status: 'error', compatibility, low: null, high: null, approved: false, rateCardId: module.DEFAULT_RATE_CARD.id, estimates, missing: failures.flatMap(result => result.errors ?? []), assumptions: [], exclusions: measurements.exclusions };
  }
  const successes = estimates;
  const totals = successes.flatMap(result => [result.total.min, result.total.max]);
  const compatibilityMissing = compatibility.status === 'needs-confirmation' ? ['Actual roof pitch / product suitability'] : [];
  const missing = [...new Set([...successes.flatMap(result => result.unpriced.map(item => item.label)), ...extraMissing(input, measurements), ...compatibilityMissing])];
  const complete = successes.every(result => result.complete) && missing.length === 0 && compatibility.status === 'compatible';
  const pitchClampAssumption = pricedScenarios.some((scenario, index) => scenario.pitchDegrees !== [measurements.low, measurements.high][index].pitchDegrees)
    ? ['For pricing only, any modelled endpoint below the representative product minimum pitch is raised to that representative minimum. Confirm the actual selected product and roof pitch.']
    : [];
  return {
    product,
    status: complete ? 'complete' : 'partial',
    compatibility,
    low: Math.min(...totals),
    high: Math.max(...totals),
    approved: successes.every(result => result.approved),
    rateCardId: successes[0].rateCardId,
    estimates: successes,
    missing,
    assumptions: [...new Set([...measurements.assumptions, ...pitchClampAssumption, ...successes.flatMap(result => result.assumptions)])],
    exclusions: [...new Set([...measurements.exclusions, ...successes.flatMap(result => result.exclusions)])]
  };
}
