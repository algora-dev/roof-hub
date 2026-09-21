import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Book, Calculator, Camera, Check, Layers, Measure, Shield, Spark } from "@/components/Icons";
import { SectionHeading } from "@/components/SectionHeading";

const fastPaths = [
  { icon: Calculator, title: "Price a roof", copy: "Explore the structure of a transparent NZ roofing estimate.", href: "/pricing", tone: "terracotta" },
  { icon: Measure, title: "Measure a roof", copy: "A home for plan, satellite and dimension-based measurement tools.", href: "/tools", tone: "sage" },
  { icon: Camera, title: "Identify & assess", copy: "Photo and plan analysis will plug into the same approved roofing core.", href: "/tools", tone: "sage" },
  { icon: Layers, title: "Plan the project", copy: "Compare options, understand scope and prepare better questions.", href: "/guides", tone: "neutral" }
];

const decisions = [
  ["Repair or replace?", "Understand the factors that change the answer before booking an inspection."],
  ["What should a quote include?", "Know the scope items, assumptions and exclusions worth checking."],
  ["Which material suits?", "Compare roofing systems by use case rather than forcing one universal winner."],
  ["How big is the roof?", "Turn dimensions, plans or imagery into a preliminary working area."]
];

export default function HomePage() {
  return (
    <>
      <section className="hero hero--home">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">New Zealand roofing made clearer</p>
            <h1>Know more.<br/><span>Build brighter.</span></h1>
            <p className="hero-lede">Practical roofing research, pricing, measurement and project-planning tools for New Zealand homes and properties — useful before you ever contact a roofer.</p>
            <div className="button-row"><Link className="button button--primary button--large" href="/pricing">Explore pricing <ArrowRight /></Link><Link className="button button--outline button--large" href="/tools">View tools</Link></div>
            <div className="hero-proof"><span><Check /> Useful answers first</span><span><Check /> Transparent assumptions</span><span><Check /> Built around NZ conditions</span></div>
          </div>
          <div className="hero-visual hero-visual--photo" aria-label="RoofHub project planning example">
            <Image className="hero-photo" src="/media/hero-home.webp" alt="Contemporary metal-roofed home in a New Zealand alpine and lakeside setting" fill priority sizes="(max-width: 980px) 100vw, 48vw" />
            <div className="hero-photo-shade" aria-hidden="true" />
            <div className="project-panel">
              <div className="project-panel__top"><span className="status-dot"/> Project snapshot <span className="draft-chip">demo</span></div>
              <div className="project-panel__metric"><small>Estimated roof area</small><strong>186 m²</strong><span>preliminary</span></div>
              <div className="project-panel__grid"><div><small>Pitch</small><b>22°</b></div><div><small>Likely system</small><b>Long-run steel</b></div></div>
              <div className="project-panel__bar"><span style={{width:"74%"}}/></div>
              <p>Measurements, pricing context, assumptions and practical next steps in one place.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <SectionHeading eyebrow="Start with the question you have" title="Four useful ways into RoofHub" copy={<p>No generic lead form first. Start with the decision, calculation or explanation you actually need.</p>} />
          <div className="fast-path-grid">{fastPaths.map(({icon: Icon, title, copy, href, tone}) => <Link className={`fast-path-card tone-${tone}`} href={href} key={title}><span className="icon-tile"><Icon /></span><h3>{title}</h3><p>{copy}</p><span className="card-link">Explore <ArrowRight /></span></Link>)}</div>
        </div>
      </section>

      <section className="trust-strip"><div className="container trust-grid"><div><Shield/><strong>Evidence over guesswork</strong><span>Methodology and sources should sit alongside important claims.</span></div><div><Spark/><strong>AI where it is genuinely useful</strong><span>Analysis should orchestrate trusted tools, not invent technical rules.</span></div><div><Book/><strong>Useful without an enquiry</strong><span>The site should help even if the visitor never submits contact details.</span></div></div></section>

      <section className="section section--sage-soft">
        <div className="container feature-split">
          <div><p className="eyebrow">Built for New Zealand</p><h2>Roofing decisions change with the property and the place.</h2><p>Coastal exposure, high wind, alpine conditions, roof pitch, access and existing materials can all change the right next step. RoofHub should explain those variables without pretending one answer fits every project.</p><Link className="text-link" href="/about">How RoofHub works <ArrowRight /></Link></div>
          <div className="stack-list"><div><span>01</span><div><strong>Research</strong><p>Clear, source-aware explanations for real roofing decisions.</p></div></div><div><span>02</span><div><strong>Calculate</strong><p>Deterministic tools for price, area, pitch and quantities.</p></div></div><div><span>03</span><div><strong>Assess</strong><p>Preliminary image and plan analysis with uncertainty preserved.</p></div></div><div><span>04</span><div><strong>Act</strong><p>When useful, ask RoofHub which type of specialist is the best fit.</p></div></div></div>
        </div>
      </section>

      <section className="section"><div className="container"><SectionHeading eyebrow="Real questions, structured properly" title="Roofing decisions people actually need to make" copy={<p>These are representative content directions for the build — not a mass-produced blog plan.</p>} /><div className="decision-grid">{decisions.map(([title, copy], i) => <article className="decision-card" key={title}><span>0{i+1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

      <section className="section section--dark"><div className="container dark-cta"><div><p className="eyebrow">Prototype, not published pricing</p><h2>See how a real RoofHub tool result could feel.</h2><p>The pricing page contains a working prototype interaction so we can test the visual hierarchy before integrating the actual pricing engine.</p></div><Link className="button button--primary button--large" href="/pricing">Try the pricing prototype <ArrowRight /></Link></div></section>

      <section className="section"><div className="container"><SectionHeading eyebrow="Guides & research" title="Build confidence before the quote" /><div className="resource-grid"><Link className="resource-card resource-card--feature" href="/guides/how-to-prepare-for-a-roofing-quote"><div className="resource-photo"><Image src="/media/guide-roof-1.webp" alt="New Zealand roof and eave detail" fill sizes="(max-width: 680px) 100vw, 40vw" /></div><p className="eyebrow">5 min guide</p><h3>How to prepare for a roofing quote</h3><p>A practical checklist for getting comparable, useful roofing quotes.</p><span className="card-link">Read guide <ArrowRight /></span></Link><div className="resource-card resource-card--muted"><div className="resource-photo"><Image src="/media/guide-roof-3.webp" alt="Residential roofing detail" fill sizes="(max-width: 680px) 100vw, 28vw" /></div><p className="eyebrow">Coming next</p><h3>What does a reroof price actually include?</h3><p>Scope, removal, access, flashings, underlay, disposal and other project variables.</p></div><div className="resource-card resource-card--muted"><div className="resource-photo"><Image src="/media/guide-roof-4.webp" alt="Close-up metal roofing profile" fill sizes="(max-width: 680px) 100vw, 28vw" /></div><p className="eyebrow">Coming next</p><h3>How roof area and pitch affect the project</h3><p>A plain-English explanation of measured area, plan area, pitch and waste.</p></div></div></div></section>
    </>
  );
}
