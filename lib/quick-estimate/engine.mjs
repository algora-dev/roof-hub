import { getRoofMesh } from './geometry.mjs';
import { PITCH_BANDS, QUICK_ESTIMATE_MODEL_VERSION, ROOF_TEMPLATES, SIZE_BANDS, shapeScenario } from './model.mjs';

const quantityKeys = ['footprintM2', 'roofAreaM2', 'ridgeM', 'hipM', 'valleyM', 'vergeM', 'eavesM', 'highEdgeM', 'flashingM', 'flatEdgeM', 'dormerCount'];
const edgeQuantity = { ridge: 'ridgeM', hip: 'hipM', valley: 'valleyM', verge: 'vergeM', eaves: 'eavesM', high_edge: 'highEdgeM', flashing: 'flashingM', flat_edge: 'flatEdgeM' };
export const emptyQuantities = () => Object.fromEntries(quantityKeys.map(k => [k, 0]));
const edgeLength = (start, end) => Math.hypot(...start.map((v, i) => v - end[i]));

export function measureSection(shape, footprintM2, pitchDegrees) {
  if (!Number.isFinite(footprintM2) || footprintM2 <= 0) throw new Error('Footprint must be positive and finite.');
  if (!Number.isFinite(pitchDegrees) || pitchDegrees < 0 || pitchDegrees > 50) throw new Error('Pitch is outside the quick-estimate model.');
  if (shape === 'flat-low-slope' && pitchDegrees !== 0) throw new Error('Flat roof geometry uses zero degrees in this model.');
  const mesh = getRoofMesh(shape);
  const scale = Math.sqrt(footprintM2 / mesh.footprintM2);
  const tan = Math.tan(pitchDegrees * Math.PI / 180);
  const convert = p => [p[0] * scale, p[1] * scale, p[2] * scale * tan];
  const edges = mesh.edges.map(e => ({ kind: e.kind, start: convert(e.start), end: convert(e.end) }));
  const q = emptyQuantities();
  q.footprintM2 = footprintM2;
  q.roofAreaM2 = mesh.faces.reduce((s, f) => s + f.planArea * scale * scale * Math.sqrt(1 + tan * tan * (f.gradient[0] ** 2 + f.gradient[1] ** 2)), 0);
  for (const e of edges) q[edgeQuantity[e.kind]] += edgeLength(e.start, e.end);
  q.dormerCount = ROOF_TEMPLATES[shape].dormerCount;
  return { shape, pitchDegrees, quantities: q, edges };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function footprintRange(input) {
  const supplied = input.areaInputM2;
  if (Number.isFinite(supplied)) {
    if (supplied < 20 || supplied > 1200) throw new Error('The supplied area is outside the supported 20 to 1200 m² range.');
    if (input.areaSource === 'building-footprint') {
      return { min: supplied, max: supplied * 1.1, note: 'A building footprint was supplied. The upper scenario allows 10% for roof overhangs and plan differences.' };
    }
    if (input.areaSource === 'total-floor-area') {
      if (input.storeys === 2) return { min: supplied * 0.48, max: supplied * 0.62, note: 'For a two-storey building, total floor area is converted to a broad roof-footprint range because upper floors may not match the lower footprint.' };
      if (input.storeys === 1) return { min: supplied * 0.95, max: supplied * 1.1, note: 'For a single-storey building, total floor area is used as a broad footprint proxy with allowance for roof overhangs and plan differences.' };
      return { min: supplied * 0.48, max: supplied * 1.1, note: 'Storey count is unknown, so total floor area produces a deliberately broad roof-footprint range.' };
    }
    if (input.areaSource === 'roof-area') return { min: supplied, max: supplied, roofAreaExact: true, note: `The supplied ${supplied} m² is treated as actual sloping roof area.` };
  }
  const band = SIZE_BANDS[input.sizeBand] ?? SIZE_BANDS.unknown;
  return { min: band.min, max: band.max, note: `The ${band.label.toLowerCase()} size band is treated as approximate horizontal roof footprint.` };
}

function pitchRange(input, shape) {
  if (shape === 'flat-low-slope') return { min: 0, max: 0, note: 'Flat-roof geometry uses plan area. The actual membrane falls still need specification.' };
  if (Number.isFinite(input.exactPitchDegrees)) {
    if (input.exactPitchDegrees < 1 || input.exactPitchDegrees > 50) throw new Error('The supplied pitch is outside the supported 1° to 50° range.');
    return { min: input.exactPitchDegrees, max: input.exactPitchDegrees, note: `The supplied ${input.exactPitchDegrees}° pitch is used.` };
  }
  const band = PITCH_BANDS[input.pitchBand] ?? PITCH_BANDS.unknown;
  return { min: band.min, max: band.max, note: `The ${band.label.toLowerCase()} pitch band is used for the lower and upper scenarios.` };
}

function scenario(input, endpoint, area) {
  const shape = shapeScenario(input.roofShape, endpoint);
  const pitch = pitchRange(input, shape);
  const pitchDegrees = endpoint === 'low' ? pitch.min : pitch.max;
  let footprint = endpoint === 'low' ? area.min : area.max;
  if (area.roofAreaExact) {
    const ratio = shape === 'flat-low-slope' ? 1 : measureSection(shape, 1, pitchDegrees).quantities.roofAreaM2;
    footprint = input.areaInputM2 / ratio;
  }
  footprint = clamp(footprint, 20, 1200);
  const measured = measureSection(shape, footprint, pitchDegrees);
  const q = measured.quantities;
  return {
    endpoint,
    shape,
    pitchDegrees,
    quantities: q,
    access: {
      storeys: input.storeys ?? (endpoint === 'low' ? 1 : 2),
      perimeterM: q.eavesM + q.vergeM + q.highEdgeM
    }
  };
}

export function measureQuickRoof(input) {
  if (!input || typeof input !== 'object') throw new Error('Quick-estimate input is required.');
  const area = footprintRange(input);
  const low = scenario(input, 'low', area);
  const high = scenario(input, 'high', area);
  const shapeNotes = input.roofShape === 'unknown'
    ? ['Roof shape is unknown, so the lower scenario uses a simple gable and the upper scenario uses a representative multi-section roof.']
    : [ROOF_TEMPLATES[input.roofShape]?.note].filter(Boolean);
  return {
    schemaVersion: 'roofhub-quick/v1',
    modelVersion: QUICK_ESTIMATE_MODEL_VERSION,
    source: 'estimated_geometry',
    input: { ...input },
    low,
    high,
    assumptions: [
      area.note,
      pitchRange(input, shapeScenario(input.roofShape, 'low')).note,
      'Roof slope is applied exactly once. Lengths scale with dimensions rather than directly with area.',
      'The lower and upper scenarios are coherent modelled roofs, not statistically guaranteed limits.',
      input.storeys === null ? 'Storey count is unknown, so the lower access scenario uses one storey and the upper access scenario uses two. Storeys do not change roofing material quantities.' : 'Storeys affect access pricing only. They do not increase roofing material quantities.',
      ...shapeNotes
    ],
    exclusions: [
      'Structural repairs, framing, purlins, insulation, consent, engineering, craneage and hazardous-material work are not inferred.',
      'Skylights, chimneys, unusual wall junctions and specialist drainage details need project-specific scope.'
    ]
  };
}

export function estimateDetailLevel(input) {
  const exactRoof = Number.isFinite(input.areaInputM2) && input.areaSource === 'roof-area';
  const someArea = Number.isFinite(input.areaInputM2);
  const exactPitch = Number.isFinite(input.exactPitchDegrees);
  if (exactRoof && exactPitch) return 'detailed';
  if (someArea || exactPitch) return 'improved';
  return 'basic';
}

export function midpointQuantities(range) {
  const out = {};
  for (const key of quantityKeys) out[key] = (range.low.quantities[key] + range.high.quantities[key]) / 2;
  return out;
}
