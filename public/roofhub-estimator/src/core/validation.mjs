import { GROUP_MAP, ROOFS, EXISTING_ROOFS } from './model.mjs';
import { validNumber, measuredValue } from './geometry.mjs';
const validId = value => typeof value==='string' && /^[A-Za-z0-9._:-]{1,150}$/.test(value);
export const isRange = r => !!r && validNumber(r.min) && validNumber(r.max) && r.max >= r.min;
export function validateRate(rate, expected) {
  const errors=[];
  if (!rate || typeof rate!=='object') return ['Invalid rate.'];
  if (expected && rate.unit!==expected.unit) errors.push(`Unit must be ${expected.unit}; convert rates explicitly before import.`);
  if (!['m2','lm','each','item'].includes(rate.unit)) errors.push('Unsupported rate unit.');
  if (!['incl','excl'].includes(rate.taxBasis)) errors.push('A rate must state whether GST is included or excluded.');
  if (rate.kind==='installed') { if(!isRange(rate.installed)) errors.push('Installed price needs a valid low/high pair.'); }
  else if(rate.kind==='split') {
    if(rate.material!==null && !isRange(rate.material)) errors.push('Material price needs a valid low/high pair.');
    if(rate.labour!==null && !isRange(rate.labour)) errors.push('Labour price needs a valid low/high pair.');
  } else errors.push('Price kind must be installed or split.');
  return errors;
}
export function validateProject(p, { complete=false }={}) {
  const errors=[];
  if(!p || typeof p!=='object' || Array.isArray(p)) return ['Invalid project.'];
  if(!validId(p.id)) errors.push('Invalid project ID.');
  if(p.schemaVersion!==1) errors.push('Unsupported project version.');
  if(typeof p.name!=='string' || p.name.length>200) errors.push('Project name must be at most 200 characters.');
  if(![null,'new','reroof'].includes(p.projectType)) errors.push('Invalid project type.');
  if(![null,...EXISTING_ROOFS.map(x=>x.id)].includes(p.existingRoof)) errors.push('Invalid existing roof.');
  if(!['unknown','negative','positive'].includes(p.asbestos)) errors.push('Invalid asbestos status.');
  if(![1,2].includes(p.storeys)) errors.push('This estimator supports one or two storeys.');
  if(!['flat','difficult'].includes(p.site)) errors.push('Invalid site setting.');
  if(![null,...ROOFS.map(r=>r.id)].includes(p.roofSystem)) errors.push('Invalid roofing system.');
  if(!['plan','actual'].includes(p.measurementBasis)) errors.push('Invalid measurement basis.');
  if(![null,'manual','digital'].includes(p.entryMode)) errors.push('Invalid entry mode.');
  if(!validNumber(p.pitch,0,85)) errors.push('Pitch must be from 0° to 85°.');
  if(!validNumber(p.wastePct,0,50)) errors.push('Material waste must be from 0% to 50%.');
  if(!['guide','custom'].includes(p.pricingMode)) errors.push('Invalid pricing mode.');
  if(!['incl','excl'].includes(p.displayTax)) errors.push('Invalid tax display.');
  for(const key of ['underlay','fixings','battenMaterials','reviewedComponents']) if(typeof p[key]!=='boolean') errors.push(`Invalid ${key} setting.`);
  if(!Number.isInteger(p.step) || p.step<0 || p.step>5 || !Number.isInteger(p.maxStep) || p.maxStep<0 || p.maxStep>5) errors.push('Invalid saved step.');
  if(!Array.isArray(p.measurements) || p.measurements.length>2000) errors.push('A project can contain at most 2,000 measurements.');
  else {
    const ids=new Set();
    for(const e of p.measurements) {
      if(!e || typeof e!=='object') { errors.push('Invalid measurement.'); continue; }
      if(!validId(e.id) || ids.has(e.id)) errors.push('Measurement IDs must be unique.');
      ids.add(e.id);
      if(typeof e.label!=='string' || e.label.length>160) errors.push('Measurement labels must be at most 160 characters.');
      if(!GROUP_MAP[e.group]) errors.push('Unsupported measurement group.');
      if(!['plan','actual'].includes(e.basis)) errors.push('Every measurement needs a plan/actual basis.');
      if(e.pitch!==null && e.pitch!==undefined && !validNumber(e.pitch,0,85)) errors.push('Entry pitch must be from 0° to 85°.');
      if(e.roofAreaId && !p.measurements.some(x=>x?.id===e.roofAreaId && x.group==='roofAreas')) errors.push(`${e.label}: linked roof area no longer exists.`);
      if(e.value===null && !complete) continue;
      try { measuredValue(p,e); } catch(err) { errors.push(err.message); }
    }
  }
  if(!p.rateOverrides || typeof p.rateOverrides!=='object' || Array.isArray(p.rateOverrides) || Object.keys(p.rateOverrides).length>100) errors.push('Invalid custom rate card.');
  if(!Array.isArray(p.customItems) || p.customItems.length>300) errors.push('Too many custom items.');
  else for(const c of p.customItems) {
    if(!c || typeof c!=='object') { errors.push('Invalid custom item.'); continue; }
    if(!validId(c.id)) errors.push('Invalid custom item ID.');
    if(!c || typeof c.name!=='string' || c.name.length>160 || (complete && !c.name.trim())) errors.push('Give every custom component a name (at most 160 characters).');
    if(!['m2','lm','each','item'].includes(c.unit)) errors.push('Unsupported custom component unit.');
    if(!validNumber(c.quantity) || (['each','item'].includes(c.unit) && !Number.isInteger(c.quantity))) errors.push('Invalid custom component quantity.');
    if(!['incl','excl'].includes(c.taxBasis)) errors.push('Custom components must state their GST basis.');
    if(c.low!==null || c.high!==null) if(!isRange({min:c.low,max:c.high})) errors.push(`Custom component ${c.name || ''}: low must not exceed high.`);
  }
  const a=p.access;
  if(!a || !['exclude','include','unsure'].includes(a.choice) || !['full','edge'].includes(a.system)) errors.push('Invalid access options.');
  else {
    if(a.perimeter!==null && !validNumber(a.perimeter,0,5000)) errors.push('Scaffold perimeter must be from 0 to 5,000 lm.');
    if(!validNumber(a.weeks,1,104) || !Number.isInteger(a.weeks)) errors.push('Hire duration must be from 1 to 104 whole weeks.');
    if(typeof a.assessmentAccepted!=='boolean') errors.push('Invalid access acknowledgement.');
    if(complete && a.choice==='include' && !(a.perimeter>0)) errors.push('Enter the scaffold perimeter, or choose to leave access unpriced.');
    if(complete && a.choice==='include' && a.system==='edge' && p.storeys!==1) errors.push('Edge-protection allowance is only available for single-storey projects in this tool.');
  }
  if(complete) {
    if(!p.projectType) errors.push('Choose new roof or re-roof.');
    if(p.projectType==='reroof' && !p.existingRoof) errors.push('Select the existing roof material.');
    if(!p.roofSystem) errors.push('Choose a roof covering.');
    if(!Array.isArray(p.measurements) || !p.measurements.some(e=>e?.group==='roofAreas' && e.value>0)) errors.push('Add at least one roof area greater than zero.');
  }
  return [...new Set(errors)];
}
/** Only accepts JSON data, bounded before parsing; no executable templates. */
export function parseProject(text) {
  if(typeof text!=='string' || text.length>5_000_000) throw new Error('Project file is too large (5 MB limit).');
  let data;
  try { data=JSON.parse(text); } catch { throw new Error('This is not valid JSON.'); }
  const project=data.project ?? data;
  const errors=validateProject(project);
  if(errors.length) throw new Error(errors.slice(0,4).join(' '));
  return structuredClone(project);
}
