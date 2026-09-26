export type PriceRow = {
  label: string;
  range: string;
  basis: string;
  notes?: string;
};

/** Primary HTML pricing/comparison table. Numbers live in HTML, never only in JS. */
export function PriceTable({
  caption,
  rows,
  head = ["What", "Typical range (NZD)", "Basis", "Notes"]
}: {
  caption: string;
  rows: PriceRow[];
  head?: string[];
}) {
  return (
    <div className="table-wrap">
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
              <td>{r.notes ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
