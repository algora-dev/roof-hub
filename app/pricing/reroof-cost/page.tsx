import Link from "next/link";
import { ArticleSchema } from "@/components/evidence/ArticleSchema";
import { CornerstoneHeader } from "@/components/evidence/CornerstoneHeader";
import { FaqBlock } from "@/components/evidence/FaqBlock";
import { MethodologyNote } from "@/components/evidence/MethodologyNote";
import { PriceTable } from "@/components/evidence/PriceTable";
import { RelatedTool } from "@/components/evidence/RelatedTool";
import { Sources } from "@/components/evidence/Sources";
import { WorkedExample } from "@/components/evidence/WorkedExample";
import { evidenceRows, observationCount, observationSourceEntries } from "@/data/content";
import { TECHNICAL_SOURCES } from "@/data/technicalSources";
import { pageMetadata } from "@/lib/seo";

const PATH = "/pricing/reroof-cost";
const DESCRIPTION = "NZ re-roof cost guide covering new roof installation, old-roof removal, scaffold, disposal, Decramastic/asbestos risk and published 2026 project examples.";
const evidenceIds = ["bm-01", "bm-05", "rr-01", "rr-02", "rr-05", "bm-13", "bm-14", "tt-05", "tt-10", "rr-09"];
export const metadata = pageMetadata({ title: "Re-roof cost NZ — replacement roofing prices", description: DESCRIPTION, path: PATH });

export default function ReroofCostPage() {
  const sources = [...observationSourceEntries(evidenceIds), TECHNICAL_SOURCES.worksafeAsbestos];
  return <>
    <ArticleSchema headline="Re-roof cost in New Zealand" description={DESCRIPTION} path={PATH} />
    <CornerstoneHeader
      crumbs={[{ label: "Home", href: "/" }, { label: "Pricing", href: "/pricing" }, { label: "Re-roof cost" }]}
      eyebrow="Re-roof pricing · New Zealand"
      title="How much does a re-roof cost in NZ?"
      answer={<><p>For a re-roof, the useful calculation is <strong>new roof + removal/disposal + access/scaffolding + any repairs</strong>. Current public NZ examples span roughly <strong>$12,000–$35,000 for common long-run reroof jobs</strong>, while complete-project rates can be much higher for complex materials or difficult sites.</p><p>The existing roof matters because metal sheet, pressed tile, concrete tile and asbestos-containing products do not cost the same to remove.</p></>}
      facts={[{ label: "Project", value: "Existing roof replacement" }, { label: "Region", value: "New Zealand" }, { label: "Reviewed", value: "26 Sep 2026" }, { label: "Evidence used", value: `${observationCount(evidenceIds)} observations` }]}
    />

    <section className="section section--white"><div className="container article-stack"><div><p className="eyebrow">Published examples</p><h2>Observed NZ reroof pricing</h2><p>These sources do not all include the same scope. That is the point: a reroof number is only useful when removal, scaffold, GST and roof area are stated.</p></div><PriceTable caption="NZ reroof market observations" rows={evidenceRows(["bm-05", "rr-01", "rr-02", "rr-05", "bm-13", "bm-14"])} /><MethodologyNote version="2026.09-v1" reviewedAt="26 Sep 2026" evidenceCount={observationCount(evidenceIds)} gstBasis="shown per observation" /></div></section>

    <section className="section section--sage"><div className="container article-two-col"><div className="article-stack"><p className="eyebrow">Removal</p><h2>The existing roof changes the job before the new roof starts</h2><p>Long-run metal is generally simpler to strip and handle than heavy concrete tile. Pressed metal tile usually involves many smaller units and battens. Older Decramastic-type tiles need an asbestos risk check before normal removal assumptions are used.</p><p>Public NZ sources in RoofHub's dataset include generic old-roof removal observations of <strong>$20–$50/m²</strong> where GST was not stated, plus whole-job removal/disposal allowances. Treat these as market observations, not a universal removal tariff.</p></div><PriceTable caption="Published roof removal observations" rows={evidenceRows(["tt-10", "tt-05"])} /></div></section>

    <section className="section section--white"><div className="container article-stack"><div className="evidence-callout"><strong>Decramastic and asbestos:</strong> WorkSafe warns that older Decramastic roofing may contain asbestos and gives specific guidance for metal cladding lined with asbestos-containing bitumen. If asbestos is suspected, normal removal pricing should stop until the material is appropriately assessed/tested. Specialist removal can materially change the project cost.</div><WorkedExample title="How to structure a reroof estimate" lines={[{ label: "1. New roof", value: "roof covering + labour + underlay/components" }, { label: "2. Existing roof", value: "removal + disposal" }, { label: "3. Access", value: "edge protection or scaffold where required" }, { label: "4. Unknowns", value: "repairs, penetrations, difficult access, asbestos if relevant" }, { label: "Result", value: "low–high project range", highlight: true }]} note="This structure keeps the new-roof rate reusable and adds reroof-specific costs rather than burying them inside one opaque $/m² figure." /></div></section>

    <section className="section"><div className="container article-two-col"><div className="article-stack"><p className="eyebrow">What moves the price</p><h2>Why two roofs with the same area can price differently</h2><ul className="plain-list"><li>Existing roof material and disposal method</li><li>Single-storey vs two-storey access</li><li>Flat/easy ground vs sloping or restricted access</li><li>Roof pitch and walkability</li><li>Number of hips, valleys, penetrations and roof junctions</li><li>Substrate, purlin or framing repairs discovered after strip-off</li></ul><p>For the safety/access component, see <Link className="text-link" href="/pricing/scaffolding-cost">scaffolding and edge-protection costs</Link>.</p></div><RelatedTool title="Detailed re-roof estimator" href="/tools/detailed-roof-estimator" copy="Choose re-roof, identify the existing roof, enter or measure quantities, and keep removal/access separate in the result." /></div></section>

    <section className="section section--white"><div className="container article-stack"><div><p className="eyebrow">Sources</p><h2>Evidence used on this page</h2></div><Sources sources={sources} /></div></section>

    <section className="section section--sage"><div className="container faq-layout"><div><p className="eyebrow">FAQ</p><h2>Re-roof questions</h2></div><FaqBlock faqs={[
      { q: "What normally gets added to a new-roof price for a reroof?", a: "Removal and disposal of the existing roof are added first. Access/scaffolding may also be required, and repairs uncovered after strip-off can change the final quote." },
      { q: "Is concrete tile more expensive to remove than old long-run metal?", a: "It can be because concrete tile is heavier and handling/disposal differs. RoofHub keeps the existing-roof type as a separate estimator input rather than assuming one removal cost for everything." },
      { q: "Does Decramastic roofing always contain asbestos?", a: "No. But older Decramastic-type roofing may contain asbestos. WorkSafe advises identifying asbestos risk before work that could disturb older roofing materials. Testing or competent assessment may be needed." },
      { q: "Can I get a reroof estimate from plan area alone?", a: "Only approximately. Actual pitched roof area, overhangs and geometry matter. RoofHub can convert plan-view measurements using pitch when the input is clearly identified as plan area." }
    ]} /></div></section>
  </>;
}
