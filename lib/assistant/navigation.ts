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
    "/guides/how-to-prepare-for-a-roofing-quote - prepare a clear roofing brief and scope",
    "/guides/how-to-choose-a-roofer - contractor checks, LBP context and written scope",
    "/guides/reroof-building-consent - NZ reroof consent and Schedule 1 context",
    "/guides/roof-repair-or-replace - repair versus reroof decision framework",
    "/guides/roof-leak-or-condensation - moisture-source investigation",
    "/guides/roof-underlay - metal-roof underlay and condensation management",
    "/guides/roof-flashings - ridge, hip, valley, barge, apron and junctions",
    "/guides/roof-warranties - product, workmanship and Building Act protections",
    "/guides/metal-roof-maintenance - NZ metal-roof care and safety",
    "/guides/coastal-roofing - coastal exposure, corrosion, products and maintenance",
    "/guides/gutters-and-downpipes - roof drainage, rainfall and outlet capacity",
    "/guides/roof-parts - NZ roof terminology, edges, junctions and framing terms",
    "/guides/reroof-process - step-by-step NZ reroof process and handover",
    "/guides/roofing-contracts-deposits-variations - roofing contracts, deposits, payments and variations",
    "/guides/roof-penetrations-skylights-flues - skylights, flues, pipes, vents and penetration flashing",
    "/guides/roof-painting-or-replacement - restoration/recoating versus roof replacement",
    "/guides/roof-ventilation - roof-space moisture and ventilation guidance",
    "/guides/roof-problems - symptom-led roof problem investigation",
    "/guides/solar-panels-and-roofing - roofing checks before or during solar installation",
    "/guides/roof-insulation-when-reroofing - insulation opportunity when a roof is opened",
    "/guides/roof-insurance-storm-damage - storm damage, maintenance and insurance documentation",
    "/guides/roof-condition-assessment - neutral roof-condition framework and remote-review limits",
    "/guides/rusting-metal-roof-repair-or-replace - rust/corrosion repair, restoration and reroof decision",
    "/guides/roof-keeps-leaking-after-repair - recurring leak diagnosis and escalation",
    "/guides/concrete-tile-roof-repair-restoration-or-replace - concrete tile repair/restoration/replacement decision",
    "/guides/decramastic-roof-repair-restore-or-replace - safety-first Decramastic repair/restoration/reroof decision",
    "/guides/hidden-problems-found-during-reroof - concealed timber/substrate problems and variations",

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
