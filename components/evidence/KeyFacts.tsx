export type KeyFact = { label: string; value: string };

/** Region / currency / GST / reviewed-date strip shown directly under the direct answer. */
export function KeyFacts({ facts }: { facts: KeyFact[] }) {
  return (
    <dl className="key-facts">
      {facts.map((f) => (
        <div key={f.label}>
          <dt>{f.label}</dt>
          <dd>{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}
