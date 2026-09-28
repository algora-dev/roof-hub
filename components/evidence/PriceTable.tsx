export type PriceRow = {
  label: string;
  range: string;
  basis: string;
  notes?: string;
  sourceUrl?: string; sourceLabel?: string; sourceDate?: string; lastCheckedAt?: string; historical?: boolean;
};

/** Primary HTML pricing/comparison table. Numbers live in HTML, never only in JS. */
export function PriceTable({
  caption,
  rows,
  head = ["What", "Published price (NZD)", "Basis", "Notes"]
}: {
  caption: string;
  rows: PriceRow[];
  head?: string[];
}) {
  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-label={caption}>
      <table className="evidence-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>{head.map((h) => <th key={h} scope="col">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              <td className="num">{r.range}</td>
              <td>{r.basis}</td>
              <td>{r.historical && <strong className="rh-evidence-label">Historical guide</strong>}{r.notes ?? ""}{r.sourceUrl && <small className="rh-price-source"><a href={r.sourceUrl} target="_blank" rel="noopener noreferrer">{r.sourceLabel ?? "Original source"}</a><br />Published: {r.sourceDate ?? "date not stated"}{r.lastCheckedAt && <> · Checked {r.lastCheckedAt}</>}</small>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
