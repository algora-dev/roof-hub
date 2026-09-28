# RoofHub Content and Answers v0.6: return instructions

**Apply this as an overlay to the current repository, not a replacement website.**

Baseline: the supplied `roofhub-codebase-2026-09-28.zip`, identified in its agent rules as git main `5b87d0c` (Clarity addition). This return ZIP contains only added/changed full files. It does not contain the whole repository, dependencies, font files, credentials or build output. No deletions or renames are required.

The v0.6 name identifies this content release. The application package version and dependency lock remain as supplied; only package scripts changed.

## What to do

1. Create a branch from the current RoofHub repo. If it has changes after the supplied baseline, compare those changes before overwriting the corresponding files.
2. Overlay every file in this ZIP at the same relative path. Keep all unlisted files.
3. Run the normal checks below. Do not skip the full typecheck/build on the basis of the offline QA record.
4. Deploy to a preview, run the interaction checklist, then apply your normal production release process.
5. Keep existing environment variables, canonical host, private email configuration and indexing decision. This patch does not authorise flipping indexing or changing domains.

```bash
npm ci
npm test
npm run typecheck
npm run build
```

`npm test` now includes content, research and math checks. After deployment, use the existing production checker with `EXPECT_INDEXING` matching the current deployment, and inspect the rendered canonical/sitemap/robots behaviour. Do not submit previews to search engines.

## What is implemented

- All public em dashes removed, including home title/hero, metadata, article content and estimator output strings. A regression check rejects literal and common encoded forms.
- Ten existing cornerstone articles rewritten and seven question-led routes added. Substantive answers, HTML tables, sources and examples are server-rendered; small calculators progressively enhance the page.
- 38 source-page records and seven attributed real project accounts, with source dates/limitations and missing costs kept explicit.
- Four small inline arithmetic utilities, not the deferred Simple Estimator.
- An Answers directory, homepage question links, article contents navigation, related articles and contextual project/correction enquiries.
- Historical/current and plan/slope/scaffold pricing distinctions retained. Uncertain prices do not become invented current ranges.

## Seven added routes

| Question | Path |
|---|---|
| Corrugated or five-rib? | `/guides/corrugated-vs-five-rib` |
| How much does a 200m² roof cost? | `/pricing/200m2-roof-cost` |
| How long does a metal roof last? | `/guides/how-long-does-a-metal-roof-last` |
| Can concrete tiles be replaced with metal? | `/guides/replacing-concrete-tiles-with-metal-roofing` |
| COLORSTEEL or ZINCALUME? | `/guides/colorsteel-vs-zincalume` |
| How long does a reroof take? | `/guides/how-long-does-a-reroof-take` |
| Could Decramastic contain asbestos? | `/guides/does-decramastic-contain-asbestos` |

## Deliberately unchanged

- `ALLOW_INDEXING`, canonical host, middleware, robots and sitemap generation logic. Only the shared route manifest gains new content entries and genuine review dates.
- Vercel settings, env example, credentials and private server enquiry destination.
- Enquiry API, Microsoft Clarity setup, estimator bridge, rate numbers, tax assumptions and estimator noindex status.
- Next/React dependency versions and package lock.
- Existing brand/logo assets and font setup. No third-party photos or font files are redistributed.
- No Simple Estimator, scraping automation, rating system, invented reviews or artificial product-price ranking.

## Verification and remaining gate

The software checks pass: 1,655 research assertions, 46 math/rate cases, existing estimator smoke checks, 69 TS/TSX syntax passes, and strict typing for the pure data/math modules. Offline static layout checks cover 23 pages at four widths, with no document-level overflow or broken local links.

These are not a full Next production build or real React interaction test. The sandbox cannot install the project packages, so `npm ci`, full framework typecheck/build, browser interactions, live forms and the actual deployment still need the normal environment. No production files or settings were changed remotely.

Read `docs/research/QA-2026-09-28.md` for exact test scope and `docs/research/EDITORIAL-RESEARCH-2026-09-28.md` for the source corrections and maintenance rules. The previous broader platform blueprint remains useful but does not override these more specific return instructions.

## Per-file changes

| File | Status | Change |
|---|---|---|
| `app/contact/page.tsx` | Changed | Correct enquiry instructions so they match the required response email field. |
| `app/evidence.css` | Changed | Add responsive article, contents navigation, comparison, project-card and calculator styles using the existing site tokens. |
| `app/guides/colorsteel-vs-zincalume/page.tsx` | Added | Add question-led route using shared article content and existing metadata helpers. |
| `app/guides/corrugated-vs-five-rib/page.tsx` | Added | Add question-led route using shared article content and existing metadata helpers. |
| `app/guides/does-decramastic-contain-asbestos/page.tsx` | Added | Add question-led route using shared article content and existing metadata helpers. |
| `app/guides/how-long-does-a-metal-roof-last/page.tsx` | Added | Add question-led route using shared article content and existing metadata helpers. |
| `app/guides/how-long-does-a-reroof-take/page.tsx` | Added | Add question-led route using shared article content and existing metadata helpers. |
| `app/guides/how-to-prepare-for-a-roofing-quote/page.tsx` | Changed | Public-copy punctuation only. |
| `app/guides/page.tsx` | Changed | Replace the guide directory with grouped, question-led answers and tool links. |
| `app/guides/replacing-concrete-tiles-with-metal-roofing/page.tsx` | Added | Add question-led route using shared article content and existing metadata helpers. |
| `app/guides/roof-area/page.tsx` | Changed | Replace existing cornerstone content with the researched article renderer and metadata. |
| `app/guides/roof-pitch/page.tsx` | Changed | Replace existing cornerstone content with the researched article renderer and metadata. |
| `app/layout.tsx` | Changed | Remove title punctuation and add a keyboard skip link/main target; preserve providers and indexing behaviour. |
| `app/methodology/page.tsx` | Changed | Explain historical prices, conflicting evidence, scope, source checks and calculator assumptions. |
| `app/page.tsx` | Changed | Replace hero/browser-title em dashes, add direct question cards and visitor-facing wording. |
| `app/pricing/200m2-roof-cost/page.tsx` | Added | Add question-led route using shared article content and existing metadata helpers. |
| `app/pricing/page.tsx` | Changed | Connect the pricing hub to the 200m² question and material evidence. |
| `app/pricing/reroof-cost/page.tsx` | Changed | Replace existing cornerstone content with the researched article renderer and metadata. |
| `app/pricing/roofing-costs/page.tsx` | Changed | Replace existing cornerstone content with the researched article renderer and metadata. |
| `app/pricing/scaffolding-cost/page.tsx` | Changed | Replace existing cornerstone content with the researched article renderer and metadata. |
| `app/roofing/corrugated/page.tsx` | Changed | Replace existing cornerstone content with the researched article renderer and metadata. |
| `app/roofing/five-rib/page.tsx` | Changed | Replace existing cornerstone content with the researched article renderer and metadata. |
| `app/roofing/long-run/page.tsx` | Changed | Replace existing cornerstone content with the researched article renderer and metadata. |
| `app/roofing/pressed-metal-tile/page.tsx` | Changed | Replace existing cornerstone content with the researched article renderer and metadata. |
| `app/roofing/tray-standing-seam/page.tsx` | Changed | Replace existing cornerstone content with the researched article renderer and metadata. |
| `app/sources/page.tsx` | Changed | Expose the active research source register with dates and limitations. |
| `app/terms/page.tsx` | Changed | Public-copy punctuation only. |
| `components/ContactForm.tsx` | Changed | Safely prefill allowed enquiry topics and same-site page context; no recipient or backend changes. |
| `components/Header.tsx` | Changed | Use Answers navigation and add a roofing-system entry without replacing the header design. |
| `components/PreviewBanner.tsx` | Changed | Punctuation only; preview/indexing behaviour unchanged. |
| `components/content/QuantityCalculator.tsx` | Added | Add four validated client arithmetic modes: roof area, rise/run pitch, sheet cover conversion and own-rate budget. |
| `components/content/QuestionLinks.tsx` | Added | Reusable server-rendered related-question cards. |
| `components/content/ResearchArticle.tsx` | Added | Render complete source-backed articles, tables, real-project cards, contents, related links and contextual enquiries. |
| `components/evidence/MethodologyNote.tsx` | Changed | Punctuation only. |
| `components/evidence/PriceTable.tsx` | Changed | Display source-specific prices, dates, tax, historical status, scope and inline source links; accessible overflow region. |
| `components/evidence/Sources.tsx` | Changed | Punctuation only. |
| `data/content.ts` | Changed | Carry source/date/notes through price rows and label observation units accurately. |
| `data/derive.ts` | Changed | Prevent misleading observed spans from mixed GST/scope/area, historical/disputed evidence, invalid amounts or incomplete ranges. |
| `data/observations.ts` | Changed | Correct reviewed dates, units and interpretation; add three scaffold observations with evidence limitations; retain older research records. |
| `data/research/articles.json` | Added | 17 articles: rewrite the existing 10 cornerstones and add seven question-led resources. |
| `data/research/index.ts` | Added | Typed accessors and source/observation collection for editorial records. |
| `data/research/projects.json` | Added | Seven attributed published project examples with unknown prices/areas preserved. |
| `data/research/sources.json` | Added | 38 source-page records with publisher, source type, dates and limitations. |
| `data/research/types.ts` | Added | Typed editorial blocks, sources, projects and article contracts. |
| `data/siteRoutes.ts` | Changed | Register seven routes and update only substantively reviewed route dates; preserve estimator noindex. |
| `data/technicalSources.ts` | Changed | Preserve product-width conflicts and legacy safety-source limitations. |
| `data/types.ts` | Changed | Add hourly/scaffold-week units and price provenance/eligibility fields. |
| `docs/research/EDITORIAL-RESEARCH-2026-09-28.md` | Added | Record source discrepancies, evidence policy, maintenance and next data priorities. |
| `docs/research/QA-2026-09-28.md` | Added | Record tests actually run, offline-render limits and deployment checks. |
| `lib/roof-maths.ts` | Added | Pure validated geometry and own-price arithmetic, separate from market rates. |
| `lib/seo.ts` | Changed | Remove the em dash from Open Graph alternative text; canonical/indexing logic unchanged. |
| `package.json` | Changed | Add research/math check scripts and include them in npm test; dependency versions unchanged. |
| `public/roofhub-estimator/src/core/export.mjs` | Changed | Remove em dashes from exported copy; calculations untouched. |
| `public/roofhub-estimator/src/core/rates.mjs` | Changed | Remove em dashes from explanatory strings/comments; all numeric rates and flags preserved. |
| `public/roofhub-estimator/src/ui/app.mjs` | Changed | Remove public UI em dashes; existing flow retained. |
| `public/roofhub-estimator/src/ui/styles.css` | Changed | Punctuation cleanup in source comments; theme retained. |
| `public/roofhub-estimator/src/ui/views.mjs` | Changed | Remove public-facing em dashes from estimator views. |
| `scripts/check-content.mjs` | Changed | Parse actual observation records and include new JSON article references in existing checks. |
| `scripts/check-math.cjs` | Added | 46 executable geometry/rate-integrity checks using the existing TypeScript dev dependency. |
| `scripts/check-research.mjs` | Added | Validate sources, routes, pricing references, review dates and no-em-dash/privacy boundaries. |
| `scripts/submit-indexnow.mjs` | Changed | Comment punctuation only; submission behaviour unchanged. |
| `CHANGES-RETURN.md` | Added | Apply instructions and complete return manifest. |
