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

const PATH = "/roofing/tray-standing-seam";
const DESCRIPTION = "Architectural tray and standing seam roofing NZ guide: concealed-fix systems, common cover widths, low-pitch use and published installed pricing evidence.";
const ids = ["rr-03", "rr-04", "tt-04"];
export const metadata = pageMetadata({ title: "Tray & standing seam roofing NZ — cost & systems", description: DESCRIPTION, path: PATH });

export default function TrayStandingSeamPage() {
  const sources = [...observationSourceEntries(ids), TECHNICAL_SOURCES.metalcraftEspan, TECHNICAL_SOURCES.buildingE2];
  return <>
    <ArticleSchema headline="Architectural tray and standing seam roofing in New Zealand" description={DESCRIPTION} path={PATH} />
    <CornerstoneHeader crumbs={[{label:"Home",href:"/"},{label:"Roofing",href:"/roofing"},{label:"Tray & standing seam"}]} eyebrow="Architectural metal roofing" title="Tray and standing seam roofing in NZ: systems, widths and cost" answer={<><p>Architectural tray and standing seam sit well above standard corrugate/five-rib pricing because the system, fabrication, detailing and installation are more specialised. Public NZ examples in RoofHub's dataset range from <strong>$130–$170/m² for one long-run tray complete-project example</strong> to <strong>$200–$280/m² for a standing-seam complete-project example</strong>.</p><p>RoofHub treats tray and standing seam as one premium category for a first-pass estimate, but the exact system should be priced separately for a real quote.</p></>} facts={[{label:"Fixing",value:"Often concealed / clip fixed"},{label:"Example cover",value:"340–470 mm class"},{label:"Example min pitch",value:"3° on cited Espan 470"},{label:"Reviewed",value:"26 Sep 2026"}]} />

    <section className="section section--white"><div className="container article-stack"><div><p className="eyebrow">Pricing evidence</p><h2>Published tray and standing-seam observations</h2></div><PriceTable caption="Architectural tray and standing seam observations" rows={evidenceRows(ids)} /><div className="evidence-callout"><strong>Scope warning:</strong> tray/standing-seam pricing is highly sensitive to the exact system, substrate/support requirements, penetrations, sheet lengths, folds and architectural details. A generic $/m² range is useful for planning but not specification.</div></div></section>

    <section className="section section--sage"><div className="container article-two-col"><div className="article-stack"><p className="eyebrow">System example</p><h2>Espan 470 shows what concealed-fix tray means</h2><p>Metalcraft publishes Espan 470 with a nominal <strong>470 mm cover</strong>, <strong>484 mm sheet width</strong> and <strong>3° minimum pitch</strong> subject to sheet-length requirements. The sheet locks onto a clip system so the pan is not punctured by exposed fixings.</p><p>The same manufacturer also offers a narrower Espan 340 family, which is why “tray” should not be treated as one universal width.</p></div><RelatedTool title="Budget an architectural tray roof" href="/tools/detailed-roof-estimator" copy="Use the tray / standing seam bundled installed range for a first-pass estimate, then replace it with an exact supplier/installer rate when quoting." /></div></section>

    <section className="section section--white"><div className="container article-stack"><div><p className="eyebrow">Why the premium exists</p><h2>More than just expensive sheet metal</h2></div><div className="three-col"><article className="info-card"><span>01</span><h3>Specialised fabrication</h3><p>Long architectural pans, folds and system-specific clips/details require tighter coordination than ordinary exposed-fix profiles.</p></article><article className="info-card"><span>02</span><h3>Detailing</h3><p>Penetrations, transitions, ridges, barges and junctions often need custom architectural detailing.</p></article><article className="info-card"><span>03</span><h3>Substrate/support</h3><p>Some systems need specific support conditions; others use clip systems direct to purlins. The selected manufacturer detail controls the requirement.</p></article></div></div></section>

    <section className="section"><div className="container article-stack"><p>For a simpler metal roof with lower installed cost, compare <Link className="text-link" href="/roofing/corrugated">corrugated roofing</Link> and <Link className="text-link" href="/roofing/five-rib">five-rib roofing</Link>.</p><div><p className="eyebrow">Sources</p><h2>Evidence and manufacturer references</h2></div><Sources sources={sources} /></div></section>
    <section className="section section--sage"><div className="container faq-layout"><div><p className="eyebrow">FAQ</p><h2>Tray and standing-seam questions</h2></div><FaqBlock faqs={[
      { q: "Is architectural tray the same as standing seam?", a: "The terms overlap in everyday use, but systems differ. RoofHub groups concealed-fix architectural tray/standing-seam systems for high-level pricing while a real specification should identify the exact manufacturer profile and installation system." },
      { q: "Why is tray roofing more expensive than corrugate?", a: "The premium is driven by specialised systems, detailing, fabrication and installation rather than simply the amount of steel in each square metre." },
      { q: "Can standing seam be used on a low-pitch roof?", a: "Some concealed-fix tray systems can. The cited Metalcraft Espan 470 states a 3° minimum pitch subject to sheet-length requirements. Always use the exact manufacturer's current design rules." }
    ]} /></div></section>
  </>;
}
