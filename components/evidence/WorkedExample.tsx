import { Fragment } from "react";

export type WorkedLine = { label: string; value: string; highlight?: boolean };

/** Show-your-working example: inputs, arithmetic and result, all visible. */
export function WorkedExample({ title, lines, note }: { title: string; lines: WorkedLine[]; note?: string }) {
  return (
    <div className="worked-example">
      <h3>{title}</h3>
      <dl>
        {lines.map((l) => (
          <Fragment key={l.label}>
            <dt>{l.label}</dt>
            <dd className={l.highlight ? "worked-example__total" : undefined}>{l.value}</dd>
          </Fragment>
        ))}
      </dl>
      {note ? <p className="worked-note">{note}</p> : null}
    </div>
  );
}
