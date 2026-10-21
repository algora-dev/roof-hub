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
      "RoofHub does not require an account and does not run a newsletter. We use Microsoft Clarity to understand how people use the site through aggregated interaction data, heatmaps and session replay. Clarity may process technical information such as device and browser details, approximate location, page interactions and network information under Microsoft's terms. If Google Analytics is enabled on the deployment, it also processes aggregate usage information. RoofHub does not use these services to build advertising profiles.",
      "Roofing tools run primarily in your browser. Non-sensitive project selections may be kept in browser session storage so you can move between RoofHub tools without re-entering the same information. Session storage is scoped to the browser tab and is not a RoofHub account or cloud record. Detailed-estimator measurements and estimates also remain in browser session storage unless you choose to submit an enquiry."
    ]
  },
  {
    h: "When you contact us",
    body: [
      "If you use the contact, project or quote-enquiry form, RoofHub receives the details you choose to submit so we can handle that request. A project enquiry may include your contact details, location, roof selections, measurements, estimate context and any notes you provide. Detailed-estimator quote payloads do not include uploaded plan-image bytes or private custom rate overrides.",
      "If you explicitly ask RoofHub to obtain or review contractor quotes, relevant project information may be shared with an appropriate roofing partner only where the form records consent to do so. RoofHub does not add correspondents to marketing lists."
    ]
  },
  {
    h: "Analytics and third parties",
    body: [
      "This site is hosted on Vercel. Microsoft Clarity provides session replay, heatmaps and usage analytics. Google Analytics may process aggregate usage data when it is enabled. Contact and quote-enquiry submissions are delivered through a transactional email provider so the message can reach the RoofHub team. These providers process information under their own terms and privacy obligations.",
      "RoofHub does not sell form-submission data and does not use advertising trackers. General analytics events are designed to record coarse product usage, such as which tool was opened or completed, rather than names, email addresses, phone numbers, exact addresses, uploaded documents or conversation text."
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
        <div className="page-intro__aside"><p>RoofHub is built to be useful without requiring an account. This page explains what is collected, what remains in your browser and what is sent only when you choose to contact us.</p></div>
      </div>
    </section>
    <section className="section section--white">
      <div className="container narrow">
        <p><strong>Last updated: 20 October 2026.</strong></p>
        {sections.map((s) => <div key={s.h}><h2>{s.h}</h2>{s.body.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}</div>)}
      </div>
    </section>
  </>;
}
