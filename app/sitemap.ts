import type { MetadataRoute } from "next";
import { SITE_URL, isIndexingEnabled } from "@/lib/seo";

const routes: Array<{ path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/tools", priority: 0.8, changeFrequency: "monthly" },
  { path: "/guides", priority: 0.8, changeFrequency: "monthly" },
  { path: "/guides/how-to-prepare-for-a-roofing-quote", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/methodology", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.4, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" }
];

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isIndexingEnabled()) return [];
  return routes.map((r) => ({
    url: r.path === "/" ? SITE_URL : `${SITE_URL}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority
  }));
}

// Intentionally excluded (noindex, not listed here): /pricing (demo arithmetic until the
// rate card is approved) and /tools/detailed-roof-estimator (preview pricing tool).
