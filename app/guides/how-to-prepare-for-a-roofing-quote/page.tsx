import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "How to prepare for a roofing quote",
  description: "What to gather, what to ask, and how to compare roofing quotes on scope, assumptions and exclusions — not just the bottom-line price.",
  path: "/guides/how-to-prepare-for-a-roofing-quote"
});

export default function GuidePage() {
  return <>
    <section className="article-hero">
      <div className="container article-shell">
        <p className="breadcrumbs"><Link href="/guides">Guides</Link><span>/</span> Project planning</p>
        <p className="eyebrow">Representative draft guide · 5 min read</p>
        <h1>How to prepare for a roofing quote</h1>
        <p className="article-lede">A useful quote starts with a clear description of the project. You do not need to know every technical detail, but a little preparation makes it easier to compare scope, assumptions and exclusions.</p>
        <div className="article-meta"><span>For New Zealand projects</span><span>Preview draft</span><span>Technical review required before indexing</span></div>
      </div>
    </section>

    <section className="article-section">
      <div className="container article-layout">
        <article className="prose">
          <div className="answer-box"><strong>Quick answer</strong><p>Gather the property location, what you know about the existing roof, a few useful photos, any plans or measurements you already have, and the outcome you are trying to achieve. Then compare quotes on scope as well as price.</p></div>

          <h2 id="problem">1. Start with the problem, not the product</h2>
          <p>Instead of deciding in advance that you need a particular roofing product, describe what is happening: age, leaks, visible corrosion, broken tiles, planned renovation, insurance work, or a roof that simply appears to be reaching the end of its serviceable life.</p>
          <p className="draft-callout"><strong>Preview-content note:</strong> final technical guidance will be reviewed against appropriate New Zealand sources before indexing is enabled.</p>

          <h2 id="context">2. Give the roofer enough context to prepare properly</h2>
          <p>Useful information can include the town or region, approximate building type, known roof material, number of storeys, access constraints, existing solar or penetrations, and photos taken safely from ground level.</p>
          <div className="article-check-grid"><div><strong>Useful to have</strong><ul><li>Property location</li><li>Roof type if known</li><li>Approximate area or plans</li><li>Clear photos</li></ul></div><div><strong>Useful to explain</strong><ul><li>What problem you are solving</li><li>Known leaks or damage</li><li>Access constraints</li><li>Renovation or timing context</li></ul></div></div>

          <h2 id="scope">3. Compare what is included — not only the bottom-line price</h2>
          <p>Two quotes can look similar while covering different work. RoofHub&apos;s future quote-checking content should help users identify differences in removal, disposal, scaffold, flashings, underlay, gutters, penetrations, insulation interfaces and other scope items where relevant.</p>

          <h2 id="unknowns">4. Keep unknowns visible</h2>
          <p>A quote prepared before a detailed inspection may reasonably contain assumptions. The important thing is that those assumptions are visible rather than hidden or silently treated as zero-cost items.</p>

          <h2 id="next">5. Ask what happens next</h2>
          <p>Clarify how the contractor handles variations, weather delays, access, warranties, site protection and any project-specific approvals or specialist requirements.</p>

          <div className="article-end-cta"><p className="eyebrow">Where RoofHub can help</p><h2>Turn scattered project information into one useful summary.</h2><p>Measurements, photos, pricing context and unanswered questions can eventually flow into one project record rather than being retyped into every enquiry.</p><Link className="button button--primary" href="/tools">See the tool plan</Link></div>
        </article>
        <aside className="article-sidebar">
          <nav className="toc-card" aria-label="On this page"><strong>On this page</strong><a href="#problem">Start with the problem</a><a href="#context">Project context</a><a href="#scope">Compare scope</a><a href="#unknowns">Keep unknowns visible</a><a href="#next">What happens next</a></nav>
          <div className="method-card"><span>Methodology</span><p>This article is representative preview content, not final published New Zealand roofing guidance.</p></div>
        </aside>
      </div>
    </section>
  </>;
}
