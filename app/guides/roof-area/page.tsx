import Link from "next/link";
import { ArticleSchema } from "@/components/evidence/ArticleSchema";
import { CornerstoneHeader } from "@/components/evidence/CornerstoneHeader";
import { FaqBlock } from "@/components/evidence/FaqBlock";
import { RelatedTool } from "@/components/evidence/RelatedTool";
import { Sources } from "@/components/evidence/Sources";
import { WorkedExample } from "@/components/evidence/WorkedExample";
import { TECHNICAL_SOURCES } from "@/data/technicalSources";
import { pageMetadata } from "@/lib/seo";

const PATH = "/guides/roof-area";
const DESCRIPTION = "How to measure a roof in New Zealand: plan area vs actual surface area, pitch conversion, ridges, hips, valleys, barges and how those measurements feed a roofing estimate.";
export const metadata = pageMetadata({ title: "How to measure roof area NZ — plan vs actual measurements", description: DESCRIPTION, path: PATH });

export default function RoofAreaPage() {
  const sources = [TECHNICAL_SOURCES.buildingE2, TECHNICAL_SOURCES.e2as1, TECHNICAL_SOURCES.worksafeRoofs];
  return <>
    <ArticleSchema headline="How to measure roof area and roofing quantities" description={DESCRIPTION} path={PATH} />
    <CornerstoneHeader crumbs={[{label:"Home",href:"/"},{label:"Guides",href:"/guides"},{label:"Roof area & measurement"}]} eyebrow="Roof measurement" title="How to measure a roof for an estimate" answer={<><p>The first question is whether your measurement is <strong>plan-view</strong> or <strong>actual roof surface</strong>. Plan-view area needs a pitch conversion; an actual sloping measurement does not.</p><p>A useful roofing estimate also needs lineal quantities such as ridges, hips, valleys and barges because those components have different materials and labour from the main roof area.</p></>} facts={[{label:"Area unit",value:"m²"},{label:"Flashings",value:"lineal metres"},{label:"Plan measurements",value:"apply pitch once"},{label:"Actual measurements",value:"no pitch conversion"}]} />

    <section className="section section--white"><div className="container article-two-col"><div className="article-stack"><p className="eyebrow">Two measurement modes</p><h2>Tell the estimator what you actually measured</h2><p><strong>Plan measurements</strong> are the roof as seen from directly above. They are convenient on architectural plans and satellite imagery but understate the sloping surface on pitched roofs.</p><p><strong>Actual measurements</strong> already follow the roof surface/edge. Do not multiply them by a pitch factor again.</p></div><RelatedTool title="Detailed roof measurement estimator" href="/tools/detailed-roof-estimator" copy="Enter quantities manually or trace them from an image/plan. Each measurement can retain whether it came from plan view or the actual roof." /></div></section>

    <section className="section section--sage"><div className="container article-stack"><WorkedExample title="Simple plan-area conversion" lines={[{label:"Plan area",value:"180 m²"},{label:"Roof pitch",value:"25°"},{label:"Pitch factor",value:"≈ 1.103"},{label:"Approx. sloping surface",value:"≈ 198.6 m²",highlight:true}]} note="This is the simple area conversion only. Eaves/overhangs and complex geometry must also be represented in the plan measurement or measured separately." /><p>See the <Link className="text-link text-link--sage" href="/guides/roof-pitch">roof pitch guide</Link> for a full pitch-factor table.</p></div></section>

    <section className="section section--white"><div className="container article-stack"><div><p className="eyebrow">What to measure</p><h2>The component list that makes an estimate more useful</h2></div><div className="three-col"><article className="info-card"><span>m²</span><h3>Roof areas</h3><p>Main roof covering, underlay and many removal allowances follow actual roof surface area.</p></article><article className="info-card"><span>lm</span><h3>Ridges, hips, valleys &amp; barges</h3><p>These are measured as lineal lengths because flashing material and labour follow the edge/junction length.</p></article><article className="info-card"><span>each/lm</span><h3>Rainwater &amp; custom items</h3><p>Spouting is usually lineal; downpipes and some penetrations are counted; unusual items can be added separately.</p></article></div></div></section>

    <section className="section"><div className="container article-stack"><div><p className="eyebrow">Accuracy</p><h2>When a plan measurement is enough — and when it is not</h2></div><p>A plan can be excellent for preliminary quantities when it has a known scale and clear roof geometry. Satellite imagery can be useful for early planning but may contain perspective/imagery limitations. A site quote still needs actual conditions confirmed, especially access, penetrations, substrate condition and details hidden in the plan.</p><div className="evidence-callout"><strong>Safety:</strong> this guide is about measurement logic, not instructions to climb a roof. WorkSafe guidance applies to work at height; use plans, imagery and competent site measurement methods rather than putting yourself at risk to obtain a number.</div></div></section>

    <section className="section section--white"><div className="container article-stack"><div><p className="eyebrow">Technical references</p><h2>Why the detail still matters after the maths</h2></div><p>Roof area is only one input. The New Zealand Building Code's external-moisture requirements and the selected roof manufacturer's details govern how claddings, flashings, junctions and penetrations need to perform.</p><Sources sources={sources} /></div></section>
    <section className="section section--sage"><div className="container faq-layout"><div><p className="eyebrow">FAQ</p><h2>Roof measurement questions</h2></div><FaqBlock faqs={[
      {q:"Is house floor area the same as roof area?",a:"Usually not. Roof overhangs, plan geometry and pitch can all make the roof surface larger than the floor/footprint area."},
      {q:"Should I add pitch to ridge length?",a:"A horizontal ridge length does not need the same pitch-area conversion as a roof plane. Hips and valleys can require geometric conversion when measured in plan view; the detailed RoofHub tool handles those measurement types separately."},
      {q:"Can I upload a plan and measure it digitally?",a:"Yes. The detailed estimator includes a plan/image takeoff workflow where a known dimension can be used to calibrate measurements before tracing roof areas and components."}
    ]} /></div></section>
  </>;
}
