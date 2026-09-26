import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { OBSERVATIONS } from "@/data/observations";

export const metadata=pageMetadata({title:"Sources & corrections policy",description:"How RoofHub selects, records and reviews New Zealand roofing sources, supplier prices, technical references and market observations.",path:"/sources"});

export default function SourcesPage(){
  const unique=new Map<string,{name:string,url:string,type:string,tier:string}>();
  for(const o of OBSERVATIONS){if(!unique.has(o.sourceUrl))unique.set(o.sourceUrl,{name:o.sourceName,url:o.sourceUrl,type:o.sourceType,tier:o.evidenceTier});}
  const sources=[...unique.values()].sort((a,b)=>a.name.localeCompare(b.name));
  return <>
  <section className="page-intro"><div className="container page-intro__grid"><div><p className="eyebrow">Sources & corrections</p><h1>Where RoofHub evidence comes from.</h1></div><div className="page-intro__aside"><p>RoofHub records roofing information from manufacturers, suppliers, government/technical sources and published market examples. The source stays attached to the observation so it can be checked again later.</p></div></div></section>
  <section className="section section--white"><div className="container article-two-col"><div className="article-stack"><p className="eyebrow">Source policy</p><h2>Use the strongest source for the type of claim.</h2><p>Manufacturer and government sources lead product specifications, compliance and safety claims. Public contractor and scaffolder information is useful for real-world market pricing. Editorial sources can add context, but repetition is not treated as independent proof.</p><div className="evidence-callout"><strong>Copyright:</strong> RoofHub records facts, observations and links. It does not treat another company's job photography or article text as reusable simply because the original page is cited.</div></div><div className="article-stack"><p className="eyebrow">Current dataset</p><h2>{OBSERVATIONS.length} recorded price observations</h2><p>Across {sources.length} unique public source URLs in the current research dataset. Individual published pricing tables use only verified observations relevant to their scope; provisional and stale records remain research-only.</p><Link className="button button--secondary" href="/methodology">Read pricing methodology</Link></div></div></section>
  <section className="section section--sage"><div className="container article-stack"><div><p className="eyebrow">Recorded public sources</p><h2>Source catalogue</h2><p>This list is a transparency aid, not an endorsement of every statement on each external website.</p></div><ol className="source-list">{sources.map((s,i)=><li key={s.url}><span className={`tier tier--${s.tier}`}>{s.tier}</span><span><a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a><span className="source-type"> · {s.type}</span></span></li>)}</ol></div></section>
  <section className="section section--white"><div className="container cta-band"><div><p className="eyebrow">Found something better?</p><h2>Corrections and stronger sources are welcome.</h2><p>Send the page URL and the source you think should replace or qualify an observation.</p></div><Link className="button button--primary" href="/contact">Submit a correction</Link></div></section>
  </>;
}
