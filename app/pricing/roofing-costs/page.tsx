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
import { pageMetadata } from "@/lib/seo";

const PATH = "/pricing/roofing-costs";
const DESCRIPTION = "New Zealand roofing cost guide with published market observations for corrugated steel, pressed metal tile, tray roofing and complete reroof projects.";
const evidenceIds = ["rr-02", "tt-02", "tt-03", "rr-03", "rr-04", "rr-05", "bm-13", "bm-14", "rr-09"];

export const metadata = pageMetadata({ title: "Roofing costs NZ — 2026 price guide", description: DESCRIPTION, path: PATH });

export default function RoofingCostsPage() {
  const sources = observationSourceEntries(evidenceIds);
  return <>
    <ArticleSchema headline="Roofing costs in New Zealand — 2026 price guide" description={DESCRIPTION} path={PATH} />
    <CornerstoneHeader
      crumbs={[{ label: "Home", href: "/" }, { label: "Pricing", href: "/pricing" }, { label: "Roofing costs" }]}
      eyebrow="NZ roofing costs · 2026"
      title="How much does roofing cost in New Zealand?"
      answer={<><p>There is no single honest NZ roofing rate. Published NZ examples in RoofHub&apos;s verified dataset range from about <strong>$60–$65/m² for pressed-metal-tile supply-and-install examples where GST is not stated</strong> to <strong>$200–$280/m² incl GST for a complete standing-seam reroof example</strong>. The number only makes sense when the material, GST treatment, removal, scaffold and project scope are stated beside it.</p><p>RoofHub keeps those bases separate so you can compare like with like.</p></>}
      facts={[{ label: "Region", value: "New Zealand" }, { label: "Currency", value: "NZD" }, { label: "Reviewed", value: "26 Sep 2026" }, { label: "Evidence used", value: `${observationCount(evidenceIds)} recorded observations` }]}
    />

    <section className="section section--white"><div className="container article-stack">
      <div><p className="eyebrow">Published market evidence</p><h2>What current public NZ sources actually show</h2><p>The rows below deliberately preserve the source's own pricing basis. A complete reroof that includes removal and scaffold should not be compared directly with a supply-and-install roof covering rate.</p></div>
      <PriceTable caption="Published New Zealand roofing price observations" rows={evidenceRows(evidenceIds.slice(0, 6))} />
      <MethodologyNote version="2026.09-v1" reviewedAt="26 Sep 2026" evidenceCount={observationCount(evidenceIds)} gstBasis="shown per observation" />
    </div></section>

    <section className="section section--sage"><div className="container article-two-col">
      <div className="article-stack"><p className="eyebrow">Three price bases</p><h2>The same roof can have three very different “cost per m²” answers</h2><p><strong>Material only</strong> is the roof product before installation. <strong>Supply and install</strong> adds roofing labour and the agreed component scope. <strong>Complete reroof</strong> can also include removal, disposal, scaffolding, access and project-specific work.</p><p>RoofHub pages always label the basis rather than blending those numbers into one range.</p></div>
      <div className="stat-row"><div className="stat-card"><strong>Material</strong><span>product/supply only</span></div><div className="stat-card"><strong>Installed</strong><span>covering + labour</span></div><div className="stat-card"><strong>Reroof</strong><span>existing roof + access + new system</span></div></div>
    </div></section>

    <section className="section section--white"><div className="container article-stack">
      <div><p className="eyebrow">Worked example</p><h2>What a published complete-reroof rate means on a 200m² roof</h2></div>
      <WorkedExample title="200m² corrugated reroof using one published complete-project observation" lines={[{ label: "Roof area", value: "200 m²" }, { label: "Published observation", value: "$110–$145/m² incl GST" }, { label: "Arithmetic", value: "200 × $110 to 200 × $145" }, { label: "Indicative project span", value: "$22,000–$29,000 incl GST", highlight: true }]} note="This is a worked example using one source observation, not a RoofHub quote. The cited source describes the rate as including removal, scaffold and GST." />
      <div className="evidence-callout"><strong>Why RoofHub uses ranges:</strong> pitch, roof geometry, access, material specification, flashings, substrate repairs and the existing roof can move a job materially even when the plan area is identical.</div>
    </div></section>

    <section className="section"><div className="container article-two-col">
      <div className="article-stack"><p className="eyebrow">What to compare</p><h2>Before you compare two roofing prices</h2><ul className="plain-list"><li>Check whether GST is included.</li><li>Check whether scaffold or edge protection is included.</li><li>Check whether existing-roof removal and disposal are included.</li><li>Check whether the area is plan area or actual pitched roof area.</li><li>Check whether flashings, underlay, fixings and penetrations are included.</li><li>Check whether the quote allows for substrate or framing repairs.</li></ul><p>For a re-roof specifically, use the <Link className="text-link" href="/pricing/reroof-cost">NZ re-roof cost guide</Link>.</p></div>
      <RelatedTool title="Detailed roof estimator" href="/tools/detailed-roof-estimator" copy="Enter real roof quantities or measure from a plan, then see a preliminary low/high estimate with assumptions kept visible." />
    </div></section>

    <section className="section section--white"><div className="container article-stack"><div><p className="eyebrow">Evidence</p><h2>Sources used on this page</h2></div><Sources sources={sources} /></div></section>

    <section className="section section--sage"><div className="container faq-layout"><div><p className="eyebrow">FAQ</p><h2>Roofing cost questions</h2></div><FaqBlock faqs={[
      { q: "What is the cheapest metal roofing type in New Zealand?", a: "RoofHub's working estimating model places pressed metal tile marginally below corrugated long-run on a comparable straightforward roof, with five-rib only slightly above corrugate. Public sources use different inclusions, so compare the full scope rather than one headline rate." },
      { q: "Does a reroof cost more than a new roof?", a: "Usually, because a reroof adds removal and disposal of the existing roof and often needs access/scaffolding around an occupied building. The existing material can materially change the removal cost." },
      { q: "Should I price a roof from the house floor area?", a: "Not without adjustment. Plan or floor area does not automatically equal actual roof surface area. Pitch, overhangs and roof geometry change the quantity of roofing required." },
      { q: "Are RoofHub estimates quotes?", a: "No. RoofHub ranges are planning estimates based on recorded evidence and stated assumptions. A contractor must inspect the site and confirm the final scope before giving a binding quote." }
    ]} /></div></section>
  </>;
}
