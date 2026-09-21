import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "@/components/Icons";

export const metadata: Metadata = { title: "About RoofHub" };

export default function AboutPage() {
  return <>
    <section className="page-hero page-hero--sage"><div className="container page-hero-grid"><div><p className="eyebrow">About RoofHub</p><h1>A roofing research and planning layer — not another roofing contractor website.</h1><p>The aim is to help New Zealand homeowners, property people and industry users understand a roofing project before they decide who to contact.</p></div><div className="page-hero-media page-hero-media--landscape"><Image src="/media/about-landscape.webp" alt="New Zealand alpine landscape" fill priority sizes="(max-width: 980px) 100vw, 34vw"/><span>Practical · trustworthy · New Zealand</span></div></div></section>
    <section className="section"><div className="container feature-split"><div><p className="eyebrow">The operating model</p><h2>Useful information first.</h2><p>RoofHub should remain useful even when someone never submits an enquiry. Pricing, measurements, guides and preliminary analysis should deliver their value before asking for personal details.</p></div><ol className="process-list"><li><span>1</span><div><strong>Arrive with a question</strong><p>Cost, size, material, condition, scope or next step.</p></div></li><li><span>2</span><div><strong>Use information or tools</strong><p>Get a clearer answer with assumptions visible.</p></div></li><li><span>3</span><div><strong>Choose whether to ask for help</strong><p>RoofHub can eventually suggest the type of specialist worth contacting.</p></div></li></ol></div></section>
    <section className="section section--sage-soft"><div className="container"><div className="about-grid"><div><h3>RoofHub should be</h3><ul className="check-list"><li><Check/> Practical</li><li><Check/> Transparent</li><li><Check/> Evidence-aware</li><li><Check/> Nationally useful</li><li><Check/> Helpful before conversion</li></ul></div><div><h3>RoofHub should not pretend to be</h3><ul className="plain-list"><li>An independent regulator or industry body</li><li>A certified inspection when analysis is preliminary</li><li>A formal quote when a result is only an estimate</li><li>A roofing contractor carrying out every project</li></ul></div></div></div></section>
  </>;
}
