import Link from "next/link";
import { ArrowRight, Calculator, Layers, Shield } from "@/components/Icons";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Roofing pricing NZ", description: "RoofHub NZ pricing guides for roofing costs, reroofing, scaffold/access and specific metal roofing systems.", path: "/pricing" });

const cards = [
  ["New roof cost NZ", "Budget a roof for a new build or extension without silently adding old-roof removal and disposal.", "/pricing/new-roof-cost"],
  ["200m² roof cost", "Worked examples that distinguish actual roof area, footprint, quoted rate and GST.", "/pricing/200m2-roof-cost"],
  ["Roofing costs NZ", "Compare published NZ market observations and understand material-only, supply/install and complete-project price bases.", "/pricing/roofing-costs"],
  ["Roof replacement cost NZ", "Add removal, disposal, scaffold/access and existing-roof risk to the replacement calculation.", "/pricing/reroof-cost"],
  ["Scaffolding costs", "Single-storey, two-storey, edge protection, weekly hire and difficult-site considerations.", "/pricing/scaffolding-cost"],
  ["Corrugated roofing", "Public material and complete-project observations for the classic long-run profile.", "/roofing/corrugated"],
  ["Pressed metal tile", "Panel systems, historical price context and batten/underlay scope.", "/roofing/pressed-metal-tile"],
  ["Five-rib roofing", "Trapezoidal profile pricing with the installation difference kept visible.", "/roofing/five-rib"],
  ["Tray & standing seam", "Premium concealed-fix and architectural roof systems with separate pricing evidence.", "/roofing/tray-standing-seam"]
] as const;

export default function PricingPage(){return <>
<section className="page-intro page-intro--terracotta"><div className="container page-intro__grid"><div><p className="eyebrow">Roofing pricing</p><h1>NZ roofing costs, with the scope attached.</h1></div><div className="page-intro__aside"><p>A price without its basis is easy to misuse. RoofHub separates supply-only, installed and complete-project observations, records GST where the source states it, and shows what can still move the final quote.</p></div></div></section>
<section className="section section--white"><div className="container"><div className="tool-grid">{cards.map(([title,copy,href],i)=><article className="tool-card tool-card--active" key={title}><div className="tool-card__head"><span className="icon-tile">{i<3?<Calculator/>:<Layers/>}</span><span className="status-pill status-pill--live">Guide live</span></div><h2>{title}</h2><p>{copy}</p><Link className="text-link" href={href}>Read the guide <ArrowRight/></Link></article>)}</div></div></section>
<section className="section section--sage"><div className="container feature-split"><div className="feature-copy"><p className="eyebrow">Price integrity</p><h2>RoofHub does not force unlike numbers into one average.</h2><p>Material-only sheet prices, installed covering rates and complete reroof projects answer different questions. The data model keeps those bases distinct so each page can explain what a range actually represents.</p></div><div className="three-col"><article className="info-card"><span><Shield/></span><h3>Source-backed</h3><p>Each observation retains its publisher, URL, date, units and review status.</p></article><article className="info-card"><span>GST</span><h3>Explicit when known</h3><p>If a public source does not state GST, RoofHub says so instead of guessing.</p></article><article className="info-card"><span>Scope</span><h3>Estimate ≠ quote</h3><p>Site access, repairs and product specification still need confirmation.</p></article></div></div></section>
<section className="section section--dark"><div className="container cta-band cta-band--dark"><div><p className="eyebrow">Apply the evidence</p><h2>Estimate a roof or check a quote you already have.</h2><p>Start rough if the design is early, use measured quantities when you have them, or compare a written quote on the same GST and scope basis.</p></div><div className="button-row"><Link className="button button--primary button--large" href="/tools/roof-estimate">Estimate a roof <ArrowRight/></Link><Link className="button button--ghost button--large" href="/tools/quote-checker">Check a quote</Link></div></div></section>
</>}
