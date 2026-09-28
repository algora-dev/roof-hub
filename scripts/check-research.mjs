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
  for(const block of section.blocks){
   assert(['paragraph','notice','table','prices','projects','calculator','checklist'].includes(block.type),`Unknown block ${id}`);
   if('sources' in block)checkSources(block.sources,id);
   if(block.type==='table')for(const row of block.rows){assert(row.cells.length===block.heads.length,`Table mismatch ${id}`);checkSources(row.sources,id);}
   if(block.type==='projects')for(const pid of block.ids)assert(has(projects,pid),`Unknown project ${pid}`);
   if(block.type==='prices')for(const oid of block.ids){used.add(oid);const o=byId.get(oid);assert(o?.status==='verified',`Unverified price ${oid}`);assert(validDate(o?.lastCheckedAt) && o.lastCheckedAt <= a.updatedAt,`Missing or inconsistent price review date ${oid}`);}
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
