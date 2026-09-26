import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Book, Calculator, Check, Layers, Measure, Shield } from "@/components/Icons";
import { SectionHeading } from "@/components/SectionHeading";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: { absolute: "RoofHub NZ — Roofing prices, guides & tools" },
  description: "Independent New Zealand roofing pricing, product guides and estimating tools for homeowners, roofers and building professionals.",
  path: "/"
});

const fastPaths = [
  { icon: Calculator, title: "Roofing costs", copy: "See what published NZ sources show, understand the pricing basis and compare material systems without mixing supply-only and complete-project figures.", href: "/pricing/roofing-costs", link: "See NZ roofing costs", tone: "tone-terracotta" },
  { icon: Layers, title: "Roofing systems", copy: "Corrugate, five-rib, pressed metal tile and architectural tray explained with manufacturer specifications and market evidence.", href: "/roofing", link: "Compare roof systems", tone: "" },
  { icon: Measure, title: "Measure a roof", copy: "Understand plan area, actual roof area, pitch factors, ridges, hips, valleys and the quantities that turn into a useful estimate.", href: "/guides/roof-area", link: "Roof measurement guide", tone: "" },
  { icon: Book, title: "Re-roofing", copy: "Separate the new roof from old-roof removal, disposal, scaffold, access and asbestos risk instead of hiding everything inside one rate.", href: "/pricing/reroof-cost", link: "See re-roof costs", tone: "tone-neutral" }
];

export default function HomePage() {
  return <>
    <section className="photo-hero">
      <Image className="photo-hero__image" src="/media/hero-home.webp" alt="New Zealand residential roofs" fill priority sizes="100vw" />
      <div className="photo-hero__shade" />
      <div className="container photo-hero__content">
        <div className="photo-hero__copy">
          <p className="eyebrow eyebrow--light">Independent NZ roofing information</p>
          <h1>Know what a roof should cost — and what the number actually includes.</h1>
          <p className="photo-hero__lede">RoofHub brings together New Zealand roofing prices, manufacturer specifications, practical guides and measurement tools so you can understand a project before asking for a quote.</p>
          <div className="button-row"><Link className="button button--primary button--large" href="/pricing/roofing-costs">Explore roofing costs <ArrowRight /></Link><Link className="button button--glass button--large" href="/tools/detailed-roof-estimator">Open detailed estimator</Link></div>
          <div className="hero-proof hero-proof--light"><span><Check /> Source-backed NZ evidence</span><span><Check /> Ranges, not fake precision</span><span><Check /> Useful before any enquiry</span></div>
        </div>
      </div>
    </section>

    <section className="trust-strip"><div className="container trust-grid"><div><Shield/><strong>Transparent methodology</strong><span>Source, date, GST basis and scope stay visible.</span></div><div><Calculator/><strong>Pricing that explains itself</strong><span>Material, installed and complete reroof figures stay separate.</span></div><div><Measure/><strong>Tools for real quantities</strong><span>Use approximate inputs or bring actual measurements.</span></div></div></section>

    <section className="section section--white"><div className="container"><SectionHeading eyebrow="Start with your question" title="Prices, systems and measurements — connected by one roofing data layer." copy={<p>RoofHub is designed so the guide you read and the tool you use are talking about the same roof, the same units and the same evidence.</p>} /><div className="fast-path-grid">{fastPaths.map(({icon:Icon,title,copy,href,link,tone})=><Link className={`fast-path-card ${tone}`} href={href} key={title}><span className="icon-tile"><Icon/></span><h3>{title}</h3><p>{copy}</p><span className="card-link">{link} <ArrowRight/></span></Link>)}</div></div></section>

    <section className="section section--sage"><div className="container feature-split"><div className="feature-copy"><p className="eyebrow">The RoofHub method</p><h2>Fragmented roofing information becomes something you can compare.</h2><p>Supplier prices, manufacturer specifications, published project examples and technical guidance are useful individually. RoofHub records the context around each one, then turns that evidence into comparisons, worked examples and tools.</p><Link className="text-link text-link--sage" href="/methodology">How RoofHub handles evidence <ArrowRight/></Link></div><ol className="process-stack process-stack--numbered"><li><span>01</span><div><strong>Collect</strong><p>Record the source, date, region, units, GST status and what the price includes.</p></div></li><li><span>02</span><div><strong>Separate</strong><p>Keep material-only, labour, supply-and-install and complete-project pricing distinct.</p></div></li><li><span>03</span><div><strong>Compare</strong><p>Show ranges and examples with assumptions instead of one unsupported headline number.</p></div></li><li><span>04</span><div><strong>Calculate</strong><p>Let the same data flow into useful measurement and estimating tools.</p></div></li></ol></div></section>

    <section className="section section--white"><div className="container"><SectionHeading eyebrow="Cornerstone guides" title="Go deeper on the roofing questions that change the answer." /><div className="editorial-list"><Link href="/pricing/roofing-costs"><div><span>Pricing</span><strong>How much does roofing cost in New Zealand?</strong><small>Market evidence · project scope · worked examples</small></div><ArrowRight/></Link><Link href="/pricing/reroof-cost"><div><span>Re-roofing</span><strong>What does a re-roof cost — and what gets added?</strong><small>Removal · disposal · scaffold · asbestos risk</small></div><ArrowRight/></Link><Link href="/roofing/long-run"><div><span>Roof systems</span><strong>Long-run metal roofing: corrugate vs five-rib</strong><small>Profiles · pitch · pricing evidence</small></div><ArrowRight/></Link><Link href="/guides/roof-pitch"><div><span>Measurement</span><strong>How roof pitch changes area and product choice</strong><small>Degrees · pitch factors · safety</small></div><ArrowRight/></Link></div></div></section>

    <section className="scenic-band"><Image className="scenic-band__image" src="/media/hero-secondary.webp" alt="Residential roofing in New Zealand" fill sizes="100vw" /><div className="scenic-band__shade"/><div className="container scenic-band__content"><p className="eyebrow eyebrow--light">Detailed estimator</p><h2>Bring the measurements you already have — or measure from a plan.</h2><p>The detailed RoofHub estimator accepts roof area plus ridges, hips, valleys, barges, rainwater items and custom components. It keeps plan-view measurements separate from actual roof measurements and shows a low/high range rather than pretending the first number is a quote.</p><Link className="button button--primary button--large" href="/tools/detailed-roof-estimator">Open the estimator <ArrowRight/></Link></div></section>
  </>;
}
