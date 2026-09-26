export type SourceEntry = {
  name: string;
  url: string;
  tier: "primary" | "market" | "editorial";
  type: string;
  date?: string;
  note?: string;
};

/** Evidence list with tier badges. Sources sit next to the numbers they support. */
export function Sources({ sources }: { sources: SourceEntry[] }) {
  return (
    <ol className="source-list">
      {sources.map((s, i) => (
        <li key={`${s.url}-${i}`}>
          <span className={`tier tier--${s.tier}`}>{s.tier}</span>
          <span>
            <a href={s.url} target="_blank" rel="noopener">{s.name}</a>
            {s.date ? ` (${s.date})` : ""}
            {s.note ? <> — {s.note}</> : null}
            <span className="source-type"> · {s.type}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
