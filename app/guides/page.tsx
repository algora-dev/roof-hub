import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Book, Calculator, Layers } from "@/components/Icons";

export const metadata: Metadata = { title: "Roofing guides & research" };

export default function GuidesPage() {
  return <>
    <section className="page-hero page-hero--terracotta-soft"><div className="container narrow"><p className="eyebrow">Guides & research</p><h1>Roofing information designed to help make a decision.</h1><p>Not a huge blog for its own sake. RoofHub guides should answer real questions, connect to useful tools, show evidence where it matters, and give the reader a practical next step.</p></div></section>
    <section className="section"><div className="container"><div className="guide-grid"><Link className="guide-card guide-card--featured" href="/guides/how-to-prepare-for-a-roofing-quote"><div className="guide-icon"><Book/></div><p className="eyebrow">Planning · 5 min</p><h2>How to prepare for a roofing quote</h2><p>What to gather, what to ask and how to make multiple roofing quotes easier to compare.</p><span className="card-link">Read the guide <ArrowRight/></span></Link><article className="guide-card"><div className="guide-icon"><Calculator/></div><p className="eyebrow">Pricing · planned</p><h2>What a reroof price should account for</h2><p>A structured look at scope, access, removal, flashings, underlay, scaffold and uncertainty.</p></article><article className="guide-card"><div className="guide-icon"><Layers/></div><p className="eyebrow">Materials · planned</p><h2>How RoofHub will compare roofing systems</h2><p>Use-case driven comparisons rather than one preselected winner.</p></article></div></div></section>
  </>;
}
