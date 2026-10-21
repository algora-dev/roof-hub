import { SITE_ROUTES } from "@/data/siteRoutes";
import { ARTICLES } from "@/data/research";

const routeSet = new Set([
  ...SITE_ROUTES.map(route => route.path),
  ...Object.values(ARTICLES).map(article => article.path),
  "/tools/roof-estimate",
  "/tools/detailed-roof-estimator",
  "/tools/quote-checker",
  "/contact"
]);

export function approvedAssistantPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const path = value.trim().split("?")[0].split("#")[0];
  return routeSet.has(path) ? value.trim() : null;
}

export function commonAssistantDestinations(): string {
  return [
    "/tools/roof-estimate - quick estimate with approximate inputs",
    "/tools/detailed-roof-estimator - measured/detailed estimator",
    "/tools/quote-checker - compare an existing roofing quote with the saved RoofHub project",
    "/pricing/roofing-costs - NZ roofing pricing evidence",
    "/pricing/reroof-cost - reroof and removal costs",
    "/pricing/new-roof-cost - new-build roof budgeting without old-roof removal",
    "/guides/compare-roofing-quotes - compare GST, scope and quote terms",
    "/roofing/corrugated - corrugated roofing guide",
    "/roofing/five-rib - five-rib roofing guide",
    "/roofing/pressed-metal-tile - pressed metal tile guide",
    "/roofing/tray-standing-seam - tray/standing seam guide",
    "/roofing/membrane - membrane systems, falls, substrates and quote checks",
    "/guides/roof-area - roof area and measurement",
    "/guides/roof-pitch - roof pitch guide",
    "/guides/corrugated-vs-five-rib - corrugated vs five-rib comparison",
    "/methodology - RoofHub evidence methodology",
    "/contact - RoofHub contact and project help"
  ].join("\n");
}
