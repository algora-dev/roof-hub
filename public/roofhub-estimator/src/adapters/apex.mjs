/**
 * Boundary to the supplied Apex workstation. Its output is already pitched.
 * Do not apply roof pitch twice. Explicitly state payload units: metric is
 * the default used by the supplied TakeoffStation, imperial converts feet
 * / square feet. Unit hints alone are not trusted to infer conversion.
 * No Apex product IDs, pricing, branding, auth, or demo AI data is imported.
 */
import { newEntry, newCustomItem, uid } from '../core/model.mjs';
const groupFor=(name,semantic) => {
  const key=`${name??''} ${semantic??''}`.toLowerCase();
  if(key.includes('downpipe')) return 'downpipes';
  if(key.includes('ridge') && !key.includes('barge')) return 'ridges';
  if(key.includes('hip') && !key.includes('valley')) return 'hips';
  if(key.includes('valley')) return 'valleys';
  if(key.includes('barge')) return 'barges';
  if(key.includes('apron') || key.includes('wall flashing')) return 'aprons';
  if(key.includes('spout') || key.includes('gutter')) return 'spouting';
  return null;
};
export function fromApexTakeoff(payload,{units='metric'}={}) {
  if(!payload || !Array.isArray(payload.roofAreas) || !Array.isArray(payload.componentGroups)) throw new Error('Invalid Apex takeoff payload.');
  if(!['metric','imperial'].includes(units)) throw new Error('Specify metric or imperial payload values.');
  const length=units==='imperial'?0.3048:1,area=length*length;
  const measurements=[],customItems=[],areaIds=new Map();
  for(const a of payload.roofAreas) {
    if(!Number.isFinite(a.area) || a.area<0) throw new Error('Invalid takeoff roof area.');
    const id=`apex-area-${a.id??uid()}`;areaIds.set(a.id,id);
    measurements.push(newEntry('roofAreas','actual',{id,label:a.name||'Roof area',value:a.area*area,pitch:Number.isFinite(a.pitch)?a.pitch:null,source:'apex'}));
  }
  for(const c of payload.componentGroups) {
    const group=groupFor(c.name,c.semantic);
    const isArea=c.measurementType==='area';
    const isCount=['quantity','point','count'].includes(c.measurementType);
    const factor=group==='downpipes'||isCount?1:isArea?area:length;
    const values=Array.isArray(c.measurements)?c.measurements:[];
    if(group) for(const [i,m] of values.entries()) {
      if(!Number.isFinite(m.value)||m.value<0) throw new Error('Invalid takeoff component value.');
      measurements.push(newEntry(group,'actual',{id:`apex-${c.componentId??group}-${i}`,label:`${c.name||group} ${i+1}`,value:m.value*factor,roofAreaId:areaIds.get(m.quoteRoofAreaId)??null,source:'apex'}));
    }
    else {
      const quantity=(values.length?values.reduce((s,m)=>s+m.value,0):(c.total??c.count??0))*factor;
      if(!Number.isFinite(quantity)||quantity<0) throw new Error('Invalid custom takeoff quantity.');
      if(quantity>0) customItems.push(newCustomItem({id:`apex-custom-${c.componentId??uid()}`,name:c.name||'Custom takeoff component',quantity,unit:isArea?'m2':isCount?'each':'lm',source:'apex'}));
    }
  }
  return {measurements,customItems,measurementBasis:'actual',planImages:payload.planImages??[]};
}
/** Replace prior Apex entries, never silently duplicate an earlier import. */
export function applyApexTakeoff(project,payload,options={}) {
  const mapped=fromApexTakeoff(payload,options);
  return {...project,entryMode:'digital',measurementBasis:'actual',
    measurements:[...project.measurements.filter(e=>e.source!=='apex'),...mapped.measurements],
    customItems:[...project.customItems.filter(e=>e.source!=='apex'),...mapped.customItems]};
}
