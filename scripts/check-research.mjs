import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const read = path => readFileSync(path, 'utf8');
const json = path => JSON.parse(read(path));
const articles = json('data/research/articles.json');
const sources = json('data/research/sources.json');
const projects = json('data/research/projects.json');
const raw = read('data/observations.ts');
const observations = JSON.parse(raw.slice(raw.indexOf('= [') + 2, raw.lastIndexOf(']') + 1));
const byId = new Map(observations.map(o => [o.id, o]));
let checks = 0; const failures = [];
function assert(condition, message) { checks++; if (!condition) failures.push(message); }
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value && value <= new Date().toISOString().slice(0,10);
const validPublicationDate = value => validDate(value) || (typeof value === 'string' && /^\d{4}$/.test(value) && value <= new Date().toISOString().slice(0,4));
const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const checkSources = (ids, where) => {assert(Array.isArray(ids), `Missing source list: ${where}`);for(const id of ids ?? [])assert(has(sources,id),`Unknown source ${id}: ${where}`);};
const flatten = blocks => blocks.flatMap(block => block.type === 'details' ? [block, ...flatten(block.blocks ?? [])] : [block]);
const paths = new Set(); const titles = new Set(); const used = new Set();
for(const [id,a] of Object.entries(articles)){
 assert(a.id === id, `Article key mismatch ${id}`);
 assert(!paths.has(a.path),`Duplicate route ${a.path}`); paths.add(a.path);
 assert(!titles.has(a.title),`Duplicate title ${a.title}`); titles.add(a.title);
 assert(existsSync(`app${a.path}/page.tsx`),`Missing page ${a.path}`);
 assert(read('data/siteRoutes.ts').includes(`path: "${a.path}"`),`Missing sitemap entry ${a.path}`);
 assert(a.answer.length > 100,`Missing answer ${id}`);
 assert(a.sections.length >= 4,`Incomplete article ${id}`);
 assert(validDate(a.updatedAt) && validDate(a.publishedAt) && a.updatedAt >= a.publishedAt,`Invalid article dates ${id}`);
 checkSources(a.answerSources,id);
 const anchors = new Set();
 for(const section of a.sections){
  assert(/^[a-z][a-z0-9-]*$/.test(section.id),`Invalid anchor ${section.id}`);
  assert(!anchors.has(section.id),`Duplicate anchor ${id}/${section.id}`); anchors.add(section.id);
  for(const block of flatten(section.blocks)){
   assert(['paragraph','notice','table','prices','projects','calculator','checklist','details','action','corrugated-prices','corrugated-examples','corrugated-budget','corrugated-cover','five-rib-prices','five-rib-profiles','five-rib-examples','five-rib-budget','sheet-quote-compare','pressed-tile-prices','pressed-tile-profiles','pressed-tile-budget','pressed-tile-examples'].includes(block.type),`Unknown block ${id}`);
   if('sources' in block)checkSources(block.sources,id);
   if(block.type==='table')for(const row of block.rows){assert(row.cells.length===block.heads.length,`Table mismatch ${id}`);checkSources(row.sources,id);}
   if(block.type==='projects')for(const pid of block.ids)assert(has(projects,pid),`Unknown project ${pid}`);
   if(['prices','corrugated-prices','corrugated-examples','five-rib-prices','five-rib-examples','pressed-tile-prices'].includes(block.type))for(const oid of block.ids){used.add(oid);const o=byId.get(oid);assert(o?.status==='verified',`Unverified price ${oid}`);assert(validDate(o?.lastCheckedAt) && o.lastCheckedAt <= a.updatedAt,`Missing or inconsistent price review date ${oid}`);}
   if(block.type==='details')assert(typeof block.title==='string' && Array.isArray(block.blocks) && block.blocks.length>0,`Empty disclosure ${id}`);
   if(block.type==='action'){assert(block.href.startsWith('/')&&!block.href.startsWith('//'),`Unsafe action ${id}`);assert(existsSync(`app${block.href.split(/[?#]/)[0]}/page.tsx`),`Broken action ${block.href}`);}
   if(block.type==='calculator')assert(['area','pitch','sheet','budget'].includes(block.mode),`Bad calculator ${id}`);
  }
 }
 for(const related of a.related){assert(has(articles,related),`Broken related article ${id} -> ${related}`);assert(related!==id,`Self-related ${id}`);}
 for(const faq of a.faqs)checkSources(faq.sources,`${id} FAQ`);
}
for(const [id,s] of Object.entries(sources)){
 assert(s.id===id,`Source key mismatch ${id}`);
 assert(/^https:\/\//.test(s.url),`Insecure source ${id}`);
 assert(validDate(s.reviewedAt) && (!s.publishedAt || (validPublicationDate(s.publishedAt) && s.publishedAt <= s.reviewedAt)),`Invalid source review dates ${id}`);
}
for(const [id,p] of Object.entries(projects)){
 assert(p.id===id && has(sources,p.sourceId),`Broken project ${id}`);
 assert(p.price===null && p.areaM2===null,`Unsourced project metric ${id}`);
 assert(p.imagePermission==='not-obtained',`Unexpected image permission ${id}`);
}
// Source-specific corrugated review: full conversion prerequisites, no hidden rate injection.
const market=json('data/research/corrugated.json');
assert(validDate(market.reviewedAt),'Invalid corrugated review date');
assert(new Set(market.retail.map(row=>row.observationId)).size===market.retail.length,'Duplicate corrugated listing');
for(const row of market.retail){
 const o=byId.get(row.observationId);
 assert(o?.status==='verified' && o.priceBasis==='material-only',`Invalid material observation ${row.observationId}`);
 assert(validDate(o?.lastCheckedAt) && o.lastCheckedAt<=market.reviewedAt,`Unreviewed listing ${row.observationId}`);
 checkSources(row.sourceIds,row.observationId);
 assert(['confirmed','approximate','archived-seller','unknown'].includes(row.coverBasis),`Bad cover basis ${row.observationId}`);
 assert(row.coverBasis==='unknown' ? row.coverMm===null : Number.isFinite(row.coverMm)&&row.coverMm>0,`Missing cover ${row.observationId}`);
 assert(o?.unit==='lm' || (o?.unit==='each' && row.fixedLengthM>0),`Missing sheet length ${row.observationId}`);
 if(row.observationId!=='lr-18')assert(o?.rangeEligible===false,`New retail rate entered pooled range ${row.observationId}`);
}
for(const row of market.held){checkSources(row.sourceIds,row.name);assert(row.reason.length>30,`Missing exclusion reason ${row.name}`);}
const corrBlocks=articles.corrugated.sections.flatMap(s=>flatten(s.blocks));
const ledger=corrBlocks.find(b=>b.type==='corrugated-prices');
assert(JSON.stringify(ledger?.ids)===JSON.stringify(market.retail.map(r=>r.observationId)),'Corrugated ledger incomplete');
assert(corrBlocks.filter(b=>b.type==='corrugated-budget').length===1,'Missing or duplicate sheet calculator');
const example=corrBlocks.find(b=>b.type==='corrugated-examples');
assert(JSON.stringify(example?.ids)===JSON.stringify(['lr-18','corr-rc-maxam-20260928','rr-02']),'Size example provenance mismatch');
const corrProjects=[...new Set(corrBlocks.filter(b=>b.type==='projects').flatMap(b=>b.ids))];
assert(corrProjects.length===7,'Corrugated project account count needs reviewing');
assert(new Set(corrProjects.map(id=>sources[projects[id].sourceId].publisher)).size===6,'Corrugated publisher count needs reviewing');
assert(!read('components/content/CorrugatedEvidence.tsx').includes('deriveRate'),'Corrugated listings must not be pooled into a market range');

// Five-rib source audit is parallel to corrugate, not a second price engine.
const five=json('data/research/five-rib.json');
assert(validDate(five.reviewedAt),'Invalid five-rib review date');
assert(new Set(five.retail.map(row=>row.observationId)).size===five.retail.length,'Duplicate five-rib listing');
assert(new Set(five.retail.map(row=>row.supplierKey)).size===4,'Five-rib supplier count needs reviewing');
for(const row of five.retail){
 const o=byId.get(row.observationId);
 assert(o?.status==='verified' && o.priceBasis==='material-only',`Invalid five-rib observation ${row.observationId}`);
 assert(o?.lastCheckedAt===five.reviewedAt,`Five-rib listing review mismatch ${row.observationId}`);
 checkSources(row.sourceIds,row.observationId);
 assert(row.coverBasis==='unknown' ? row.coverMm===null : Number.isFinite(row.coverMm)&&row.coverMm>0,`Invalid five-rib cover ${row.observationId}`);
 assert(o?.unit==='lm' || (o?.unit==='each' && row.fixedLengthM>0),`Missing fixed sheet length ${row.observationId}`);
 if(row.observationId!=='lr-18')assert(o?.rangeEligible===false,`Five-rib listing entered national range ${row.observationId}`);
}
for(const row of five.held){checkSources(row.sourceIds,row.name);assert(row.reason.length>30,`Missing five-rib exclusion reason ${row.name}`);}
for(const row of five.profiles){checkSources(row.sources,row.id);for(const k of ['cover','overall','thickness','pitch','note'])assert(typeof row[k]==='string' && row[k].length>2,`Incomplete profile ${row.id}/${k}`);}
assert(five.profiles.length===8 && new Set(five.profiles.map(row=>row.manufacturer)).size===6,'Five-rib manufacturer coverage mismatch');
assert(five.profiles.find(row=>row.id==='hi-five')?.cover.includes('Conflict'),'Hi Five discrepancy was hidden');
assert(five.profiles.find(row=>row.id==='freeman')?.pitch.includes('10°'),'Freeman end-lap condition was removed');
const fiveBlocks=articles['five-rib'].sections.flatMap(section=>flatten(section.blocks));
const fiveLedger=fiveBlocks.find(b=>b.type==='five-rib-prices');
assert(JSON.stringify(fiveLedger?.ids)===JSON.stringify(five.retail.map(row=>row.observationId)),'Incomplete five-rib ledger');
const fiveProjects=[...new Set(fiveBlocks.filter(b=>b.type==='projects').flatMap(b=>b.ids))];
assert(fiveProjects.length===7,'Five-rib project count needs reviewing');
assert(new Set(fiveProjects.map(id=>sources[projects[id].sourceId].publisher)).size===6,'Five-rib project publisher count needs reviewing');
assert(fiveBlocks.filter(b=>b.type==='five-rib-budget').length===1,'Missing or duplicate five-rib sheet calculator');
assert(fiveBlocks.some(b=>b.type==='paragraph' && b.sources.includes('mrm-flashings') && b.text.includes('soft-edge')),'Flashing qualification missing');
assert(!read('components/content/FiveRibEvidence.tsx').includes('deriveRate'),'Five-rib ledger must not imply a national range');
assert(byId.get('five-renovation-sheet-20260928')?.gstBasis==='unknown','Unknown Renovation Warehouse GST was assumed');
assert(five.retail.find(row=>row.observationId==='five-bunnings-20260928')?.coverMm===null,'Nominal Bunnings width became effective cover');
assert(five.retail.find(row=>row.observationId==='lr-18')?.coverBasis==='archived-seller','Conditional Bitz cover became confirmed');
assert(articles['corrugate-vs-five'].sections.flatMap(s=>flatten(s.blocks)).filter(b=>b.type==='sheet-quote-compare').length===1,'Quote-comparison worksheet missing or duplicated');
assert(read('components/content/ResearchArticle.tsx').includes("article.id === 'five-rib'"),'Five-rib shortcut routing missing');
assert(read('components/content/ResearchArticle.tsx').includes("article.id === 'corrugated'"),'Corrugate shortcut routing regressed');
assert(read('app/sources/page.tsx').includes('<ResearchLibraryStats/>') && read('app/methodology/page.tsx').includes('<ResearchLibraryStats/>'),'Library signature missing');

// Pressed tiles: source figures, support scope and supplier-owned arithmetic.
const tiles=json('data/research/pressed-tile.json');
assert(validDate(tiles.reviewedAt),'Invalid tile review date');
assert(tiles.profiles.length===9,'Pressed tile profile count needs review');
assert(new Set(tiles.profiles.map(p=>p.id)).size===tiles.profiles.length,'Duplicate tile profile');
for(const p of tiles.profiles){
 checkSources([p.sourceId],p.id);
 for(const field of ['coverLengthMm','coverWidthMm','panelsPerM2','minimumPitch'])assert(Number.isFinite(p[field]) && p[field]>0,`Missing panel figure ${p.id}/${field}`);
 assert(typeof p.presetEligible==='boolean',`Missing preset decision ${p.id}`);
 assert(p.support.length>5,`Missing support scope ${p.id}`);
 if(!p.presetEligible)assert(p.note.includes('Confirmation needed'),'A blocked panel preset must explain its discrepancy');
}
assert(tiles.profiles.filter(p=>p.presetEligible).length===7,'Unexpected automatic density presets');
for(const id of ['cf-slate','calibre'])assert(tiles.profiles.find(p=>p.id===id)?.presetEligible===false,`Disputed ${id} quantity was auto-filled`);
const tileBlocks=articles['pressed-tile'].sections.flatMap(s=>flatten(s.blocks));
assert(tileBlocks.filter(b=>b.type==='pressed-tile-budget').length===1,'Tile worksheet missing or duplicated');
assert(tileBlocks.filter(b=>b.type==='pressed-tile-profiles').length===1,'Tile profile table missing or duplicated');
assert(JSON.stringify(tileBlocks.find(b=>b.type==='pressed-tile-prices')?.ids)===JSON.stringify(tiles.priceRows.map(r=>r.observationId)),'Tile price ledger mismatch');
for(const row of tiles.priceRows){
 const o=byId.get(row.observationId);checkSources(row.sourceIds,row.observationId);
 assert(o?.status==='verified' && ['supply-install','complete-project'].includes(o.priceBasis),`Wrong tile price scope ${row.observationId}`);
 assert(o?.unit==='m2',`Wrong tile price unit ${row.observationId}`);
 assert(row.scope.length>20 && row.note.length>30,`Incomplete tile scope ${row.observationId}`);
}
assert(byId.get('tile-rs-20260929')?.rangeEligible===false,'Undated tile guide entered pooled pricing');
assert(byId.get('tile-rs-20260929')?.gstBasis==='incl','Roofing Systems explicit tax basis lost');
assert(byId.get('tt-01')?.status==='provisional','Historical provisional record was silently overwritten');
assert(new Set(tiles.priceRows.flatMap(r=>r.sourceIds.map(id=>sources[id].publisher))).size===3,'Independent tile price-publisher count mismatch');
for(const row of tiles.held){checkSources(row.sourceIds,row.name);assert(row.reason.length>30,'Missing tile exclusion reason');}
const tileProjects=[...tiles.newProjectIds,...tiles.replacementProjectIds];
for(const id of tileProjects)assert(tileBlocks.some(b=>b.type==='projects' && b.ids.includes(id)),`Missing tile project ${id}`);
assert(new Set(tileProjects.map(id=>sources[projects[id].sourceId].publisher)).size===4,'Tile project-publisher count mismatch');
assert(projects['tile-kumeu'].lesson.includes('does not establish'),'Kumeu gallery became a verified new-build record');
assert(projects['eastern-beach'].system.includes('T-rib') && !projects['eastern-beach'].system.includes('Trimrib'),'Builder project profile misattributed');
assert(articles['pressed-tile'].answer.toLowerCase().includes('new'),'New-roof emphasis missing');
assert(read('components/content/ResearchArticle.tsx').includes("article.id === 'pressed-tile'"),'Tile shortcut routing missing');
assert(read('components/content/PressedTileBudget.tsx').includes("useState('')"),'Panel price should start empty');
assert(!read('components/content/PressedTileBudget.tsx').includes('RoofHubRate'),'Panel worksheet imports estimator rates');
assert(!read('components/content/PressedTileEvidence.tsx').includes('deriveRate'),'Tile ledger pooled incompatible guides');

assert(byId.get('tt-02')?.sourceDate==='2024-02-10','Historical Arcline date regressed');
assert(byId.get('rr-13')?.unit==='hour','Hourly labour unit regressed');
assert(byId.get('access-upwell-setup-20260928')?.rangeEligible===false,'Conflicting scaffold rate admitted to derived range');
assert(sources['hi-five'].note.includes('755'),'Hi Five conflict omitted');
function walk(dir){return readdirSync(dir).flatMap(name=>{const path=join(dir,name);return statSync(path).isDirectory()?walk(path):[path];});}
// Detect literal and commonly encoded em dashes without touching functional escapes.
const emDash = new RegExp(String.fromCodePoint(0x2014)+'|&mdash;|&#(?:8212|x2014);|\\\\u2014','i');
const publicFiles=['app','components','data','lib','public/roofhub-estimator/src'].flatMap(walk).filter(p=>/\.(?:tsx?|mjs|js|json|css|html)$/.test(p));
for(const file of publicFiles){
 const text=read(file);assert(!emDash.test(text),`Em dash in public source ${file}`);
 assert(!text.includes('\ufffd'),`Replacement character in ${file}`);
 if(!file.startsWith('app/api/'))assert(!/@t3labs\.co\.uk/i.test(text),`Private email exposed in ${file}`);
}
// Explicit unchanged release boundaries.
assert(read('data/siteRoutes.ts').includes('path: "/tools/detailed-roof-estimator", lastModified: "2026-09-26", priority: 0.2, changeFrequency: "monthly", indexable: false'),'Estimator indexability changed');
assert(read('lib/site.ts').includes('process.env.ALLOW_INDEXING === "true"'),'Indexing switch changed');
if(failures.length){console.error(failures.join('\n'));console.error(`${failures.length}/${checks} research checks failed`);process.exit(1);}
console.log(`Research checks: ${checks} passed; ${Object.keys(articles).length} articles; ${Object.keys(sources).length} registered sources; ${Object.keys(projects).length} attributed projects; ${used.size} unique rechecked price observations.`);
