import { GROUPS, GROUP_MAP, newEntry, newCustomItem, uid, unitLabel, clone } from '../core/model.mjs';
import { polygonArea, lineLength, polygonCrossesItself, validNumber } from '../core/geometry.mjs';
import { escapeHtml as e, numericFormat as num } from '../core/export.mjs';
import { icon } from './icons.mjs';
export const TAKEOFF_COLOURS = {roofAreas:'#c15a3c',ridges:'#627262',hips:'#366a91',valleys:'#a66b22',barges:'#7a8f7a',aprons:'#536153',spouting:'#5c7f82',downpipes:'#cc785f',perimeter:'#5f6467',custom:'#92a392'};
export const newWorkspace=()=>({id:uid('takeoff'),pages:[],activePageId:null});
/** Return raw plan quantities. The shared engine applies pitch once later. */
export function workspaceMeasurements(workspace) {
  const measurements=[],customItems=[];let perimeter=0;
  for(const page of workspace.pages) {
    if(!page.shapes.length) continue;
    if(!(page.scale>0)) throw new Error('Every measured page must be calibrated.');
    for(const s of page.shapes) {
      const unit=s.group==='custom'?s.customUnit:(GROUP_MAP[s.group]?.unit??'lm');
      const value=unit==='m2'?polygonArea(s.points)*page.scale**2:unit==='each'?s.points.length:lineLength(s.points)*page.scale;
      if(s.group==='perimeter') {perimeter+=value;continue;}
      if(s.group==='custom') {customItems.push(newCustomItem({id:`digital-${s.id}`,name:s.label,unit,quantity:value,source:'digital',sourceBasis:'plan',quantityConfirmed:unit==='each'}));continue;}
      measurements.push(newEntry(s.group,'plan',{id:`digital-${s.id}`,label:s.label,value,source:'digital',sourcePage:page.name,pitch:s.pitch,regularGeometry:s.regularGeometry??false,roofAreaId:s.roofAreaId?`digital-${s.roofAreaId}`:null}));
    }
  }
  return {measurements,customItems,perimeter};
}
export function mergeWorkspace(project,workspace) {
  const m=workspaceMeasurements(workspace);
  return {...project,entryMode:'digital',measurementBasis:'plan',reviewedComponents:false,
    measurements:[...project.measurements.filter(x=>x.source!=='digital'),...m.measurements],
    customItems:[...project.customItems.filter(x=>x.source!=='digital'),...m.customItems],
    access:m.perimeter>0?{...project.access,perimeter:m.perimeter,perimeterSource:'digital'}:project.access};
}
const numberValue=x=>x===''?null:Number(x);
function shapeUnit(shape) {return shape.group==='custom'?shape.customUnit:(GROUP_MAP[shape.group]?.unit??'lm');}
const option=(v,t,current)=>`<option value="${e(v)}" ${v===current?'selected':''}>${e(t)}</option>`;
const field=(label,id,value,attrs='')=>`<div class="rh-field"><label for="${id}">${label}</label><input id="${id}" data-to-field="${id}" value="${e(value??'')}" ${attrs}></div>`;
export class TakeoffUI {
  constructor(container,{workspace=newWorkspace(),pitch=25,onFinish,onClose,pdfLoader}={}) {
    this.container=container;this.workspace=workspace;this.defaultPitch=pitch;this.onFinish=onFinish;this.onClose=onClose;this.pdfLoader=pdfLoader;
    this.tool='calibrate';this.group='roofAreas';this.customUnit='lm';this.draft=[];this.calibration=[];this.knownLength=null;this.label='';this.pitch=pitch;this.regular=false;this.parent=null;this.zoom=1;this.error='';this.busy=false;this.history=[];this.redoStack=[];
    this.events=new AbortController();const signal=this.events.signal;
    container.addEventListener('click',ev=>this.click(ev),{signal});
    container.addEventListener('input',ev=>this.input(ev),{signal});
    container.addEventListener('change',ev=>this.change(ev),{signal});
    container.addEventListener('pointerdown',ev=>this.pointerDown(ev),{signal});
    container.addEventListener('pointermove',ev=>this.pointerMove(ev),{signal});
    container.addEventListener('pointerup',()=>{this.panStart=null;},{signal});
    container.addEventListener('pointercancel',()=>{this.panStart=null;},{signal});
    container.addEventListener('keydown',ev=>this.keydown(ev),{signal});
    this.render();
  }
  get page(){return this.workspace.pages.find(p=>p.id===this.workspace.activePageId);}
  destroy(){this.events.abort();if(this.pdfDoc)this.pdfDoc.destroy?.();this.pdfDoc=null;this.disposed=true;}
  checkpoint(){if(!this.page)return;this.history.push({pageId:this.page.id,shapes:clone(this.page.shapes),scale:this.page.scale});if(this.history.length>50)this.history.shift();this.redoStack=[];}
  undo(){if(this.draft.length){this.draft.pop();this.render();return;}const snapshot=this.history.pop();if(!snapshot)return;const p=this.workspace.pages.find(x=>x.id===snapshot.pageId);if(!p)return;this.redoStack.push({pageId:p.id,shapes:clone(p.shapes),scale:p.scale});p.shapes=snapshot.shapes;p.scale=snapshot.scale;this.workspace.activePageId=p.id;this.render();}
  redo(){const snapshot=this.redoStack.pop();if(!snapshot)return;const p=this.workspace.pages.find(x=>x.id===snapshot.pageId);if(!p)return;this.history.push({pageId:p.id,shapes:clone(p.shapes),scale:p.scale});p.shapes=snapshot.shapes;p.scale=snapshot.scale;this.workspace.activePageId=p.id;this.render();}
  render(){
    const page=this.page;
    const scroll=this.container.querySelector('.rh-to-scroll');const scrollPos=scroll?{x:scroll.scrollLeft,y:scroll.scrollTop}:null;
    const groups=[...GROUPS,{id:'perimeter',name:'Scaffold perimeter',unit:'lm'},{id:'custom',name:'Custom component',unit:this.customUnit}];
    const unit=this.group==='custom'?this.customUnit:(GROUP_MAP[this.group]?.unit??'lm');
    const calibrated=!!page?.scale;
    let instruction=!page?'Upload a plan or overhead image to begin.':!calibrated?'First, set the scale. Click the two ends of a known dimension.':this.tool==='calibrate'?'Click two known points, then enter their real-world distance.':this.tool==='pan'?'Drag the plan to move around it. Switch to Measure to trace.':unit==='m2'?'Click around the roof plane, then choose Finish shape.':unit==='each'?'Click each downpipe / item, then choose Finish count.':'Click the start and end of the run. Add points for bends, then choose Finish line.';
    const shapes=page?.shapes??[];
    this.container.innerHTML=`<div class="rh-takeoff-root" data-takeoff="true">
      <div class="rh-to-head"><div><div class="rh-kicker">Local digital takeoff</div><h2>Your plan. Your measurements.</h2><p>Calibrate once per page. Trace areas, lengths and points.</p></div><button class="rh-icon-button" data-to="close" aria-label="Close measuring workspace">${icon('close')}</button></div>
      <div class="rh-to-grid"><aside class="rh-to-controls">
      <div class="rh-to-upload"><button class="rh-button secondary small" data-to="upload">${icon('upload')} ${page?'Add another page':'Upload a plan'}</button><input type="file" data-to-upload hidden accept="image/png,image/jpeg,image/webp,application/pdf"></div>
      ${this.workspace.pages.length?`<div class="rh-field"><label for="to-page">Page</label><select id="to-page" data-to-field="page">${this.workspace.pages.map(p=>option(p.id,p.name,this.workspace.activePageId)).join('')}</select></div>`:''}
      ${page?`<div class="rh-field"><label for="to-group">What are you measuring?</label><select id="to-group" data-to-field="group">${groups.map(g=>option(g.id,`${g.name} · ${unitLabel(g.unit)}`,this.group)).join('')}</select></div>
      ${this.group==='custom'?`<p class="rh-help">Custom items transfer as plan-view quantities. Review any slope adjustment in Components before they are priced.</p><div class="rh-field"><label for="to-custom-unit">Custom measurement type</label><select id="to-custom-unit" data-to-field="customUnit">${[['lm','Length'],['m2','Area'],['each','Count']].map(([v,t])=>option(v,t,this.customUnit)).join('')}</select></div>`:''}
      ${field('Measurement label','to-label',this.label,'placeholder="e.g. Garage roof" maxlength="160"')}
      ${field('Roof pitch (degrees)','to-pitch',this.pitch,'type="number" min="0" max="85" step="0.1"')}
      ${['hips','valleys'].includes(this.group)?`<label class="rh-check-row"><input type="checkbox" data-to-field="regular" ${this.regular?'checked':''}><span>Equal-pitch roof, 45° hip/valley in plan.<small>Otherwise enter actual lengths in the measurement table.</small></span></label>`:''}
      ${this.group!=='roofAreas'&&shapes.some(s=>s.group==='roofAreas')?`<div class="rh-field"><label for="to-parent">Associated roof plane</label><select id="to-parent" data-to-field="parent">${option('','No specific plane',this.parent??'')}${shapes.filter(s=>s.group==='roofAreas').map(s=>option(s.id,s.label,this.parent)).join('')}</select></div>`:''}
      ${this.tool==='calibrate'?`${field('Known dimension (metres)','to-known',this.knownLength,'type="number" min="0.01" max="10000" step="0.01" placeholder="e.g. 10"')}<button class="rh-button small" data-to="calibrate" ${this.calibration.length!==2?'disabled':''}>Set scale</button>`:''}
      <div class="rh-note rh-to-note rh-space">${icon('info')}<span>${calibrated?`Scale set: ${num(page.scale*1000)} mm per pixel. Measurements are <strong>plan view</strong>; pitch is applied in the estimator.`:'Use a labelled plan dimension or a reliable map scale. Do not use a perspective photograph.'}</span></div>
      <h3>Measured on this page (${shapes.length})</h3><div class="rh-to-list">${shapes.map(s=>`<div class="rh-to-shape"><div><strong><i class="rh-to-dot" style="background:${TAKEOFF_COLOURS[s.group]}"></i>${e(s.label)}</strong><span>${num(this.shapeValue(s))} ${unitLabel(shapeUnit(s))} plan</span></div><button class="rh-icon-button" data-to="delete" data-id="${e(s.id)}" aria-label="Delete ${e(s.label)}">${icon('trash')}</button></div>`).join('')||'<span class="rh-help">Your traced measurements appear here.</span>'}</div>`:'<div class="rh-note rh-to-note rh-space">'+icon('lock')+'<span>Plans stay in this browser. They are not uploaded to a server or sent with an enquiry automatically.</span></div>'}
      </aside><div class="rh-to-stage">
      <div class="rh-to-tools"><div class="rh-actions"><button class="rh-button small ${this.tool==='measure'?'':'secondary'}" data-to="measure" ${!calibrated?'disabled':''}>${icon('ruler')} Measure</button><button class="rh-icon-button" data-to="pan" aria-label="Pan plan" aria-pressed="${this.tool==='pan'}" ${!page?'disabled':''}>${icon('pan')}</button><button class="rh-icon-button" data-to="scale" aria-label="Set or change scale" ${!page?'disabled':''}>${icon('target')}</button><button class="rh-icon-button" data-to="undo" aria-label="Undo" ${!this.history.length&&!this.draft.length?'disabled':''}>${icon('undo')}</button><button class="rh-icon-button" data-to="redo" aria-label="Redo" ${!this.redoStack.length?'disabled':''}>${icon('redo')}</button></div><div class="rh-actions"><button class="rh-icon-button" data-to="zoom-out" aria-label="Zoom out">${icon('minus')}</button><span>${Math.round(this.zoom*100)}%</span><button class="rh-icon-button" data-to="zoom-in" aria-label="Zoom in">${icon('plus')}</button><button class="rh-tool-link" data-to="fit">Fit</button></div></div>
      <div class="rh-to-instruction" role="status">${e(instruction)}</div>
      ${this.error?`<div class="rh-note rh-error" role="alert">${icon('info')}<span>${e(this.error)}</span></div>`:''}
      <div class="rh-to-scroll">${page?this.svg():`<div class="rh-to-empty"><div>${icon('plan')}<h3>Start with a clear view from above.</h3><p>Upload a PDF plan, PNG, JPG or WebP image. You’ll need one known dimension to set the scale. Each PDF page is calibrated separately.</p><button class="rh-button" data-to="upload">${icon('upload')} Choose a plan</button><p class="rh-help rh-small-space">Images up to 20 MB · PDFs up to 40 MB</p></div></div>`}</div>
      ${this.draft.length?`<div class="rh-to-tools"><span>${this.draft.length} point${this.draft.length===1?'':'s'} · ${num(this.draftValue())} ${unitLabel(unit)} plan</span><div class="rh-actions"><button class="rh-tool-link" data-to="cancel-shape">Cancel</button><button class="rh-button small" data-to="finish-shape">${icon('check')} Finish ${unit==='m2'?'shape':unit==='each'?'count':'line'}</button></div></div>`:''}
      </div></div>
      <div class="rh-to-foot"><p>${this.workspace.pages.reduce((s,p)=>s+p.shapes.length,0)} measurements across ${this.workspace.pages.length} page${this.workspace.pages.length===1?'':'s'}. Verify scale, avoid duplicate roof planes, and review quantities before pricing. Images are session-only.</p><div class="rh-actions"><button class="rh-button secondary small" data-to="close">Back</button><button class="rh-button small" data-to="finish" ${!this.workspace.pages.some(p=>p.shapes.length)||this.draft.length?'disabled':''}>Use these measurements ${icon('arrow')}</button></div></div>
      ${this.busy?'<div class="rh-toast" role="status">Preparing your plan…</div>':''}
      </div>`;
    const newScroll=this.container.querySelector('.rh-to-scroll');if(newScroll&&scrollPos){newScroll.scrollLeft=scrollPos.x;newScroll.scrollTop=scrollPos.y;}
  }
  svg(){
    const p=this.page;const w=p.width,h=p.height;
    const available=Math.max(300,(this.container.clientWidth>700?this.container.clientWidth-310:this.container.clientWidth-45));
    const width=Math.min(available,w)*this.zoom;
    const stroke=Math.max(1,w/650);
    const pointsString=points=>points.map(p=>`${p.x},${p.y}`).join(' ');
    const shapes=p.shapes.map(s=>{
      const colour=TAKEOFF_COLOURS[s.group],points=pointsString(s.points),unit=shapeUnit(s);
      if(unit==='each')return s.points.map(pt=>`<g><circle cx="${pt.x}" cy="${pt.y}" r="${stroke*6}" fill="${colour}" stroke="white" stroke-width="${stroke}"/><path d="M${pt.x-stroke*3} ${pt.y}h${stroke*6}M${pt.x} ${pt.y-stroke*3}v${stroke*6}" stroke="white" stroke-width="${stroke}"/></g>`).join('');
      return `<${unit==='m2'?'polygon':'polyline'} points="${points}" fill="${unit==='m2'?colour:'none'}" fill-opacity=".16" stroke="${colour}" stroke-width="${stroke*2}" stroke-linejoin="round"/><text x="${s.points[0].x+stroke*5}" y="${s.points[0].y-stroke*6}" fill="${colour}" font-size="${stroke*10}" font-family="sans-serif" font-weight="600" paint-order="stroke" stroke="white" stroke-width="${stroke*2}">${e(s.label)}</text>`;
    }).join('');
    const draft=this.tool==='calibrate'?this.calibration:this.draft;
    return `<svg class="rh-to-svg ${this.tool==='pan'?'pan':''}" data-to-canvas viewBox="0 0 ${w} ${h}" width="${width}" height="${width*h/w}" role="img" aria-label="Plan measurement canvas. Use the manual measurement table as a keyboard-accessible alternative."><image href="${e(p.image)}" width="${w}" height="${h}"/>${shapes}<polyline points="${pointsString(draft)}" fill="none" stroke="${this.tool==='calibrate'?'#a66b22':TAKEOFF_COLOURS[this.group]}" stroke-width="${stroke*2}" stroke-dasharray="${stroke*5} ${stroke*3}"/>${draft.map(pt=>`<circle cx="${pt.x}" cy="${pt.y}" r="${stroke*4}" fill="white" stroke="#536153" stroke-width="${stroke*2}"/>`).join('')}</svg>`;
  }
  shapeValue(s){const u=shapeUnit(s);return u==='m2'?polygonArea(s.points)*(this.page.scale??0)**2:u==='each'?s.points.length:lineLength(s.points)*(this.page.scale??0);}
  draftValue(){return this.shapeValue({group:this.group,customUnit:this.customUnit,points:this.draft});}
  input(ev){const input=ev.target;const key=input.dataset.toField;if(!key)return;ev.stopPropagation();if(key==='to-known')this.knownLength=numberValue(input.value);if(key==='to-label')this.label=input.value;if(key==='to-pitch')this.pitch=numberValue(input.value);}
  change(ev){const input=ev.target;if(input.matches('[data-to-upload]')){const file=input.files?.[0];if(file)this.loadFile(file);return;}const key=input.dataset.toField;if(!key)return;ev.stopPropagation();if(['group','customUnit','page','parent','regular'].includes(key)){
    if(this.draft.length){this.error='Finish or cancel the current shape before changing its type/page.';this.render();return;}
    if(key==='group'){this.group=input.value;this.label='';this.tool=this.page?.scale?'measure':'calibrate';}
    if(key==='customUnit')this.customUnit=input.value;
    if(key==='page'){this.workspace.activePageId=input.value;this.calibration=[];this.parent=null;this.knownLength=null;this.tool=this.page?.scale?'measure':'calibrate';}
    if(key==='parent')this.parent=input.value||null;
    if(key==='regular')this.regular=input.checked;
    this.error='';this.render();
  }}
  pointerDown(ev){const svg=ev.target.closest('[data-to-canvas]');if(!svg)return;ev.preventDefault();if(this.tool==='pan'){const scroll=this.container.querySelector('.rh-to-scroll');this.panStart={x:ev.clientX,y:ev.clientY,left:scroll.scrollLeft,top:scroll.scrollTop};svg.setPointerCapture?.(ev.pointerId);return;}const matrix=svg.getScreenCTM();if(!matrix)return;const point=new DOMPoint(ev.clientX,ev.clientY).matrixTransform(matrix.inverse());if(point.x<0||point.y<0||point.x>this.page.width||point.y>this.page.height)return;
    if(this.tool==='calibrate'){if(this.calibration.length===2)this.calibration=[];this.calibration.push({x:point.x,y:point.y});}
    else if(this.page.scale){if(this.draft.length>=2000){this.error='A shape can contain at most 2,000 points.';this.render();return;}this.draft.push({x:point.x,y:point.y});}
    this.error='';this.render();
  }
  pointerMove(ev){if(!this.panStart)return;const s=this.container.querySelector('.rh-to-scroll');s.scrollLeft=this.panStart.left-(ev.clientX-this.panStart.x);s.scrollTop=this.panStart.top-(ev.clientY-this.panStart.y);}
  keydown(ev){if(['INPUT','SELECT','TEXTAREA'].includes(ev.target.tagName))return;if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==='z'){ev.preventDefault();ev.shiftKey?this.redo():this.undo();}if(ev.key==='Enter'&&this.draft.length){ev.preventDefault();this.finishShape();}if(ev.key==='Escape'&&this.draft.length){ev.preventDefault();ev.stopPropagation();this.draft=[];this.render();}}
  click(ev){const b=ev.target.closest('[data-to]');if(!b)return;ev.preventDefault();ev.stopPropagation();const action=b.dataset.to;
    if(action==='upload'){this.container.querySelector('[data-to-upload]').click();return;}
    if(action==='close'){this.onClose?.();return;}
    if(action==='finish'){try{workspaceMeasurements(this.workspace);this.onFinish?.(this.workspace);}catch(err){this.error=err.message;this.render();}return;}
    if(action==='calibrate'){
      if(this.calibration.length!==2||!validNumber(this.knownLength,.01,10000)){this.error='Select two points and enter their real distance in metres.';this.render();return;}
      const px=lineLength(this.calibration);if(px<5){this.error='Choose a longer calibration line for a reliable scale.';this.render();return;}
      this.checkpoint();this.page.scale=this.knownLength/px;this.page.calibration={points:clone(this.calibration),metres:this.knownLength};this.calibration=[];this.tool='measure';this.error='';this.render();return;
    }
    if(action==='finish-shape'){this.finishShape();return;}
    if(action==='cancel-shape'){this.draft=[];this.error='';this.render();return;}
    if(action==='undo'){this.undo();return;}if(action==='redo'){this.redo();return;}
    if(action==='delete'){
      const id=b.dataset.id;this.checkpoint();const parent=this.page.shapes.find(s=>s.id===id);this.page.shapes=this.page.shapes.filter(s=>s.id!==id).map(s=>s.roofAreaId===id?{...s,pitch:s.pitch??parent?.pitch??this.defaultPitch,roofAreaId:null}:s);if(this.parent===id)this.parent=null;this.render();return;
    }
    if(['scale','pan','measure'].includes(action)){
      if(this.draft.length){this.error='Finish or cancel the current shape first.';this.render();return;}
      this.tool=action==='scale'?'calibrate':action;this.calibration=[];this.error='';this.render();return;
    }
    if(action==='zoom-in')this.zoom=Math.min(4,this.zoom+.25);
    if(action==='zoom-out')this.zoom=Math.max(.25,this.zoom-.25);
    if(action==='fit')this.zoom=1;
    this.render();
  }
  finishShape(){
    const unit=this.group==='custom'?this.customUnit:GROUP_MAP[this.group]?.unit??'lm';
    const minimum=unit==='m2'?3:unit==='each'?1:2;
    if(this.draft.length<minimum){this.error=`Add at least ${minimum} points to finish this measurement.`;this.render();return;}
    if(unit==='m2'&&(polygonCrossesItself(this.draft)||polygonArea(this.draft)<1)){this.error='Trace one non-crossing roof outline. This polygon crosses itself or has no area.';this.render();return;}
    if(unit==='lm' && lineLength(this.draft)<1){this.error='The line needs a measurable length.';this.render();return;}
    if(!validNumber(this.pitch,0,85)){this.error='Enter a pitch between 0° and 85°.';this.render();return;}
    if(['hips','valleys'].includes(this.group)&&!this.regular){this.error='For plan hip/valley conversion, confirm regular equal-pitch geometry. Use actual length entry for irregular intersections.';this.render();return;}
    if(this.group==='custom'&&!this.label.trim()){this.error='Name this custom component so it can be priced later.';this.render();return;}
    const rootName=GROUP_MAP[this.group]?.singular??(this.group==='perimeter'?'Scaffold perimeter':'Custom component');
    const count=this.page.shapes.filter(s=>s.group===this.group).length+1;
    this.checkpoint();this.page.shapes.push({id:uid('shape'),group:this.group,customUnit:this.customUnit,label:this.label.trim()||`${rootName} ${count}`,points:clone(this.draft),pitch:this.parent?null:this.pitch,roofAreaId:this.parent,regularGeometry:this.regular});this.draft=[];this.label='';this.error='';this.render();
  }
  async loadFile(file){
    try {
      if(this.draft.length)throw new Error('Finish or cancel the current measurement before adding another page.');
      const pdf=file.type==='application/pdf'||/\.pdf$/i.test(file.name);
      if(file.size>(pdf?40:20)*1024*1024)throw new Error(`This file exceeds the ${pdf?40:20} MB limit.`);
      if(!pdf&&!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Use a PDF, PNG, JPG or WebP. SVG and other active file types are not accepted.');
      this.busy=true;this.error='';this.render();
      if(pdf){await this.loadPdf(file);return;}
      const data=await new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=()=>reject(new Error('Could not read this image.'));fr.readAsDataURL(file);});
      await this.addImage(data,file.name);this.busy=false;this.render();
    }catch(err){this.busy=false;this.error=err.message||'Could not open this file.';this.render();}
  }
  async addImage(data,name){
    if(this.workspace.pages.length>=20)throw new Error('This session supports up to 20 plan pages.');
    const image=new Image();image.src=data;await image.decode();if(this.disposed)return;
    if(image.width*image.height>80_000_000)throw new Error('This image is too large. Export a smaller plan image.');
    const scale=Math.min(1,3600/Math.max(image.width,image.height));const width=Math.round(image.width*scale),height=Math.round(image.height*scale);
    let src=data;
    if(scale<1){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d').drawImage(image,0,0,width,height);src=canvas.toDataURL('image/png');}
    const page={id:uid('page'),name:name.slice(0,150),width,height,image:src,scale:null,shapes:[]};this.workspace.pages.push(page);this.workspace.activePageId=page.id;this.tool='calibrate';this.calibration=[];this.knownLength=null;this.draft=[];this.parent=null;this.zoom=1;
  }
  async loadPdf(file){
    let lib;
    try {
      lib=this.pdfLoader?await this.pdfLoader():await import(new URL('../../assets/pdfjs/pdf.min.mjs',import.meta.url).href);
    } catch {throw new Error('PDF support is not installed in this preview. Run npm install (which copies PDF.js assets), or upload this page as a PNG/JPG. Manual/image takeoff remains available.');}
    lib.GlobalWorkerOptions.workerSrc=new URL('../../assets/pdfjs/pdf.worker.min.mjs',import.meta.url).href;
    const base=new URL('../../assets/pdfjs/',import.meta.url).href;
    const task=lib.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false,cMapUrl:base+'cmaps/',cMapPacked:true,standardFontDataUrl:base+'standard_fonts/',wasmUrl:base+'wasm/',maxImageSize:40_000_000});
    task.onPassword=()=>{task.destroy();this.error='Password-protected PDFs are not supported. Export an unlocked page image instead.';this.busy=false;this.render();};
    const doc=await task.promise;if(this.disposed){await doc.destroy();return;}
    this.pdfDoc=doc;this.pdfName=file.name;this.pdfPage=1;this.busy=false;this.render();this.showPdfPicker();
  }
  async showPdfPicker(){
    const dialog=document.createElement('dialog');dialog.className='rh-dialog';dialog.setAttribute('aria-label','Choose a PDF page');
    dialog.innerHTML=`<div class="rh-dialog-header"><div><h2>Choose your plan page</h2><p>${e(this.pdfName)} · ${this.pdfDoc.numPages} pages</p></div><button class="rh-icon-button" data-pdf-close aria-label="Cancel PDF upload">${icon('close')}</button></div><div class="rh-pdf-preview"><canvas></canvas></div><div class="rh-field rh-space"><label for="pdf-page-number">Page number</label><input id="pdf-page-number" type="number" min="1" max="${this.pdfDoc.numPages}" value="1"></div><div class="rh-actions rh-space"><button class="rh-button" data-pdf-use>Use this page ${icon('arrow')}</button><button class="rh-button secondary" data-pdf-close>Cancel</button></div><p class="rh-help rh-small-space">Add other pages separately and calibrate each. Avoid measuring the same roof twice.</p>`;
    this.container.append(dialog);dialog.showModal();let renderTask=null;let serial=0;
    const close=()=>{renderTask?.cancel();dialog.close();dialog.remove();this.pdfDoc?.destroy?.();this.pdfDoc=null;};
    dialog.addEventListener('cancel',ev=>{ev.preventDefault();close();});
    const render=async()=>{
      const n=Number(dialog.querySelector('input').value);const use=dialog.querySelector('[data-pdf-use]');
      if(!Number.isInteger(n)||n<1||n>this.pdfDoc.numPages){use.disabled=true;return;}
      use.disabled=true;const current=++serial;renderTask?.cancel();
      try {const p=await this.pdfDoc.getPage(n);if(current!==serial)return;const initial=p.getViewport({scale:1});const viewport=p.getViewport({scale:Math.min(3,2200/Math.max(initial.width,initial.height))});const canvas=dialog.querySelector('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);renderTask=p.render({canvas,canvasContext:canvas.getContext('2d'),viewport});await renderTask.promise;if(current===serial){this.pdfPage=n;use.disabled=false;}}
      catch(err){if(err.name!=='RenderingCancelledException'){this.error='Could not render this PDF page. Try exporting it as an image.';close();this.render();}}
    };
    dialog.querySelector('input').addEventListener('change',render);
    dialog.querySelectorAll('[data-pdf-close]').forEach(b=>b.addEventListener('click',close));
    dialog.querySelector('[data-pdf-use]').addEventListener('click',async()=>{const src=dialog.querySelector('canvas').toDataURL('image/png');const name=`${this.pdfName} · page ${this.pdfPage}`;close();try{await this.addImage(src,name);this.render();}catch(err){this.error=err.message;this.render();}});
    await render();
  }
}
