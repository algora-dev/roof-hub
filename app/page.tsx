import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Book, Calculator, Camera, Check, Layers, Measure, Shield, Spark } from "@/components/Icons";
import { SectionHeading } from "@/components/SectionHeading";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: { absolute: "RoofHub NZ — Roofing knowledge, pricing & tools" },
  description: "Practical New Zealand roofing research, pricing, measurement and project-planning tools — useful before you ever contact a roofer.",
  path: "/"
});

const fastPaths = [
  { icon: Calculator, title: "Price a roof", copy: "Understand the structure of a roofing estimate before you ask for a formal quote.", href: "/pricing", tone: "terracotta" },
  { icon: Measure, title: "Measure a roof", copy: "A home for plan, satellite and dimension-based measurement workflows.", href: "/tools", tone: "sage" },
  { icon: Camera, title: "Identify & assess", copy: "Photo and plan analysis with confidence, limitations and unknowns made visible.", href: "/tools", tone: "sage" },
  { icon: Layers, title: "Plan the project", copy: "Compare scope, materials and practical next steps before contacting a specialist.", href: "/guides", tone: "neutral" }
];

const decisions = [
  ["Repair or replace?", "Understand the factors that change the answer before booking an inspection."],
  ["What should a quote include?", "Know the scope items, assumptions and exclusions worth checking."],
  ["Which material suits?", "Compare roofing systems by use case rather than forcing one universal winner."],
  ["How big is the roof?", "Turn dimensions, plans or imagery into a preliminary working area."]
];

export default function HomePage() {
  return (
    <>
      <section className="photo-hero photo-hero--home">
        <Image className="photo-hero__image" src="/media/hero-home.webp" alt="Modern New Zealand home with a long-run metal roof overlooking a mountain lake" fill priority sizes="100vw" />
        <div className="photo-hero__shade" aria-hidden="true" />
        <div className="container photo-hero__content">
          <div className="photo-hero__copy">
            <p className="eyebrow eyebrow--light">New Zealand roofing made clearer</p>
            <h1>Know more.<br/>Build brighter.</h1>
            <p className="photo-hero__lede">Practical roofing research, pricing, measurement and project-planning tools for New Zealand homes and properties — useful before you ever contact a roofer.</p>
            <div className="button-row">
              <Link className="button button--primary button--large" href="/pricing">Explore pricing <ArrowRight /></Link>
              <Link className="button button--glass button--large" href="/tools">View tools</Link>
            </div>
          </div>
          <div className="hero-proof hero-proof--light">
            <span><Check /> Useful answers first</span>
            <span><Check /> Transparent assumptions</span>
            <span><Check /> Built around NZ conditions</span>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="container trust-grid">
          <div><Shield/><strong>Evidence over guesswork</strong><span>Important claims should have clear methodology and sources.</span></div>
          <div><Spark/><strong>AI where it is useful</strong><span>Analysis should orchestrate trusted tools, not invent technical rules.</span></div>
          <div><Book/><strong>Useful without an enquiry</strong><span>RoofHub should help even if the visitor never submits contact details.</span></div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Start with the question you have" title="Four useful ways into RoofHub" copy={<p>No generic lead form first. Start with the decision, calculation or explanation you actually need.</p>} />
          <div className="fast-path-grid">
            {fastPaths.map(({icon: Icon, title, copy, href, tone}) => (
              <Link className={`fast-path-card tone-${tone}`} href={href} key={title}>
                <span className="icon-tile"><Icon /></span>
                <h3>{title}</h3>
                <p>{copy}</p>
                <span className="card-link">Explore <ArrowRight /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--sage">
        <div className="container feature-split">
          <div className="feature-copy">
            <p className="eyebrow">How RoofHub should work</p>
            <h2>Useful information first. Practical help second.</h2>
            <p>RoofHub is the research, assessment and routing layer. The site should give people something useful before it asks for personal details or points them toward a provider.</p>
            <Link className="text-link text-link--sage" href="/about">Read the operating model <ArrowRight /></Link>
          </div>
          <ol className="process-stack">
            <li><span>01</span><div><strong>Research</strong><p>Understand the question, options and relevant evidence.</p></div></li>
            <li><span>02</span><div><strong>Calculate</strong><p>Use approved pricing, area, pitch and quantity logic.</p></div></li>
            <li><span>03</span><div><strong>Assess</strong><p>Use imagery and plans for preliminary observations where appropriate.</p></div></li>
            <li><span>04</span><div><strong>Act</strong><p>When useful, decide what type of specialist is worth contacting next.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="scenic-band">
        <Image className="scenic-band__image" src="/media/hero-secondary.webp" alt="Modern metal-roofed New Zealand home overlooking a lake and mountains" fill sizes="100vw" />
        <div className="scenic-band__shade" aria-hidden="true" />
        <div className="container scenic-band__content">
          <p className="eyebrow eyebrow--light">Built for New Zealand</p>
          <h2>Roofing decisions change with the property and the place.</h2>
          <p>Coastal exposure, wind, altitude, access, roof geometry and the existing system can all change the right next step. RoofHub should explain those variables without pretending one answer fits every project.</p>
          <div className="condition-row">
            <span>Coastal</span><span>Urban</span><span>Rural</span><span>Alpine</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Real questions, structured properly" title="Roofing decisions people actually need to make" copy={<p>The content plan starts with useful decisions, not with producing hundreds of pages.</p>} />
          <div className="decision-grid">
            {decisions.map(([title, copy], i) => <article className="decision-card" key={title}><span>0{i+1}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <SectionHeading eyebrow="Methodology matters" title="The result should explain itself" copy={<p>Pricing, measurement and image analysis become more trustworthy when assumptions and limitations are visible instead of buried.</p>} />
          <div className="method-grid">
            <article><span>01</span><h3>Separate inputs from inference</h3><p>User-supplied measurements, calculated values and model observations should not be mixed together.</p></article>
            <article><span>02</span><h3>Keep unknowns visible</h3><p>An unknown scaffold requirement or roof condition is not the same as zero cost or no problem.</p></article>
            <article><span>03</span><h3>Keep professional boundaries clear</h3><p>A preliminary estimate or visual assessment should never be presented as a formal quote or certified inspection.</p></article>
          </div>
        </div>
      </section>

      <section className="section section--white">
        <div className="container">
          <div className="editorial-layout">
            <div>
              <p className="eyebrow">Guides & research</p>
              <h2>Build confidence before the quote.</h2>
              <p className="lead-copy">RoofHub guides should answer a real roofing question, connect to a useful tool when appropriate, and leave the reader with a practical next step.</p>
              <Link className="button button--secondary" href="/guides">Browse guides <ArrowRight /></Link>
            </div>
            <div className="editorial-list">
              <Link href="/guides/how-to-prepare-for-a-roofing-quote"><span>5 min guide</span><strong>How to prepare for a roofing quote</strong><small>Planning · scope · comparison</small></Link>
              <div><span>Planned</span><strong>What does a reroof price actually include?</strong><small>Pricing · exclusions · allowances</small></div>
              <div><span>Planned</span><strong>How roof area and pitch affect the project</strong><small>Measurement · geometry · quantities</small></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--terracotta-soft">
        <div className="container cta-band">
          <div><p className="eyebrow">Prototype build</p><h2>See how the first RoofHub tool result feels.</h2><p>The current estimator uses demo arithmetic only, but the interaction shows how the real pricing engine can present ranges, assumptions and uncertainty.</p></div>
          <Link className="button button--primary button--large" href="/pricing">Try the pricing prototype <ArrowRight /></Link>
        </div>
      </section>
    </>
  );
}
