export type Faq = { q: string; a: string };

/** Visible FAQ from answers that genuinely exist on the page. Schema optional. */
export function FaqBlock({ faqs, withSchema = true }: { faqs: Faq[]; withSchema?: boolean }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    }))
  };
  return (
    <div className="faq-list">
      {faqs.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
      {withSchema ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ) : null}
    </div>
  );
}
