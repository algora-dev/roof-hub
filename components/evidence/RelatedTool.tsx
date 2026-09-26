import Link from "next/link";

/** Card linking the page to the most relevant tool or guide. */
export function RelatedTool({ title, href, copy }: { title: string; href: string; copy: string }) {
  return (
    <Link className="related-tool" href={href}>
      <strong>{title}</strong>
      <span>{copy}</span>
    </Link>
  );
}
