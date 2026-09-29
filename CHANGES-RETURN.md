# RoofHub Five-Rib Reference Guide v0.8

## Apply this as an overlay, not a replacement repository

This package contains changed and added files only, based on `roof-hub-main-cf6343f-2026-09-28.zip`. Keep every unlisted file. Preserve production environment variables and live indexing. Nothing in this package requires another redesign, estimator rewrite, change of canonical host or email reconfiguration.

Read `V08-OVERLAY-MANIFEST.json` before applying. It lists before/after hashes and additions. If a current file differs from the baseline hash, reconcile that file's changes rather than overwriting newer work blindly.

## What this release does

- Replaces the existing `/roofing/five-rib` article with a source-led reference guide, not a new competing route.
- Adds eight profile entries from six manufacturers, five priced listings from four businesses, three held/excluded listings, and seven attributed project accounts from six publishers.
- Cites 39 unique source pages on the five-rib guide. Twenty-eight source records and six project records are new to the platform.
- Adds source-specific 100/150/200/250 m² sheet examples and reuses the existing budget maths with five-rib metadata.
- Strengthens `/guides/corrugated-vs-five-rib` and adds a reader-editable two-quote sheet comparison. The example prices are explicitly hypothetical, not new market rates.
- Adds dynamic research-library coverage to `/sources` and `/methodology`: 89 cited source pages, 22 referenced price records, 18 attributed project accounts and 17 research articles in this snapshot.
- Preserves the short-answer / deep-evidence pattern. Technical notes, excluded prices and additional projects use native disclosures. Their content remains part of the rendered HTML.
- Extends source validation and maths regression coverage.

## Boundaries

Do not change:

- Live `ALLOW_INDEXING` or existing canonical/redirect/sitemap settings.
- Clarity, Search Console setup or analytics identifiers.
- The private enquiry API or destination email configuration.
- Any detailed-estimator file, numeric rate, permission model or current `noindex`.
- RoofHub fonts, colours, logos, global styles or other page designs.
- Any of the other 15 article records.

All 67 pre-existing price observations remain unchanged. Four retail records are appended with `rangeEligible: false`. The original shared Bitz record is reused with separate profile cover metadata. This is not a rate-card migration.

## Data and implementation map

| File / area | Purpose |
|---|---|
| `data/research/five-rib.json` | Profile comparison, retail metadata and exclusion reasons. |
| `data/research/five-rib.ts` | Typed access and conditional budget preset. |
| `data/research/articles.json` | Only five-rib and corrugate-vs-five records change. |
| `data/research/sources.json`, `projects.json` | Append-only evidence records. |
| `data/observations.ts` | Four appended source-specific listings; no prior rate changes. |
| `FiveRibEvidence.tsx` | Guide shortcuts, supplier ledger, profile table and area examples. |
| `SheetQuoteComparison.tsx` | Side-by-side reader-owned quote arithmetic with explicit GST. |
| `CorrugatedBudget.tsx` | Optional system label for the downloaded heading; default corrugated behaviour remains intact. |
| `lib/corrugated-maths.ts` | Existing shared primitives retained; additive two-quote comparison function. The legacy filename does not imply a second pricing engine. |
| `ResearchArticle.tsx`, research types/index | New block rendering/traversal and article-specific guide shortcuts. |
| `data/research/stats.ts`, `ResearchLibraryStats.tsx` | Counts actually referenced evidence, deduplicating URLs and record IDs. Source pages are not independent organisations. |
| `app/evidence.css` | Scoped comparison/profile/statistics styles using current RoofHub tokens. |
| `scripts/check-research.mjs`, `check-math.cjs` | Extended regression checks. |

## Important research qualifications

Read `docs/research/FIVE-RIB-RESEARCH-2026-09-28.md` before editing the evidence.

- Hi Five cover conflict remains visible, not guessed.
- Bunnings and Mitre 10 listings do not acquire an invented effective cover.
- Renovation Warehouse's unknown GST prevents an inclusive-GST area price.
- Bitz cover is conditional on an archived same-seller listing matching current stock.
- R&C's five-rib title/corrugated description conflict stays out of priced evidence.
- The researched guidance does not support saying every five-rib ridge must be hand-notched. The article explains specified details without changing the estimator's existing labour allowances.
- Project accounts are not RoofHub-inspected jobs or invoice samples. Missing roof prices/areas stay missing. Do not substitute overall development budgets or plan dimensions.
- Do not copy photographs from the linked contractor pages without permission.

## Build and deployment

```bash
npm ci
npm test
npm run typecheck
npm run build
```

Then use a preview deployment and work through `docs/research/FIVE-RIB-QA-2026-09-28.md`. The complete Next build and React hydration could not be verified in the offline editing environment; local data/maths types, content tests, callback-harness checks and static layouts were checked separately.

After successful preview QA, deploy using existing production settings. Do not switch indexing off to apply this content update. Use the repository's production checker normally. Article dates are already 28 September 2026; do not fabricate fresher dates for unchanged pages.

## Acceptance criteria

- Five-rib and comparison routes load, with correct unique metadata and unchanged canonical paths.
- Supplier prices retain GST/unit/scope conditions. No national price range is inferred from mismatched listings.
- Profiles and project accounts are attributed; source counts are accurate and not called independent confirmations.
- Both worksheets calculate and validate; no accidental double pitch or GST conversion.
- All source/disclosure content is present in initial rendered HTML.
- Corrugated page and estimator pass regression checks.
- Public content contains no em dashes or private destination address.
- Existing analytics, enquiry handling and indexing remain unchanged.

## Agent return report

Report the commit and preview/production URL, test/typecheck/build results, worksheet/phone-layout checks, any changed integration files, and whether source/canonical checks passed. Do not shorten or remove evidence qualifications merely to make the page look more confident.
