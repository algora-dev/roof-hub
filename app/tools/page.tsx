import Link from "next/link";
import { ArrowRight, Calculator, Check, Layers, Measure, Spark } from "@/components/Icons";
import { AskRoofHubButton } from "@/components/assistant/AskRoofHubButton";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Roofing calculators & tools",
  description: "RoofHub tools for quick roof estimates, detailed measurement-to-price estimating, roof pitch, roof area and NZ roofing pricing.",
  path: "/tools"
});

const quickTools = [
  { icon: Calculator, title: "Estimate a roof", copy: "Start with roof shape, approximate size and pitch. Measurements are optional, and the same project can move into the detailed estimator.", status: "Quick", href: "/tools/roof-estimate", link: "Start estimate" },
  { icon: Check, title: "Check a roofing quote", copy: "Already have a quote? Compare GST, product and major inclusions against the same RoofHub project before comparing headline price.", status: "Decision support", href: "/tools/quote-checker", link: "Check a quote" },
  { icon: Spark, title: "Ask RoofHub", copy: "Ask a roofing question, get help with a tool step, understand a product or let RoofHub point you to the right calculation.", status: "Assistant", assistant: true, link: "Ask a question" }
];

const advancedTools = [
  { icon: Calculator, title: "Detailed roof estimator", copy: "Enter actual quantities or measure from a plan/image, choose a roofing system and build a transparent low/high estimate.", status: "Measured", href: "/tools/detailed-roof-estimator" },
  { icon: Measure, title: "Roof area & measurement", copy: "Understand plan area, actual roof area and the component measurements that feed a roofing estimate.", status: "Guide + tool", href: "/guides/roof-area" },
  { icon: Layers, title: "Roof pitch & quantities", copy: "Convert plan area using pitch and see how product minimum pitches and roof geometry affect the answer.", status: "Guide + tool", href: "/guides/roof-pitch" },
  { icon: Calculator, title: "NZ roofing cost evidence", copy: "Compare published market observations and their scope before applying pricing to a measured project.", status: "Evidence", href: "/pricing/roofing-costs" }
];

export default function ToolsPage() {
  return <>
    <section className="page-intro"><div className="container page-intro__grid"><div><p className="eyebrow">RoofHub tools</p><h1>Start rough. Add detail when it earns its keep.</h1></div><div className="page-intro__aside"><p>Use a quick estimate when information is limited, move into measured quantities when you have them, or ask RoofHub which path fits what you are trying to do.</p></div></div></section>

    <section className="section section--compact section--white"><div className="container">
      <div className="tool-section-heading"><div><p className="eyebrow">Quick tools</p><h2>Useful without a full takeoff.</h2></div><p>Good for early budgets, first-pass pricing and projects where the measurements are not ready yet.</p></div>
      <div className="tool-grid tool-grid--quick">{quickTools.map(({icon:Icon,title,copy,status,href,assistant,link}) => <article className="tool-card tool-card--active" key={title}><div className="tool-card__head"><span className="icon-tile"><Icon/></span><span className="status-pill status-pill--live">{status}</span></div><h2>{title}</h2><p>{copy}</p>{assistant ? <AskRoofHubButton label={link} prompt="Help me work out which RoofHub tool or roofing information I need." className="text-link tool-text-button" /> : <Link className="text-link" href={href!}>{link} <ArrowRight/></Link>}</article>)}</div>
    </div></section>

    <section className="section section--sage"><div className="container">
      <div className="tool-section-heading"><div><p className="eyebrow">Advanced tools</p><h2>For measurements, plans and deeper estimating.</h2></div><p>Builders, roofers, estimators and technically confident users can move straight into quantities without completing the simple flow first.</p></div>
      <div className="tool-grid">{advancedTools.map(({icon:Icon,title,copy,status,href}) => <article className="tool-card tool-card--active" key={title}><div className="tool-card__head"><span className="icon-tile"><Icon/></span><span className="status-pill status-pill--live">{status}</span></div><h2>{title}</h2><p>{copy}</p><Link className="text-link" href={href}>Open <ArrowRight/></Link></article>)}</div>
    </div></section>

    <section className="section section--white"><div className="container feature-split"><div className="feature-copy"><p className="eyebrow">One roof project</p><h2>Approximate and measured information should work together.</h2><p>Roof area, ridges, hips, valleys, barges and project selections can carry between RoofHub tools. Approximate quantities stay labelled as estimated until you replace them with real measurements.</p></div><div className="architecture-diagram"><span>Question / rough inputs</span><span>Plan / measurements</span><span className="architecture-core">Roof project</span><span>Roof system</span><span>Estimate range</span></div></div></section>
  </>;
}
