import Link from "next/link";
import { Check } from "@/components/Icons";
import { ContactForm } from "@/components/ContactForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact & corrections",
  description: "Report a correction, suggest a roofing pricing source, send tool feedback or contact RoofHub through a private form.",
  path: "/contact"
});

const routes = [
  { n: "01", t: "Report a correction", c: "Tell us about an outdated figure, broken source, unclear claim or calculation that needs another look." },
  { n: "02", t: "Suggest a source", c: "Send a manufacturer page, supplier price, scaffolding rate or published New Zealand project example." },
  { n: "03", t: "General enquiry", c: "Questions about RoofHub, its tools, the methodology or a roofing estimate can all use the same form." }
];

const usefulContext = [
  "The RoofHub page you are writing about",
  "What looks wrong, unclear or incomplete",
  "A public source link, if you have one",
  "The region if the issue is pricing-related"
];

export default function ContactPage() {
  return <>
    <section className="page-intro page-intro--sage">
      <div className="container page-intro__grid">
        <div><p className="eyebrow">Contact</p><h1>Contact &amp; corrections.</h1></div>
        <div className="page-intro__aside"><p>RoofHub is built on source-backed information. Corrections, stronger sources and practical feedback make the platform more useful for everyone.</p></div>
      </div>
    </section>

    <section className="section section--white"><div className="container">
      <div className="driver-grid">
        {routes.map((r) => <article key={r.n}><span>{r.n}</span><h3>{r.t}</h3><p>{r.c}</p></article>)}
      </div>
    </div></section>

    <section className="section section--sage"><div className="container feature-split">
      <div className="feature-copy">
        <p className="eyebrow">Useful context</p>
        <h2>Send enough detail for us to check it properly.</h2>
        <ul className="check-list">{usefulContext.map((item) => <li key={item}><Check /> {item}</li>)}</ul>
        <p>Your message is sent privately to the RoofHub team. No public email address is displayed or required.</p>
      </div>
      <ContactForm />
    </div></section>

    <section className="section section--compact section--white"><div className="container cta-band">
      <div><p className="eyebrow">How corrections work</p><h2>Sources are re-checked before a figure changes.</h2><p>When a pricing observation changes, RoofHub keeps the source context and updates the review date rather than silently replacing the history.</p></div>
      <Link className="button button--secondary button--large" href="/methodology">Read the methodology</Link>
    </div></section>
  </>;
}
