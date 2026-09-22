import { newProject,newEntry,newCustomItem,GROUPS,GROUP_MAP,clone,unitLabel } from '../core/model.mjs';
import { measuredValue,safeGroupQuantity,validNumber,removeMeasurement } from '../core/geometry.mjs';
import { DEFAULT_RATE_CARD } from '../core/rates.mjs';
import { calculateEstimate } from '../core/pricing.mjs';
import { validateProject,validateRate,parseProject } from '../core/validation.mjs';
import { escapeHtml as e,numericFormat as num,downloadText,projectExport,estimateCsv,printableHtml,enquiryPayload } from '../core/export.mjs';
import { applyApexTakeoff } from '../adapters/apex.mjs';
import { icon } from './icons.mjs';
import { STEPS,NEXT_LABELS,VIEWS,sidebarView,note } from './views.mjs';
import { TakeoffUI,newWorkspace,mergeWorkspace } from './takeoff.mjs';
const numberKeys=new Set(['pitch','storeys','wastePct','access.perimeter','access.weeks']);
const structuralKeys=new Set(['projectType','existingRoof','asbestos','asbestosConcern','entryMode','measurementBasis','roofSystem','underlay','fixings','battenMaterials','pricingMode','access.choice','access.system','storeys','site','displayTax','access.assessmentAccepted']);
const allowedFields=new Set(['name','projectType','existingRoof','asbestos','asbestosConcern','entryMode','measurementBasis','pitch','storeys','roofSystem','underlay','fixings','battenMaterials','wastePct','pricingMode','reviewedComponents','access.choice','access.system','access.perimeter','access.weeks','access.assessmentAccepted','site','displayTax']);
const toNumber=value=>value===''?null:Number(value);
export class RoofHubEstimator {
  constructor(host,options={}) {
    if(!(host instanceof HTMLElement))throw new TypeError('Mount RoofHub on an HTML element.');
    this.host=host;this.options=options;this.rateCard=clone(options.rateCard??DEFAULT_RATE_CARD);this.storageKey=options.storageKey??'roofhub-detailed-v1';
    this.root=host.shadowRoot??host.attachShadow({mode:'open'});this.events=new AbortController();this.errors=[];this.openEntries=new Set();this.openRates=new Set();this.addGroup='ridges';this.workspace=newWorkspace();this.restored=false;this.disposed=false;
    this.project=newProject();
    if(options.initialProject){const errors=validateProject(options.initialProject);if(errors.length)throw new Error(errors.join(' '));this.project=clone(options.initialProject);}
    else if(options.persist!==false){try{const raw=sessionStorage.getItem(this.storageKey);if(raw){this.project=parseProject(raw);this.restored=true;}}catch{try{const backup=sessionStorage.getItem(this.storageKey+':valid');this.project=backup?parseProject(backup):newProject();this.restored=!!backup;}catch{this.project=newProject();}}}
    if(options.theme)for(const [key,value] of Object.entries(options.theme)){if(/^--rh-[a-z-]+$/.test(key))host.style.setProperty(key,String(value));}
    const signal=this.events.signal;
    this.root.addEventListener('click',ev=>this.click(ev),{signal});
    this.root.addEventListener('input',ev=>this.input(ev),{signal});
    this.root.addEventListener('change',ev=>this.change(ev),{signal});
    this.root.addEventListener('submit',ev=>this.submitEnquiry(ev),{signal});
    this.render();
    if(this.restored)this.toast('Your measurements and choices were restored. Re-upload plan images to measure them again.');
  }
  destroy(){this.disposed=true;this.events.abort();this.takeoffUI?.destroy();clearTimeout(this.toastTimer);this.root.replaceChildren();}
  getProject(){return clone(this.project);}
  setProject(project){const errors=validateProject(project);if(errors.length)throw new Error(errors.join(' '));this.project=clone(project);this.errors=[];this.workspace=newWorkspace();this.persist();this.render(true);}
  importApexMeasurements(payload,options={}){this.project=applyApexTakeoff(this.project,payload,options);this.project.measurements=this.project.measurements.filter(x=>x.value!==null);this.project.step=1;this.project.maxStep=Math.max(1,this.project.maxStep);this.persist();this.render();this.toast('Takeoff measurements imported. They are already slope-adjusted and will not be adjusted again.');}
  persist(){if(this.options.persist!==false){try{const json=JSON.stringify(this.project);sessionStorage.setItem(this.storageKey,json);if(!validateProject(this.project).length)sessionStorage.setItem(this.storageKey+':valid',json);}catch{this.storageFailed=true;}}try{this.options.onProjectChange?.(this.getProject());}catch{this.toast('The host page could not save a change. Your estimator session is still available.');}}
  render(focus=false){
    if(this.disposed)return;
    this.takeoffUI?.destroy();this.takeoffUI=null;
    if(this.project.step===5){try{this.estimate=calculateEstimate(this.project,this.rateCard);}catch(err){this.estimate={ok:false,errors:[err.message]};}}
    const css=new URL('styles.css',import.meta.url).href;
    this.root.innerHTML=`<link rel="stylesheet" href="${css}"><div class="rh-shell"><div class="rh-toolbar"><div class="rh-breadcrumb">RoofHub ${icon('chevron')} Tools ${icon('chevron')} Detailed estimator</div><div class="rh-actions"><button class="rh-tool-link" data-action="import-project">${icon('upload')} Open project</button><button class="rh-tool-link" data-action="export-project">${icon('download')} Save progress</button><button class="rh-tool-link" data-action="restart">Start over</button></div></div>
    <header class="rh-intro"><div><div class="rh-kicker">RoofHub estimating tool</div><h1>Detailed roof estimator</h1><p>Measure your roof, choose the roofing system and build a practical New Zealand cost range. You can refine the scope before asking anyone for a quote.</p></div><div class="rh-intro-note">${icon('lock')} Preliminary range · no sign-up</div></header>
    <nav class="rh-stepper" aria-label="Estimator progress">${STEPS.map((s,i)=>`<button class="rh-step ${i===this.project.step?'active':i<this.project.step?'done':''}" data-action="goto" data-step="${i}" ${i>this.project.maxStep?'disabled':''} ${i===this.project.step?'aria-current="step"':''}><span class="rh-step-number">${i<this.project.step?icon('check'):String(i+1).padStart(2,'0')}</span><span>${s}</span></button>`).join('')}</nav>
    <div class="rh-layout"><main class="rh-main"><div class="rh-panel">${this.errors.length?`<div class="rh-note rh-error" role="alert" style="margin-bottom:22px">${icon('info')}<div><strong>A little more information is needed.</strong>${this.errors.map(x=>`<p>${e(x)}</p>`).join('')}</div></div>`:''}${VIEWS[this.project.step](this)}</div>
    <div class="rh-footer">${this.project.step>0?`<button class="rh-button tertiary" data-action="back">${icon('back')} Back</button>`:'<span class="rh-footer-message">'+icon('lock')+' Work stays in this browser</span>'}${this.project.step<5?`<button class="rh-button" data-action="next">${NEXT_LABELS[this.project.step]} ${icon('arrow')}</button>`:'<button class="rh-button secondary" data-action="goto" data-step="1">'+icon('edit')+' Edit measurements</button>'}</div>
    <p class="rh-bottom-note">An estimate is a starting point, not a formal quote or a roof design. ${this.storageFailed?'Browser storage is unavailable — save a project file before leaving.':'Progress is kept in this tab. Use Save progress for a reusable project file.'}</p></main>${sidebarView(this)}</div></div>
    <input type="file" data-file="project" hidden accept="application/json,.json"><input type="file" data-file="rates" hidden accept="application/json,.json"><div data-toast aria-live="polite"></div>`;
    if(focus)requestAnimationFrame(()=>{const title=this.root.querySelector('#rh-step-title');title?.focus({preventScroll:true});this.host.scrollIntoView({block:'start',behavior:'instant'});});
  }
  toast(message){const box=this.root.querySelector('[data-toast]');if(!box)return;box.innerHTML=`<div class="rh-toast" role="status">${e(message)}</div>`;clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>{box.replaceChildren();},6000);}
  setField(key,value){
    if(!allowedFields.has(key))return;
    if(numberKeys.has(key)&&typeof value!=='number')value=toNumber(value);
    if(key==='asbestosConcern'){this.project.asbestos=value?'positive':'unknown';return;}
    if(key.startsWith('access.'))this.project.access[key.slice(7)]=value;
    else this.project[key]=value===''&&['projectType','existingRoof','roofSystem','entryMode'].includes(key)?null:value;
    if(key==='storeys'&&value===2&&this.project.access.system==='edge'){this.project.access.system='full';this.project.access.assessmentAccepted=false;}
    if(key==='roofSystem')this.project.reviewedComponents=false;
    if(key==='measurementBasis')this.project.measurements=this.project.measurements.map(entry=>entry.value===null&&entry.source==='manual'?{...entry,basis:value}:entry);
    if(key==='existingRoof')this.project.asbestos='unknown';
    if(key==='entryMode'&&value==='manual'&&!this.project.measurements.length)this.project.measurements.push(newEntry('roofAreas',this.project.measurementBasis));
  }
  applyInput(input){
    if(input.dataset.field){this.setField(input.dataset.field,input.type==='checkbox'?input.checked:input.value);}
    else if(input.dataset.entry){
      const entry=this.project.measurements.find(e=>e.id===input.dataset.entry),key=input.dataset.entryField;if(!entry||!['label','value','quantity','basis','pitch','roofAreaId','regularGeometry'].includes(key))return;
      entry[key]=['value','quantity','pitch'].includes(key)?toNumber(input.value):key==='regularGeometry'?input.checked:key==='roofAreaId'?input.value||null:input.value;
      this.project.reviewedComponents=false;
    }else if(input.dataset.custom){
      const c=this.project.customItems.find(c=>c.id===input.dataset.custom),key=input.dataset.customField;if(!c||!['name','unit','quantity','low','high','taxBasis','quantityConfirmed'].includes(key))return;
      c[key]=['quantity','low','high'].includes(key)?toNumber(input.value):key==='quantityConfirmed'?input.checked:input.value;
    }else if(input.dataset.rate){
      const id=input.dataset.rate,key=input.dataset.rateField,base=this.rateCard.rates[id];if(!base)return;
      let rate=this.project.rateOverrides[id];
      if(!rate)rate={id,label:base.label,unit:base.unit,kind:'installed',installed:{min:null,max:null},status:'custom',taxBasis:'excl',note:'User-supplied rate.'};
      if(key==='kind'){rate=input.value==='split'?{...rate,kind:'split',installed:undefined,material:{min:null,max:null},labour:{min:null,max:null}}:{...rate,kind:'installed',installed:{min:null,max:null},material:undefined,labour:undefined};}
      else if(key==='taxBasis')rate.taxBasis=input.value;
      else{const [part,end]=key.split('.');if(['material','labour','installed'].includes(part)&&['min','max'].includes(end)){rate[part]??={min:null,max:null};rate[part][end]=toNumber(input.value);}}
      this.project.rateOverrides[id]=rate;this.project.pricingMode='custom';
    }
  }
  input(ev){if(ev.target.closest('[data-takeoff]')||ev.target.closest('[data-enquiry]'))return;const input=ev.target;this.applyInput(input);this.persist();this.updateLive();}
  change(ev){
    if(ev.target.closest('[data-takeoff]')||ev.target.closest('[data-enquiry]'))return;
    const input=ev.target;
    if(input.dataset.file){const file=input.files?.[0];if(file)this.importFile(file,input.dataset.file);input.value='';return;}
    if(input.dataset.uiField==='addGroup'){this.addGroup=input.value;return;}
    // Numeric/text inputs were already captured on input. Avoid replacing
    // the focused DOM on blur; this also prevents losing the next click.
    if(input.tagName==='SELECT'||input.type==='checkbox'){
      this.applyInput(input);this.persist();
      if(structuralKeys.has(input.dataset.field)||input.dataset.entry||input.dataset.rate||input.dataset.custom)this.render();
      else this.updateLive();
    }
  }
  updateLive(){
    for(const group of GROUPS){const q=safeGroupQuantity(this.project,group.id);this.root.querySelectorAll(`[data-live-group="${group.id}"]`).forEach(el=>{el.textContent=q===null?'Check inputs':`${num(q)} ${unitLabel(group.unit)}`;});}
    const area=safeGroupQuantity(this.project,'roofAreas');this.root.querySelectorAll('[data-live-area]').forEach(el=>{el.textContent=area===null?'Check inputs':`${num(area)} m²`;});
    for(const entry of this.project.measurements){const el=[...this.root.querySelectorAll('[data-live-entry]')].find(x=>x.dataset.liveEntry===entry.id);if(el){try{el.textContent=`${num(measuredValue(this.project,entry))} ${unitLabel(GROUP_MAP[entry.group].unit)} actual`;}catch{el.textContent='Check measurement / pitch';}}}
  }
  validateStep(step){
    const p=this.project,errors=[];
    if(step===0){if(!p.projectType)errors.push('Choose a new roof or replacement roof to continue.');if(p.projectType==='reroof'&&!p.existingRoof)errors.push('Choose the existing roof material, or select “I’m not sure”.');}
    if(step===1){if(!p.entryMode)errors.push('Choose how you want to provide measurements.');if(!validNumber(p.pitch,0,85))errors.push('Roof pitch must be between 0° and 85°.');if(!p.measurements.some(x=>x.group==='roofAreas'&&x.value>0))errors.push('Add at least one roof area greater than zero.');for(const entry of p.measurements){try{measuredValue(p,entry);}catch(err){errors.push(err.message);}}}
    if(step===2){if(!p.roofSystem)errors.push('Choose one of the four roof systems.');if(!validNumber(p.wastePct,0,50))errors.push('Material waste must be between 0% and 50%.');}
    if(step>=2&&p.pricingMode==='custom')for(const [id,rate] of Object.entries(p.rateOverrides))errors.push(...validateRate(rate,this.rateCard.rates[id]).map(x=>`${rate.label}: ${x}`));
    if(step===3){for(const c of p.customItems){if(!c.name.trim())errors.push('Give each custom component a name.');if(!validNumber(c.quantity))errors.push(`Enter a valid quantity for ${c.name||'the custom component'}.`);if(c.low!==null||c.high!==null)if(!validNumber(c.low)||!validNumber(c.high)||c.low>c.high)errors.push(`${c.name}: enter both price limits, with low no higher than high.`);}}
    if(step===4){if(p.access.choice==='include'&&!(p.access.perimeter>0))errors.push('Enter the lineal metres of scaffold/edge protection, or leave access unpriced.');errors.push(...validateProject(p,{complete:true}));}
    return [...new Set(errors)];
  }
  navigate(step){
    if(step<0||step>5)return;
    if(step>this.project.step){const errors=[];for(let i=this.project.step;i<step;i++)errors.push(...this.validateStep(i));if(errors.length){this.errors=[...new Set(errors)];this.render(true);return;}}
    this.errors=[];this.project.step=step;this.project.maxStep=Math.max(step,this.project.maxStep);this.persist();this.render(true);
  }
  click(ev){
    if(ev.target.closest('[data-takeoff]')||ev.target.closest('[data-enquiry]'))return;
    const button=ev.target.closest('[data-action]');if(!button)return;ev.preventDefault();const a=button.dataset.action;
    if(a==='choose'){this.setField(button.dataset.key,button.dataset.value);this.errors=[];this.persist();this.render();return;}
    if(a==='next'){this.navigate(this.project.step+1);return;}if(a==='back'){this.navigate(this.project.step-1);return;}
    if(a==='goto'){const step=Number(button.dataset.step);if(step<=this.project.maxStep)this.navigate(step);return;}
    if(a==='add-entry'||a==='add-selected-group'){const group=a==='add-entry'?button.dataset.group:this.addGroup;this.addMeasurement(group);return;}
    if(a==='delete-entry'){const id=button.dataset.id;this.project.measurements=removeMeasurement(this.project,id);this.project.reviewedComponents=false;this.persist();this.render();return;}
    if(a==='entry-settings'){this.openEntries.has(button.dataset.id)?this.openEntries.delete(button.dataset.id):this.openEntries.add(button.dataset.id);this.render();return;}
    if(a==='add-custom'){const c=newCustomItem();this.project.customItems.push(c);this.persist();this.render();requestAnimationFrame(()=>this.root.querySelector(`[id="custom-${c.id}-name"]`)?.focus());return;}
    if(a==='delete-custom'){this.project.customItems=this.project.customItems.filter(c=>c.id!==button.dataset.id);this.persist();this.render();return;}
    if(a==='provide-rate'){this.project.pricingMode='custom';this.openRates.add(button.dataset.id);this.persist();this.render();return;}
    if(a==='toggle-rate'){this.openRates.has(button.dataset.id)?this.openRates.delete(button.dataset.id):this.openRates.add(button.dataset.id);this.render();return;}
    if(a==='clear-rate'){delete this.project.rateOverrides[button.dataset.id];this.openRates.delete(button.dataset.id);this.persist();this.render();return;}
    if(a==='import-project'){this.root.querySelector('[data-file="project"]').click();return;}
    if(a==='import-rates'){this.root.querySelector('[data-file="rates"]').click();return;}
    if(a==='export-project'){let current=null;try{const computed=calculateEstimate(this.project,this.rateCard);if(computed.ok)current=computed;}catch{}downloadText('roofhub-project.json',JSON.stringify(projectExport(this.project,current),null,2));this.toast('Project saved. Plan images and contact details are not included.');return;}
    if(a==='export-rates'){downloadText('roofhub-my-rates.json',JSON.stringify({schemaVersion:1,type:'roofhub-rate-overrides',currency:'NZD',rates:this.project.rateOverrides},null,2));return;}
    if(a==='rate-template'){downloadText('roofhub-rate-template.json',JSON.stringify({schemaVersion:1,type:'roofhub-rate-overrides',currency:'NZD',rates:{'corrugate.covering':{id:'corrugate.covering',label:'My corrugate rate',unit:'m2',kind:'split',material:{min:null,max:null},labour:{min:null,max:null},taxBasis:'excl',status:'custom',note:'TEMPLATE ONLY — replace all null values before using.'}}},null,2));this.toast('Template downloaded. Replace its null placeholders with your rates before importing.');return;}
    if(a==='download-csv'&&this.estimate?.ok){downloadText('roofhub-estimate.csv',estimateCsv(this.project,this.estimate),'text/csv;charset=utf-8');return;}
    if(a==='print'&&this.estimate?.ok){this.print();return;}
    if(a==='restart'){this.confirmRestart();return;}
    if(a==='takeoff'){this.openTakeoff();return;}
    if(a==='external-takeoff'){this.openExternal();return;}
    if(a==='enquiry'&&this.estimate?.ok){this.openEnquiry();return;}
  }
  addMeasurement(group){if(!GROUP_MAP[group])return;const count=this.project.measurements.filter(x=>x.group===group).length;const entry=newEntry(group,this.project.measurementBasis,{label:`${GROUP_MAP[group].singular} ${count+1}`});if(group==='aprons'||group==='downpipes')entry.basis='actual';this.project.measurements.push(entry);this.project.reviewedComponents=false;if(entry.basis==='plan'&&['hips','valleys'].includes(group))this.openEntries.add(entry.id);this.persist();this.render();requestAnimationFrame(()=>{const input=this.root.querySelector(`[id="${entry.id}-value"]`);input?.focus();input?.scrollIntoView({block:'center',behavior:'instant'});});}
  async importFile(file,type){
    try{
      if(file.size>5_000_000)throw new Error('JSON file exceeds the 5 MB limit.');const text=await file.text();
      if(type==='project'){this.setProject(parseProject(text));this.toast('Project opened. Its measurements and custom rates are ready.');}
      else{
        const data=JSON.parse(text);if(data.schemaVersion!==1||data.currency!=='NZD'||!data.rates||typeof data.rates!=='object'||Array.isArray(data.rates)||Object.keys(data.rates).length>100)throw new Error('Use a version 1 RoofHub rate card with NZD currency.');
        const errors=[];const overrides={};
        for(const [id,rate] of Object.entries(data.rates)){const base=this.rateCard.rates[id];if(!base){errors.push(`Unknown rate ID: ${id}`);continue;}errors.push(...validateRate(rate,base).map(x=>`${id}: ${x}`));overrides[id]={...rate,id,label:typeof rate.label==='string'?rate.label.slice(0,160):base.label,status:'custom',note:typeof rate.note==='string'?rate.note.slice(0,1000):'User-imported rate.'};}
        if(errors.length)throw new Error(errors.slice(0,5).join(' '));this.project.rateOverrides={...this.project.rateOverrides,...overrides};this.project.pricingMode='custom';this.persist();this.render();this.toast(`${Object.keys(overrides).length} custom rates imported. Units and GST basis have been checked.`);
      }
    }catch(err){this.toast(`Could not import: ${err.message}`);}
  }
  makeDialog(title,body,{wide=false}={}){const dialog=document.createElement('dialog');dialog.className=`rh-dialog ${wide?'rh-takeoff-dialog':''}`;dialog.setAttribute('aria-label',title);dialog.innerHTML=body;this.root.append(dialog);dialog.showModal();return dialog;}
  confirmRestart(){
    const dialog=this.makeDialog('Start a new estimate',`<div class="rh-dialog-header"><div><h2>Start a fresh estimate?</h2><p>This clears the current measurements, uploaded plans and any custom rates in this session. Save a project file first to keep your work.</p></div></div><div class="rh-actions"><button class="rh-button" data-reset-confirm>Start fresh</button><button class="rh-button secondary" data-reset-cancel>Keep working</button></div>`);
    dialog.querySelector('[data-reset-cancel]').onclick=()=>{dialog.close();dialog.remove();};dialog.querySelector('[data-reset-confirm]').onclick=()=>{this.project=newProject();this.workspace=newWorkspace();this.errors=[];this.openEntries.clear();this.openRates.clear();this.persist();this.render(true);};
  }
  openTakeoff(){
    const dialog=this.makeDialog('RoofHub digital takeoff','<div data-takeoff-mount style="height:100%"></div>',{wide:true});
    const close=()=>{this.takeoffUI?.destroy();this.takeoffUI=null;dialog.close();dialog.remove();};
    dialog.addEventListener('cancel',ev=>{ev.preventDefault();close();});
    this.takeoffUI=new TakeoffUI(dialog.querySelector('[data-takeoff-mount]'),{workspace:this.workspace,pitch:this.project.pitch,pdfLoader:this.options.pdfLoader,onClose:close,onFinish:workspace=>{
      this.project=mergeWorkspace(this.project,workspace);this.project.measurements=this.project.measurements.filter(x=>x.value!==null);this.workspace=workspace;close();this.persist();this.render();this.toast('Measurements added. Review each plane’s pitch and the resulting roof surface area.');
    }});
  }
  openExternal(){
    if(!this.options.takeoffRenderer)return;
    const dialog=this.makeDialog('Connected digital takeoff','<div data-external-mount style="height:100%"></div>',{wide:true});let cleanup;
    const close=()=>{if(typeof cleanup==='function')cleanup();dialog.close();dialog.remove();};
    dialog.addEventListener('cancel',ev=>{ev.preventDefault();close();});
    try{cleanup=this.options.takeoffRenderer(dialog.querySelector('[data-external-mount]'),{onFinish:(payload,options={})=>{close();this.importApexMeasurements(payload,options);},onCancel:close});}
    catch(err){close();this.toast(`Connected takeoff could not start: ${err.message}`);}
  }
  print(){const html=printableHtml(this.project,this.estimate);const win=window.open('','_blank');if(!win){downloadText('roofhub-estimate.html',html,'text/html;charset=utf-8');this.toast('Your browser blocked the print window. Open the downloaded estimate and print from there.');return;}win.opener=null;win.document.open();win.document.write(html);win.document.close();win.focus();}
  openEnquiry(){
    const connected=!!this.options.onQuoteRequest;
    const dialog=this.makeDialog('Prepare a roofing quote enquiry',`<form data-enquiry><div class="rh-dialog-header"><div><div class="rh-kicker">The next step, on your terms</div><h2 style="margin-top:10px">${connected?'Request a confirmed quote.':'Prepare your quote enquiry.'}</h2><p>${connected?'We’ll share these details with RoofHub and a roofing partner only when you submit.':'This preview prepares a file for you to share. Nothing is sent to a provider.'}</p></div><button type="button" class="rh-icon-button" data-enquiry-close aria-label="Close enquiry">${icon('close')}</button></div>
      <div class="rh-grid-2"><div class="rh-field"><label for="enquiry-name">Your name</label><input id="enquiry-name" name="name" required maxlength="120" autocomplete="name"></div><div class="rh-field"><label for="enquiry-email">Email</label><input id="enquiry-email" name="email" type="email" required maxlength="254" autocomplete="email"></div></div>
      <div class="rh-grid-2"><div class="rh-field"><label for="enquiry-phone">Phone <span class="rh-help">(optional)</span></label><input id="enquiry-phone" name="phone" type="tel" maxlength="40" autocomplete="tel"></div><div class="rh-field"><label for="enquiry-location">Suburb / town</label><input id="enquiry-location" name="location" required maxlength="200" autocomplete="address-level2"></div></div>
      <div class="rh-field"><label for="enquiry-notes">Anything else to know? <span class="rh-help">(optional)</span></label><textarea id="enquiry-notes" name="notes" rows="3" maxlength="3000" placeholder="Access details, timing, or questions about the estimate."></textarea></div>
      <label class="rh-check-row rh-space"><input type="checkbox" name="consent" required><span>${connected?'I agree to share my contact details, measurements and estimate with RoofHub and its roofing partner so they can contact me about this project.':'Include my contact details, measurements and estimate in a file that I can choose to share with RoofHub or a roofer.'}<small>Plan images and your underlying custom rate card are not included. ${this.options.privacyUrl?`<a href="${e(this.options.privacyUrl)}" target="_blank" rel="noopener noreferrer">Privacy policy</a>`:''}</small></span></label>
      <div data-enquiry-message class="rh-small-space" role="status"></div><div class="rh-actions rh-space"><button class="rh-button" type="submit">${connected?'Send quote request':'Download enquiry file'} ${icon('arrow')}</button><button class="rh-button secondary" type="button" data-enquiry-close>Not now</button></div></form>`);
    dialog.querySelectorAll('[data-enquiry-close]').forEach(b=>b.onclick=()=>{dialog.close();dialog.remove();});
  }
  async submitEnquiry(ev){
    const form=ev.target;if(!form.matches('[data-enquiry]'))return;ev.preventDefault();if(!form.reportValidity())return;
    const data=Object.fromEntries(new FormData(form));if(data.consent!=='on')return;
    const payload=enquiryPayload(this.project,this.estimate,data),button=form.querySelector('[type=submit]'),message=form.querySelector('[data-enquiry-message]');
    button.disabled=true;
    try{
      if(this.options.onQuoteRequest){message.innerHTML=note('Sending your request…');const result=await this.options.onQuoteRequest(payload);if(!result||result.ok!==true)throw new Error('The website did not confirm receipt. Your request has not been marked as sent.');message.innerHTML=note(`<strong>Your request has been received.</strong>${result.reference?` Reference: ${e(result.reference)}`:''}`,'','check');form.querySelectorAll('input,textarea').forEach(x=>x.disabled=true);button.textContent='Request received';}
      else{downloadText('roofhub-quote-enquiry.json',JSON.stringify(payload,null,2));message.innerHTML=note('<strong>Your enquiry file is ready.</strong> Nothing has been sent. Share the file with your chosen roofer or the RoofHub team.','','check');button.disabled=false;button.textContent='Download again';}
    }catch(err){message.innerHTML=note(`${e(err.message||'Unable to send. Please try again.')} You can still save your estimate.`, 'error');button.disabled=false;}
  }
}
