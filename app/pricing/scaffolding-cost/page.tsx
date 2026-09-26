import Link from "next/link";
import { ArticleSchema } from "@/components/evidence/ArticleSchema";
import { CornerstoneHeader } from "@/components/evidence/CornerstoneHeader";
import { FaqBlock } from "@/components/evidence/FaqBlock";
import { PriceTable } from "@/components/evidence/PriceTable";
import { Sources } from "@/components/evidence/Sources";
import { evidenceRows, observationSourceEntries } from "@/data/content";
import { TECHNICAL_SOURCES } from "@/data/technicalSources";
import { pageMetadata } from "@/lib/seo";

const PATH = "/pricing/scaffolding-cost";
const DESCRIPTION = "NZ roof scaffolding and edge-protection cost guide covering single-storey and two-storey work, weekly hire, difficult sites and WorkSafe roof-edge requirements.";
const ids = ["lr-03", "lr-08", "rr-09", "rr-10", "rr-11", "rr-12", "tt-11"];
export const metadata = pageMetadata({ title: "Roof scaffolding cost NZ — edge protection & hire", description: DESCRIPTION, path: PATH });

export default function ScaffoldingCostPage() {
  const sources = [...observationSourceEntries(ids), TECHNICAL_SOURCES.worksafeScaffold, TECHNICAL_SOURCES.worksafeRoofs];
  return <>
    <ArticleSchema headline="Roof scaffolding and edge protection costs in New Zealand" description={DESCRIPTION} path={PATH} />
    <CornerstoneHeader crumbs={[{label:"Home",href:"/"},{label:"Pricing",href:"/pricing"},{label:"Scaffolding cost"}]} eyebrow="Roof access & fall protection" title="How much does roof scaffolding cost in NZ?" answer={<><p>Public NZ scaffold pricing varies because a “scaffold cost” may mean a weekly hire, a whole-house wrap, a two-week reroof package or scaffold already bundled into a roofing quote. RoofHub's recorded public observations include <strong>$600–$1,200/week for one single-storey hire guide</strong> and <strong>$3,000–$7,000 for one reroof edge/scaffold package</strong>, with other whole-job examples extending higher.</p><p>Height, perimeter, ground conditions, access and hire duration all matter.</p></>} facts={[{label:"Main drivers",value:"perimeter + height + site"},{label:"Single storey",value:"edge protection may be an option"},{label:"Two storey",value:"full scaffold budget"},{label:"Reviewed",value:"26 Sep 2026"}]} />

    <section className="section section--white"><div className="container article-stack"><div><p className="eyebrow">Published NZ evidence</p><h2>Scaffold price observations</h2></div><PriceTable caption="Roof scaffold market observations" rows={evidenceRows(ids)} /><p className="source-note">Some observations are whole-job totals and others are weekly or per-square-metre rates. Do not average them together without normalising scope.</p></div></section>

    <section className="section section--sage"><div className="container article-two-col"><div className="article-stack"><p className="eyebrow">Edge protection</p><h2>Single-storey reroofs may not always need a full four-plank wrap</h2><p>WorkSafe recognises temporary edge protection and/or scaffolding as fall-prevention controls where there is a risk of falling from a roof. Proprietary edge-protection systems are available for residential roofing situations and should comply with the relevant temporary edge-protection standards.</p><p>RoofHub's estimator only offers edge protection as a simple option for single-storey work. Two-storey jobs are budgeted as full scaffold because site-specific engineering/access decisions become more important.</p></div><div className="evidence-callout"><strong>Roof pitch matters:</strong> WorkSafe distinguishes configurations above and below 25°. For roof slopes over 35°, edge protection should be designed specifically rather than estimated as a generic standard system.</div></div></section>

    <section className="section section--white"><div className="container article-stack"><div><p className="eyebrow">Why lineal metres help</p><h2>A roofing scaffold estimator needs perimeter, not just roof area</h2></div><p>A 200 m² roof can sit over a compact two-storey footprint or a sprawling single-storey footprint. Those buildings can have very different scaffold quantities even though the roof area is similar. RoofHub therefore keeps <strong>scaffold perimeter</strong> separate from roof surface area in the detailed estimator.</p><div className="three-col"><article className="info-card"><span>01</span><h3>Height</h3><p>Two-storey scaffold requires more structure, labour and material than single-storey work.</p></article><article className="info-card"><span>02</span><h3>Ground</h3><p>Sloping or constrained sites can increase setup effort and require different base/tie arrangements.</p></article><article className="info-card"><span>03</span><h3>Duration</h3><p>Many quotes include an initial hire period; extra weeks can add recurring hire cost.</p></article></div></div></section>

    <section className="section"><div className="container article-stack"><p>For a re-roof, scaffold is normally an access/safety layer added after the roof and removal quantities are understood. See the <Link className="text-link" href="/pricing/reroof-cost">re-roof cost guide</Link>.</p><div><p className="eyebrow">Sources</p><h2>Pricing and safety references</h2></div><Sources sources={sources} /></div></section>
    <section className="section section--sage"><div className="container faq-layout"><div><p className="eyebrow">FAQ</p><h2>Scaffolding questions</h2></div><FaqBlock faqs={[
      {q:"Can edge protection be used for a single-storey reroof in New Zealand?",a:"Yes, appropriate temporary edge-protection systems are a recognised fall-prevention option. Suitability depends on the roof, pitch, access and system design, so RoofHub treats it as a planning option rather than a compliance decision."},
      {q:"Why not price scaffold only from roof square metres?",a:"Because scaffold quantity follows building perimeter, height and access more directly than roof surface area. RoofHub asks for a separate scaffold perimeter in the detailed estimator."},
      {q:"Does a hillside site usually cost more?",a:"It can. Uneven or sloping ground can make erection, levelling, access and stabilisation more involved. The actual scaffold provider must confirm the design and price."}
    ]} /></div></section>
  </>;
}
