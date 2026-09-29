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
  const loaded=new Module(filename); loaded.filename=filename; loaded.paths=Module._nodeModulePaths(path.dirname(filename));
  const nativeRequire=loaded.require.bind(loaded);
  loaded.require=(id)=>{
    if(id.startsWith('.')){
      const dependency=path.resolve(path.dirname(filename),id+'.ts');
      if(fs.existsSync(dependency))return load(dependency);
    }
    return nativeRequire(id);
  };
  loaded._compile(output,filename);return loaded.exports;
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

const corr=load('lib/corrugated-maths.ts');
const rawObs=fs.readFileSync('data/observations.ts','utf8');
const obs=JSON.parse(rawObs.slice(rawObs.indexOf('= [')+2,rawObs.lastIndexOf(']')+1));
const metadata=JSON.parse(fs.readFileSync('data/research/corrugated.json','utf8'));
const listed=id=>{const o=obs.find(r=>r.id===id);const m=metadata.retail.find(r=>r.observationId===id);return corr.normaliseListing(o,m);};
test('MAXAM exact GST conversion',()=>near(listed('corr-rc-maxam-20260928').inclGstPerLm,31.97));
test('MAXAM coverage conversion',()=>near(listed('corr-rc-maxam-20260928').inclGstPerM2,42.06578947368421));
test('archived seller cover stays conditional',()=>assert.equal(listed('lr-18').conditionalCover,true));
test('Bitz coverage arithmetic',()=>near(listed('lr-18').inclGstPerM2,22.42307692307692));
test('unknown tax stays null',()=>assert.equal(listed('corr-bunnings-painted-20260928').inclGstPerLm,null));
test('unknown width stays null',()=>assert.equal(listed('corr-mitre-slimline-20260928').inclGstPerM2,null));
test('fixed 3 m zinc sheet is not priced per metre',()=>near(listed('corr-bunnings-zinc3-20260928').originalPerLm,64.94/3));
test('fixed 3 m galv sheet is not priced per metre',()=>near(listed('corr-bunnings-galv3-20260928').originalPerLm,67.93/3));
const spec={coverMm:760,coverBasis:'confirmed',fixedLengthM:null};
const priced={...observation,unit:'lm',amountExact:27.80,gstBasis:'excl'};
for(const [name,change] of [['unverified',{status:'provisional'}],['labour',{priceBasis:'labour-only'}],['no exact value',{amountExact:undefined}],['negative',{amountExact:-10}],['unsupported unit',{unit:'job'}],['unknown tax enum',{gstBasis:'bad'}]])test(`conversion rejects ${name}`,()=>assert.throws(()=>corr.normaliseListing({...priced,...change},spec)));
test('conversion rejects missing fixed length',()=>assert.throws(()=>corr.normaliseListing({...priced,unit:'each'},spec)));
test('conversion rejects zero cover',()=>assert.throws(()=>corr.normaliseListing(priced,{...spec,coverMm:0})));
test('conversion rejects invalid cover classification',()=>assert.throws(()=>corr.normaliseListing(priced,{...spec,coverBasis:'guess'})));
const budget={area:200,basis:'actual',pitchDegrees:25,pricePerLm:27.8,gstBasis:'excl',coverMm:760,extraPercent:0,minimumOrderLm:50};
test('default sheet subtotal uses unrounded rate',()=>near(corr.sheetBudget(budget).totalInclGst,8413.157894736842));
test('actual area bypasses pitch',()=>near(corr.sheetBudget({...budget,pitchDegrees:NaN}).surfaceM2,200));
test('plan conversion happens once',()=>near(corr.sheetBudget({...budget,basis:'plan'}).surfaceM2,maths.roofSurfaceArea(200,25,'plan')));
test('allowance affects order not geometry',()=>{const r=corr.sheetBudget({...budget,extraPercent:10});near(r.surfaceM2,200);near(r.totalInclGst,8413.157894736842*1.1);});
test('minimum quantity is honoured',()=>{const r=corr.sheetBudget({...budget,area:10});assert.equal(r.minimumApplies,true);near(r.billedLm,50);near(r.totalInclGst,1598.5);});
test('GST-inclusive quote is not taxed again',()=>near(corr.sheetBudget({...budget,pricePerLm:31.97,gstBasis:'incl'}).totalInclGst,8413.157894736842));
for(const [field,value] of [['area',0],['area',NaN],['area',Infinity],['pricePerLm',0],['coverMm',0],['extraPercent',-1],['extraPercent',101],['minimumOrderLm',-1],['minimumOrderLm',Infinity],['basis','unknown'],['gstBasis','unknown']])test(`sheet budget rejects ${field} ${value}`,()=>assert.throws(()=>corr.sheetBudget({...budget,[field]:value})));
test('sheet budget rejects plan pitch 90',()=>assert.throws(()=>corr.sheetBudget({...budget,basis:'plan',pitchDegrees:90})));
test('sheet budget rejects numeric overflow',()=>assert.throws(()=>corr.sheetBudget({...budget,area:Number.MAX_VALUE,pricePerLm:Number.MAX_VALUE})));
test('sheet count rounds up',()=>assert.equal(corr.sheetCount(10,760),14));
test('exact sheet count',()=>assert.equal(corr.sheetCount(7.6,760),10));
test('invalid sheet count rejects',()=>assert.throws(()=>corr.sheetCount(-10,760)));
test('unsafe sheet count rejects',()=>assert.throws(()=>corr.sheetCount(Number.MAX_VALUE,1)));

// Same mathematical primitives, separate five-rib listing metadata.
const fiveMeta=JSON.parse(fs.readFileSync('data/research/five-rib.json','utf8'));
const fiveListed=id=>corr.normaliseListing(obs.find(row=>row.id===id),fiveMeta.retail.find(row=>row.observationId===id));
test('five-rib Bitz cover does not change corrugate cover',()=>{near(fiveListed('lr-18').inclGstPerM2,17.49/.840);near(listed('lr-18').inclGstPerM2,17.49/.780);});
test('five-rib archived cover remains conditional',()=>assert.equal(fiveListed('lr-18').conditionalCover,true));
test('Bunnings GST known but five-rib cover unknown',()=>{near(fiveListed('five-bunnings-20260928').inclGstPerLm,30.35);assert.equal(fiveListed('five-bunnings-20260928').inclGstPerM2,null);});
test('Mitre 10 painted five-rib cover unknown',()=>assert.equal(fiveListed('five-mitre-colour-20260928').inclGstPerM2,null));
test('Mitre 10 malformed unpainted width excluded',()=>assert.equal(fiveListed('five-mitre-unpainted-20260928').inclGstPerM2,null));
test('Renovation sheet price divided by 3.6 once',()=>near(fiveListed('five-renovation-sheet-20260928').originalPerLm,73/3.6));
test('Renovation unknown GST blocks inclusive conversions',()=>{const c=fiveListed('five-renovation-sheet-20260928');assert.equal(c.inclGstPerLm,null);assert.equal(c.inclGstPerM2,null);});
const qa={pricePerLm:25,gstBasis:'incl',coverMm:760,minimumOrderLm:0};
const qb={...qa,coverMm:840};
const compare={area:200,basis:'actual',pitchDegrees:25,extraPercent:0,quoteA:qa,quoteB:qb};
test('comparison equivalent basis totals',()=>{const c=corr.compareSheetQuotes(compare);near(c.a.totalInclGst,200*25/.760);near(c.b.totalInclGst,200*25/.840);near(c.deltaInclGst,200*25/.840-200*25/.760);});
test('comparison exact rates before material allowance',()=>{const c=corr.compareSheetQuotes({...compare,extraPercent:10});near(c.aPerCoveredM2,25/.760);near(c.a.totalInclGst,200*25/.760*1.1);});
test('comparison actual area not pitch adjusted',()=>near(corr.compareSheetQuotes({...compare,pitchDegrees:NaN}).a.surfaceM2,200));
test('comparison plan area converted once for each quote',()=>{const c=corr.compareSheetQuotes({...compare,basis:'plan'});near(c.a.surfaceM2,maths.roofSurfaceArea(200,25,'plan'));near(c.a.surfaceM2,c.b.surfaceM2);});
test('equal quotes have zero difference',()=>near(corr.compareSheetQuotes({...compare,quoteB:qa}).deltaInclGst,0));
test('GST inclusive/exclusive equivalent prices compare equally',()=>near(corr.compareSheetQuotes({...compare,quoteA:{...qa,pricePerLm:20,gstBasis:'excl'},quoteB:{...qa,pricePerLm:23,gstBasis:'incl'}}).deltaInclGst,0));
test('minimum order applies independently',()=>{const c=corr.compareSheetQuotes({...compare,quoteA:{...qa,minimumOrderLm:500}});assert.equal(c.a.minimumApplies,true);assert.equal(c.b.minimumApplies,false);near(c.a.totalInclGst,12500);});
for(const which of ['quoteA','quoteB']){
 for(const [field,value] of [['gstBasis','unknown'],['pricePerLm',0],['pricePerLm',NaN],['coverMm',0],['coverMm',-760],['minimumOrderLm',-1]])test(`comparison rejects ${which} ${field} ${value}`,()=>assert.throws(()=>corr.compareSheetQuotes({...compare,[which]:{...qa,[field]:value}})));
}
test('comparison rejects bad pitch',()=>assert.throws(()=>corr.compareSheetQuotes({...compare,basis:'plan',pitchDegrees:90})));
test('comparison rejects excessive allowance',()=>assert.throws(()=>corr.compareSheetQuotes({...compare,extraPercent:101})));
test('comparison rejects overflow in unit-area rate',()=>assert.throws(()=>corr.compareSheetQuotes({...compare,area:1e-300,quoteA:{...qa,pricePerLm:1e30,coverMm:1e-300}})));

// Pressed tile quantities are separate from market pricing and the estimator rate card.
const tile=load('lib/pressed-tile-maths.ts');
const tq={area:200,basis:'actual',pitchDegrees:25,panelsPerM2:2.15,extraPercent:0,packSize:1,minimumPanels:0};
test('tile baseline 430 panels',()=>assert.equal(tile.panelQuantity(tq).purchasePanels,430));
test('tile 2.2 density uses 440 panels',()=>assert.equal(tile.panelQuantity({...tq,panelsPerM2:2.2}).purchasePanels,440));
test('tile fractions round up after allowance',()=>assert.equal(tile.panelQuantity({...tq,extraPercent:5}).purchasePanels,452));
test('tile floating boundary is not an extra panel',()=>assert.equal(tile.panelQuantity({...tq,extraPercent:10}).purchasePanels,473));
test('tile actual area ignores unused pitch',()=>assert.equal(tile.panelQuantity({...tq,pitchDegrees:NaN}).surfaceM2,200));
test('tile actual area ignores an impossible unused pitch',()=>assert.equal(tile.panelQuantity({...tq,pitchDegrees:100}).surfaceM2,200));
test('tile plan area is converted once',()=>{const r=tile.panelQuantity({...tq,basis:'plan'});near(r.surfaceM2,maths.roofSurfaceArea(200,25,'plan'));assert.equal(r.requiredPanels,475);});
test('tile 0-degree plan area unchanged',()=>assert.equal(tile.panelQuantity({...tq,basis:'plan',pitchDegrees:0}).requiredPanels,430));
test('tile allowance leaves geometry unchanged',()=>assert.equal(tile.panelQuantity({...tq,extraPercent:20}).surfaceM2,200));
test('tile 150m2 rounds up half-panel',()=>assert.equal(tile.panelQuantity({...tq,area:150}).requiredPanels,323));
test('tile no minimum unless it exceeds requirement',()=>assert.equal(tile.panelQuantity({...tq,minimumPanels:430}).minimumApplies,false));
test('tile minimum applied before pack rounding',()=>{const r=tile.panelQuantity({...tq,minimumPanels:451,packSize:20});assert.equal(r.requiredPanels,430);assert.equal(r.purchasePanels,460);assert.equal(r.packs,23);assert.equal(r.packExtraPanels,9);assert.equal(r.minimumApplies,true);});
test('tile pack rounding alone',()=>{const r=tile.panelQuantity({...tq,packSize:12});assert.equal(r.purchasePanels,432);assert.equal(r.packExtraPanels,2);assert.equal(r.minimumApplies,false);});
test('tile exact pack does not round twice',()=>assert.equal(tile.panelQuantity({...tq,packSize:10}).purchasePanels,430));
test('tile very small positive roof still needs a whole panel',()=>assert.equal(tile.panelQuantity({...tq,area:.01}).requiredPanels,1));
for(const [field,value] of [['area',0],['area',NaN],['area',Infinity],['area',1000001],['panelsPerM2',0],['panelsPerM2',NaN],['panelsPerM2',1001],['extraPercent',-1],['extraPercent',101],['extraPercent',NaN],['packSize',0],['packSize',1.5],['packSize',NaN],['packSize',1000001],['minimumPanels',-1],['minimumPanels',1.5],['minimumPanels',Infinity],['minimumPanels',1000000001],['basis','unknown']])test(`tile quantity rejects ${field} ${value}`,()=>assert.throws(()=>tile.panelQuantity({...tq,[field]:value})));
for(const pitch of [-1,90,NaN,Infinity])test(`tile plan rejects pitch ${pitch}`,()=>assert.throws(()=>tile.panelQuantity({...tq,basis:'plan',pitchDegrees:pitch})));
test('tile oversized converted area rejected',()=>assert.throws(()=>tile.panelQuantity({...tq,area:1000000,basis:'plan'})));
test('tile epsilon round preserves exact integer',()=>assert.equal(tile.wholePanels(473.00000000000006),473));
test('tile real fractional panel is never rounded down',()=>assert.equal(tile.wholePanels(473.00001),474));
test('tile invalid large quantity rejected',()=>assert.throws(()=>tile.wholePanels(Number.MAX_SAFE_INTEGER)));
test('tile negative quantity rejected',()=>assert.throws(()=>tile.wholePanels(-1)));
test('tile unknown GST keeps quoted basis',()=>assert.deepEqual(tile.panelSubtotal(430,12,'unknown'),{quotedSubtotal:5160,inclGst:null,gst:'unknown'}));
test('tile excluding GST converts once',()=>near(tile.panelSubtotal(430,12,'excl').inclGst,5934));
test('tile including GST is not taxed again',()=>near(tile.panelSubtotal(430,12,'incl').inclGst,5160));
test('tile original rate not prematurely rounded',()=>near(tile.panelSubtotal(431,12.3456,'excl').inclGst,431*12.3456*1.15));
for(const n of [0,-1,1.5,Infinity,2000000001])test(`tile subtotal invalid quantity ${n}`,()=>assert.throws(()=>tile.panelSubtotal(n,12,'incl')));
for(const price of [0,-1,NaN,Infinity,10000001])test(`tile subtotal invalid price ${price}`,()=>assert.throws(()=>tile.panelSubtotal(430,price,'incl')));
test('tile subtotal invalid GST rejected',()=>assert.throws(()=>tile.panelSubtotal(430,12,'invalid')));
test('tile subtotal unsafe monetary precision rejected',()=>assert.throws(()=>tile.panelSubtotal(2000000000,10000000,'incl')));
test('tile separate batten check',()=>near(tile.battenAllowance(200,368),200/.368));
for(const [area,gauge] of [[0,368],[200,0],[NaN,368],[200,NaN],[200,5001]])test(`tile batten check rejects ${area}/${gauge}`,()=>assert.throws(()=>tile.battenAllowance(area,gauge)));
test('tile batten check does not alter panel count',()=>{tile.battenAllowance(200,400);assert.equal(tile.panelQuantity(tq).purchasePanels,430);});
test('tile quantities monotonic with allowance',()=>{let old=0;for(let p=0;p<=100;p++){const q=tile.panelQuantity({...tq,extraPercent:p});assert.ok(q.purchasePanels>=old);assert.ok(q.purchasePanels>=q.allowancePanelEquivalent-1e-10);old=q.purchasePanels;}});
test('tile pack rules always provide enough panels',()=>{for(const size of [1,2,7,12,20,100]){const q=tile.panelQuantity({...tq,packSize:size,minimumPanels:503});assert.equal(q.purchasePanels%size,0);assert.ok(q.purchasePanels>=Math.max(q.requiredPanels,503));}});

console.log(`${cases} math and rate-integrity cases passed.`);

// Keep the panel worksheet behaviour in the standard regression gate.
require('./check-tile-ui.cjs');
