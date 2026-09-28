# RoofHub Corrugated Reference Guide v0.7

## Start here

This is a **changed-files overlay**, not a complete repository. Apply these 20 full files over the uploaded `roofhub-codebase-post-v0.6.zip` baseline. That agent snapshot identifies production main commit `d4e75a2` and content release v0.6.

Keep every unlisted file. Do not delete/recreate the site or apply the old v0.5 full-repository handoff over this overlay. If the repository has moved beyond this snapshot, compare intervening changes before replacing shared JSON or components.

Target route: **`/roofing/corrugated`**. The existing route file already reads the shared article record; it does not need a new URL, redirect, sitemap entry or indexing decision.

**The website is already live. Preserve existing production indexing, canonical host, environment variables, analytics, private email delivery, estimator configuration and rate card. Do not turn indexing off for this content update.**

## What ships

- An answer-first corrugated guide with eleven sections and 41 linked source-page URLs.
- Six manufacturer comparisons, including usable cover, gauge/BMT, pitch conditions and the distinction between ordinary corrugate and specialist deeper profiles.
- Six priced listings from four suppliers, plus two additional supplier listings explicitly withheld from conversion. Multiple Bunnings SKUs count as one supplier, not three independent confirmations.
- Seven published project accounts from six publishers. Unknown roof price/area remain "Not published". No contractor photos were copied.
- A sheet-only budget worksheet with two source-specific examples or the reader's own quoted rate, explicit GST, effective cover, plan/actual area, optional material allowance, supplier minimum quantity and downloadable calculation.
- Separate 100/150/200/250 m² arithmetic examples. Old complete-reroof prices are labelled historical and not blended into current supply-only rates.
- Native expandable evidence, a compact mobile contents list, a sticky desktop contents list, source review notes, contextual estimator/quote links and Article citations.
- An original HTML/CSS coverage illustration. No new dependency, font, third-party photograph or generic SEO article route.

## Files in this overlay

| File | Change |
|---|---|
| `CHANGES-RETURN.md` | This release manifest, replacing the earlier one. |
| `app/evidence.css` | Add scoped reference-guide, evidence-disclosure, cover diagram and worksheet styles using the existing RoofHub tokens. No global brand token changes. |
| `components/content/ResearchArticle.tsx` | Render new blocks; recursively collect disclosure evidence; reference-guide contents and source disclosure; contextual flow. Avoid duplicate FAQ section anchors on existing articles. |
| `components/content/CorrugatedEvidence.tsx` | New server components for market count signature, source-specific ledger, area examples and coverage illustration. |
| `components/content/CorrugatedBudget.tsx` | New client worksheet with explicit source scope, robust input errors, custom quoted pricing and text export. |
| `components/evidence/ArticleSchema.tsx` | Optional visible-source citations and safe JSON serialization. Other articles receive no invented extra markup. |
| `data/research/articles.json` | Replace only the `corrugated` record. The other 16 article records remain semantically identical. |
| `data/research/sources.json` | Add 24 source records. Existing 38 records are unchanged. 41 unique source URLs are cited on this page; 62 are now registered site-wide. |
| `data/research/projects.json` | Add five attributed project records; two existing examples are reused. Existing seven records are unchanged; 12 are now registered site-wide. |
| `data/research/types.ts` | Add typed disclosures, contextual actions and corrugated evidence/worksheet blocks. |
| `data/research/index.ts` | Traverse nested evidence to collect sources and observations instead of ignoring collapsed blocks. |
| `data/research/corrugated.json` | New per-listing cover, specification, minimum-order and exclusion metadata. No duplicated price amounts. |
| `data/research/corrugated.ts` | New typed accessors and worksheet presets derived from the central observation records. |
| `data/observations.ts` | Add five checked raw material observations, all excluded from pooled rate derivation. Existing 62 observations are unchanged. |
| `lib/corrugated-maths.ts` | New dependency-free listing normalisation, sheet-budget and sheet-count functions. Unknown GST/cover remain unknown. |
| `scripts/check-content.mjs` | Include nested disclosure observation references in the existing content gate. |
| `scripts/check-research.mjs` | Validate the new block/schema types, price metadata, provenance, counts, exclusions, routes and existing protected boundaries. |
| `scripts/check-math.cjs` | Add 40 real calculation/rate-integrity cases to the existing 46. |
| `docs/research/CORRUGATED-RESEARCH-2026-09-28.md` | Source register, data cohort, exact conversion decisions, project scope and future evidence priorities. |
| `docs/research/CORRUGATED-QA-2026-09-28.md` | Actual test results, honest environment limitations and mandatory preview/deployment checks. |

## Deliberately unchanged

- `.env.example`, all secrets/env handling and the server-only enquiry destination.
- `lib/site.ts`, `lib/seo.ts`, middleware, robots, sitemap, route registry and the `www.roofhub.co.nz` canonical policy.
- Clarity, ContactForm, enquiry API, spam/validation controls and lead delivery.
- Every file under `public/roofhub-estimator/`, its numeric rates, rate-card assumptions and separate noindex decision.
- `components/RoofHubEstimator.tsx`, the existing mount/quote API and its browser storage.
- `app/globals.css`, logo/media assets, existing font setup and design-system files.
- Package manifest, lockfile, Next configuration and dependencies.
- Editorial records for the other 16 research articles, and all existing source/project/observation records.

No Simple Estimator was built. No new professional review/endorsement, median national price, independent invoice verification, promised coating life or universal cheapest-material ranking was invented. No standard or third-party project photography was copied.

## Scope and conversion safeguards

The two usable covered-area examples have explicit caveats: R&C cover is approximate and its 50 lm minimum is honoured; Bitz cover comes from an archived seller listing and its gauge is not established as BMT. They are not equivalent specifications or low/high endpoints of one market range.

Bunnings GST/effective cover and Mitre 10 effective cover remain unconfirmed where the evidence does not establish them. Roof Crowd and WBS ambiguous listings are described but not converted. Historical installed guides stay dated with original scope and area basis. The new raw observations never silently replace the estimator's private/provisional rate card.

The sheet worksheet does not automatically seed the detailed estimator. Its CTA and text export are explicit about this. Do not claim automatic quantity transfer without implementing and testing it separately.

## Apply and verify

1. Apply the overlay to the current repository, retaining unlisted files and any independently added newer work.
2. Run the normal gates with real dependencies:

```bash
npm ci
npm test
npm run typecheck
npm run build
```

3. Use a preview deployment to verify `/roofing/corrugated`, real React input handling, source disclosures, mobile layout, calculation export, contextual contact links and the unchanged estimator.
4. Check the scope-specific sample outputs and edge cases in the QA document. Do not rewrite the researched content or combine unrelated rates to make the headline look cheaper.
5. After review, deploy through the existing production process with current indexing still enabled. Check the existing production checker. There is no new route to submit; inspect the existing corrugated URL in Search Console after the substantive content update.

## Validation performed here

- `npm test`: passed, including 2,071 research assertions, 86 math/rate-integrity cases and both existing estimator smoke tests.
- 73 TypeScript/TSX files passed syntax transpilation; strict checks of the real dependency-independent math/data modules passed.
- All 17 research article components produced static HTML. Ninety layout combinations at five widths passed the documented checks, including expanded corrugated evidence.
- Thirteen component-wiring checks exercised the actual worksheet event handlers with a minimal hook-state harness.
- Baseline comparison confirmed all protected files byte-identical and older records unchanged.

**Not certified here:** a complete dependency-resolved application typecheck/build or React/Next runtime. `npm ci` encountered `EAI_AGAIN` npm DNS failures and timed out. The offline layout/component harness is not a substitute for the normal deployment gate. Preview screenshots use fallback fonts and must not be described as a deployed screenshot.

Read the research and QA documents for the exact evidence boundaries. This release changes the corrugated reference resource, not the live site's plumbing or pricing policy.
