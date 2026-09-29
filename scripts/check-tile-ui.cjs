/** Small component-state harness, not browser hydration or a replacement for Next build. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'..');let states=[],cursor=0,cases=0,blobText='',downloadFails=false;
const Fragment=Symbol('Fragment'),jsx=(type,props)=>({type,props:props||{}});
const React={useId:()=> 'tile-test',useState:init=>{const n=cursor++;if(!(n in states))states[n]=typeof init==='function'?init():init;return [states[n],v=>{states[n]=typeof v==='function'?v(states[n]):v;}];}};
const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const m={exports:{}};cache.set(file,m);
 const req=id=>{
  if(id==='react')return React;
  if(id==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment};
  if(id==='next/link')return {__esModule:true,default:props=>jsx('a',props)};
  if(id.startsWith('.')||id.startsWith('@/')){
   const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
   const found=['','.ts','.tsx','.json','/index.ts'].map(s=>base+s).find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());
   if(found)return load(found);
  }
  throw Error(`Unexpected component-test dependency ${id}`);
 };
 const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const document={body:{appendChild:()=>{}},createElement:()=>({click:()=>{if(downloadFails)throw Error('download blocked');},remove:()=>{}})};
 const URL={createObjectURL:()=> 'blob:local-test',revokeObjectURL:()=>{}};
 const Blob=function(parts){blobText=parts.join('');};
 new Function('require','module','exports','document','URL','Blob','setTimeout',source)(req,m,m.exports,document,URL,Blob,()=>{});
 return m.exports;
}
const Component=load(path.join(root,'components/content/PressedTileBudget.tsx')).PressedTileBudget;
const profiles=load(path.join(root,'data/research/pressed-tile.ts')).tileWorksheetProfiles();
function render(){cursor=0;return Component({profiles});}
function all(node){if(node==null||typeof node==='boolean')return [];if(Array.isArray(node))return node.flatMap(all);if(typeof node!=='object')return [];if(typeof node.type==='function')return all(node.type(node.props));return [node,...all(node.props.children)];}
function text(node){if(node==null||typeof node==='boolean')return '';if(Array.isArray(node))return node.map(text).join('');if(typeof node!=='object')return String(node);return text(typeof node.type==='function'?node.type(node.props):node.props.children);}
function control(tree,suffix){const n=all(tree).find(n=>n.props.id===`tile-test-${suffix}`);assert.ok(n,`Missing ${suffix} input`);return n;}
function change(key,value){const tree=render();control(tree,key).props.onChange({target:{value,checked:value}});return render();}
const output=tree=>all(tree).find(n=>n.props.className==='rh-sheet-result');
const save=tree=>all(tree).find(n=>n.type==='button'&&text(n).includes('Save my worksheet'));
function reset(){states=[];downloadFails=false;blobText='';return render();}
function test(name,fn){try{fn();cases++;}catch(e){console.error(`FAIL tile component: ${name}: ${e.message}`);process.exitCode=1;}}

test('default is quantity-only and 430 panels',()=>{const t=reset();assert.equal(control(t,'price').props.value,'');assert.equal(control(t,'gst').props.value,'unknown');assert.ok(text(output(t)).includes('430 panels'));assert.ok(!text(output(t)).includes('$'));});
test('actual area updates quantity',()=>{reset();assert.ok(text(output(change('area','150'))).includes('323 panels'));});
test('allowance updates after density',()=>{reset();assert.ok(text(output(change('extra','5'))).includes('452 panels'));});
test('plan conversion happens once',()=>{reset();assert.ok(text(output(change('basis','plan'))).includes('475 panels'));});
test('below-minimum plan pitch carries warning',()=>{reset();change('basis','plan');const t=change('pitch','5');assert.ok(text(t).includes('Pitch needs review.'));assert.equal(save(t).props.disabled,false);});
test('unknown tax preserves quoted-basis subtotal',()=>{reset();const t=change('price','12');assert.ok(text(output(t)).includes('$5,160.00'));assert.ok(text(output(t)).includes('GST unconfirmed'));assert.ok(!text(output(t)).includes('including GST'));});
test('exclusive GST gives 5934, not double tax',()=>{reset();change('price','12');assert.ok(text(output(change('gst','excl'))).includes('$5,934.00'));});
test('inclusive GST stays 5160',()=>{reset();change('price','12');assert.ok(text(output(change('gst','incl'))).includes('$5,160.00'));});
test('bad price does not hide valid quantities',()=>{reset();const t=change('price','-1');assert.ok(text(output(t)).includes('430 panels'));assert.ok(text(output(t)).includes('Price per panel must'));assert.equal(save(t).props.disabled,true);});
test('empty area does not silently become zero',()=>{reset();const t=change('area','');assert.ok(text(output(t)).includes('Enter your roof area'));assert.equal(save(t).props.disabled,true);});
test('minimum then pack rule reaches 460',()=>{reset();change('minimum','451');assert.ok(text(output(change('pack','20'))).includes('460 panels'));});
test('fractional pack size blocks export',()=>{reset();const t=change('pack','1.5');assert.equal(save(t).props.disabled,true);assert.ok(text(output(t)).includes('whole number'));});
test('profile switch clears old quote and order assumptions',()=>{reset();change('price','12');change('gst','excl');change('pack','20');change('minimum','1000');const t=change('profile','shake');assert.equal(control(t,'price').props.value,'');assert.equal(control(t,'gst').props.value,'unknown');assert.equal(control(t,'pack').props.value,'1');assert.equal(control(t,'minimum').props.value,'0');assert.ok(text(output(t)).includes('440 panels'));});
test('CF Slate has no auto-filled disputed density',()=>{reset();const t=change('profile','cf-slate');assert.equal(control(t,'density').props.value,'');assert.equal(save(t).props.disabled,true);assert.ok(text(t).includes('Automatic density disabled'));});
test('confirmed CF Slate density can be entered',()=>{reset();change('profile','cf-slate');assert.ok(text(output(change('density','3.14'))).includes('628 panels'));});
test('Calibre does not offer a generic batten calculation',()=>{reset();const t=change('profile','calibre');assert.equal(all(t).filter(n=>n.props.id==='tile-test-battens').length,0);assert.ok(text(t).includes('uses plywood support'));});
test('own product needs confirmed density',()=>{reset();const t=change('profile','custom');assert.equal(save(t).props.disabled,true);assert.ok(text(output(change('density','2.5'))).includes('500 panels'));});
test('optional batten check requires an installer gauge',()=>{reset();const t=change('battens',true);assert.ok(text(t).includes('Enter the installer-provided batten gauge'));assert.equal(save(t).props.disabled,true);});
test('batten check leaves 430 panels unchanged',()=>{reset();change('battens',true);const t=change('gauge','400');assert.ok(text(output(t)).includes('500 lm'));assert.ok(text(output(t)).includes('430 panels'));});
test('changing profile clears batten gauge',()=>{reset();change('battens',true);change('gauge','400');const t=change('profile','bond');assert.equal(control(t,'battens').props.checked,false);});
test('download contains calculations, source and exclusions',()=>{reset();change('price','12');change('gst','excl');save(render()).props.onClick();assert.ok(blobText.includes('Planning purchase quantity: 430'));assert.ok(blobText.includes('$5,934.00'));assert.ok(blobText.includes('https://www.gerardroofs.co.nz'));assert.ok(blobText.includes('Excludes all trims'));assert.ok(text(render()).includes('Worksheet file prepared'));});
test('download failure is honest and preserves measurements',()=>{reset();downloadFails=true;save(render()).props.onClick();const t=render();assert.ok(text(t).includes('could not save'));assert.equal(control(t,'area').props.value,'200');});
test('stale download success clears when inputs change',()=>{reset();save(render()).props.onClick();const t=change('area','201');assert.ok(!text(t).includes('Worksheet file prepared'));});
console.log(`${cases} pressed-tile component-state harness scenarios passed (not React hydration).`);
