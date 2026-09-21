import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const indexingEnabled = process.env.ALLOW_INDEXING === "true";
  if (!indexingEnabled) return [];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://roofhub.co.nz";
  const routes = ["", "/pricing", "/tools", "/guides", "/guides/how-to-prepare-for-a-roofing-quote", "/about"];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7
  }));
}
