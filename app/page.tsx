import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calculator, Check, Layers, Measure, Shield, Spark } from "@/components/Icons";
import { SectionHeading } from "@/components/SectionHeading";
import { QuestionLinks } from "@/components/content/QuestionLinks";
import { AssistantHeroPrompt } from "@/components/assistant/AssistantHeroPrompt";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: { absolute: "RoofHub NZ | New Zealand roofing answers, pricing and tools" },
  description: "Independent New Zealand roofing knowledge, pricing, estimating tools and practical decision support for homeowners, builders, roofers and building professionals.",
  path: "/"
});

const fastPaths = [
  { icon: Calculator, title: "Estimate a roof", copy: "Start with approximate shape, size and pitch. You do not need measurements, and you can refine the same project later.", href: "/tools/roof-estimate", link: "Start a quick estimate", tone: "tone-terracotta" },
  { icon: Layers, title: "Compare roofing systems", copy: "Understand corrugate, five-rib, pressed metal tile and architectural tray using NZ product and market evidence.", href: "/roofing", link: "Compare roof systems", tone: "" },
  { icon: Measure, title: "Use measurements", copy: "Already have quantities or plans? Move straight into the detailed estimator and build a measured low/high allowance.", href: "/tools/detailed-roof-estimator", link: "Open detailed estimator", tone: "" },
  { icon: Check, title: "Check a roofing quote", copy: "Already have a written price? Compare GST, product and scope against the same RoofHub project before judging the headline total.", href: "/tools/quote-checker", link: "Check a quote", tone: "tone-neutral" }
];

const useCases = [
  { title: "Early project budgeting", copy: "Get a broad roofing allowance when the design or measurements are still incomplete." },
  { title: "Measured estimating", copy: "Use actual roof areas, ridges, hips, valleys and other components when you need more control." },
  { title: "Product decisions", copy: "Compare profiles, pitch requirements, pricing evidence and practical trade-offs before specifying a system." },
  { title: "Quote context", copy: "Understand what a roofing quote should include and why two legitimate quotes can differ materially." }
];

export default function HomePage() {
  return <>
    <section className="photo-hero photo-hero--product">
      <Image className="photo-hero__image" src="/media/hero-home.webp" alt="New Zealand residential roofs" fill priority sizes="100vw" />
      <div className="photo-hero__shade" />
      <div className="container photo-hero__content home-hero-grid">
        <div className="photo-hero__copy">
          <p className="eyebrow eyebrow--light">Independent New Zealand roofing platform</p>
          <h1>New Zealand roofing answers, pricing and tools in one place.</h1>
          <p className="photo-hero__lede">Research a product, estimate a roof with or without measurements, check published pricing, use detailed takeoff tools or ask RoofHub a question.</p>
          <div className="button-row"><Link className="button button--primary button--large" href="/tools/roof-estimate">Estimate a roof <ArrowRight /></Link><Link className="button button--glass button--large" href="/tools/quote-checker">Check a quote</Link></div>
          <div className="hero-proof hero-proof--light"><span><Check /> No measurements required to start</span><span><Check /> NZ source-backed evidence</span><span><Check /> Simple through to detailed tools</span></div>
        </div>
        <div className="home-hero-assistant"><AssistantHeroPrompt /></div>
      </div>
    </section>

    <section className="trust-strip"><div className="container trust-grid"><div><Shield/><strong>Independent evidence</strong><span>Sources, dates, GST basis and scope stay visible.</span></div><div><Calculator/><strong>Deterministic pricing</strong><span>RoofHub software calculates project ranges. AI does not invent prices.</span></div><div><Spark/><strong>Ask RoofHub anywhere</strong><span>Get help with a page, a tool step or a roofing question without starting over.</span></div></div></section>

    <section className="section section--white"><div className="container"><SectionHeading eyebrow="Start where you are" title="Simple when you need simple. Detailed when you need detailed." copy={<p>RoofHub is useful whether you know almost nothing about the roof or already have a complete set of quantities.</p>} /><div className="fast-path-grid">{fastPaths.map(({icon:Icon,title,copy,href,link,tone})=><Link className={`fast-path-card ${tone}`} href={href} key={title}><span className="icon-tile"><Icon/></span><h3>{title}</h3><p>{copy}</p><span className="card-link">{link} <ArrowRight/></span></Link>)}</div></div></section>

    <section className="section section--sage"><div className="container"><SectionHeading eyebrow="One platform, different jobs" title="Useful whether you are researching, budgeting, measuring or pricing." copy={<p>You do not need to choose a user type first. Start with the task, then add detail only when it improves the answer.</p>} /><div className="use-case-grid">{useCases.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div></div></section>

    <section className="section section--white"><div className="container"><SectionHeading eyebrow="Questions New Zealanders are asking" title="Useful answers first. A tool when it helps." copy={<p>Research the issue, see what the evidence actually says, then apply it to a project without re-entering everything.</p>} /><QuestionLinks ids={["compare-quotes", "new-roof-cost", "corrugate-vs-five", "lifespan", "colorsteel-zincalume", "membrane"]}/><p style={{marginTop:24}}><Link className="text-link" href="/guides">Explore all roofing questions →</Link></p></div></section>

    <section className="section section--sage"><div className="container feature-split"><div className="feature-copy"><p className="eyebrow">The RoofHub method</p><h2>Market evidence and estimating logic stay separate.</h2><p>Supplier prices, manufacturer specifications, published project examples and technical guidance provide useful evidence. RoofHub keeps that evidence traceable, then uses an explicitly versioned estimator model when calculating a project.</p><Link className="text-link text-link--sage" href="/methodology">How RoofHub handles evidence <ArrowRight/></Link></div><ol className="process-stack process-stack--numbered"><li><span>01</span><div><strong>Research</strong><p>Record the source, date, region, units, GST status and what a published number actually covers.</p></div></li><li><span>02</span><div><strong>Separate</strong><p>Keep market observations distinct from RoofHub's approved estimator rates and assumptions.</p></div></li><li><span>03</span><div><strong>Calculate</strong><p>Turn approximate or measured roof quantities into a transparent low/high project range.</p></div></li><li><span>04</span><div><strong>Refine</strong><p>Replace assumptions with real measurements or site information without restarting the project.</p></div></li></ol></div></section>

    <section className="section section--white"><div className="container"><SectionHeading eyebrow="Cornerstone guides" title="Go deeper on the roofing questions that change the answer." /><div className="editorial-list"><Link href="/pricing/roofing-costs"><div><span>Pricing</span><strong>How much does roofing cost in New Zealand?</strong><small>Market evidence · project scope · worked examples</small></div><ArrowRight/></Link><Link href="/pricing/reroof-cost"><div><span>Re-roofing</span><strong>What does a roof replacement cost, and what gets added?</strong><small>Removal · disposal · scaffold · existing-condition risk</small></div><ArrowRight/></Link><Link href="/pricing/new-roof-cost"><div><span>New builds</span><strong>What should a new-build roof allowance include?</strong><small>Area · profile · geometry · access · scope</small></div><ArrowRight/></Link><Link href="/guides/roof-pitch"><div><span>Measurement</span><strong>How roof pitch changes area and product choice</strong><small>Degrees · pitch factors · safety</small></div><ArrowRight/></Link></div></div></section>

    <section className="scenic-band"><Image className="scenic-band__image" src="/media/hero-secondary.webp" alt="Residential roofing in New Zealand" fill sizes="100vw" /><div className="scenic-band__shade"/><div className="container scenic-band__content"><p className="eyebrow eyebrow--light">Advanced tools</p><h2>Already have measurements or plans?</h2><p>Move straight into the detailed RoofHub estimator. Enter roof area plus ridges, hips, valleys, barges, rainwater items and custom components, then refine the same project as better information becomes available.</p><Link className="button button--primary button--large" href="/tools/detailed-roof-estimator">Use the detailed estimator <ArrowRight/></Link></div></section>
  </>;
}
