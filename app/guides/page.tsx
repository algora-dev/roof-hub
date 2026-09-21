import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/Icons";

export const metadata: Metadata = { title: "Roofing guides & research" };

const planned = [
  {src:"/media/guide-roof-2.webp", eyebrow:"Materials · planned", title:"How RoofHub will compare roofing systems", copy:"Use-case driven comparisons rather than one preselected winner."},
  {src:"/media/guide-roof-3.webp", eyebrow:"Pricing · planned", title:"What a reroof price should account for", copy:"Scope, access, removal, flashings, underlay, scaffold and uncertainty."},
  {src:"/media/guide-roof-4.webp", eyebrow:"Conditions · planned", title:"Roofing choices for coastal and exposed NZ sites", copy:"How exposure, maintenance and project context can change the decision."}
];

export default function GuidesPage() {
  return <>
    <section className="page-hero page-hero--terracotta-soft"><div className="container narrow"><p className="eyebrow">Guides & research</p><h1>Roofing information designed to help make a decision.</h1><p>Not a huge blog for its own sake. RoofHub guides should answer real questions, connect to useful tools, show evidence where it matters, and give the reader a practical next step.</p></div></section>
    <section className="section"><div className="container"><div className="guide-grid guide-grid--media"><Link className="guide-card guide-card--featured" href="/guides/how-to-prepare-for-a-roofing-quote"><div className="guide-card__media"><Image src="/media/guide-roof-1.webp" alt="Residential roof detail" fill sizes="(max-width: 980px) 100vw, 34vw"/></div><p className="eyebrow">Planning · 5 min</p><h2>How to prepare for a roofing quote</h2><p>What to gather, what to ask and how to make multiple roofing quotes easier to compare.</p><span className="card-link">Read the guide <ArrowRight/></span></Link>{planned.slice(0,2).map((item)=><article className="guide-card" key={item.title}><div className="guide-card__media"><Image src={item.src} alt="Roofing detail" fill sizes="(max-width: 980px) 100vw, 30vw"/></div><p className="eyebrow">{item.eyebrow}</p><h2>{item.title}</h2><p>{item.copy}</p></article>)}</div><div className="guide-strip"><article><Image src={planned[2].src} alt="Metal roofing close-up" fill sizes="38vw"/><div><p className="eyebrow">{planned[2].eyebrow}</p><h3>{planned[2].title}</h3><p>{planned[2].copy}</p></div></article><div className="guide-principle"><span>Editorial rule</span><strong>Answer the roofing question first. Conversion comes second.</strong></div></div></div></section>
  </>;
}
