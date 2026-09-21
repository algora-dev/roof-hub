import type { ReactNode } from "react";

type Props = { eyebrow?: string; title: string; copy?: ReactNode; align?: "left" | "center" };
export function SectionHeading({ eyebrow, title, copy, align = "left" }: Props) {
  return <div className={`section-heading section-heading--${align}`}>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2>{copy && <div className="section-copy">{copy}</div>}</div>;
}
