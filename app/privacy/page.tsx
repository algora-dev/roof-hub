import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy policy",
  description: "What RoofHub collects, what stays on your device, and how to exercise your privacy rights.",
  path: "/privacy"
});

const sections = [
  {
    h: "What we collect",
    body: [
      "RoofHub does not require an account and does not run a newsletter. When analytics is enabled, we collect standard aggregate page-view analytics (pages viewed, referrer, approximate region, device type) with IP addresses anonymised. We do not build advertising profiles.",
      "The roofing tools on this site run primarily in your browser. Measurements, plan images and estimates stay on your device unless a feature explicitly says otherwise and you choose to submit an enquiry. Quote-enquiry payloads do not include uploaded plan-image bytes or private custom rate overrides."
    ]
  },
  {
    h: "When you contact us",
    body: [
      "If you use the contact or quote-enquiry form, we keep the details you submit only to handle that request and, where you explicitly ask for a quote, to pass the relevant project information to an appropriate roofing partner. We do not add correspondents to marketing lists."
    ]
  },
  {
    h: "Third parties",
    body: [
      "This site is hosted on Vercel. When analytics is enabled, Google Analytics processes aggregate usage data under Google's own terms. Contact and quote-enquiry submissions are delivered through a transactional email provider so the message can reach the RoofHub team. RoofHub does not use advertising trackers or sell form-submission data."
    ]
  },
  {
    h: "Your rights",
    body: [
      "Under the New Zealand Privacy Act 2020 you can ask what personal information we hold about you and ask for it to be corrected. Contact us via the contact page and we will respond within a reasonable timeframe."
    ]
  },
  {
    h: "Changes to this policy",
    body: [
      "If this policy changes materially, the updated date below changes with it. Continued use of the site after an update means you accept the current policy."
    ]
  }
];

export default function PrivacyPage() {
  return <>
    <section className="page-intro">
      <div className="container page-intro__grid">
        <div><p className="eyebrow">Legal</p><h1>Privacy policy.</h1></div>
        <div className="page-intro__aside"><p>RoofHub is built to be useful without collecting personal information. This page explains exactly what little is collected and why.</p></div>
      </div>
    </section>
    <section className="section section--white">
      <div className="container narrow">
        <p><strong>Last updated: 26 September 2026.</strong></p>
        {sections.map((s) => <div key={s.h}><h2>{s.h}</h2>{s.body.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}</div>)}
      </div>
    </section>
  </>;
}
