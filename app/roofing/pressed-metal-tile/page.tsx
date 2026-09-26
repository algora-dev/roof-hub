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

const PATH = "/roofing/pressed-metal-tile";
const DESCRIPTION = "Pressed metal tile roofing NZ guide covering Gerard-style steel tiles, pitch, battens and underlay, pricing evidence, reroofing and Decramastic/asbestos considerations.";
const ids = ["rr-05", "tt-02", "tt-03", "tt-08", "tt-09"];
export const metadata = pageMetadata({ title: "Pressed metal tile roofing NZ — cost & reroof guide", description: DESCRIPTION, path: PATH });

export default function PressedMetalTilePage() {
  const sources = [...observationSourceEntries(ids), TECHNICAL_SOURCES.gerardBond, TECHNICAL_SOURCES.gerardMilano, TECHNICAL_SOURCES.worksafeAsbestos];
  return <>
    <ArticleSchema headline="Pressed metal tile roofing in New Zealand" description={DESCRIPTION} path={PATH} />
    <CornerstoneHeader
      crumbs={[{ label: "Home", href: "/" }, { label: "Roofing", href: "/roofing" }, { label: "Pressed metal tile" }]}
      eyebrow="Pressed steel roof tiles"
      title="Pressed metal tile roofing in NZ: cost, pitch and reroof considerations"
      answer={<><p>Pressed metal tile uses lightweight profiled steel panels laid in courses over battens. In RoofHub's working price hierarchy it is the <strong>lowest-cost mainstream metal-roof option by a small margin</strong> on a comparable straightforward roof, followed closely by corrugate and then five-rib.</p><p>Published NZ pricing is inconsistent because some sources quote covering supply/install while others include reroof removal and scaffold.</p></>}
      facts={[{ label: "Format", value: "Pressed steel tile panels" }, { label: "Example pitch", value: "12° min on cited Gerard systems" }, { label: "Example cover", value: "~0.45–0.47 m²/panel" }, { label: "Reviewed", value: "26 Sep 2026" }]}
    />

    <section className="section section--white"><div className="container article-stack"><div><p className="eyebrow">Pricing evidence</p><h2>Published pressed-metal-tile pricing</h2><p>Verified observations in RoofHub's dataset include <strong>$60–$65/m² supply-and-install examples with GST not stated</strong>, while a separate complete reroof source places Metrotile stone-chip roofing at <strong>$150–$210/m² incl GST</strong>. The scope and GST basis are more important than the apparent price gap.</p></div><PriceTable caption="Pressed metal tile price observations" rows={evidenceRows(ids)} /></div></section>

    <section className="section section--sage"><div className="container article-two-col"><div className="article-stack"><p className="eyebrow">How the system is installed</p><h2>Battens are part of the pressed-tile workflow</h2><p>Pressed metal tile is installed differently from standard long-run sheet roofing. RoofHub's labour model assumes the roofer installs underlay and tile battens as part of the pressed-tile installation workflow, while long-run pricing assumes the supporting purlins/framing are already available for the roofer.</p><p>Batten <em>materials</em> remain a separate allowance unless the chosen system/quote says they are included.</p></div><RelatedTool title="Estimate a pressed-metal-tile roof" href="/tools/detailed-roof-estimator" copy="Choose pressed metal tile, add the actual roof area and keep reroof removal/access separate." /></div></section>

    <section className="section section--white"><div className="container article-stack"><div><p className="eyebrow">Product reference</p><h2>Gerard Bond and Milano illustrate the system format</h2></div><div className="three-col"><article className="info-card"><span>Bond</span><h3>~0.47 m² cover per panel</h3><p>Gerard lists Bond at 1265 mm cover length × 368 mm cover width and a 12° minimum pitch.</p></article><article className="info-card"><span>Milano</span><h3>~0.45 m² cover per panel</h3><p>Gerard lists Milano at 1210 mm cover length × 368 mm cover width and a 12° minimum pitch.</p></article><article className="info-card"><span>System</span><h3>Tiles + accessories</h3><p>Ridges, valleys, barges and flashings belong to the selected pressed-tile system rather than generic long-run flashings.</p></article></div></div></section>

    <section className="section"><div className="container article-stack"><div className="evidence-callout"><strong>Decramastic is not automatically asbestos-free.</strong> WorkSafe warns that older Decramastic roofing may contain asbestos and publishes guidance for metal cladding lined with asbestos-containing bitumen. A reroof estimator should not apply the ordinary non-asbestos removal rate until that risk is appropriately resolved.</div><p>For the full replacement-cost structure, use the <Link className="text-link" href="/pricing/reroof-cost">re-roof cost guide</Link>.</p></div></section>

    <section className="section section--white"><div className="container article-stack"><div><p className="eyebrow">Sources</p><h2>Evidence and manufacturer references</h2></div><Sources sources={sources} /></div></section>
    <section className="section section--sage"><div className="container faq-layout"><div><p className="eyebrow">FAQ</p><h2>Pressed metal tile questions</h2></div><FaqBlock faqs={[
      { q: "Is pressed metal tile cheaper than corrugated long-run?", a: "RoofHub's working estimator is designed so pressed metal tile is only marginally cheaper on a comparable straightforward roof. Public sources vary because their inclusions differ, so this is a modelling relationship rather than a universal market tariff." },
      { q: "Does pressed metal tile need battens?", a: "Pressed metal tile systems are installed in courses over battens. RoofHub's labour model treats batten installation as part of the tile workflow, while batten material supply remains separately identifiable." },
      { q: "Can old Decramastic tiles contain asbestos?", a: "Yes, some older Decramastic roofing can contain asbestos in the bituminous layer. WorkSafe recommends identifying asbestos risk before work that could disturb older roofing materials." }
    ]} /></div></section>
  </>;
}
