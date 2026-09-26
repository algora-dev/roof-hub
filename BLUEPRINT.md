# RoofHub Platform Blueprint

**Purpose:** Get RoofHub technically indexable and trustworthy, then
establish the architecture for high-quality NZ roofing pricing pages,
guides, datasets and tools.

**Audience:** RoofHub website/development agent and future content/data
contributors.

**Status:** Implementation brief. Treat P0 items as launch blockers.

> **RoofHub status note (added 2026-09-26 by implementation agent):** P0 is
> shipped — production is crawlable/indexable, robots + sitemap + canonicals
> + trust surfaces (about/methodology/privacy/terms/contact) are live. The
> shared data model, 59 verified pricing observations, reusable evidence
> components and the external-agent integration contract are in the repo
> (`data/`, `components/evidence/`, `docs/EXTERNAL_AGENT_HANDOFF.md`).
> Current phase: P1 items 10–12 (reusable components exist; first 3
> cornerstone pages are the next deliverable).

---

## 1. Product thesis

RoofHub should be an independent **New Zealand roofing information,
pricing and calculation platform**, not a conventional contractor blog.

The platform has three shared layers:

1. **Knowledge** — source-backed pages that answer NZ roofing
   questions clearly.
2. **Data** — structured observations for prices, specifications,
   project examples, assumptions, sources and review dates.
3. **Tools** — calculators and measurement tools consuming the same
   underlying data.

Desired journey:

> Search or AI answer → useful answer → evidence/examples → relevant
> tool → personalised estimate → optional quote enquiry.

Deliver the useful result before asking for the lead.

---

## 2. P0: make production crawlable and indexable

*(Status: COMPLETE — 2026-09-26. Kept for reference; do not redo.)*

Before publishing more content, verify the live site can be fetched,
rendered and indexed.

### Production checks

- Public pages return HTTP `200` without login, challenge pages or
  crawler-specific failures.
- No production `noindex` except intentionally excluded pages
  (`/pricing` prototype and the detailed estimator tool page are
  intentionally excluded until real rates are approved).
- `/robots.txt` is public and does not block public content or
  resources required for rendering.
- `/sitemap.xml` or a sitemap index is public and contains canonical
  production URLs only.
- Every indexable page has one self-referencing HTTPS canonical.
- HTTP and non-preferred host variants permanently redirect to one
  preferred HTTPS host (`https://www.roofhub.co.nz`).
- Staging, preview, parameter duplicates and development URLs are
  excluded from sitemaps.
- Server-rendered/prerendered HTML contains title, meta description,
  H1, primary answer and core editorial content.
- Important internal navigation uses normal `<a href>` links.
- Missing pages return HTTP `404`, not `200`.
- CDN/WAF/security configuration does not unintentionally block major
  crawlers.

### Search-engine setup

- Verify the production domain in Google Search Console. *(owner task)*
- Submit the canonical sitemap.
- Inspect the homepage plus representative article, pricing and tool
  URLs after launch.
- Verify the domain in Bing Webmaster Tools and submit the sitemap.
- Implement IndexNow on publish/update/delete events. *(live —
  `npm run indexnow` submits the full sitemap)*

Record the HTTP status, canonical, robots meta, sitemap inclusion and
search-engine inspection result for representative URLs before declaring
launch complete.

---

## 3. Recommended information architecture

Keep URLs short, descriptive and stable.

``` text
/
/pricing/
/pricing/roofing-costs/
/pricing/new-roof-cost/
/pricing/reroof-cost/
/pricing/corrugated-roof-cost/
/pricing/five-rib-roof-cost/
/pricing/pressed-metal-tile-cost/
/pricing/tray-standing-seam-roof-cost/
/pricing/scaffolding-cost/

/roofing/
/roofing/long-run/
/roofing/corrugated/
/roofing/five-rib/
/roofing/pressed-metal-tile/
/roofing/tray-standing-seam/

/guides/
/guides/roof-pitch/
/guides/roof-area/
/guides/reroofing/
/guides/roof-flashings/

/tools/
/tools/roof-cost-calculator/
/tools/roof-measurement-estimator/
/tools/roof-pitch-calculator/
/tools/roof-area-calculator/
/tools/scaffolding-estimator/

/methodology/
/sources/
/about/
/contact/
```

Do not create multiple URLs for essentially the same search intent.
Related pages must have genuinely different scopes.

---

## 4. First ten cornerstone resources

Build these before scaling into large numbers of articles:

1. **Roofing Costs NZ** — national overview, material comparison,
   supply-only vs supply/install vs reroof, examples, methodology and
   calculator.
2. **Re-roof Cost NZ** — covering + removal/disposal +
   access/scaffold, existing-roof categories, asbestos caveat, examples
   and calculator.
3. **Long-run Roofing NZ** — profiles, manufacturers,
   gauges/coatings, pitch, pricing, installation and alternatives.
4. **Corrugated Roofing NZ** — profile/specification, market
   observations, installed range, flashings/underlay, examples and
   calculator preset.
5. **Five-rib / Trapezoidal Roofing NZ** — naming variants, profile
   comparison, labour differences, pricing and examples.
6. **Pressed Metal Tile Roofing NZ** — system construction,
   battens/underlay, pricing, reroof implications and Decramastic
   distinction.
7. **Tray & Standing Seam Roofing NZ** — architectural tray vs
   standing seam, common systems/widths, concealed fixing and premium
   pricing.
8. **Roof Pitch NZ** — degrees, rise/run, pitch factors, roof-area
   effects and calculator.
9. **Roof Scaffolding & Edge Protection Costs NZ** —
   single/two-storey, edge protection, flat/difficult sites and hire
   assumptions.
10. **Roof Area & Measurement Guide NZ** — plan vs actual area, pitch
    conversion, ridges/hips/valleys/barges and detailed estimator.

Do not mechanically generate dozens of roof-size pages until this core
model and internal-link structure are proven.

---

## 5. Standard page anatomy

Every important guide/pricing page should be predictable for humans and
machines:

1. Breadcrumbs.
2. H1 matching the real topic/question.
3. **Direct answer** in 2–5 sentences.
4. **Key facts**: New Zealand, NZD, GST basis, pricing basis, last
   reviewed, evidence count where relevant.
5. Primary comparison/pricing table in HTML.
6. Relevant calculator near the answer.
7. Factors that change the result.
8. Worked examples or sourced project observations.
9. Technical/product detail.
10. Alternatives/comparisons.
11. Methodology and limitations.
12. Sources/evidence.
13. Short FAQ containing questions actually answered on-page.
14. Related guides/tools.
15. Optional quote CTA only after useful value has been delivered.

### Editorial rules

- Answer first; avoid generic introductions.
- Use NZ terminology and NZD.
- Always distinguish **material only**, **supply and install**, and
  **complete reroof** pricing.
- Always state GST treatment.
- Date volatile pricing observations.
- Distinguish observed facts, RoofHub calculations, assumptions and
  third-party opinion.
- Prefer concrete tables, ranges and examples to vague prose.
- Avoid filler written only for word count.
- Do not copy or closely paraphrase competitors.
- Do not republish third-party project photography without
  permission/licence.

---

## 6. Shared data model

Do not manually type the same price into multiple pages and calculators.
Maintain raw observations centrally and derive RoofHub rates from them.

*(Status: LIVE — `data/types.ts`, `data/observations.ts` (59 records),
`data/derive.ts`.)*

### Pricing observation

``` ts
type PricingObservation = {
  id: string;
  category: 'roof-covering' | 'flashing' | 'underlay' | 'removal' | 'scaffold' | 'labour' | 'other';
  roofSystem?: 'pressed-metal-tile' | 'corrugate' | 'five-rib' | 'tray-standing-seam';
  item: string;
  amountLow?: number;
  amountHigh?: number;
  amountExact?: number;
  unit: 'm2' | 'lm' | 'each' | 'week' | 'job';
  priceBasis: 'material-only' | 'labour-only' | 'supply-install' | 'complete-project';
  gstBasis: 'incl' | 'excl' | 'unknown';
  region: string;
  observedAt: string;
  sourceUrl: string;
  sourceName: string;
  sourceType: 'manufacturer' | 'supplier' | 'government' | 'technical' | 'roofer' | 'scaffolder' | 'other';
  evidenceTier: 'primary' | 'market' | 'editorial';
  status: 'verified' | 'provisional' | 'stale' | 'excluded';
  notes?: string;
};
```

### Derived RoofHub rate

``` ts
type RoofHubRate = {
  key: string;
  label: string;
  low: number;
  high: number;
  unit: 'm2' | 'lm' | 'each' | 'week' | 'job';
  basis: 'material' | 'labour' | 'supply-install' | 'removal' | 'access';
  gstBasis: 'incl' | 'excl';
  reviewedAt: string;
  methodologyVersion: string;
  sourceObservationIds: string[];
};
```

### Project observation

Store source, date, location, roof area, system/profile, new vs reroof,
existing roof, storeys, pitch, total price, $/m², whether
scaffold/removal is included, GST basis, confidence and notes.

Keep raw observations separate from derived RoofHub ranges so
methodology can evolve without losing provenance.

---

## 7. Evidence policy

RoofHub's advantage is **traceable synthesis**, not copied content.

### Evidence tiers

**Primary:** NZ government/regulator sources, technical bodies,
manufacturer specifications, direct supplier listings and product
documentation.

**Market:** contractor/scaffolder published pricing, case studies,
public project examples and merchant listings.

**Editorial:** explanatory articles and experience-based commentary.

Use primary evidence for technical/regulatory claims where possible.
Market evidence is valuable for pricing and project behaviour. Ten sites
repeating the same claim are not ten independent sources.

For important numerical observations store publisher, canonical URL,
page title, publication/update date if known, RoofHub observation date,
unit/basis, GST treatment, region, inclusions/exclusions and
confidence/status.

---

## 8. Public pricing methodology

Create `/methodology/` before scaling pricing pages. *(Status: LIVE.)*

Explain:

- RoofHub provides estimates/information, not binding quotes.
- How public manufacturer/supplier observations are collected.
- How labour allowances are maintained.
- How low/high ranges are derived.
- Difference between new roof, supply/install and reroof.
- Treatment of removal, scaffold, pitch, geometry, access and region.
- GST convention.
- Review cadence.
- Correction process.

Each pricing page should show a compact methodology note and link to the
full page.

---

## 9. Tools and editorial pages

Interactive tools should enhance crawlable editorial content, not
replace it.

Every tool page should have server-rendered/prerendered:

- unique title, description and H1;
- concise explanation of the tool;
- inputs, outputs, assumptions and limitations;
- at least one worked example;
- links to methodology and the relevant source-backed guide.

Interactive results generally should **not** create thousands of
indexable parameter/result URLs. Private plans, addresses and project
details must never be exposed to indexing.

Editorial pages may deep-link into tools with sensible presets,
e.g. opening the estimator with corrugate selected.

---

## 10. Metadata and structured data

For every indexable page:

- unique title and meta description;
- one clear primary H1;
- self-referencing canonical;
- Open Graph metadata;
- meaningful image alt text;
- visible breadcrumbs where appropriate;
- meaningful `lastModified` when content actually changes;
- visible review/publication dates where freshness matters;
- real author/editor/reviewer attribution where meaningful.

Structured data should describe visible content accurately:

- `Organization` for RoofHub identity.
- `WebSite` at site/home context.
- `BreadcrumbList` for hierarchical pages.
- `Article` for substantive guides where appropriate.
- `FAQPage` only where a real FAQ is visible; do not assume it will
  create a Google FAQ rich result.
- Consider `Dataset` later for genuine public RoofHub data landing
  pages with documented provenance.
- Do not invent ratings, reviews, authors, offers or prices.
- Do not mark indicative roofing ranges as product offers unless the
  page genuinely represents an offered product/service and the markup
  accurately matches the visible page.

Validate structured data in production.

---

## 11. Internal linking

Every cornerstone page should link naturally to:

- its parent topic hub;
- the most relevant calculator;
- 2–5 closely related guides;
- methodology when prices are discussed;
- relevant material/product comparisons.

Every tool should link back to explanatory guides.

Use descriptive anchor text such as `corrugated roofing costs`, not
repeated generic `learn more`.

No orphan pages.

---

## 12. AI / answer-engine readability

There is no magic markup guaranteeing AI citation. Optimise for clarity,
provenance, crawlability and useful original information.

- Put the concise answer immediately below the relevant heading.
- Make region, currency, unit and time period explicit.
- Use HTML tables for comparisons.
- Keep important facts in HTML/text, not only images, canvases or
  calculators.
- Give important datasets/ranges stable names and documented
  methodology.
- Show `Last reviewed` on volatile pricing content.
- Place source links near the evidence they support.
- Avoid unsupported claims such as "cheapest in NZ".
- Publish original calculations/derived comparisons and explain them.
- Use consistent terminology for roofing systems.
- Never hide the primary answer behind registration or a quote form.

---

## 13. Images and media

- Prefer original RoofHub diagrams, profile illustrations, charts and
  data visualisations.
- Use manufacturer media only when permitted.
- Do not lift contractor project photography simply because the
  contractor is cited.
- Record image source/licence/permission.
- Compress responsive images and provide dimensions.
- Build consistent RoofHub-owned profile diagrams for corrugate,
  five-rib, pressed tile and tray/standing seam.

---

## 14. Trust and transparency

Publish or complete before scaling:

- `/about/` *(live)*
- `/methodology/` *(live)*
- source/corrections policy *(live via /methodology + /contact)*
- privacy policy *(live)*
- terms/estimator disclaimer *(live)*
- contact/correction route *(live — insights@t3labs.co.uk)*

Do not invent "expert reviewer" identities. Identify real reviewers
accurately and explain their role.

---

## 15. Performance, accessibility and UX baseline

Treat these as launch requirements:

- mobile-first responsive layout;
- keyboard-accessible forms/tools;
- visible focus states;
- labelled controls and useful validation;
- adequate contrast;
- no critical interaction dependent on hover;
- responsive, compressed images;
- avoid excessive client JS for editorial pages;
- reserve image/component dimensions to minimise layout shift;
- useful loading/error/empty states for calculators;
- preserve calculator work across accidental refresh where practical.

Test representative pages with Lighthouse/PageSpeed, but prioritise
actual user experience and Core Web Vitals over chasing a perfect
synthetic score.

---

## 16. Analytics and conversion events

Track useful events without turning every page into a lead trap:

- cornerstone page view;
- calculator start;
- calculator step completion;
- calculator completion;
- material/system selected;
- new roof vs reroof;
- scaffold estimate requested;
- detailed measurement workspace opened;
- estimate generated;
- quote enquiry started;
- quote enquiry submitted;
- outbound source link click;
- related-guide/tool click.

Do not send private plan contents or sensitive project data into general
analytics.

*(Status: GA4 baseline wired, inert until a measurement ID is set.)*

---

## 17. Content publishing workflow

For each new cornerstone page:

1. Define the user/search intent.
2. Research primary sources first.
3. Gather market observations.
4. Store observations in the shared data model.
5. Calculate RoofHub-derived ranges separately.
6. Draft the answer-first page from structured evidence.
7. Add original tables, diagrams/calculations and relevant tool.
8. Add source links and methodology.
9. Add metadata and accurate structured data.
10. QA mobile, accessibility and performance.
11. Publish.
12. Update sitemap and optionally notify IndexNow.
13. Inspect indexing.
14. Review pricing/freshness on a defined schedule.

Do not mass-publish AI-generated pages that have not gone through
evidence/data QA.

---

## 18. Recommended implementation order

### P0 — before organic launch *(COMPLETE 2026-09-26)*

1. Fix/verify production crawlability.
2. Add/verify robots and sitemap.
3. Canonical/redirect/noindex audit.
4. Google Search Console + Bing Webmaster verification. *(owner task)*
5. Server-rendered metadata/core copy.
6. About, methodology, privacy, terms/disclaimer and correction/contact
   surfaces.
7. Analytics baseline.

### P1 — establish the platform *(foundation complete; pages pending)*

8. Implement shared `PricingObservation`, `RoofHubRate` and
   project-observation models. *(live)*
9. Centralise the estimator's rates into the same data source.
10. Create reusable components: *(live — `components/evidence/`)*

    - Key Facts
    - NZ Market Evidence
    - Price Range
    - Worked Example
    - Methodology Note
    - Sources
    - Related Tool

11. Publish the first 3 cornerstone pages: *(NEXT — external agent)*

    - Roofing Costs NZ
    - Re-roof Cost NZ
    - Long-run Roofing NZ

12. Integrate the detailed estimator.

### P2 — complete the first authority cluster

13. Publish corrugate, five-rib, pressed tile and tray/standing seam
    pages.
14. Publish roof pitch, scaffold and roof measurement pages/tools.
15. Strengthen internal linking and topic hubs.
16. Review Search Console/Bing crawl and query data before expanding.

### P3 — scale only after quality is proven

17. Add carefully selected roof-size pages, comparisons, regional
    evidence or additional technical guides only where they answer
    distinct demand.
18. Expand the public data/evidence layer.
19. Build the simple homeowner estimator.
20. Develop professional/custom-rate quoting workflows.

---

## 19. Definition of done for "ready to start publishing"

RoofHub is ready for the cornerstone-content phase when:

- homepage and representative pages are externally fetchable; ✅
- robots and sitemap are valid; ✅
- no accidental noindex/blocking exists; ✅
- canonical/redirect rules are clean; ✅
- Search Console and Bing Webmaster are verified; *(owner task pending)*
- the site has About, Methodology, Privacy, Terms/Disclaimer and
  Contact/Corrections surfaces; ✅
- shared pricing data is not duplicated manually across pages/tools; ✅
- the detailed estimator clearly labels estimates and assumptions; ✅
- a reusable answer-first article/pricing template exists; ✅
- source/evidence components exist; ✅
- analytics can measure tool use and quote conversion; *(baseline wired)*
- the first cornerstone page can be published without inventing a new
  technical pattern. ✅

---

## 20. Core principle

**Do not build the largest collection of NZ roofing articles. Build the
most useful NZ roofing data platform, then let pages, calculators,
comparisons and quoting tools become different interfaces into that
data.**

That is the standard every new RoofHub page or feature should be
measured against.
