import Link from "next/link";
import { ArrowRight, Check } from "@/components/Icons";
import { SectionHeading } from "@/components/SectionHeading";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Pricing methodology",
  description: "How RoofHub collects roofing price observations, derives published ranges, and keeps estimates clearly separate from quotes.",
  path: "/methodology"
});

const evidenceTiers = [
  { rank: "Tier 1", title: "Primary evidence", copy: "New Zealand manufacturers, suppliers, government and technical bodies. Used for technical and regulatory claims wherever possible." },
  { rank: "Tier 2", title: "Market evidence", copy: "Published contractor and scaffolder pricing, case studies, public project examples and merchant listings. Valuable for how the market actually prices." },
  { rank: "Tier 3", title: "Editorial evidence", copy: "Explanatory articles and experience-based commentary. Useful context, but never treated as a price source on its own." }
];

const provenance = [
  "Publisher and canonical source URL",
  "Publication or update date, where known",
  "RoofHub observation date",
  "Unit, price basis and GST treatment",
  "Region, inclusions and exclusions",
  "Confidence and review status"
];

const pipeline = [
  { n: "01", t: "Collect observations", c: "Raw observations are stored once, centrally, with full provenance — never retyped into individual pages or calculators." },
  { n: "02", t: "Normalise", c: "Each observation is standardised to a unit, a price basis (material only / supply and install / complete project) and a GST treatment." },
  { n: "03", t: "Derive ranges", c: "RoofHub publishes low/high ranges derived from the observation set, with assumptions stated and outliers reviewed rather than silently dropped." },
  { n: "04", t: "Review and date", c: "Every published range carries a last-reviewed date and a methodology version, so volatility stays visible." }
];

export default function MethodologyPage() {
  return <>
    <section className="page-intro page-intro--sage">
      <div className="container page-intro__grid">
        <div><p className="eyebrow">Methodology</p><h1>How RoofHub pricing information is built.</h1></div>
        <div className="page-intro__aside"><p>RoofHub publishes estimates and research — never quotes. This page explains where evidence comes from, how ranges are derived, and what the current limitations are.</p></div>
      </div>
    </section>

    <section className="section section--white"><div className="container"><div className="three-col">
      <article className="info-card"><span>01</span><h3>Estimates, not quotes</h3><p>Everything published here is planning information. A real price comes from a licensed roofer who has inspected the site.</p></article>
      <article className="info-card"><span>02</span><h3>Bases stay separate</h3><p>Material-only, supply-and-install and complete re-roof figures are never blended into one ambiguous number.</p></article>
      <article className="info-card"><span>03</span><h3>GST always stated</h3><p>Every published figure states whether it includes GST. Where the treatment is unresolved, the figure is not published.</p></article>
    </div></div></section>

    <section className="section"><div className="container">
      <SectionHeading eyebrow="Evidence policy" title="Three tiers of evidence, weighted by trust." copy={<p>Ten sites repeating the same claim are not ten independent sources. Provenance is stored per observation so claims can be traced.</p>} />
      <div className="principle-grid">
        {evidenceTiers.map((tier) => <article key={tier.rank}><span>{tier.rank}</span><h3>{tier.title}</h3><p>{tier.copy}</p></article>)}
      </div>
    </div></section>

    <section className="section section--sage"><div className="container feature-split">
      <div className="feature-copy">
        <p className="eyebrow">Provenance</p>
        <h2>What gets recorded for every observation.</h2>
        <p>When a number enters the RoofHub data set, the record keeps enough context to re-check it later — and to retire it when it goes stale.</p>
      </div>
      <ul className="check-list check-list--large">
        {provenance.map((item) => <li key={item}><Check /> {item}</li>)}
      </ul>
    </div></section>

    <section className="section section--white"><div className="container">
      <SectionHeading eyebrow="From observation to published range" title="One pipeline, versioned and reviewable." />
      <ol className="process-stack process-stack--numbered">
        {pipeline.map((step) => <li key={step.n}><span>{step.n}</span><div><strong>{step.t}</strong><p>{step.c}</p></div></li>)}
      </ol>
    </div></section>

    <section className="section"><div className="container narrow">
      <SectionHeading eyebrow="Current status" title="What is live today — and what is not." />
      <div className="draft-notice"><strong>Prototype phase:</strong> the estimator on this site currently runs on illustrative demo arithmetic while the RoofHub rate card is being reviewed. No verified New Zealand market pricing is published yet, and GST treatment is not yet configured. Pricing pages will carry last-reviewed dates from the moment reviewed ranges go live.</div>
      <p>Corrections and source suggestions are welcome — see <Link className="text-link" href="/contact">contact &amp; corrections</Link>.</p>
    </div></section>

    <section className="section section--dark"><div className="container cta-band cta-band--dark">
      <div><p className="eyebrow">Transparency</p><h2>Spotted a problem on this site?</h2><p>The fastest way to improve RoofHub data is to tell us exactly what looks wrong.</p></div>
      <Link className="button button--primary button--large" href="/contact">Report a correction <ArrowRight /></Link>
    </div></section>
  </>;
}
