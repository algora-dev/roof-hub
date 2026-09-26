import type { MetadataRoute } from "next";
import { SITE_URL, isIndexingEnabled } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexingEnabled()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
