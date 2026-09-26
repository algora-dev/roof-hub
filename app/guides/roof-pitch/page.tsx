import Link from "next/link";
import { ArticleSchema } from "@/components/evidence/ArticleSchema";
import { CornerstoneHeader } from "@/components/evidence/CornerstoneHeader";
import { FaqBlock } from "@/components/evidence/FaqBlock";
import { PriceTable } from "@/components/evidence/PriceTable";
import { RelatedTool } from "@/components/evidence/RelatedTool";
import { Sources } from "@/components/evidence/Sources";
import { WorkedExample } from "@/components/evidence/WorkedExample";
import { TECHNICAL_SOURCES } from "@/data/technicalSources";
import { pageMetadata } from "@/lib/seo";

const PATH = "/guides/roof-pitch";
const DESCRIPTION = "NZ roof pitch guide explaining degrees, plan area vs actual roof area, pitch multipliers, roofing profile minimum pitches and how pitch affects estimates.";
export const metadata = pageMetadata({ title: "Roof pitch NZ — degrees, area factors & roofing limits", description: DESCRIPTION, path: PATH });

const rows = [
  ["0°", "1.000", "200 m²"], ["5°", "1.004", "201 m²"], ["10°", "1.015", "203 m²"], ["15°", "1.035", "207 m²"], ["20°", "1.064", "213 m²"], ["25°", "1.103", "221 m²"], ["30°", "1.155", "231 m²"], ["35°", "1.221", "244 m²"], ["40°", "1.305", "261 m²"], ["45°", "1.414", "283 m²"]
].map(([label, range, basis]) => ({ label, range, basis, notes: "Simple single-pitch conversion before overhangs/complex geometry" }));

export default function RoofPitchPage() {
  const sources = [TECHNICAL_SOURCES.metalcraftCorrugate, TECHNICAL_SOURCES.metalcraftFiveRib, TECHNICAL_SOURCES.metalcraftEspan, TECHNICAL_SOURCES.gerardBond, TECHNICAL_SOURCES.worksafeRoofs, TECHNICAL_SOURCES.buildingE2];
  return <>
    <ArticleSchema headline="Roof pitch in New Zealand" description={DESCRIPTION} path={PATH} />
    <CornerstoneHeader crumbs={[{label:"Home",href:"/"},{label:"Guides",href:"/guides"},{label:"Roof pitch"}]} eyebrow="Roof geometry" title="Roof pitch: how degrees change area, products and access" answer={<><p>Roof pitch affects both <strong>how much roof surface exists above a plan footprint</strong> and which roofing profiles can be used. For a simple roof plane, actual sloping area is approximately <strong>plan area ÷ cos(pitch)</strong>.</p><p>A 200 m² plan area is about 207 m² at 15°, 221 m² at 25° and 244 m² at 35° before allowing for overhangs and irregular geometry.</p></>} facts={[{label:"Input",value:"Pitch in degrees"},{label:"Area formula",value:"plan area ÷ cos(pitch)"},{label:"Safety breakpoint",value:">25° needs more slip control"},{label:"Reviewed",value:"26 Sep 2026"}]} />

    <section className="section section--white"><div className="container article-stack"><div><p className="eyebrow">Pitch factors</p><h2>How pitch changes a 200m² plan area</h2></div><PriceTable caption="Roof pitch area conversion factors" head={["Roof pitch","Area factor","200m² plan becomes","Notes"]} rows={rows} /></div></section>

    <section className="section section--sage"><div className="container article-two-col"><div className="article-stack"><p className="eyebrow">Worked calculation</p><h2>Plan measurement vs actual measurement</h2><WorkedExample title="200m² plan-view roof at 25°" lines={[{label:"Plan area",value:"200 m²"},{label:"cos(25°)",value:"≈ 0.9063"},{label:"Calculation",value:"200 ÷ 0.9063"},{label:"Simple sloping area",value:"≈ 220.7 m²",highlight:true}]} note="This works for a simple roof plane. A real roof may also include overhangs, multiple pitches and geometry that should be measured directly when possible." /></div><RelatedTool title="Measure the actual roof" href="/tools/detailed-roof-estimator" copy="Tell the estimator whether each measurement is plan-view or actual. Plan measurements are converted once using the entered pitch." /></div></section>

    <section className="section section--white"><div className="container article-stack"><div><p className="eyebrow">Product limits</p><h2>Minimum pitch belongs to the exact roof profile</h2></div><div className="three-col"><article className="info-card"><span>Corrugate</span><h3>8° on cited systems</h3><p>Metalcraft Corrugate and Steel &amp; Tube Custom Orb publish 8° minimum pitch, subject to their detailed limitations.</p></article><article className="info-card"><span>Five-rib</span><h3>3° on cited systems</h3><p>Metalcraft MC760 and Dimond Hi Five publish 3° minimum pitch for the cited systems.</p></article><article className="info-card"><span>Pressed tile</span><h3>12° on cited Gerard systems</h3><p>Gerard Bond and Milano publish 12° minimum pitch.</p></article></div><p>These are manufacturer examples, not a generic legal rule for every product. Use the selected manufacturer's current specification and the relevant Building Code compliance pathway.</p></div></section>

    <section className="section"><div className="container article-stack"><div className="evidence-callout"><strong>Safety matters too:</strong> WorkSafe notes that roofs above 25° have greater sliding risk and recommends additional controls; for slopes over 35°, edge protection should be specifically designed. Roof pitch therefore affects both quantity and access planning.</div><p>For measurement methodology, continue to <Link className="text-link" href="/guides/roof-area">roof area and measurement</Link>.</p><div><p className="eyebrow">Sources</p><h2>Technical references</h2></div><Sources sources={sources} /></div></section>
    <section className="section section--sage"><div className="container faq-layout"><div><p className="eyebrow">FAQ</p><h2>Roof pitch questions</h2></div><FaqBlock faqs={[
      {q:"Does roof pitch increase roof area?",a:"Yes. A sloping roof surface is larger than its plan-view projection. For a simple roof plane the conversion is plan area divided by the cosine of the pitch angle."},
      {q:"If I already measured the actual roof surface, should I apply pitch again?",a:"No. Pitch conversion is only for plan-view measurements. Applying it to an actual sloping measurement would double-count the slope."},
      {q:"What is a normal NZ roof pitch?",a:"There is no single normal pitch. Product choice and architecture vary widely. RoofHub asks for the actual pitch or a broad pitch category because both area and product suitability can change."}
    ]} /></div></section>
  </>;
}
