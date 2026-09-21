import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, Camera, Layers, Measure } from "@/components/Icons";

export const metadata: Metadata = { title: "Roofing tools" };

const tools = [
  { icon: Calculator, title: "Roof pricing", copy: "Prototype experience live now. Existing pricing logic will replace demo arithmetic.", status: "Prototype live", href: "/pricing", active: true },
  { icon: Measure, title: "Roof measurement", copy: "Integration point for plan, satellite and dimension-based measurement workflows.", status: "Integration planned", href: "#", active: false },
  { icon: Camera, title: "Photo / plan analysis", copy: "Preliminary material and condition observations with confidence and limitations.", status: "Integration planned", href: "#", active: false },
  { icon: Layers, title: "Roof pitch & quantities", copy: "Small deterministic calculators that share the same approved roofing core.", status: "Integration planned", href: "#", active: false }
];

export default function ToolsPage() {
  return <>
    <section className="page-hero"><div className="container narrow"><p className="eyebrow">RoofHub tools</p><h1>Useful calculations before the contact form.</h1><p>RoofHub's strongest differentiator is the tooling that already exists. This v0.1 page is the shell those mature calculators and analysis workflows will plug into after their audit.</p></div></section>
    <section className="section section--tight"><div className="container"><div className="tool-grid">{tools.map(({icon: Icon,title,copy,status,href,active}) => <article className={`tool-card ${active ? "tool-card--active" : ""}`} key={title}><div className="tool-card__head"><span className="icon-tile"><Icon/></span><span className={`status-pill ${active ? "status-pill--live" : ""}`}>{status}</span></div><h2>{title}</h2><p>{copy}</p>{active ? <Link className="text-link" href={href}>Open prototype <ArrowRight/></Link> : <span className="muted-link">Awaiting existing tool audit</span>}</article>)}</div></div></section>
    <section className="section section--sage-soft"><div className="container feature-split"><div><p className="eyebrow">Integration rule</p><h2>Do not rebuild mature roofing logic just to fit this website.</h2><p>The site is the presentation and orchestration layer. Approved pricing, measurement and analysis functions should remain reusable sources of truth that can also serve the smart assistant and future agent interfaces.</p></div><div className="architecture-diagram"><span>Website</span><span>Smart assistant</span><span className="architecture-core">Approved roofing core</span><span>Future agent access</span><span>Reports / enquiries</span></div></div></section>
  </>;
}
