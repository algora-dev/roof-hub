export const QUICK_ESTIMATE_MODEL_VERSION = 'roofhub-quick-1.0';

export const SIZE_BANDS = Object.freeze({
  small: { label: 'Small', min: 60, max: 100, hint: 'About 60 to 100 m² footprint' },
  'small-medium': { label: 'Small-medium', min: 100, max: 145, hint: 'About 100 to 145 m² footprint' },
  medium: { label: 'Medium', min: 145, max: 190, hint: 'About 145 to 190 m² footprint' },
  'medium-large': { label: 'Medium-large', min: 190, max: 240, hint: 'About 190 to 240 m² footprint' },
  large: { label: 'Large', min: 240, max: 300, hint: 'About 240 to 300 m² footprint' },
  'very-large': { label: 'Very large', min: 300, max: 400, hint: 'About 300 to 400 m² footprint' },
  unknown: { label: 'Not sure', min: 100, max: 300, hint: 'Uses a deliberately broad starting range' }
});

export const PITCH_BANDS = Object.freeze({
  low: { label: 'Low', min: 5, max: 15, description: 'A gentle slope' },
  typical: { label: 'Typical', min: 15, max: 30, description: 'A noticeable residential slope' },
  steep: { label: 'Steep', min: 30, max: 45, description: 'A tall, pronounced slope' },
  unknown: { label: 'Not sure', min: 8, max: 35, description: 'Uses a deliberately broad pitch range' }
});

export const PRODUCT_MIN_PITCH = Object.freeze({
  corrugate: { degrees: 8, basis: 'Representative current NZ corrugated manufacturer guidance. Confirm the selected product.' },
  'five-rib': { degrees: 3, basis: 'Representative current NZ five-rib manufacturer guidance. Confirm the selected product.' },
  'pressed-metal-tile': { degrees: 12, basis: 'Representative current NZ pressed-metal-tile manufacturer guidance. Confirm the selected product.' },
  'tray-standing-seam': { degrees: 3, basis: 'Representative current NZ concealed-fix tray guidance. Confirm the selected system.' }
});

const block = (bounds, axis, caps = [], lift = 0) => {
  const [x0, y0, x1, y1] = bounds;
  const x = [{ a: 1, b: 0, c: -x0 + lift }, { a: -1, b: 0, c: x1 + lift }];
  const y = [{ a: 0, b: 1, c: -y0 + lift }, { a: 0, b: -1, c: y1 + lift }];
  const planes = axis === 'flat' ? [{ a: 0, b: 0, c: 0 }]
    : axis === 'mono' ? [y[0]] : axis === 'hip' ? [...x, ...y] : axis === 'x' ? x : y;
  return { bounds, planes: [...planes, ...caps] };
};

export const ROOF_TEMPLATES = Object.freeze({
  skillion: {
    id: 'skillion', label: 'Skillion / single slope', description: 'One roof surface sloping in one direction', complexity: 'simple', dormerCount: 0,
    blocks: [block([0, 0, 10, 6], 'mono')],
    note: 'The high edge may need project-specific flashing or wall-junction detailing.'
  },
  gable: {
    id: 'gable', label: 'Simple gable', description: 'Two slopes meeting along one ridge', complexity: 'simple', dormerCount: 0,
    blocks: [block([0, 0, 10, 6], 'y')]
  },
  hip: {
    id: 'hip', label: 'Hip roof', description: 'Slopes on all four sides', complexity: 'moderate', dormerCount: 0,
    blocks: [block([0, 0, 10, 6], 'hip')]
  },
  'gable-valley': {
    id: 'gable-valley', label: 'Gable with valley', description: 'Joined gable wings with an internal valley', complexity: 'moderate', dormerCount: 0,
    blocks: [block([0, 0, 10, 6], 'y', [{ a: -1, b: 0, c: 10 }]), block([4, 0, 10, 10], 'x', [{ a: 0, b: 1, c: 0 }])]
  },
  'hip-valley': {
    id: 'hip-valley', label: 'Hip and valley', description: 'Joined hipped sections with an internal valley', complexity: 'complex', dormerCount: 0,
    blocks: [block([0, 0, 10, 6], 'hip'), block([4, 0, 10, 10], 'hip')]
  },
  'multi-section': {
    id: 'multi-section', label: 'Multiple roof sections', description: 'Several ridges, hips and valleys', complexity: 'complex', dormerCount: 0,
    blocks: [block([0, 0, 14, 8], 'hip'), block([8, 0, 14, 13], 'hip'), block([2, -4, 6, 4], 'x', [{ a: 0, b: -1, c: 4 }])],
    note: 'This is one representative complex layout. Unusual junctions need measured quantities.'
  },
  'dormer-complex': {
    id: 'dormer-complex', label: 'Roof with dormers', description: 'A main roof with projecting dormer sections', complexity: 'complex', dormerCount: 2,
    blocks: [block([0, 0, 12, 8], 'y'), block([2, 4, 4, 7], 'x', [], 2), block([8, 4, 10, 7], 'x', [], 2)],
    note: 'Two representative dormers are modelled. Windows, cheek cladding and structural work are not priced.'
  },
  'flat-low-slope': {
    id: 'flat-low-slope', label: 'Flat / membrane-style roof', description: 'A nearly level roof normally relying on a waterproof membrane system', complexity: 'simple', dormerCount: 0,
    blocks: [block([0, 0, 10, 6], 'flat')],
    note: 'Plan area is used for the membrane surface. Falls, upstands, outlets, insulation and decking require specification.'
  }
});

export const ROOF_SHAPE_OPTIONS = Object.freeze([
  'skillion', 'gable', 'hip', 'gable-valley', 'hip-valley', 'multi-section', 'dormer-complex', 'flat-low-slope', 'unknown'
]);

export function shapeScenario(shape, endpoint) {
  if (shape !== 'unknown') return shape;
  return endpoint === 'low' ? 'gable' : 'multi-section';
}

export function productPitchAssessment(product, shape, pitchBand, exactPitchDegrees) {
  if (product === 'undecided') return { status: 'unknown', message: '' };
  if (product === 'membrane') {
    if (shape === 'flat-low-slope' || shape === 'unknown') return { status: 'supported-unpriced', message: 'Membrane geometry is supported, but RoofHub does not yet have an approved membrane estimator rate card.' };
    return { status: 'needs-confirmation', message: 'Membrane systems can be used on specific low-slope designs. Confirm the actual roof design and membrane specification.' };
  }
  if (shape === 'flat-low-slope') return { status: 'incompatible', message: 'This flat-roof template is not used to price pitched metal roofing. Choose a pitched shape or a membrane system.' };
  const rule = PRODUCT_MIN_PITCH[product];
  if (!rule) return { status: 'unknown', message: '' };
  if (Number.isFinite(exactPitchDegrees)) {
    if (exactPitchDegrees < rule.degrees) return { status: 'incompatible', message: `The supplied ${exactPitchDegrees}° pitch is below the representative ${rule.degrees}° minimum used for this product family. ${rule.basis}` };
    return { status: 'compatible', message: rule.basis };
  }
  const band = PITCH_BANDS[pitchBand] ?? PITCH_BANDS.unknown;
  if (band.max < rule.degrees) return { status: 'incompatible', message: `This pitch range is below the representative ${rule.degrees}° minimum used for this product family. ${rule.basis}` };
  if (band.min < rule.degrees) return { status: 'needs-confirmation', message: `Part of this pitch range is below the representative ${rule.degrees}° minimum. Check the actual pitch before selecting this product. ${rule.basis}` };
  return { status: 'compatible', message: rule.basis };
}
