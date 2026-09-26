import { SITE_NAME, SITE_URL } from "@/lib/seo";

export function ArticleSchema({
  headline,
  description,
  path,
  datePublished = "2026-09-26",
  dateModified = "2026-09-26"
}: {
  headline: string;
  description: string;
  path: string;
  datePublished?: string;
  dateModified?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    datePublished,
    dateModified,
    inLanguage: "en-NZ",
    mainEntityOfPage: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/roofhub-mark-black.png` }
    }
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
