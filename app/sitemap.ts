import type { MetadataRoute } from "next";
import { SITE_URL, isIndexingEnabled } from "@/lib/site";
import { SITE_ROUTES } from "@/data/siteRoutes";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isIndexingEnabled()) return [];
  return SITE_ROUTES.filter((route) => route.indexable !== false).map((route) => ({
    url: route.path === "/" ? SITE_URL : `${SITE_URL}${route.path}`,
    lastModified: new Date(`${route.lastModified}T00:00:00+12:00`),
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));
}
