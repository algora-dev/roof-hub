export type SiteRoute = {
  path: string;
  lastModified: string;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
  indexable?: boolean;
};

export const SITE_ROUTES: SiteRoute[] = [
  { path: "/", lastModified: "2026-09-26", priority: 1, changeFrequency: "weekly" },
  { path: "/pricing", lastModified: "2026-09-26", priority: 0.9, changeFrequency: "monthly" },
  { path: "/pricing/roofing-costs", lastModified: "2026-09-26", priority: 1, changeFrequency: "weekly" },
  { path: "/pricing/reroof-cost", lastModified: "2026-09-26", priority: 0.95, changeFrequency: "weekly" },
  { path: "/pricing/scaffolding-cost", lastModified: "2026-09-26", priority: 0.8, changeFrequency: "monthly" },
  { path: "/roofing", lastModified: "2026-09-26", priority: 0.9, changeFrequency: "monthly" },
  { path: "/roofing/long-run", lastModified: "2026-09-26", priority: 0.95, changeFrequency: "monthly" },
  { path: "/roofing/corrugated", lastModified: "2026-09-26", priority: 0.9, changeFrequency: "monthly" },
  { path: "/roofing/five-rib", lastModified: "2026-09-26", priority: 0.9, changeFrequency: "monthly" },
  { path: "/roofing/pressed-metal-tile", lastModified: "2026-09-26", priority: 0.9, changeFrequency: "monthly" },
  { path: "/roofing/tray-standing-seam", lastModified: "2026-09-26", priority: 0.9, changeFrequency: "monthly" },
  { path: "/guides", lastModified: "2026-09-26", priority: 0.85, changeFrequency: "monthly" },
  { path: "/guides/roof-pitch", lastModified: "2026-09-26", priority: 0.85, changeFrequency: "monthly" },
  { path: "/guides/roof-area", lastModified: "2026-09-26", priority: 0.85, changeFrequency: "monthly" },
  { path: "/guides/how-to-prepare-for-a-roofing-quote", lastModified: "2026-09-26", priority: 0.65, changeFrequency: "monthly" },
  { path: "/tools", lastModified: "2026-09-26", priority: 0.8, changeFrequency: "monthly" },
  { path: "/tools/detailed-roof-estimator", lastModified: "2026-09-26", priority: 0.2, changeFrequency: "monthly", indexable: false },
  { path: "/methodology", lastModified: "2026-09-26", priority: 0.7, changeFrequency: "monthly" },
  { path: "/sources", lastModified: "2026-09-26", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", lastModified: "2026-09-26", priority: 0.55, changeFrequency: "monthly" },
  { path: "/contact", lastModified: "2026-09-26", priority: 0.4, changeFrequency: "yearly" },
  { path: "/privacy", lastModified: "2026-09-26", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", lastModified: "2026-09-26", priority: 0.3, changeFrequency: "yearly" }
];
