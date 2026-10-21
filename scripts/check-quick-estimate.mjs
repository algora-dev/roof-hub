import assert from 'node:assert/strict';
import { measureQuickRoof, productPitchAssessment, SIZE_BANDS, PITCH_BANDS } from '../lib/quick-estimate/index.mjs';
import { priceQuickEstimate } from '../lib/quick-estimate/pricing.mjs';
import * as estimator from '../public/roofhub-estimator/src/index.mjs';

let passed = 0;
const check = (condition, message) => { assert.ok(condition, message); passed += 1; };
const approx = (a, b, epsilon = 1e-6) => Math.abs(a - b) <= epsilon;

const shapes = ['skillion','gable','hip','gable-valley','hip-valley','multi-section','dormer-complex','flat-low-slope','unknown'];
const sizes = Object.keys(SIZE_BANDS);
const pitches = Object.keys(PITCH_BANDS);

for (const shape of shapes) {
  for (const sizeBand of sizes) {
    for (const pitchBand of pitches) {
      const input = {
        projectType: 'new', existingRoof: 'unknown', roofShape: shape, sizeBand,
        areaInputM2: null, areaSource: 'unknown', pitchBand,
        exactPitchDegrees: null, desiredRoof: shape === 'flat-low-slope' ? 'membrane' : 'corrugate',
        storeys: 1, complexities: []
      };
      const range = measureQuickRoof(input);
      check(Number.isFinite(range.low.quantities.roofAreaM2) && range.low.quantities.roofAreaM2 > 0, `${shape}/${sizeBand}/${pitchBand} low roof area must be finite`);
      check(Number.isFinite(range.high.quantities.roofAreaM2) && range.high.quantities.roofAreaM2 >= range.low.quantities.roofAreaM2, `${shape}/${sizeBand}/${pitchBand} high roof area must not shrink below low`);
      for (const side of [range.low, range.high]) for (const [key, value] of Object.entries(side.quantities)) {
        check(Number.isFinite(value) && value >= 0, `${shape}/${sizeBand}/${pitchBand} ${side.endpoint} ${key} must be non-negative`);
      }
    }
  }
}

const exactAreaInput = { projectType:'new',existingRoof:'unknown',roofShape:'hip',sizeBand:'small',areaInputM2:180,areaSource:'roof-area',pitchBand:'typical',exactPitchDegrees:null,desiredRoof:'corrugate',storeys:1,complexities:[] };
const exactArea = measureQuickRoof(exactAreaInput);
check(approx(exactArea.low.quantities.roofAreaM2, 180), 'Supplied roof area must be preserved at low endpoint');
check(approx(exactArea.high.quantities.roofAreaM2, 180), 'Supplied roof area must be preserved at high endpoint');

const exactPitch = measureQuickRoof({ ...exactAreaInput, areaInputM2:null, areaSource:'unknown', exactPitchDegrees:27 });
check(exactPitch.low.pitchDegrees === 27 && exactPitch.high.pitchDegrees === 27, 'Exact pitch must replace pitch band at both endpoints');

const oneStorey = measureQuickRoof({ ...exactAreaInput, areaInputM2:220, areaSource:'total-floor-area', storeys:1, exactPitchDegrees:20 });
const twoStorey = measureQuickRoof({ ...exactAreaInput, areaInputM2:220, areaSource:'total-floor-area', storeys:2, exactPitchDegrees:20 });
check(twoStorey.high.quantities.footprintM2 < oneStorey.low.quantities.footprintM2, 'Two-storey total floor area must convert to a smaller roof footprint range than one-storey');

const geometryOne = measureQuickRoof({ ...exactAreaInput, areaInputM2:null, storeys:1 });
const geometryTwo = measureQuickRoof({ ...exactAreaInput, areaInputM2:null, storeys:2 });
check(approx(geometryOne.low.quantities.roofAreaM2, geometryTwo.low.quantities.roofAreaM2), 'Storeys must not change roof material geometry');
check(approx(geometryOne.high.quantities.ridgeM, geometryTwo.high.quantities.ridgeM), 'Storeys must not change ridge geometry');

check(productPitchAssessment('corrugate','gable','low',5).status === 'incompatible', '5 degree corrugate must be flagged below representative 8 degree minimum');
check(productPitchAssessment('five-rib','gable','low',5).status === 'compatible', '5 degree five-rib may be compatible with representative 3 degree minimum');
check(productPitchAssessment('pressed-metal-tile','gable','low',null).status === 'needs-confirmation', 'Low pitch band must warn for pressed metal tile');
check(productPitchAssessment('membrane','flat-low-slope','unknown',null).status === 'supported-unpriced', 'Flat membrane selection must be supported but unpriced');

const pricedInput = { projectType:'reroof',existingRoof:'concrete-tile',roofShape:'hip',sizeBand:'medium',areaInputM2:null,areaSource:'unknown',pitchBand:'typical',exactPitchDegrees:null,desiredRoof:'corrugate',storeys:1,complexities:[] };
const pricedRange = measureQuickRoof(pricedInput);
const corrugate = priceQuickEstimate(pricedInput, pricedRange, 'corrugate', estimator);
check(corrugate.status === 'complete', 'Representative corrugate reroof should be fully configured');
check(corrugate.low > 0 && corrugate.high > corrugate.low, 'Corrugate pricing range must be positive and ordered');
check(corrugate.approved === false, 'Current draft detailed rate card must remain unapproved');

const fiveRib = priceQuickEstimate({ ...pricedInput, desiredRoof:'five-rib' }, pricedRange, 'five-rib', estimator);
check(fiveRib.status === 'complete' && fiveRib.low > 0, 'Representative five-rib reroof should calculate through the existing engine');

const tray = priceQuickEstimate({ ...pricedInput, desiredRoof:'tray-standing-seam' }, pricedRange, 'tray-standing-seam', estimator);
check(tray.status === 'partial' && tray.missing.length > 0, 'Tray result must remain partial while component rates are missing');

const pressed = priceQuickEstimate({ ...pricedInput, desiredRoof:'pressed-metal-tile' }, pricedRange, 'pressed-metal-tile', estimator);
check(pressed.status === 'partial' && pressed.missing.length > 0, 'Pressed metal tile result must remain partial while component/batten rates are missing');

const membrane = priceQuickEstimate({ ...pricedInput, roofShape:'flat-low-slope', desiredRoof:'membrane' }, measureQuickRoof({ ...pricedInput, roofShape:'flat-low-slope', desiredRoof:'membrane' }), 'membrane', estimator);
check(membrane.status === 'unpriced' && membrane.low === null, 'Membrane must not invent an estimator price');


const newRoofUnknownExistingInput = { ...pricedInput, projectType:'new', existingRoof:'unknown' };
const newRoofUnknownExisting = priceQuickEstimate(newRoofUnknownExistingInput, measureQuickRoof(newRoofUnknownExistingInput), 'corrugate', estimator);
check(!newRoofUnknownExisting.missing.some(x => x.toLowerCase().includes('removal')), 'New roof must not be marked partial merely because existing roof is unknown');

const unknownProjectInput = { ...pricedInput, projectType:'unknown', existingRoof:'unknown' };
const unknownProject = priceQuickEstimate(unknownProjectInput, measureQuickRoof(unknownProjectInput), 'corrugate', estimator);
check(unknownProject.status === 'partial' && unknownProject.missing.some(x => x.toLowerCase().includes('replacement project')), 'Unknown project type must preserve possible removal uncertainty');

const unknownRemovalInput = { ...pricedInput, existingRoof:'unknown' };
const unknownRemoval = priceQuickEstimate(unknownRemovalInput, measureQuickRoof(unknownRemovalInput), 'corrugate', estimator);
check(unknownRemoval.status === 'partial' && unknownRemoval.missing.some(x => x.toLowerCase().includes('removal')), 'Unknown existing roof must leave removal visibly incomplete');

const decramasticInput = { ...pricedInput, existingRoof:'decramastic' };
const decramastic = priceQuickEstimate(decramasticInput, measureQuickRoof(decramasticInput), 'corrugate', estimator);
check(decramastic.status === 'partial' && decramastic.missing.some(x => x.toLowerCase().includes('asbestos')), 'Decramastic must preserve asbestos uncertainty');

const skylightInput = { ...pricedInput, complexities:['skylights-or-chimneys'] };
const skylight = priceQuickEstimate(skylightInput, measureQuickRoof(skylightInput), 'corrugate', estimator);
check(skylight.status === 'partial' && skylight.missing.some(x => x.toLowerCase().includes('skylight')), 'Skylight complexity must be flagged instead of priced with a fake multiplier');
check(approx(skylight.low, corrugate.low) && approx(skylight.high, corrugate.high), 'Unpriced skylight flag must not secretly change the calculation');

const difficultInput = { ...pricedInput, complexities:['difficult-access'] };
const difficult = priceQuickEstimate(difficultInput, measureQuickRoof(difficultInput), 'corrugate', estimator);
check(difficult.low > corrugate.low && difficult.high > corrugate.high, 'Difficult access may change price only through the configured scaffold rate');

const twoStoreyPriceInput = { ...pricedInput, storeys:2, complexities:['two-storey'] };
const twoStoreyPrice = priceQuickEstimate(twoStoreyPriceInput, measureQuickRoof(twoStoreyPriceInput), 'corrugate', estimator);
check(twoStoreyPrice.low > corrugate.low && twoStoreyPrice.high > corrugate.high, 'Two storeys must affect configured access pricing while geometry remains unchanged');

const unknownStoreyInput = { ...pricedInput, storeys:null, complexities:[] };
const unknownStoreyRange = measureQuickRoof(unknownStoreyInput);
check(unknownStoreyRange.low.access.storeys === 1 && unknownStoreyRange.high.access.storeys === 2, 'Unknown storeys must widen access from one to two storeys without changing geometry');
const unknownStoreyPrice = priceQuickEstimate(unknownStoreyInput, unknownStoreyRange, 'corrugate', estimator);
check(unknownStoreyPrice.high > corrugate.high, 'Unknown storeys must preserve the upper two-storey access exposure in price');

const lowPitchBandInput = { ...pricedInput, projectType:'new', roofShape:'gable', pitchBand:'low', exactPitchDegrees:null, desiredRoof:'corrugate' };
const lowPitchBand = priceQuickEstimate(lowPitchBandInput, measureQuickRoof(lowPitchBandInput), 'corrugate', estimator);
check(lowPitchBand.status === 'partial' && lowPitchBand.missing.includes('Actual roof pitch / product suitability'), 'A pitch band crossing product minimum must stay partial');
check(lowPitchBand.assumptions.some(x => x.includes('representative product minimum pitch')), 'Pricing must disclose product-minimum pitch clamping');

const unknownShapeRange = measureQuickRoof({ ...pricedInput, roofShape:'unknown' });
check(unknownShapeRange.low.shape === 'gable' && unknownShapeRange.high.shape === 'multi-section', 'Unknown shape must widen from a simple to complex coherent roof template');
check(unknownShapeRange.assumptions.some(x => x.includes('shape is unknown')), 'Unknown shape widening must be disclosed');

console.log(`${passed} quick-estimate geometry, compatibility and pricing cases passed.`);
