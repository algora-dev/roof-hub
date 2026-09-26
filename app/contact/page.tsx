import Link from "next/link";
import { ArrowRight, Check } from "@/components/Icons";
import { CONTACT_EMAIL, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact & corrections",
  description: "Report a correction, suggest a pricing source, or send a general enquiry to RoofHub.",
  path: "/contact"
});

const routes = [
  { n: "01", t: "Report a correction", c: "A number that looks wrong, an outdated figure, a broken link or a claim that needs a source. Include the page URL and, if possible, a better source." },
  { n: "02", t: "Suggest a source", c: "Manufacturer price lists, supplier pages, scaffolder rates or published project examples — public New Zealand sources we can record as observations." },
  { n: "03", t: "General enquiry", c: "Feedback on the tools, questions about the methodology, or anything else useful." }
];

const usefulContext = [
  "The page URL you are writing about",
  "What looks wrong or unclear",
  "A source link, if you have one",
  "The region, if it is pricing-related"
];

export default function ContactPage() {
  return <>
    <section className="page-intro page-intro--sage">
      <div className="container page-intro__grid">
        <div><p className="eyebrow">Contact</p><h1>Contact &amp; corrections.</h1></div>
        <div className="page-intro__aside"><p>RoofHub is built on source-backed information. If something looks wrong, telling us is the most useful thing you can do — corrections are welcome, not awkward.</p></div>
      </div>
    </section>

    <section className="section section--white"><div className="container">
      <div className="driver-grid">
        {routes.map((r) => <article key={r.n}><span>{r.n}</span><h3>{r.t}</h3><p>{r.c}</p></article>)}
      </div>
    </div></section>

    <section className="section section--sage"><div className="container feature-split">
      <div className="feature-copy">
        <p className="eyebrow">Email</p>
        <h2>One mailbox, answered by a human.</h2>
        <p>Sending useful context with your message gets it fixed faster:</p>
        <ul className="check-list">
          {usefulContext.map((item) => <li key={item}><Check /> {item}</li>)}
        </ul>
      </div>
      <div>
        {CONTACT_EMAIL ? (
          <>
            <p className="eyebrow">Write to</p>
            <p><a className="text-link text-link--sage" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
            <p><a className="button button--primary button--large" href={`mailto:${CONTACT_EMAIL}`}>Send an email <ArrowRight /></a></p>
          </>
        ) : (
          <div className="draft-notice"><strong>Corrections mailbox:</strong> a dedicated RoofHub mailbox is being configured. This page will carry the address as soon as it is live. In the meantime, the methodology page explains how published figures are reviewed.</div>
        )}
      </div>
    </div></section>

    <section className="section section--compact section--white"><div className="container cta-band">
      <div><p className="eyebrow">Before you write</p><h2>How RoofHub handles corrections.</h2><p>Corrections are reviewed against the recorded observation, the source is re-checked, and the page is updated with a new review date if the number changes.</p></div>
      <Link className="button button--secondary button--large" href="/methodology">Read the methodology <ArrowRight /></Link>
    </div></section>
  </>;
}
