import Link from "next/link";
import { SITE_URL } from "@/lib/site";

export type Crumb = { label: string; href?: string };

function absoluteHref(href: string) {
  if (/^https?:\/\//i.test(href)) return href;
  return href === "/" ? SITE_URL : `${SITE_URL}${href.startsWith("/") ? href : `/${href}`}`;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: absoluteHref(item.href) } : {})
    }))
  };
  return (
    <nav className="breadcrumb-bar" aria-label="Breadcrumb">
      <div className="container">
        <ol className="breadcrumbs">
          {items.map((item, i) => (
            <li key={`${item.label}-${i}`}>
              {item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
            </li>
          ))}
        </ol>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </div>
    </nav>
  );
}
