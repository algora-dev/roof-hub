# Editorial and research notes

## What this release adds

The 10 original cornerstone articles now share an answer-first, source-backed renderer. Seven additional question-led pages cover a 200m² budget, corrugate versus five-rib, roof lifespan, concrete-tile replacement, COLORSTEEL versus ZINCALUME, reroof duration and Decramastic/asbestos.

The homepage and Answers directory link directly to the questions. The content model stores articles, sources and attributed projects separately. Prices continue to come from the existing observations dataset. There are four small embedded arithmetic tools, not a new questionnaire estimator and not a second market-price engine.

## Source policy

Technical and safety statements use manufacturers, NZMRM, MBIE and WorkSafe. Contractor/designer guides are labelled as their published observations, not national survey results. Manufacturer case studies and contractor project accounts remain attributed. Source review dates are distinct from original publication dates, including a year-only date where no exact date is published.

No contractor photographs, logos or article bodies were copied into this patch. Project cards link to the original story and photography. All seven project records have unknown price and measured area because those fields were not published in the reviewed accounts. A future priced-project feature must add metric provenance and update its validation; do not simply replace nulls with estimates.

## Corrections worth preserving

1. **Arcline**: the roofing-types article is dated 10 February 2024. Its $60/$65 tile figures include material and installation, not raw material supply. Its long-run $80–$100/m² figure explicitly uses plan area. The figures remain dated historical observations.
2. **Delta Roofing**: its reviewed cost guide is a 2025 guide with GST, scaffold and removal included. Do not compare those rates with a bare sheet price or current cost card. Historical Endura/Maxx product names are not current product-selection advice.
3. **COLORSTEEL**: current product context identifies MAXAM rather than silently carrying forward the older Endura/Maxx naming.
4. **ZINCALUME**: NZ Steel describes the 2025 introduction of its AM125 aluminium/zinc/magnesium coating. The material comparison does not repeat an older AZ-only description as universal current fact.
5. **Dimond Hi Five**: the reviewed page displays 765 mm cover in the overview and 755 mm in the performance section. The article flags the conflict and requires manufacturer confirmation before using the width for an order.
6. **Bitz & Piecez**: $17.49/lm includes GST on the reviewed steel listing. Gauge, brand, cover and installation scope must not be inferred from another product. No generic retail listing is presented as a branded system-equivalent quote.
7. **Upwell**: the site identifies three-plank scaffold and uses elevation area. Its headline and example totals do not reconcile. Both headline observations are marked ineligible for a derived range, and the four-plank estimator is not repriced from this evidence.
8. **ScaffoldMe**: a sale package and an embedded builder rental account are different observations. The rental anecdote does not establish a current four-plank tariff or explicit GST basis.
9. **WorkSafe**: the legacy roof guide is distinguished from current safety/asbestos guidance. Neither a storey selector nor an article is a safety-system approval.
10. **Consent**: product change is not treated as automatic proof that consent is or is not needed. The article points to MBIE's actual exemption conditions and keeps structural/design assessment separate.

Exact source links, titles, review dates and limitations live in `data/research/sources.json`; individual monetary records remain in `data/observations.ts`. The corrections above are editorial findings, not representations that RoofHub independently tested products or audited contractors.

## How to maintain the content

- Edit an answer/section in `data/research/articles.json`, using the existing discriminated block types.
- Add the precise source page to `sources.json` and attach its ID to the claim or table row it supports.
- Keep quoted project outcomes in `projects.json`; do not fabricate missing quantities or cost data.
- For price tables, use observation IDs rather than retyping values in several pages.
- Preserve unknown GST, missing scope and historical dates. Do not convert unknown tax to included tax.
- Update the article's review date and relevant route modification date only after meaningful review/change.
- Run `npm test`. Date checks accept genuine future review updates; they do not force all sources to have the same day.
- `deriveRate` is an observed-span helper, not a typical-price model. It refuses unknown GST, mixed scopes/area bases, incomplete ranges and explicitly historical/disputed records. The detailed estimator still uses its separate existing provisional rate card.

## Next evidence improvement

The next high-value input is a permissioned, like-for-like set of actual roof quotes or completed-project costs with area, location, specification, GST, access, removal and date. That would support narrower and more useful comparisons. More pages repeating incompatible ranges would not.

Obtain permissioned project photography or create original RoofHub diagrams before adding photographic case-study galleries. Do not scrape and republish competitor images merely because their story is cited. This release makes no claim to hands-on product testing, representative national medians or guaranteed search/AI visibility.
