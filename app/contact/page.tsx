import Link from "next/link";
import { Check } from "@/components/Icons";
import { ContactForm } from "@/components/ContactForm";
import { ProjectEnquiryForm } from "@/components/ProjectEnquiryForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Project help, contact & corrections",
  description: "Ask RoofHub for project help, request roofing quote assistance, report a correction, suggest a source or send tool feedback.",
  path: "/contact"
});

const usefulContext = [
  "Roof details already entered in this browser tab",
  "The kind of help you want from RoofHub",
  "An existing quote or concern you want reviewed",
  "Your town or suburb when location matters to the project"
];

export default function ContactPage() {
  return <>
    <section className="page-intro page-intro--sage"><div className="container page-intro__grid"><div><p className="eyebrow">RoofHub help</p><h1>Project help, contact &amp; corrections.</h1></div><div className="page-intro__aside"><p>Use the project form when you want help with a roof, quote or next step. Use the general form for corrections, source suggestions and RoofHub feedback.</p></div></div></section>

    <section className="section section--white"><div className="container project-help-layout"><div><ProjectEnquiryForm /></div><aside className="project-help-aside"><p className="eyebrow">What carries through</p><h2>Do not retype the roof.</h2><ul className="check-list">{usefulContext.map(item => <li key={item}><Check /> {item}</li>)}</ul><p>The form only shares a project with roofing businesses if you explicitly select that option. See the privacy policy for how project and assistant data are handled.</p></aside></div></section>

    <section className="section section--sage"><div className="container feature-split"><div className="feature-copy"><p className="eyebrow">Corrections &amp; general contact</p><h2>Found a better source or something that needs fixing?</h2><p>RoofHub is built on traceable evidence. Send the page, source or issue and the team can re-check it before anything changes.</p><p>This form is also the place for general questions about RoofHub itself.</p></div><ContactForm /></div></section>

    <section className="section section--compact section--white"><div className="container cta-band"><div><p className="eyebrow">How corrections work</p><h2>Sources are re-checked before a figure changes.</h2><p>When a pricing observation changes, RoofHub keeps the source context and updates the review date rather than silently replacing the history.</p></div><Link className="button button--secondary button--large" href="/methodology">Read the methodology</Link></div></section>
  </>;
}
