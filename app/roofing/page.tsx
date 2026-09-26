import Link from "next/link";
import { ArrowRight } from "@/components/Icons";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/evidence/Breadcrumbs";
import { RelatedTool } from "@/components/evidence/RelatedTool";

export const metadata = pageMetadata({ title: "Roofing systems NZ", description: "NZ roofing system guides for long-run steel, corrugated, five-rib, pressed metal tile and tray/standing seam roofing.", path: "/roofing" });
const systems=[
  ["Long-run roofing","Corrugate and trapezoidal profiles, pitch, pricing evidence and the difference between material and installed cost.","/roofing/long-run"],
  ["Corrugated roofing","The classic rounded long-run profile: cover width, minimum pitch, material pricing and reroof examples.","/roofing/corrugated"],
  ["Five-rib / trapezoidal","Five-rib manufacturer examples, low-pitch use and why installed labour can be slightly above corrugate.","/roofing/five-rib"],
  ["Pressed metal tile","Steel tile systems, battens, underlay, pricing evidence and Decramastic/asbestos considerations.","/roofing/pressed-metal-tile"],
  ["Tray & standing seam","Architectural concealed-fix systems, common widths, low-pitch use and premium pricing.","/roofing/tray-standing-seam"]
] as const;
export default function RoofingHubPage(){return <>
<Breadcrumbs items={[{label:"Home",href:"/"},{label:"Roofing"}]}/><section className="page-intro"><div className="container page-intro__grid"><div><p className="eyebrow">Roofing systems</p><h1>NZ roofing systems, profile by profile.</h1></div><div className="page-intro__aside"><p>Each RoofHub system guide combines manufacturer specifications with public NZ market evidence, then links the information to measurement and pricing tools.</p></div></div></section>
<section className="section section--compact section--white"><div className="container"><div className="tool-grid">{systems.map(([title,copy,href])=><article className="tool-card tool-card--active" key={title}><div className="tool-card__head"><span className="status-pill status-pill--live">Guide live</span></div><h2>{title}</h2><p>{copy}</p><Link className="text-link" href={href}>Read the guide <ArrowRight/></Link></article>)}</div></div></section>
<section className="section section--sage section--compact"><div className="container cta-band"><div><p className="eyebrow">Same method everywhere</p><h2>Specifications from manufacturers. Pricing from recorded observations.</h2><p>Technical requirements are tied to the exact product source where possible; pricing evidence keeps the source's basis and GST treatment visible.</p></div><RelatedTool title="Detailed roof estimator" href="/tools/detailed-roof-estimator" copy="Measure from a plan or enter your own quantities and switch between roof systems."/></div></section>
</>}
