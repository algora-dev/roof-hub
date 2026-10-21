import { readFileSync, existsSync } from 'node:fs';
import { compareRoofingQuote, normalizeQuoteAmount, quoteAmountScenarios, QUOTE_SCOPE_ITEMS, scopeAssessment } from '../lib/quote-checker/index.mjs';
let checks=0; const failures=[];
const assert=(condition,message)=>{checks++; if(!condition)failures.push(message);};
const read=p=>readFileSync(p,'utf8');

assert(normalizeQuoteAmount(10000,'incl')===10000,'GST incl normalization changed');
assert(normalizeQuoteAmount(10000,'excl')===11500,'NZ 15% GST normalization changed');
assert(normalizeQuoteAmount(10000,'unknown')===null,'Unknown GST should remain un-normalized as a single amount');
assert(quoteAmountScenarios(10000,'unknown').length===2,'Unknown GST must produce two defensible scenarios');
assert(quoteAmountScenarios(10000,'unknown')[0].amountInclGst===10000,'Unknown GST included scenario changed');
assert(quoteAmountScenarios(10000,'unknown')[1].amountInclGst===11500,'Unknown GST extra scenario changed');
assert(normalizeQuoteAmount(0,'incl')===null,'Zero quote accepted');
assert(QUOTE_SCOPE_ITEMS.length===8,'Quote scope inventory changed unexpectedly');

const reference={low:20000,high:30000,gstBasis:'incl'};
function matchedScope(projectType){
 const assessment=scopeAssessment({projectType});
 const inc=[],exc=[];
 for(const [id,state] of Object.entries(assessment.expected)){(state==='included'?inc:exc).push(id);}
 return {inc,exc};
}
for(const projectType of ['new','reroof','unknown']){
 const {inc,exc}=matchedScope(projectType);
 for(const [amount,status] of [[19000,'below-range'],[25000,'within-range'],[31000,'above-range']]){
  const result=compareRoofingQuote({quotedAmount:amount,gstBasis:'incl',productMatch:'same',projectType,knownInclusions:inc,knownExclusions:exc,referenceEstimate:reference});
  assert(result.comparability==='good',`${projectType}/${amount} should be good`);
  assert(result.comparisonStatus===status,`${projectType}/${amount} status ${result.comparisonStatus}`);
 }
 const partial=compareRoofingQuote({quotedAmount:25000,gstBasis:'incl',productMatch:'same',projectType,knownInclusions:inc.slice(1),knownExclusions:exc,referenceEstimate:reference});
 assert(partial.comparability==='partial',`${projectType} unknown scope must be partial`);
 const mismatch=compareRoofingQuote({quotedAmount:25000,gstBasis:'incl',productMatch:'different',projectType,knownInclusions:inc,knownExclusions:exc,referenceEstimate:reference});
 assert(mismatch.comparability==='not-directly-comparable',`${projectType} product mismatch must block direct comparison`);
 assert(mismatch.comparisonStatus==='not-comparable',`${projectType} mismatch leaked price label`);
}

// Unknown GST is a partial comparison, not a dead end. If both tax interpretations land
// in the same price position, RoofHub may still state that position.
{
 const {inc,exc}=matchedScope('reroof');
 const stable=compareRoofingQuote({quotedAmount:25000,gstBasis:'unknown',productMatch:'same',projectType:'reroof',knownInclusions:inc,knownExclusions:exc,referenceEstimate:reference});
 assert(stable.comparability==='partial','Unknown GST should be partial when a matching baseline exists');
 assert(stable.comparisonStatus==='within-range','Unknown GST stable position should remain usable');
 assert(stable.gstScenarios.length===2 && !stable.gstAffectsPosition,'Stable GST scenarios should be shown without false ambiguity');
 const split=compareRoofingQuote({quotedAmount:27000,gstBasis:'unknown',productMatch:'same',projectType:'reroof',knownInclusions:inc,knownExclusions:exc,referenceEstimate:reference});
 assert(split.comparability==='partial','GST split should still be a partial comparison');
 assert(split.comparisonStatus==='not-comparable' && split.gstAffectsPosition,'GST-dependent price position should not be collapsed to one label');
 assert(new Set(split.gstScenarios.map(item=>item.position)).has('within-range') && new Set(split.gstScenarios.map(item=>item.position)).has('above-range'),'GST split scenarios incorrect');
}

for(const gstBasis of ['incl','excl','unknown']) for(const productMatch of ['same','different','unknown']) for(const hasReference of [true,false]){
 const {inc,exc}=matchedScope('reroof');
 const result=compareRoofingQuote({quotedAmount:25000,gstBasis,productMatch,projectType:'reroof',knownInclusions:inc,knownExclusions:exc,referenceEstimate:hasReference?reference:null});
 if(productMatch==='different'||!hasReference){
  assert(result.comparability==='not-directly-comparable',`Hard blocking condition failed ${gstBasis}/${productMatch}/${hasReference}`);
 } else if(gstBasis==='unknown'||productMatch==='unknown') assert(result.comparability==='partial','Unknown GST/product should be partial, not blocked');
 else assert(result.comparability==='good','Fully aligned quote should be good');
}

// Exhaustive tri-state scope regression. Every mismatch/unknown lowers comparison quality; matched scope remains good.
const tri=['included','excluded','unknown'];
const reroofItems=QUOTE_SCOPE_ITEMS.filter(i=>i.applies.includes('reroof'));
const total=3**reroofItems.length;
for(let mask=0;mask<total;mask++){
 let n=mask; const inc=[],exc=[]; let allMatched=true;
 for(const item of reroofItems){
  const state=tri[n%3]; n=Math.floor(n/3);
  if(state==='included')inc.push(item.id); else if(state==='excluded')exc.push(item.id);
  if(state!==item.reference) allMatched=false;
 }
 const result=compareRoofingQuote({quotedAmount:25000,gstBasis:'incl',productMatch:'same',projectType:'reroof',knownInclusions:inc,knownExclusions:exc,referenceEstimate:reference});
 assert(result.comparability===(allMatched?'good':'partial'),`Scope permutation ${mask} quality ${result.comparability}`);
 assert(result.comparisonStatus==='within-range',`Scope permutation ${mask} lost numeric position`);
}

const publicFiles=[
 'app/tools/quote-checker/page.tsx','components/quote-checker/QuoteChecker.tsx','lib/quote-checker/project-adapter.ts','lib/quote-checker/baseline.ts',
 'lib/assistant/orchestrator.ts','app/tools/page.tsx','app/page.tsx','data/siteRoutes.ts'
];
for(const file of publicFiles)assert(existsSync(file),`Missing Quote Checker file ${file}`);
const quoteUi=read('components/quote-checker/QuoteChecker.tsx');
assert(quoteUi.includes('Build the roof baseline before comparing the price'),'Baseline step missing');
assert(quoteUi.includes('Create baseline & continue'),'Inline baseline action missing');
assert(quoteUi.includes('Open Quick Estimate') && quoteUi.includes('Open Detailed Estimator'),'Alternative estimator paths missing');
assert(quoteUi.includes('both valid interpretations') || quoteUi.includes('both possible incl-GST totals'),'Unknown GST scenario guidance missing');
assert(!/overpriced|rip[ -]?off|unfair quote/i.test(quoteUi),'Quote Checker uses prohibited judgement language');
assert(quoteUi.includes('same roofing system') || quoteUi.includes('same roofing system'.replace('roofing ','')),'Product comparability UI missing');
assert(quoteUi.includes('does not assign made-up dollar values'),'Scope no-fabrication explanation missing');
const baseline=read('lib/quote-checker/baseline.ts');
assert(baseline.includes('priceQuickEstimate') && baseline.includes('applyQuickEstimateToRoofProject'),'Quote Checker baseline created a second pricing engine');
assert(baseline.includes('loadDetailedEstimatorModule'),'Quote Checker baseline is not using the deterministic estimator runtime');
const adapter=read('lib/quote-checker/project-adapter.ts');
assert(adapter.includes('isRateCardApprovedForPublicEstimate'),'Quote Checker bypasses rate-card approval registry');
assert(adapter.includes('allowReviewPricing'),'Calibration review pathway missing');
assert(read('components/quick-estimate/QuickRoofEstimate.tsx').includes('Use this estimate in Quote Checker'),'Quick Estimate return path missing');
assert(read('components/RoofHubEstimator.tsx').includes('Return to Quote Checker'),'Detailed Estimate return path missing');
assert(read('lib/assistant/orchestrator.ts').includes('quote-checker'),'Assistant cannot route to Quote Checker');
assert(read('data/siteRoutes.ts').includes('path: "/tools/quote-checker"') && read('data/siteRoutes.ts').includes('indexable: false'),'Quote Checker indexability boundary missing');

if(failures.length){console.error(failures.join('\n'));console.error(`${failures.length}/${checks} quote-checker checks failed`);process.exit(1);}
console.log(`Quote Checker V2 checks: ${checks} passed; ${total} reroof scope permutations exercised.`);
