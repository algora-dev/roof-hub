import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, Camera, Layers, Measure } from "@/components/Icons";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = { title: "Roofing tools" };

const tools = [
  { icon: Calculator, title: "Roof pricing", copy: "Detailed estimator: measure from a plan or enter quantities for a low/high cost range. Simple slider estimate also available.", status: "Preview live", href: "/tools/detailed-roof-estimator", active: true },
  { icon: Measure, title: "Roof measurement", copy: "Integration point for plan, satellite and dimension-based measurement workflows.", status: "Integration planned", href: "#", active: false },
  { icon: Camera, title: "Photo / plan analysis", copy: "Preliminary material and condition observations with confidence and limitations.", status: "Integration planned", href: "#", active: false },
  { icon: Layers, title: "Roof pitch & quantities", copy: "Small deterministic calculators that share the same approved roofing core.", status: "Integration planned", href: "#", active: false }
];

export default function ToolsPage() {
  return <>
    <section className="page-intro">
      <div className="container page-intro__grid">
        <div><p className="eyebrow">RoofHub tools</p><h1>Useful calculations before the contact form.</h1></div>
        <div className="page-intro__aside"><p>RoofHub already has substantial roofing tooling. This website should expose and orchestrate those capabilities without rebuilding mature logic just to fit a new interface.</p></div>
      </div>
    </section>

    <section className="section section--compact section--white"><div className="container"><div className="tool-grid">{tools.map(({icon: Icon,title,copy,status,href,active}) => <article className={`tool-card ${active ? "tool-card--active" : ""}`} key={title}><div className="tool-card__head"><span className="icon-tile"><Icon/></span><span className={`status-pill ${active ? "status-pill--live" : ""}`}>{status}</span></div><h2>{title}</h2><p>{copy}</p>{active ? <Link className="text-link" href={href}>Open prototype <ArrowRight/></Link> : <span className="muted-link">Awaiting existing tool audit</span>}</article>)}</div></div></section>

    <section className="section section--sage">
      <div className="container feature-split">
        <div className="feature-copy"><p className="eyebrow">One authoritative roofing core</p><h2>Website, assistant and future agents should use the same logic.</h2><p>Critical pricing formulas, measurement rules and technical constraints should live in approved shared functions or data — not be duplicated across page code and AI prompts.</p></div>
        <div className="architecture-diagram"><span>Website</span><span>Smart assistant</span><span className="architecture-core">Approved roofing core</span><span>Future agent access</span><span>Reports / enquiries</span></div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <SectionHeading eyebrow="Output discipline" title="Preliminary tools should say exactly what they are" copy={<p>RoofHub can be useful without overstating certainty.</p>} />
        <div className="output-grid">
          <article><span>Measurement</span><h3>Preliminary measured / estimated area</h3><p>Keep source imagery, supplied dimensions, inferred dimensions and unresolved inputs distinct.</p></article>
          <article><span>Visual assessment</span><h3>Visual indicators suggest…</h3><p>Photo analysis can highlight visible features without pretending to be a certified diagnosis.</p></article>
          <article><span>Material identification</span><h3>Likely / appears to be…</h3><p>Use confidence-aware wording where the image or supplied context cannot support certainty.</p></article>
        </div>
      </div>
    </section>

    <section className="section section--dark">
      <div className="container">
        <SectionHeading eyebrow="Integration sequence" title="Audit first. Connect the strongest vertical slice second." />
        <ol className="horizontal-steps">
          <li><span>1</span><strong>Audit existing code</strong><p>Map calculators, measurement logic, prompts, source data and duplicated rules.</p></li>
          <li><span>2</span><strong>Identify shared functions</strong><p>Extract the source-of-truth logic that multiple interfaces should call.</p></li>
          <li><span>3</span><strong>Integrate one tool properly</strong><p>Pricing or measurement should become the first complete public workflow.</p></li>
          <li><span>4</span><strong>Expand from evidence</strong><p>Add tools and pages based on real search demand and actual usage.</p></li>
        </ol>
      </div>
    </section>

    <section className="section section--white"><div className="container cta-band"><div><p className="eyebrow">Current working example</p><h2>Start with the pricing interaction.</h2><p>The calculator is still demo-only, but it gives us a real UI to test before the approved pricing engine is connected.</p></div><Link className="button button--secondary button--large" href="/pricing">Open pricing prototype <ArrowRight/></Link></div></section>
  </>;
}
