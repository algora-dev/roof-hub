import Link from "next/link";
import { ArrowRight, Check } from "@/components/Icons";
import { PricingPrototype } from "@/components/PricingPrototype";
import { SectionHeading } from "@/components/SectionHeading";
import { pageMetadata } from "@/lib/seo";

// Intentionally noindex: demo arithmetic until the rate card is approved.
export const metadata = pageMetadata({
  title: "Roofing pricing prototype",
  description: "Prototype pricing exploration: indicative range first, assumptions visible, and a clear boundary between an estimate and a formal quote.",
  path: "/pricing",
  noIndex: true
});

const costDrivers = [
  ["Roof area", "The amount of roof surface being covered, not just the floor area below it."],
  ["Pitch & geometry", "Hips, valleys, dormers, penetrations and steepness can change labour and quantities."],
  ["Access", "Height, site constraints and safe working access can materially change project setup."],
  ["Removal", "Existing roofing, disposal and substrate condition can change the scope."],
  ["Flashings & details", "Junctions, penetrations, gutters and custom details may sit outside simple square-metre pricing."],
  ["Material system", "Different roofing systems have different material, labour and detailing requirements."]
];

export default function PricingPage() {
  return <>
    <section className="page-intro page-intro--sage">
      <div className="container page-intro__grid">
        <div><p className="eyebrow">Roofing pricing · prototype</p><h1>Understand the project before chasing a quote.</h1></div>
        <div className="page-intro__aside"><p>This page tests how RoofHub can present indicative NZ roofing pricing: range first, assumptions visible, uncertainty preserved, and a clear boundary between an estimate and a formal quote.</p><div className="draft-notice"><strong>Development content:</strong> the calculator below uses illustrative demo arithmetic. It is not verified NZ market pricing and GST treatment is not yet configured.</div></div>
      </div>
    </section>

    <section className="section section--compact section--white"><div className="container"><PricingPrototype /></div></section>

    <section className="section">
      <div className="container">
        <SectionHeading eyebrow="What moves the number" title="A roofing price is more than area × rate" copy={<p>These are the kinds of project variables the real RoofHub pricing engine should expose rather than hide.</p>} />
        <div className="driver-grid">{costDrivers.map(([title, copy], i) => <article key={title}><span>0{i+1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </div>
    </section>

    <section className="section section--sage">
      <div className="container inclusion-grid">
        <div><p className="eyebrow">Estimate structure</p><h2>Show what is included, excluded and still unknown.</h2><p>A preliminary estimate becomes much more useful when the visitor can see what assumptions sit behind it.</p></div>
        <div className="scope-panels">
          <article><h3>Potentially included</h3><ul className="check-list"><li><Check/> Roofing material allowance</li><li><Check/> Installation labour</li><li><Check/> Standard underlay assumptions</li><li><Check/> Known roof area and complexity inputs</li></ul></article>
          <article><h3>May still be unknown</h3><ul className="plain-list plain-list--compact"><li>Scaffold / edge protection</li><li>Removal and disposal</li><li>Substrate repairs</li><li>Custom flashings and penetrations</li><li>Site-specific access constraints</li></ul></article>
        </div>
      </div>
    </section>

    <section className="section section--white">
      <div className="container">
        <SectionHeading eyebrow="Pricing philosophy" title="A useful estimate should explain itself" />
        <div className="three-col"><article className="info-card"><span>01</span><h3>Ranges, not fake precision</h3><p>Project conditions vary. A range is more honest than a single number pretending uncertainty does not exist.</p></article><article className="info-card"><span>02</span><h3>Unknown is not zero</h3><p>If an important component is unknown, RoofHub should say so instead of silently treating it as free.</p></article><article className="info-card"><span>03</span><h3>Quote remains separate</h3><p>A RoofHub estimate supports planning. It is not a contractor&apos;s inspected, site-specific quote.</p></article></div>
      </div>
    </section>

    <section className="section">
      <div className="container faq-layout">
        <div><p className="eyebrow">Prototype FAQ</p><h2>Questions the final pricing page should answer clearly.</h2></div>
        <div className="faq-list">
          <details><summary>Does the prototype include GST?</summary><p>No. GST treatment is deliberately marked as not configured until the approved pricing data and business rules are supplied.</p></details>
          <details><summary>Is this a real New Zealand roofing price?</summary><p>No. The current arithmetic exists only to test interaction and presentation. It must be replaced by the audited RoofHub pricing core.</p></details>
          <details><summary>Why show a range instead of one number?</summary><p>Because roof geometry, access, removal, details and other unresolved project conditions can materially change the final scope.</p></details>
          <details><summary>What should happen after an estimate?</summary><p>The user should be able to refine inputs, understand assumptions and, if useful, decide what type of specialist or formal quote is needed next.</p></details>
        </div>
      </div>
    </section>

    <section className="section section--terracotta-soft"><div className="container cta-band"><div><p className="eyebrow">Next step</p><h2>Connect pricing to measurement.</h2><p>The real experience should be able to reuse roof area, pitch and project context rather than asking the user to enter the same information twice.</p></div><Link className="button button--primary button--large" href="/tools">View the tools plan <ArrowRight /></Link></div></section>
  </>;
}
