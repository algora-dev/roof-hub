import type { MetadataRoute } from "next";
import { SITE_URL, isIndexingEnabled } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexingEnabled()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  // Public pages and tools may be crawled. Pages that should stay out of
  // results (for example the detailed estimator while its rate card is still
  // provisional) carry their own `noindex` metadata so crawlers can see it.
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  };
}
