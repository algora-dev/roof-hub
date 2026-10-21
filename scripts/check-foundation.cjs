const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const ts = require('typescript');

const root = process.cwd();
const cache = new Map();
let cases = 0;

function resolveTs(specifier, parentDir) {
  const base = specifier.startsWith('@/')
    ? path.resolve(root, specifier.slice(2))
    : path.resolve(parentDir, specifier);
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function load(file) {
  const filename = path.resolve(file);
  if (cache.has(filename)) return cache.get(filename).exports;
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true }
  }).outputText;
  const loaded = new Module(filename);
  cache.set(filename, loaded);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  const nativeRequire = loaded.require.bind(loaded);
  loaded.require = (id) => {
    if (id.startsWith('@/') || id.startsWith('.')) {
      const dependency = resolveTs(id, path.dirname(filename));
      if (dependency) return load(dependency);
    }
    return nativeRequire(id);
  };
  loaded._compile(output, filename);
  return loaded.exports;
}

function test(name, fn) {
  try {
    fn();
    cases += 1;
  } catch (error) {
    console.error(`FAIL ${name}: ${error.message}`);
    process.exitCode = 1;
  }
}

const roofProject = load('lib/roof-project.ts');
const dataTypes = load('data/types.ts');
const rateCards = load('lib/estimator/rate-card.ts');
const projectAdapter = load('lib/estimator/project-adapter.ts');
const enquiry = load('lib/enquiry.ts');
const rateLimit = load('lib/server/rate-limit.ts');

const project = roofProject.createRoofProject('quick-estimate');
project.desiredRoof = 'membrane';
project.geometry.roofAreaM2 = 180;
project.geometry.areaSource = 'roof-area';
project.geometry.complexities = ['two-storey'];
const parsed = roofProject.parseRoofProject(JSON.parse(JSON.stringify(project)));

test('RoofProject round-trips through JSON', () => {
  assert.ok(parsed);
  assert.equal(parsed.projectId, project.projectId);
  assert.equal(parsed.desiredRoof, 'membrane');
  assert.equal(parsed.geometry.roofAreaM2, 180);
});

test('RoofProject rejects unknown schema versions', () => {
  assert.equal(roofProject.parseRoofProject({ ...project, schemaVersion: 99 }), null);
});

test('RoofProject clamps malformed optional values instead of trusting them', () => {
  const value = roofProject.parseRoofProject({
    ...project,
    geometry: { ...project.geometry, roofAreaM2: -10, exactPitchDegrees: 95 },
    measurements: [{ id: 'x', group: 'roof-area', label: 'A', value: -1, unit: 'm2', quantity: 1, basis: 'actual', source: 'manual' }]
  });
  assert.ok(value);
  assert.equal(value.geometry.roofAreaM2, null);
  assert.equal(value.geometry.exactPitchDegrees, null);
  assert.equal(value.measurements.length, 0);
});

test('shared product taxonomy includes membrane', () => {
  assert.equal(dataTypes.SYSTEM_LABELS.membrane, 'Membrane roofing');
});

test('current detailed rate card stays blocked from public quick estimating', () => {
  const record = rateCards.getEstimatorRateCardRecord('roofhub-nz-draft-2026-09-22');
  assert.ok(record);
  assert.equal(record.status, 'draft');
  assert.equal(record.productCoverage.membrane, 'not-configured');
  assert.equal(rateCards.isRateCardApprovedForPublicEstimate(record.id), false);
});

test('detailed adapter mapping excludes private custom rate data', () => {
  const detailed = {
    schemaVersion: 1,
    id: 'detailed-1',
    name: 'Private rate test',
    projectType: 'reroof',
    existingRoof: 'decramastic',
    asbestos: 'negative',
    storeys: 2,
    site: 'difficult',
    roofSystem: 'five-rib',
    entryMode: 'manual',
    measurementBasis: 'actual',
    pitch: 25,
    measurements: [{ id: 'area', group: 'roofAreas', label: 'Roof area', value: 180, quantity: 1, basis: 'actual', pitch: null, roofAreaId: null, source: 'manual', regularGeometry: false }],
    reviewedComponents: true,
    underlay: true,
    fixings: true,
    battenMaterials: true,
    wastePct: 5,
    pricingMode: 'custom',
    rateOverrides: { 'five-rib.covering': { secret: 12345 } },
    customItems: [{ id: 'private', name: 'Private item', unit: 'item', quantity: 1, low: 1, high: 2, taxBasis: 'excl' }],
    access: { choice: 'exclude', system: 'full', perimeter: null, perimeterSource: 'manual', weeks: 4, assessmentAccepted: false },
    displayTax: 'incl',
    step: 3,
    maxStep: 3
  };
  const shared = projectAdapter.sharedProjectFromDetailedProject(detailed, null, null);
  const json = JSON.stringify(shared);
  assert.equal(shared.desiredRoof, 'five-rib');
  assert.equal(shared.existingRoofDetail, 'decramastic');
  assert.equal(shared.geometry.storeys, 2);
  assert.equal(shared.measurements.length, 1);
  assert.equal(json.includes('12345'), false);
  assert.equal(json.includes('Private item'), false);
});

test('structured project enquiry accepts a valid non-sensitive RoofProject', () => {
  const payload = enquiry.parseProjectEnquiryPayload({
    schemaVersion: 1,
    type: 'roofhub-project-enquiry',
    createdAt: new Date().toISOString(),
    requestedHelp: 'written-quote',
    contact: { name: 'Test User', email: 'test@example.com', phone: '', location: '', notes: '' },
    consent: { contactByRoofHub: true, shareWithRoofingPartners: false, version: 'v1', at: new Date().toISOString() },
    project
  });
  assert.ok(payload);
  assert.equal(payload.project.projectId, project.projectId);
});

test('structured project enquiry rejects missing contact consent', () => {
  const payload = enquiry.parseProjectEnquiryPayload({
    schemaVersion: 1,
    type: 'roofhub-project-enquiry',
    requestedHelp: 'written-quote',
    contact: { name: 'Test User', email: 'test@example.com' },
    consent: { contactByRoofHub: false },
    project
  });
  assert.equal(payload, null);
});

test('enquiry rate limiter blocks attempts above the local server-instance limit', () => {
  const headers = new Map([['x-forwarded-for', `203.0.113.${Math.floor(Math.random() * 200) + 1}`]]);
  const fakeRequest = { headers: { get: (name) => headers.get(name) || null } };
  let result;
  for (let i = 0; i < 12; i += 1) result = rateLimit.checkRequestRateLimit(fakeRequest, { namespace: 'foundation-test', limit: 12, windowMs: 60_000 });
  assert.equal(result.allowed, true);
  result = rateLimit.checkRequestRateLimit(fakeRequest, { namespace: 'foundation-test', limit: 12, windowMs: 60_000 });
  assert.equal(result.allowed, false);
  assert.ok(result.retryAfterSeconds > 0);
});

async function detailedRegression() {
  const fixture = JSON.parse(fs.readFileSync('scripts/fixtures/detailed-estimator-golden.json', 'utf8'));
  const estimator = await import(pathToFileURL(path.join(root, 'public/roofhub-estimator/src/index.mjs')).href);
  test('golden fixture is tied to the current detailed rate card', () => {
    assert.equal(estimator.DEFAULT_RATE_CARD.id, fixture.rateCardId);
  });
  for (const scenario of fixture.scenarios) {
    test(`detailed estimator golden result: ${scenario.name}`, () => {
      const input = scenario.input;
      const detailed = estimator.newProject();
      detailed.projectType = input.projectType;
      detailed.roofSystem = input.roofSystem;
      detailed.entryMode = 'manual';
      detailed.measurementBasis = 'actual';
      detailed.reviewedComponents = true;
      detailed.measurements = [estimator.newEntry('roofAreas', 'actual', { value: input.area })];
      detailed.access.choice = 'exclude';
      if (input.existingRoof) detailed.existingRoof = input.existingRoof;
      if (input.asbestos) detailed.asbestos = input.asbestos;
      if (input.battenMaterials === false) detailed.battenMaterials = false;
      for (const component of input.components || []) detailed.measurements.push(estimator.newEntry(component.group, 'actual', { value: component.value }));
      const result = estimator.calculateEstimate(detailed);
      assert.equal(result.ok, true);
      assert.equal(result.roofArea, scenario.expected.roofArea);
      assert.deepEqual(result.subtotal, scenario.expected.subtotal);
      assert.deepEqual(result.tax, scenario.expected.tax);
      assert.deepEqual(result.total, scenario.expected.total);
      assert.deepEqual(result.unpriced.map((item) => item.id), scenario.expected.unpriced);
    });
  }
}

detailedRegression().then(() => {
  if (process.exitCode) process.exit(process.exitCode);
  console.log(`${cases} shared-foundation and estimator-regression cases passed.`);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
