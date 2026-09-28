/** Runs against the actual TypeScript modules using the project's TypeScript dev dependency. */
const ts = require('typescript');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const assert = require('node:assert/strict');
let cases = 0;
function load(file){
  const filename=path.resolve(file);
  const output=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
  const loaded=new Module(filename); loaded.filename=filename; loaded.paths=Module._nodeModulePaths(path.dirname(filename)); loaded._compile(output,filename);return loaded.exports;
}
// Type-only imports in these modules do not create runtime framework dependencies.
const maths=load('lib/roof-maths.ts');
const {deriveRate}=load('data/derive.ts');
function test(name, fn){try{fn();cases++;}catch(e){console.error(`FAIL ${name}: ${e.message}`);process.exitCode=1;}}
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);
test('plan area at 25 degrees',()=>near(maths.roofSurfaceArea(200,25,'plan'),220.67558379249837));
test('actual area is not converted twice',()=>near(maths.roofSurfaceArea(200,25,'actual'),200));
test('actual area ignores unused pitch',()=>near(maths.roofSurfaceArea(200,NaN,'actual'),200));
test('zero pitch preserves area',()=>near(maths.roofSurfaceArea(200,0,'plan'),200));
test('rise/run degrees',()=>near(maths.pitchFromRiseRun(1.5,3),26.56505117707799));
test('zero rise',()=>near(maths.pitchFromRiseRun(0,3),0));
test('effective cover conversion',()=>near(maths.sheetAreaRate(25,760),32.89473684210526));
test('own-rate budget',()=>assert.deepEqual(maths.budgetRange(200,150,200),{low:30000,high:40000}));
test('blank is not zero',()=>assert.equal(maths.numberInput(''),null));
test('whitespace is not zero',()=>assert.equal(maths.numberInput('  '),null));
test('invalid number',()=>assert.equal(maths.numberInput('abc'),null));
test('infinite number',()=>assert.equal(maths.numberInput('Infinity'),null));
test('valid zero remains zero',()=>assert.equal(maths.numberInput('0'),0));
for(const pitch of [-1,90,100,NaN,Infinity])test(`reject bad pitch ${pitch}`,()=>assert.throws(()=>maths.roofSurfaceArea(200,pitch,'plan')));
for(const area of [0,-1,NaN,Infinity])test(`reject bad area ${area}`,()=>assert.throws(()=>maths.roofSurfaceArea(area,25,'actual')));
for(const n of [0,-1,NaN])test(`reject invalid cover ${n}`,()=>assert.throws(()=>maths.sheetAreaRate(25,n)));
test('reject zero run',()=>assert.throws(()=>maths.pitchFromRiseRun(1,0)));
test('reject negative rise',()=>assert.throws(()=>maths.pitchFromRiseRun(-1,3)));
test('reject reversed price endpoints',()=>assert.throws(()=>maths.budgetRange(200,200,100)));
test('reject overflow',()=>assert.throws(()=>maths.budgetRange(Number.MAX_VALUE,2,3)));
const observation={id:'test',category:'roof-covering',roofSystem:'corrugate',item:'Test',amountLow:20,amountHigh:30,unit:'m2',priceBasis:'material-only',gstBasis:'incl',region:'NZ',observedAt:'2026-09-28',sourceUrl:'https://example.test/',sourceName:'Test',sourceType:'supplier',evidenceTier:'market',status:'verified',areaBasis:'sloping',priceContext:'retail-listing'};
const args={observations:[observation],key:'test',label:'Test',basis:'material',unit:'m2',gstBasis:'incl',reviewedAt:'2026-09-28'};
test('derive comparable observed span',()=>assert.equal(deriveRate(args).high,30));
test('reject unknown GST',()=>assert.throws(()=>deriveRate({...args,gstBasis:'unknown'})));
test('exclude historical guides',()=>assert.throws(()=>deriveRate({...args,observations:[{...observation,priceContext:'historical-guide'}]})));
test('exclude research-only observations',()=>assert.throws(()=>deriveRate({...args,observations:[{...observation,priceContext:'research-only'}]})));
test('exclude disputed numbers',()=>assert.throws(()=>deriveRate({...args,observations:[{...observation,rangeEligible:false}]})));
test('exclude provisional numbers',()=>assert.throws(()=>deriveRate({...args,observations:[{...observation,status:'provisional'}]})));
test('reject unknown area basis',()=>assert.throws(()=>deriveRate({...args,observations:[{...observation,areaBasis:'unknown'}]})));
test('reject mixed area basis',()=>assert.throws(()=>deriveRate({...args,observations:[observation,{...observation,id:'other',areaBasis:'plan'}]})));
test('reject mixed price scope',()=>assert.throws(()=>deriveRate({...args,observations:[observation,{...observation,id:'other',priceBasis:'supply-install'}]})));
test('reject mislabelled range',()=>assert.throws(()=>deriveRate({...args,basis:'labour'})));
test('reject inverted observation',()=>assert.throws(()=>deriveRate({...args,observations:[{...observation,amountHigh:10}]})));
test('reject negative observation',()=>assert.throws(()=>deriveRate({...args,observations:[{...observation,amountLow:-1}]})));
test('reject nonfinite observation',()=>assert.throws(()=>deriveRate({...args,observations:[{...observation,amountLow:Infinity}]})));
test('area conversion is monotonic and round-trips',()=>{let previous=200;for(let angle=0;angle<=60;angle++){const surface=maths.roofSurfaceArea(200,angle,'plan');assert.ok(surface>=previous);near(surface*Math.cos(angle*Math.PI/180),200);previous=surface;}});
test('reject incomplete lower bound',()=>assert.throws(()=>deriveRate({...args,observations:[{...observation,amountHigh:undefined}]})));
test('reject incomplete upper bound',()=>assert.throws(()=>deriveRate({...args,observations:[{...observation,amountLow:undefined}]})));
test('accept exact observation',()=>assert.equal(deriveRate({...args,observations:[{...observation,amountLow:undefined,amountHigh:undefined,amountExact:25}]}).low,25));
console.log(`${cases} math and rate-integrity cases passed.`);
