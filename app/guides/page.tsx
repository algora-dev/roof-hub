import Link from "next/link";
import { ArrowRight, Book, Calculator, Layers, Measure } from "@/components/Icons";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Roofing guides & research",
  description: "Roofing guides that answer real New Zealand roofing questions, connect to useful tools and end with a practical next step.",
  path: "/guides"
});

const topics = [
  { icon: Calculator, title: "Pricing & scope", copy: "Costs, inclusions, exclusions and the variables that move a project." },
  { icon: Measure, title: "Measurement", copy: "Area, pitch, plans, quantities and the difference between preliminary and surveyed values." },
  { icon: Layers, title: "Materials & systems", copy: "Use-case driven comparisons with technical claims tied to appropriate evidence." },
  { icon: Book, title: "Project planning", copy: "Quotes, timing, access, maintenance and practical preparation before work starts." }
];

const planned = [
  ["Pricing", "What a reroof price should account for"],
  ["Measurement", "How roof area and pitch affect a project"],
  ["Materials", "Long-run steel: what to understand before choosing a profile"],
  ["Decision", "Repair vs replacement: the questions that change the answer"],
  ["Climate", "Roofing considerations for coastal New Zealand"],
  ["Planning", "What should a roofing quote include?"]
];

export default function GuidesPage() {
  return <>
    <section className="page-intro page-intro--terracotta">
      <div className="container page-intro__grid">
        <div><p className="eyebrow">Guides & research</p><h1>Roofing information designed to help make a decision.</h1></div>
        <div className="page-intro__aside"><p>Not a huge blog for its own sake. RoofHub guides should answer real questions, connect to useful tools, show evidence where it matters, and give the reader a practical next step.</p></div>
      </div>
    </section>

    <section className="section section--white">
      <div className="container featured-guide">
        <div><p className="eyebrow">Featured guide · 5 min read</p><h2>How to prepare for a roofing quote</h2><p>What to gather, what to ask and how to make multiple roofing quotes easier to compare without pretending you need to become a roofer first.</p><Link className="button button--primary" href="/guides/how-to-prepare-for-a-roofing-quote">Read the guide <ArrowRight/></Link></div>
        <div className="featured-guide__checklist"><span>Bring useful context</span><span>Compare scope, not only price</span><span>Keep assumptions visible</span><span>Know what happens next</span></div>
      </div>
    </section>

    <section className="section section--sage">
      <div className="container">
        <div className="topic-grid">{topics.map(({icon: Icon,title,copy}) => <article key={title}><span className="icon-tile"><Icon/></span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="planned-guides-head"><div><p className="eyebrow">Planned authority pages</p><h2>Build depth where a real question deserves it.</h2></div><p>These are examples to research and validate — not a commitment to mass-produce thin pages.</p></div>
        <div className="planned-guides-grid">{planned.map(([category,title]) => <article key={title}><span>{category}</span><h3>{title}</h3><small>Research / draft queue</small></article>)}</div>
      </div>
    </section>

    <section className="section section--dark">
      <div className="container editorial-standards">
        <div><p className="eyebrow">Editorial rules</p><h2>Answer the roofing question first. Conversion comes second.</h2></div>
        <div className="editorial-rules"><p><strong>Use evidence.</strong> Technical claims should be supported by appropriate NZ sources or manufacturer documentation.</p><p><strong>Separate market information from partners.</strong> A provider relationship should not buy a favourable comparison.</p><p><strong>Preserve uncertainty.</strong> Avoid turning a preliminary assessment into a definitive diagnosis.</p><p><strong>Avoid doorway content.</strong> Local pages should exist only where there is genuinely useful local information.</p></div>
      </div>
    </section>

    <section className="section section--terracotta-soft"><div className="container cta-band"><div><p className="eyebrow">Prefer tools when tools are better</p><h2>Some roofing questions are calculations, not articles.</h2><p>Roof area, pitch, quantities and pricing should lead into interactive tools where that gives the user a better answer.</p></div><Link className="button button--primary button--large" href="/tools">Explore tools <ArrowRight/></Link></div></section>
  </>;
}
