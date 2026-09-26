import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms & disclaimer",
  description: "Terms of use for RoofHub, including the limitations of preliminary estimates and measurement tools.",
  path: "/terms"
});

const sections = [
  {
    h: "Information, not advice",
    body: [
      "RoofHub publishes general roofing information, indicative price ranges and preliminary measurement tools for New Zealand. This content is informational only. It is not building, engineering, legal or financial advice, and it is not a substitute for an on-site assessment by a qualified professional."
    ]
  },
  {
    h: "Estimates are not quotes",
    body: [
      "Any figure produced by a RoofHub calculator is a preliminary estimate designed to support planning. It is not a quote, an offer or a fixed price. Only a licensed roofing contractor who has inspected your property can provide a binding price. Verify anything important here against real quotes before making decisions or commitments."
    ]
  },
  {
    h: "Accuracy and limitations",
    body: [
      "We work to keep information accurate, sourced and dated, but roofing pricing varies by region, access, geometry, material availability and site condition. Figures may be out of date or may not reflect your situation. Tools state their assumptions and limitations on the page where they appear — read them alongside any result."
    ]
  },
  {
    h: "No warranty",
    body: [
      "RoofHub content and tools are provided \"as is\" without warranty of completeness, accuracy or fitness for a particular purpose. To the maximum extent permitted by New Zealand law, RoofHub is not liable for loss arising from reliance on information or estimates published here."
    ]
  },
  {
    h: "Intellectual property and corrections",
    body: [
      "Original RoofHub text, diagrams and derived data ranges are owned by RoofHub. Third-party material is attributed to its source and remains the property of its publishers. If you believe something here is wrong, the corrections route is on the contact page."
    ]
  },
  {
    h: "Governing law",
    body: [
      "These terms are governed by the laws of New Zealand. Using this site means you accept them; if you do not accept them, please do not use the site."
    ]
  }
];

export default function TermsPage() {
  return <>
    <section className="page-intro page-intro--terracotta">
      <div className="container page-intro__grid">
        <div><p className="eyebrow">Legal</p><h1>Terms &amp; estimator disclaimer.</h1></div>
        <div className="page-intro__aside"><p>The short version: RoofHub gives you planning information and preliminary estimates. It does not give you a quote, a warranty or professional advice.</p></div>
      </div>
    </section>
    <section className="section section--white">
      <div className="container narrow">
        <p><strong>Last updated: 26 September 2026.</strong></p>
        {sections.map((s) => <div key={s.h}><h2>{s.h}</h2>{s.body.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}</div>)}
        <p>Questions about these terms? <Link className="text-link" href="/contact">Contact us</Link>.</p>
      </div>
    </section>
  </>;
}
