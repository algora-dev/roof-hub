/**
 * Framework-independent model. Quantities are always metric.
 * An entry's basis describes the measurement, not its price unit.
 * Use measured roof surface area, never total multi-storey floor area.
 */
export const SCHEMA_VERSION = 1;
export const ROOFS = [
  { id: 'pressed-metal', name: 'Pressed metal tile', short: 'Pressed metal tile', description: 'A lightweight metal roof with a tiled profile.', detail: 'Batten and underlay installation labour is included in the tile labour rate.', tag: 'Tiled profile' },
  { id: 'corrugate', name: 'Corrugated long-run', short: 'Corrugated steel', description: 'The familiar curved profile of a classic long-run roof.', detail: 'Corrugate-specific ridges and hips are selected automatically.', tag: 'Classic long-run' },
  { id: 'five-rib', name: 'Five-rib / trapezoidal', short: 'Five-rib steel', description: 'Straight ribs and wider pans for a crisp, linear finish.', detail: 'Includes the higher ridge and hip labour allowance for notching.', tag: 'Trapezoidal profile' },
  { id: 'tray', name: 'Architectural tray', short: 'Architectural tray', description: 'Wide-pan and standing-seam roofing, grouped for budgeting.', detail: 'Uses a bundled supply-and-install rate. Final system and accessory pricing need confirmation.', tag: 'Concealed-fix systems' },
];
export const GROUPS = [
  { id: 'roofAreas', name: 'Roof areas', singular: 'Roof area', unit: 'm2', pitchRule: 'rafter', help: 'The surface area of each roof plane, or its horizontal plan projection.' },
  { id: 'ridges', name: 'Ridges', singular: 'Ridge', unit: 'lm', pitchRule: 'none', help: 'Horizontal peaks where two roof slopes meet.' },
  { id: 'hips', name: 'Hips', singular: 'Hip', unit: 'lm', pitchRule: 'hipvalley', help: 'Sloping external corners, running down from a ridge.' },
  { id: 'valleys', name: 'Valleys', singular: 'Valley', unit: 'lm', pitchRule: 'hipvalley', help: 'Internal roof junctions that channel rainwater.' },
  { id: 'barges', name: 'Barges', singular: 'Barge', unit: 'lm', pitchRule: 'rafter', help: 'Sloping roof edges at gable ends. Use actual length for other orientations.' },
  { id: 'aprons', name: 'Aprons / wall flashings', singular: 'Apron', unit: 'lm', pitchRule: 'none', help: 'Enter actual flashing lengths. These can run in different directions.' },
  { id: 'spouting', name: 'Spouting', singular: 'Spouting', unit: 'lm', pitchRule: 'none', help: 'Gutters along the eaves. Supply-and-install rates are not yet set.' },
  { id: 'downpipes', name: 'Downpipes', singular: 'Downpipe', unit: 'each', pitchRule: 'none', help: 'Number of downpipes. Use a custom component for lengths or special fittings.' },
];
export const GROUP_MAP = Object.fromEntries(GROUPS.map(g => [g.id, g]));
export const EXISTING_ROOFS = [
  { id: 'long-run', name: 'Long-run / corrugated metal' },
  { id: 'pressed-metal', name: 'Pressed metal tile' },
  { id: 'concrete', name: 'Concrete tile' },
  { id: 'decramastic', name: 'Decramastic / older coated tile' },
  { id: 'unknown', name: 'I’m not sure' },
];
export const uid = (prefix = 'rh') => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`;
export const clone = value => JSON.parse(JSON.stringify(value));
export const unitLabel = unit => ({ m2: 'm²', lm: 'lm', each: 'each', item: 'item', 'lm/week': 'lm/week' }[unit] ?? unit);
export function newEntry(group = 'roofAreas', basis = 'actual', extra = {}) {
  return { id: uid('entry'), group, label: GROUP_MAP[group]?.singular ?? 'Measurement', value: null, quantity: 1, basis, pitch: null, roofAreaId: null, source: 'manual', regularGeometry: false, ...extra };
}
export function newProject() {
  return {
    schemaVersion: SCHEMA_VERSION, id: uid('project'), name: '', projectType: null, existingRoof: null,
    asbestos: 'unknown', storeys: 1, site: 'flat', roofSystem: null,
    entryMode: null, measurementBasis: 'actual', pitch: 25,
    measurements: [], reviewedComponents: false,
    underlay: true, fixings: true, battenMaterials: true, wastePct: 5,
    pricingMode: 'guide', rateOverrides: {}, customItems: [],
    access: { choice: 'exclude', system: 'full', perimeter: null, perimeterSource: 'manual', weeks: 4, assessmentAccepted: false },
    displayTax: 'incl', step: 0, maxStep: 0,
  };
}
export function newCustomItem(extra = {}) {
  return { id: uid('custom'), name: '', unit: 'item', quantity: 1, low: null, high: null, taxBasis: 'excl', ...extra };
}
export function roofName(id) { return ROOFS.find(r => r.id === id)?.name ?? 'Not selected'; }
export function existingName(id) { return EXISTING_ROOFS.find(r => r.id === id)?.name ?? 'Not selected'; }
