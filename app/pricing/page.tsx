import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "@/components/Icons";
import { PricingPrototype } from "@/components/PricingPrototype";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = { title: "Roofing pricing prototype" };

export default function PricingPage() {
  return <>
    <section className="page-hero page-hero--sage"><div className="container narrow"><p className="eyebrow">Roofing pricing · prototype page</p><h1>Understand the project before chasing a quote.</h1><p>This page tests how RoofHub can present indicative roofing pricing: range first, assumptions visible, uncertainty preserved, and a clear boundary between an estimate and a formal quote.</p><div className="draft-notice"><strong>Development content:</strong> the numbers in the calculator below are intentionally illustrative and are not verified NZ market pricing.</div></div></section>
    <section className="section section--pull-up"><div className="container"><PricingPrototype /></div></section>
    <section className="section"><div className="container"><SectionHeading eyebrow="Pricing philosophy" title="A useful estimate should explain itself" /><div className="three-col"><article className="info-card"><span>01</span><h3>Ranges, not fake precision</h3><p>Roof size, pitch, access, removal, scaffold, flashings and material choices can materially change a reroof project.</p></article><article className="info-card"><span>02</span><h3>Unknown is not zero</h3><p>If an important component is unknown, RoofHub should say so instead of silently treating it as free.</p></article><article className="info-card"><span>03</span><h3>Quote remains separate</h3><p>A preliminary RoofHub estimate helps planning. It is not a contractor's inspected, site-specific quote.</p></article></div></div></section>
    <section className="section section--sage-soft"><div className="container feature-split"><div><p className="eyebrow">What the real engine will need</p><h2>One source of truth for pricing.</h2><p>When the existing RoofHub pricing tools are supplied, this prototype UI should consume their approved calculations rather than duplicating formulas in page code.</p></div><ul className="check-list"><li><Check/> Explicit GST treatment</li><li><Check/> Material vs installed price separation</li><li><Check/> Regional and complexity factors where evidence supports them</li><li><Check/> Included / excluded scope</li><li><Check/> Assumption and source metadata</li></ul></div></section>
    <section className="section"><div className="container inline-cta"><div><p className="eyebrow">Next step</p><h2>Explore the tool structure.</h2><p>The tools hub shows where measurement, pricing and image-analysis capabilities will slot into the site.</p></div><Link className="button button--primary" href="/tools">View tools <ArrowRight /></Link></div></section>
  </>;
}
