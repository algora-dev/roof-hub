import { writeFile } from 'node:fs/promises';
import { measureQuickRoof, priceQuickEstimate } from '../lib/quick-estimate/index.mjs';
import * as estimator from '../public/roofhub-estimator/src/index.mjs';

const base = {
  projectType: 'new', existingRoof: 'unknown', roofShape: 'gable', sizeBand: 'medium',
  areaInputM2: null, areaSource: 'unknown', pitchBand: 'typical', exactPitchDegrees: null,
  desiredRoof: 'corrugate', storeys: 1, complexities: []
};

const cases = [
  ['Small gable new corrugate', { ...base, sizeBand:'small' }],
  ['Medium hip concrete-tile reroof corrugate', { ...base, projectType:'reroof', existingRoof:'concrete-tile', roofShape:'hip' }],
  ['Medium hip concrete-tile reroof five-rib', { ...base, projectType:'reroof', existingRoof:'concrete-tile', roofShape:'hip', desiredRoof:'five-rib' }],
  ['Medium gable long-run reroof corrugate', { ...base, projectType:'reroof', existingRoof:'long-run-metal' }],
  ['Large hip-valley two-storey corrugate', { ...base, roofShape:'hip-valley', sizeBand:'large', storeys:2, complexities:['two-storey'] }],
  ['Low-pitch gable corrugate', { ...base, pitchBand:'low' }],
  ['Medium hip pressed-metal-tile', { ...base, roofShape:'hip', desiredRoof:'pressed-metal-tile' }],
  ['Medium hip tray / standing seam', { ...base, roofShape:'hip', desiredRoof:'tray-standing-seam' }],
  ['Unknown shape and size corrugate', { ...base, roofShape:'unknown', sizeBand:'unknown', pitchBand:'unknown', storeys:null }],
  ['Flat membrane roof', { ...base, roofShape:'flat-low-slope', desiredRoof:'membrane', pitchBand:'unknown' }],
  ['180 m2 measured gable roof at 25 degrees', { ...base, areaInputM2:180, areaSource:'roof-area', exactPitchDegrees:25 }],
  ['220 m2 total-floor-area two-storey reroof', { ...base, projectType:'reroof', existingRoof:'concrete-tile', areaInputM2:220, areaSource:'total-floor-area', storeys:2, complexities:['two-storey'] }]
];

const output = cases.map(([name, input]) => {
  const measurements = measureQuickRoof(input);
  const result = priceQuickEstimate(input, measurements, input.desiredRoof, estimator);
  return {
    name,
    input,
    modelledRoofAreaM2: {
      low: Math.round(measurements.low.quantities.roofAreaM2 * 10) / 10,
      high: Math.round(measurements.high.quantities.roofAreaM2 * 10) / 10
    },
    pricing: {
      status: result.status,
      lowInclAssumedGst: result.low === null ? null : Math.round(result.low),
      highInclAssumedGst: result.high === null ? null : Math.round(result.high),
      approved: result.approved,
      rateCardId: result.rateCardId,
      missing: result.missing
    }
  };
});

const destination = new URL('../docs/quick-estimate-calibration.json', import.meta.url);
await writeFile(destination, JSON.stringify({ generatedAt: new Date().toISOString(), warning: 'Calibration reference only. Current RoofHub estimator rate card is draft and source GST treatment is not fully confirmed.', cases: output }, null, 2) + '\n');
console.log(`Wrote ${output.length} calibration cases to docs/quick-estimate-calibration.json`);
