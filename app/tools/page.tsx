import Link from "next/link";
import { ArrowRight, Calculator, Layers, Measure } from "@/components/Icons";
import { pageMetadata } from "@/lib/seo";

export const metadata=pageMetadata({title:"Roofing calculators & tools",description:"RoofHub tools for detailed roof estimating, plan measurement, roof pitch, roof area and project pricing in New Zealand.",path:"/tools"});
const tools=[
  {icon:Calculator,title:"Detailed roof estimator",copy:"Enter known quantities or measure from a plan/image, choose a roofing system and build a preliminary low/high estimate.",status:"Available",href:"/tools/detailed-roof-estimator"},
  {icon:Measure,title:"Roof area & measurement",copy:"Understand plan area, actual area and the component measurements that feed a roofing estimate.",status:"Guide + estimator",href:"/guides/roof-area"},
  {icon:Layers,title:"Roof pitch & quantities",copy:"Convert plan area using pitch and see how roofing system minimum pitches differ.",status:"Guide live",href:"/guides/roof-pitch"},
  {icon:Calculator,title:"NZ roofing cost guide",copy:"Compare public market observations before applying them to your own measured project.",status:"Data guide",href:"/pricing/roofing-costs"}
];
export default function ToolsPage(){return <>
<section className="page-intro"><div className="container page-intro__grid"><div><p className="eyebrow">RoofHub tools</p><h1>Calculations that keep the assumptions visible.</h1></div><div className="page-intro__aside"><p>Use RoofHub to move from a broad roofing question toward real quantities. The detailed estimator can work from your own measurements or a calibrated plan/image and keeps its result separate from a formal contractor quote.</p></div></div></section>
<section className="section section--compact section--white"><div className="container"><div className="tool-grid">{tools.map(({icon:Icon,title,copy,status,href})=><article className="tool-card tool-card--active" key={title}><div className="tool-card__head"><span className="icon-tile"><Icon/></span><span className="status-pill status-pill--live">{status}</span></div><h2>{title}</h2><p>{copy}</p><Link className="text-link" href={href}>Open <ArrowRight/></Link></article>)}</div></div></section>
<section className="section section--sage"><div className="container feature-split"><div className="feature-copy"><p className="eyebrow">One quantity model</p><h2>The same measurements should not need to be entered twice.</h2><p>Roof area, ridges, hips, valleys, barges, spouting and custom items can be carried from digital takeoff into pricing. Roof type then determines which compatible pricing components are applied.</p></div><div className="architecture-diagram"><span>Plan / image</span><span>Manual measurements</span><span className="architecture-core">Roof quantities</span><span>Roof system</span><span>Estimate range</span></div></div></section>
<section className="section section--white"><div className="container cta-band"><div><p className="eyebrow">Detailed estimator</p><h2>Already know the measurements?</h2><p>Skip the broad questions. Enter actual quantities directly and use RoofHub as a measurement-to-price workflow.</p></div><Link className="button button--primary button--large" href="/tools/detailed-roof-estimator">Open detailed estimator <ArrowRight/></Link></div></section>
</>}
