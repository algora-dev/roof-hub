import { readFileSync, existsSync } from 'node:fs';
import { compareRoofingQuote, normalizeQuoteAmount, QUOTE_SCOPE_ITEMS, scopeAssessment } from '../lib/quote-checker/index.mjs';
let checks=0; const failures=[];
const assert=(condition,message)=>{checks++; if(!condition)failures.push(message);};
const read=p=>readFileSync(p,'utf8');

assert(normalizeQuoteAmount(10000,'incl')===10000,'GST incl normalization changed');
assert(normalizeQuoteAmount(10000,'excl')===11500,'NZ 15% GST normalization changed');
assert(normalizeQuoteAmount(10000,'unknown')===null,'Unknown GST must not be normalized');
assert(normalizeQuoteAmount(0,'incl')===null,'Zero quote accepted');
assert(QUOTE_SCOPE_ITEMS.length===8,'Quote scope inventory changed unexpectedly');

const reference={low:20000,high:30000,gstBasis:'incl'};
const scopeIds=QUOTE_SCOPE_ITEMS.map(i=>i.id);
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

for(const gstBasis of ['incl','excl','unknown']) for(const productMatch of ['same','different','unknown']) for(const hasReference of [true,false]){
 const {inc,exc}=matchedScope('reroof');
 const result=compareRoofingQuote({quotedAmount:25000,gstBasis,productMatch,projectType:'reroof',knownInclusions:inc,knownExclusions:exc,referenceEstimate:hasReference?reference:null});
 if(gstBasis==='unknown'||productMatch==='different'||!hasReference){
  assert(result.comparability==='not-directly-comparable',`Blocking condition failed ${gstBasis}/${productMatch}/${hasReference}`);
 } else if(productMatch==='unknown') assert(result.comparability==='partial','Unknown product match should be partial');
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
 'app/tools/quote-checker/page.tsx','components/quote-checker/QuoteChecker.tsx','lib/quote-checker/project-adapter.ts',
 'lib/assistant/orchestrator.ts','app/tools/page.tsx','app/page.tsx','data/siteRoutes.ts'
];
for(const file of publicFiles)assert(existsSync(file),`Missing Package C file ${file}`);
const quoteUi=read('components/quote-checker/QuoteChecker.tsx');
assert(quoteUi.includes('Not directly comparable yet'),'Required comparability language missing');
assert(!/overpriced|rip[ -]?off|unfair quote/i.test(quoteUi),'Quote Checker uses prohibited judgement language');
assert(quoteUi.includes('GST basis'),'GST basis UI missing');
assert(quoteUi.includes('same roofing system'),'Product comparability UI missing');
assert(quoteUi.includes('does not assign made-up dollar values'),'Scope no-fabrication explanation missing');
const adapter=read('lib/quote-checker/project-adapter.ts');
assert(adapter.includes('isRateCardApprovedForPublicEstimate'),'Quote Checker bypasses rate-card approval registry');
assert(adapter.includes('allowReviewPricing'),'Calibration review pathway missing');
assert(read('lib/assistant/orchestrator.ts').includes('quote-checker'),'Assistant cannot route to Quote Checker');
assert(read('data/siteRoutes.ts').includes('path: "/tools/quote-checker"') && read('data/siteRoutes.ts').includes('indexable: false'),'Quote Checker indexability boundary missing');

if(failures.length){console.error(failures.join('\n'));console.error(`${failures.length}/${checks} quote-checker checks failed`);process.exit(1);}
console.log(`Quote Checker checks: ${checks} passed; ${total} reroof scope permutations exercised.`);
