import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/evidence/Breadcrumbs";
import { RelatedTool } from "@/components/evidence/RelatedTool";

export const metadata = pageMetadata({
  title: "Roofing systems",
  description: "NZ roofing systems covered by RoofHub: long-run steel, corrugated, five-rib, pressed metal tile and tray/standing seam.",
  path: "/roofing"
});

const systems = [
  { status: "Guide live", title: "Long-run roofing", copy: "Corrugated and trapezoidal profiles, gauges and coatings, pitch rules and what the market charges.", href: "/roofing/long-run", live: true },
  { status: "In research", title: "Corrugated roofing", copy: "The classic NZ profile: specification, market pricing observations and worked examples.", href: "/guides", live: false },
  { status: "In research", title: "Five-rib / trapezoidal", copy: "Stronger spanning, hidden fixing options and where it beats corrugate.", href: "/guides", live: false },
  { status: "In research", title: "Pressed metal tile", copy: "Tile-look steel systems, battens and underlay, and the Decramastic distinction.", href: "/guides", live: false },
  { status: "In research", title: "Tray & standing seam", copy: "Architectural tray systems, concealed fixing and premium pricing explained.", href: "/guides", live: false }
];

export default function RoofingHubPage() {
  return <>
    <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Roofing" }]} />
    <section className="page-intro">
      <div className="container page-intro__grid">
        <div><p className="eyebrow">Roofing systems</p><h1>NZ roofing systems, profile by profile.</h1></div>
        <div className="page-intro__aside"><p>Each system page collects the same things: what it is, where the specification comes from, what public NZ sources say it costs, and a calculator or worked example to make it concrete.</p></div>
      </div>
    </section>
    <section className="section section--compact section--white">
      <div className="container">
        <div className="tool-grid">
          {systems.map((s) => <article className={`tool-card ${s.live ? "tool-card--active" : ""}`} key={s.title}>
            <div className="tool-card__head"><span className={`status-pill ${s.live ? "status-pill--live" : ""}`}>{s.status}</span></div>
            <h2>{s.title}</h2><p>{s.copy}</p>
            {s.live ? <Link className="text-link" href={s.href}>Read the guide</Link> : <span className="muted-link">Research in progress</span>}
          </article>)}
        </div>
      </div>
    </section>
    <section className="section section--sage section--compact">
      <div className="container cta-band">
        <div><p className="eyebrow">Same method everywhere</p><h2>Every number is traceable.</h2><p>Published ranges are derived from recorded public observations — each with a source, date and GST basis. <Link className="text-link text-link--sage" href="/methodology">See how</Link>.</p></div>
        <RelatedTool title="Detailed roof estimator" href="/tools/detailed-roof-estimator" copy="Measure from a plan and get a preliminary low/high range." />
      </div>
    </section>
  </>;
}
