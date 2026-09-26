import type { SourceEntry } from "@/components/evidence/Sources";

export const TECHNICAL_SOURCES = {
  buildingE2: {
    name: "Building Performance — E2 External Moisture",
    url: "https://www.building.govt.nz/building-code-compliance/e-moisture/e2-external-moisture",
    tier: "primary",
    type: "government",
    note: "New Zealand Building Code external-moisture requirements"
  },
  e2as1: {
    name: "Building Performance — E2/AS1, 4th edition",
    url: "https://www.building.govt.nz/building-code-compliance/e-moisture/e2-external-moisture/acceptable-solutions-and-verification-methods",
    tier: "primary",
    type: "government",
    date: "2025",
    note: "Current acceptable-solution information for relevant buildings"
  },
  worksafeRoofs: {
    name: "WorkSafe — Working on roofs good practice guidelines",
    url: "https://www.worksafe.govt.nz/topic-and-industry/working-at-height/roofs/working-on-roofs-gpg/",
    tier: "primary",
    type: "government",
    note: "Fall prevention, roof access and edge-protection guidance"
  },
  worksafeScaffold: {
    name: "WorkSafe — Scaffolding in New Zealand",
    url: "https://www.worksafe.govt.nz/topic-and-industry/working-at-height/scaffolding-in-new-zealand/",
    tier: "primary",
    type: "government",
    note: "Scaffold and roof-edge-protection guidance"
  },
  worksafeAsbestos: {
    name: "WorkSafe — Check for asbestos before work on older roofs",
    url: "https://www.worksafe.govt.nz/about-us/news-and-media/check-for-asbestos-before-undertaking-high-pressure-spraying-on-roofs/",
    tier: "primary",
    type: "government",
    date: "2026",
    note: "Includes a decramastic-roof case and asbestos risk reminder"
  },
  metalcraftCorrugate: {
    name: "Metalcraft Roofing — Corrugate",
    url: "https://www.metalcraftgroup.co.nz/products/roofing-and-cladding/products/corrugate/",
    tier: "primary",
    type: "manufacturer",
    note: "760 mm cover; 8° minimum pitch stated by manufacturer"
  },
  steelTubeCustomOrb: {
    name: "Steel & Tube — Custom Orb",
    url: "https://steelandtube.co.nz/specifiers/custom-orb",
    tier: "primary",
    type: "manufacturer",
    note: "Corrugated profile; 8° minimum pitch stated by manufacturer"
  },
  metalcraftFiveRib: {
    name: "Metalcraft Roofing — MC760",
    url: "https://www.metalcraftgroup.co.nz/products/roofing-and-cladding/products/mc760/",
    tier: "primary",
    type: "manufacturer",
    note: "Five-rib trapezoidal profile; 760 mm cover; 3° minimum pitch stated"
  },
  dimondHiFive: {
    name: "Dimond — Hi Five",
    url: "https://www.dimond.co.nz/products/hi-five",
    tier: "primary",
    type: "manufacturer",
    note: "Five-rib profile; nominal 765 mm cover; 3° minimum pitch"
  },
  gerardBond: {
    name: "Gerard Roofs — Bond",
    url: "https://www.gerardroofs.co.nz/our-products/bond/",
    tier: "primary",
    type: "manufacturer",
    note: "Pressed steel tile; 0.47 m² cover per panel; 12° minimum pitch"
  },
  gerardMilano: {
    name: "Gerard Roofs — Milano",
    url: "https://www.gerardroofs.co.nz/our-products/milano/",
    tier: "primary",
    type: "manufacturer",
    note: "Pressed steel tile; 0.45 m² cover per panel; 12° minimum pitch"
  },
  metalcraftEspan: {
    name: "Metalcraft Roofing — Espan 470",
    url: "https://www.metalcraftgroup.co.nz/products/roofing-and-cladding/products/espan-470/",
    tier: "primary",
    type: "manufacturer",
    note: "470 mm cover; concealed fixing; 3° minimum pitch stated"
  }
} satisfies Record<string, SourceEntry>;
