import { GROUPS, roofName } from './model.mjs';
import { groupQuantity, entryPitch, validNumber } from './geometry.mjs';
import { DEFAULT_RATE_CARD, resolveRate, componentRateId } from './rates.mjs';
import { validateProject, validateRate, isRange } from './validation.mjs';
export const moneyRound = x => Math.round((x + Number.EPSILON) * 100) / 100;
const add = (a,b) => ({ min:moneyRound(a.min+b.min), max:moneyRound(a.max+b.max) });
const Z = () => ({min:0,max:0});
export function netRange(range,taxBasis,gstRate) {
  if(!isRange(range)) throw new Error('Invalid price range.');
  const f=taxBasis==='incl'?1/(1+gstRate):1;
  return {min:range.min*f,max:range.max*f};
}
export function priceRate(rate,quantity,{wastePct=0,skipLabour=false,gstRate=0.15}={}) {
  if(!validNumber(quantity,0,10_000_000_000)||!validNumber(wastePct,0,50)) throw new Error('Invalid pricing quantity or material waste.');
  const errors=validateRate(rate);
  if(errors.length) throw new Error(errors.join(' '));
  const missing=[];
  let amount=Z();
  if(rate.kind==='installed') {
    const r=netRange(rate.installed,rate.taxBasis,gstRate);
    amount={min:r.min*quantity,max:r.max*quantity};
    // Bundled installed rates include their own waste allowance. Never add
    // the material waste factor to the full bundle or to installation labour.
  } else {
    if(rate.material===null) missing.push('materials');
    else {
      const r=netRange(rate.material,rate.taxBasis,gstRate);
      amount=add(amount,{min:r.min*quantity*(1+wastePct/100),max:r.max*quantity*(1+wastePct/100)});
    }
    if(!skipLabour) {
      if(rate.labour===null) missing.push('labour');
      else {
        const r=netRange(rate.labour,rate.taxBasis,gstRate);
        amount=add(amount,{min:r.min*quantity,max:r.max*quantity});
      }
    }
  }
  if(!Number.isFinite(amount.max)||amount.max*100>Number.MAX_SAFE_INTEGER)throw new Error('This value is too large to price reliably.');
  return { amount:{min:moneyRound(amount.min),max:moneyRound(amount.max)}, missing };
}
export function scaffoldEstimate(project,card=DEFAULT_RATE_CARD) {
  const a=project.access;
  const result={lines:[],unpriced:[],notes:[]};
  if(a.choice==='exclude') { result.notes.push('Scaffolding and edge protection are excluded from this estimate, not deemed unnecessary.'); return result; }
  if(a.choice==='unsure') { result.unpriced.push({id:'access',label:'Site safety / access',reason:'Needs site assessment and a scaffold perimeter.'}); return result; }
  if(a.system==='edge' && project.storeys!==1) throw new Error('Two-storey edge-protection pricing is outside this estimator.');
  const pitches=project.measurements.filter(e=>e.group==='roofAreas').map(e=>entryPitch(project,e));
  const maxPitch=Math.max(project.pitch,...pitches);
  if(a.system==='edge' && (project.site==='difficult' || maxPitch>35 || !a.assessmentAccepted)) {
    result.unpriced.push({id:'access',label:'Edge protection',reason:project.site==='difficult'?'Difficult-site edge protection needs a site-specific allowance.':maxPitch>35?'A roof above 35° needs specifically designed protection; no standard allowance is applied.':'Confirm that suitability will be assessed by the installer.'});
    return result;
  }
  const key=`${a.system}-${project.storeys}-${project.site}`;
  const rate=card.scaffold[key];
  if(!rate) { result.unpriced.push({id:'access',label:'Scaffolding',reason:'No rate set for this configuration.'}); return result; }
  const base=netRange(rate.base,rate.taxBasis,card.gstRate), minimum=netRange(rate.minimum,rate.taxBasis,card.gstRate);
  result.lines.push({id:'access.base',section:'access',label:a.system==='edge'?'Single-storey edge protection':`${project.storeys===1?'Single':'Two'}-storey four-plank scaffold`,unit:'lm',quantity:a.perimeter,status:rate.status,
    amount:{min:moneyRound(Math.max(minimum.min,a.perimeter*base.min)),max:moneyRound(Math.max(minimum.max,a.perimeter*base.max))},missing:[],note:`Includes erection, dismantling and ${card.scaffold.includedWeeks} weeks of hire. ${project.site==='difficult'?'Difficult-site setup allowance. ':''}Working budget only; provider must confirm scope.`});
  const extra=Math.max(0,a.weeks-card.scaffold.includedWeeks);
  if(extra) {
    const weekly=netRange(rate.weekly,rate.taxBasis,card.gstRate);
    result.lines.push({id:'access.extra',section:'access',label:`Additional scaffold hire · ${extra} ${extra===1?'week':'weeks'}`,unit:'lm/week',quantity:a.perimeter*extra,status:rate.status,
      amount:{min:moneyRound(a.perimeter*extra*weekly.min),max:moneyRound(a.perimeter*extra*weekly.max)},missing:[],note:'Only weeks beyond the included period are charged again.'});
  }
  result.notes.push('Access pricing is a provisional budget, not a compliant scaffold design. Ground conditions, working height, ties, engineering, equipment quantities and hire terms need confirmation.');
  if(project.storeys===2 && a.perimeter<30) result.notes.push('Small two-storey scaffold jobs need a supplier minimum charge; none has been calibrated for this rate card.');
  return result;
}
export function calculateEstimate(project,card=DEFAULT_RATE_CARD) {
  const errors=validateProject(project,{complete:true});
  if(errors.length) return {ok:false,errors};
  const badOverrides=[];
  if(project.pricingMode==='custom') for(const [id,r] of Object.entries(project.rateOverrides)) {
    if(!card.rates[id]) badOverrides.push(`Unknown rate ${id}.`);
    else badOverrides.push(...validateRate(r,card.rates[id]).map(x=>`${id}: ${x}`));
  }
  if(badOverrides.length) return {ok:false,errors:badOverrides};
  const lines=[],unpriced=[],notes=[],assumptions=[];
  const area=groupQuantity(project,'roofAreas');
  const lineFor = (id,quantity,section,options={}) => {
    if(quantity<=0) return;
    const rate=resolveRate(project,id,card);
    if(!rate) { unpriced.push({id,label:id,reason:'No compatible rate configured.'}); return; }
    if(options.skipLabour && rate.kind==='installed') { unpriced.push({id,label:rate.label,reason:'A bundled underlay rate cannot be separated from labour already included in pressed-tile installation. Use a split rate with material supply identified.'}); return; }
    const priced=priceRate(rate,quantity,{...options,gstRate:card.gstRate});
    const line={id,section,label:rate.label,unit:rate.unit,quantity,amount:priced.amount,missing:priced.missing,status:rate.status,note:rate.note};
    lines.push(line);
    if(priced.missing.length) unpriced.push({id,label:rate.label,reason:`${priced.missing.join(' and ')} not yet priced`});
  };
  lineFor(`${project.roofSystem}.covering`,area,'roof',{wastePct:project.wastePct});
  if(project.underlay) {
    lineFor('common.underlay',area,'roof',{skipLabour:project.roofSystem==='pressed-metal'});
    if(project.roofSystem==='pressed-metal') notes.push('Underlay material is added, but underlay labour is not charged again: it is included in the pressed-tile installation labour.');
  } else notes.push('Underlay has been excluded by selection; this is a pricing choice, not confirmation that underlay is unnecessary.');
  if(project.fixings && project.roofSystem!=='tray') lineFor(`${project.roofSystem}.fixings`,area,'roof');
  else if(project.roofSystem!=='tray') notes.push('Roof fixing materials are excluded by selection.');
  if(project.roofSystem==='pressed-metal') {
    if(project.battenMaterials) lineFor('pressed-metal.battens',area,'roof');
    else notes.push('Pressed-tile batten material is excluded; its installation labour remains in the owner-supplied tile labour rate.');
  } else if(project.roofSystem!=='tray') notes.push('Long-run rates assume the supporting framing/purlins are already installed.');
  for(const group of GROUPS.filter(g=>g.id!=='roofAreas')) lineFor(componentRateId(project.roofSystem,group.id),groupQuantity(project,group.id),'components');
  if(!project.reviewedComponents) unpriced.push({id:'scope.components',label:'Flashing / rainwater quantities',reason:'Component measurements have not been confirmed as complete.'});
  if(project.projectType==='reroof') {
    if(project.asbestos==='positive') unpriced.push({id:'removal',label:'Specialist asbestos removal',reason:'Excluded from normal removal pricing. Obtain a specialist assessment and quote.'});
    else if(project.existingRoof==='unknown') unpriced.push({id:'removal',label:'Existing roof removal',reason:'Roof type and asbestos risk need to be identified before removal is priced.'});
    else if(project.existingRoof==='decramastic' && project.asbestos!=='negative') unpriced.push({id:'removal',label:'Decramastic removal',reason:'The $5–$9/m² non-asbestos rate is not applied until a negative test/competent assessment is confirmed. Testing and any specialist removal remain unpriced.'});
    else lineFor(`removal.${project.existingRoof}`,area,'removal');
  }
  for(const c of project.customItems) {
    if(c.quantity===0) continue;
    if(c.sourceBasis==='plan' && c.unit!=='each' && c.quantityConfirmed!==true) {unpriced.push({id:c.id,label:c.name,reason:'Review this custom plan-view quantity, apply any slope correction, and confirm it in Components.'});continue;}
    if(c.low===null || c.high===null) { unpriced.push({id:c.id,label:c.name,reason:'Custom component needs a price.'}); continue; }
    const r=netRange({min:c.low,max:c.high},c.taxBasis,card.gstRate);
    lines.push({id:c.id,section:'custom',label:c.name,unit:c.unit,quantity:c.quantity,amount:{min:moneyRound(r.min*c.quantity),max:moneyRound(r.max*c.quantity)},missing:[],status:'custom',note:'User-supplied installed rate; no extra labour or waste is added.'});
  }
  const access=scaffoldEstimate(project,card);lines.push(...access.lines);unpriced.push(...access.unpriced);notes.push(...access.notes);
  const subtotal=lines.reduce((s,l)=>add(s,l.amount),Z());
  const tax={min:moneyRound(subtotal.min*card.gstRate),max:moneyRound(subtotal.max*card.gstRate)};
  const total=add(subtotal,tax);
  if(!card.sourceTaxConfirmed) assumptions.push('The discussion did not consistently specify GST. This development card assumes its source figures exclude GST; this must be approved before publishing.');
  if(!card.approved) assumptions.push('Working rates, not an approved market price guide. Owner-supplied labour/removal rates are mixed with provisional material and scaffold allowances.');
  if(project.roofSystem==='pressed-metal' && !(project.pricingMode==='custom' && project.rateOverrides['pressed-metal.covering'])) assumptions.push('Pressed-metal-tile materials are an illustrative target, not a verified supply price.');
  if(project.wastePct) assumptions.push(`${project.wastePct}% waste is applied to split-price covering materials only. Labour, removal, underlay and bundled installed rates are not multiplied by waste.`);
  if(project.measurements.some(e=>e.basis==='plan')) assumptions.push('Plan measurements are converted once. Hip/valley conversion assumes a regular equal-pitch 45° plan intersection; irregular geometry requires actual lengths.');
  assumptions.push('No automatic competitor discount, regional surcharge or extra labour complexity multiplier has been invented. The entered rate ranges are used directly.');
  return {ok:true,version:1,projectId:project.id,rateCardId:card.id,currency:card.currency,gstRate:card.gstRate,roofArea:area,roofName:roofName(project.roofSystem),lines,unpriced,notes:[...new Set(notes)],assumptions,exclusions:card.exclusions,
    subtotal,tax,total,complete:unpriced.length===0,approved:card.approved && card.sourceTaxConfirmed,createdAt:new Date().toISOString()};
}
