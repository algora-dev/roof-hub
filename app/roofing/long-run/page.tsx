import Link from "next/link";
import { ArticleSchema } from "@/components/evidence/ArticleSchema";
import { CornerstoneHeader } from "@/components/evidence/CornerstoneHeader";
import { FaqBlock } from "@/components/evidence/FaqBlock";
import { PriceTable } from "@/components/evidence/PriceTable";
import { RelatedTool } from "@/components/evidence/RelatedTool";
import { Sources } from "@/components/evidence/Sources";
import { evidenceRows, observationSourceEntries } from "@/data/content";
import { TECHNICAL_SOURCES } from "@/data/technicalSources";
import { pageMetadata } from "@/lib/seo";

const PATH = "/roofing/long-run";
const DESCRIPTION = "Guide to long-run metal roofing in New Zealand: corrugated and five-rib profiles, pitch, cover widths, pricing evidence, underlay and reroof considerations.";
const evidenceIds = ["lr-01", "lr-02", "lr-04", "lr-05", "lr-10", "lr-12", "lr-18", "rr-02"];
export const metadata = pageMetadata({ title: "Long-run roofing NZ — profiles, prices & pitch", description: DESCRIPTION, path: PATH });

export default function LongRunPage() {
  const sources = [...observationSourceEntries(evidenceIds), TECHNICAL_SOURCES.metalcraftCorrugate, TECHNICAL_SOURCES.metalcraftFiveRib, TECHNICAL_SOURCES.buildingE2];
  return <>
    <ArticleSchema headline="Long-run roofing in New Zealand" description={DESCRIPTION} path={PATH} />
    <CornerstoneHeader crumbs={[{label:"Home",href:"/"},{label:"Roofing",href:"/roofing"},{label:"Long-run roofing"}]} eyebrow="Roofing system guide" title="Long-run metal roofing in New Zealand" answer={<><p><strong>Long-run roofing</strong> is roll-formed metal roofing supplied in sheets cut to suit the roof run. For NZ homes, the two profiles RoofHub treats as the main everyday categories are <strong>corrugate</strong> and <strong>five-rib/trapezoidal</strong>.</p><p>Material pricing can be close between them; installation detail and profile geometry are often what separate the final installed cost.</p></>} facts={[{label:"Common profiles",value:"Corrugate + five-rib"},{label:"Typical material",value:"Coated steel"},{label:"Pricing basis",value:"Keep supply and install separate"},{label:"Reviewed",value:"26 Sep 2026"}]} />

    <section className="section section--white"><div className="container article-stack"><div><p className="eyebrow">Profile families</p><h2>Corrugate and five-rib are not the same shape</h2></div><div className="three-col"><article className="info-card"><span>01</span><h3>Corrugate</h3><p>Traditional rounded wave profile. Metalcraft states 760 mm cover and an 8° minimum pitch for its Corrugate profile.</p><Link className="text-link" href="/roofing/corrugated">Corrugated roofing guide</Link></article><article className="info-card"><span>02</span><h3>Five-rib / trapezoidal</h3><p>Five pronounced ribs with wider pans between them. Metalcraft MC760 and Dimond Hi Five are examples; both publish minimum pitches around 3° for the specified systems.</p><Link className="text-link" href="/roofing/five-rib">Five-rib roofing guide</Link></article><article className="info-card"><span>03</span><h3>Architectural tray</h3><p>Concealed-fix tray and standing-seam systems are a separate premium category rather than ordinary long-run five-rib roofing.</p><Link className="text-link" href="/roofing/tray-standing-seam">Tray &amp; standing seam guide</Link></article></div></div></section>

    <section className="section section--sage"><div className="container article-stack"><div><p className="eyebrow">Market evidence</p><h2>What public NZ sources show for long-run roofing</h2><p>Some sources publish material-only rates, others installed rates and others complete reroof prices. RoofHub keeps the basis visible.</p></div><PriceTable caption="Long-run roofing market observations" rows={evidenceRows(["lr-01","lr-04","lr-05","lr-10","lr-12","lr-18","rr-02"])} /></div></section>

    <section className="section section--white"><div className="container article-two-col"><div className="article-stack"><p className="eyebrow">Installation</p><h2>Why five-rib can cost slightly more to install</h2><p>In RoofHub's estimating model, the covering material band for corrugate and five-rib is kept close. The labour band is slightly wider for five-rib because profile notching and flashing details around hips, ridges and valleys can take more work than a soft-edge corrugate detail.</p><p>This is an estimating assumption, not a claim that every five-rib job is more expensive. Roof geometry and the exact flashing system remain important.</p></div><RelatedTool title="Compare roof systems on your measured roof" href="/tools/detailed-roof-estimator" copy="Use the same measured quantities and switch the selected roof system without re-measuring the project." /></div></section>

    <section className="section"><div className="container article-stack"><div><p className="eyebrow">Technical context</p><h2>Pitch, underlay and specification matter</h2></div><p>Minimum pitch is profile-specific, not simply “metal roofing”. Metalcraft publishes 8° for its Corrugate profile and 3° for MC760; manufacturer requirements can also change with sheet length and rainwater run-off. The New Zealand Building Code's E2 external-moisture provisions and the chosen manufacturer's details must be considered together.</p><p>Use the <Link className="text-link" href="/guides/roof-pitch">roof pitch guide</Link> to understand how pitch changes actual roof area and which profile families suit low-slope roofs.</p></div></section>

    <section className="section section--white"><div className="container article-stack"><div><p className="eyebrow">Sources</p><h2>Evidence and manufacturer references</h2></div><Sources sources={sources} /></div></section>
    <section className="section section--sage"><div className="container faq-layout"><div><p className="eyebrow">FAQ</p><h2>Long-run roofing questions</h2></div><FaqBlock faqs={[{q:"Is Colorsteel the same as long-run roofing?",a:"No. Long-run describes the sheet roofing format/profile family. COLORSTEEL is a branded prepainted steel product that can be roll-formed into several roofing profiles."},{q:"Is corrugate cheaper than five-rib?",a:"The material can be very close. RoofHub's working model places five-rib only marginally above corrugate overall, mainly because some installation and flashing details can take longer."},{q:"Can long-run roofing be used on low-pitch roofs?",a:"Some trapezoidal and concealed-fix long-run profiles are designed for much lower pitches than corrugate. Always use the exact manufacturer's minimum-pitch and run-off requirements for the selected profile."}]} /></div></section>
  </>;
}
