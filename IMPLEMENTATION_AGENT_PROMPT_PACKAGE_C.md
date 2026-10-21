# Copy-paste prompt for the RoofHub implementation agent - Package C

I have attached **RoofHub Package C: Phases 5 + 6 (Quote Checker MVP + Search/Mega-Source Expansion)**.

Please integrate it into the **newest Package B production/integration tree after Package B is green**. Your current integrated tree is authoritative for genuine fixes you made during Packages A/B, so reconcile rather than blindly overwriting.

Read these first:

1. `PACKAGE_C_HANDOFF.md`
2. `PHASE5_QUOTE_CHECKER_HANDOFF.md`
3. `PHASE6_SEARCH_CONTENT_HANDOFF.md`
4. `FILE_CHANGES_PACKAGE_C.md`
5. `docs/package-c/QUOTE_CHECKER_DECISION_MODEL.md`
6. `docs/package-c/SEARCH_COVERAGE_MATRIX.md`

Treat them as the implementation specification.

## Required implementation order

1. Reconcile this package against the latest integrated Package B tree.
2. Integrate/test **Phase 5 Quote Checker** first.
3. Run the full gates.
4. Integrate/test **Phase 6 search/content** second.
5. Run the full gates again.
6. Deploy preview and perform the manual QA below.

## Non-negotiable architecture rules

- Preserve the existing detailed estimator arithmetic unless you find and document a real defect.
- Quick Estimate, Detailed Estimate, Quote Checker and Ask RoofHub must share the same RoofProject model.
- The LLM is not a price engine.
- Quote Checker must not create a second rate card.
- Do not auto-promote fresh editorial/contractor cost guides into estimator rates.
- Keep `roofhub-nz-draft-2026-09-22` draft until there is a separate explicit pricing-approval decision.
- Public production keeps `NEXT_PUBLIC_ROOFHUB_QUICK_ESTIMATE_REVIEW=0`.
- Do not invent membrane pricing.
- A scope mismatch changes comparability, not price through an arbitrary multiplier.
- Quote Checker must not label a contractor/quote overpriced, unfair, bad or fraudulent from the price result.
- Professional users must be able to use the tools without being forced into a referral funnel.

## Phase 5 behavior to preserve

Quote Checker uses:

- quote amount;
- GST incl/excl/unknown;
- same/different/unknown roofing system;
- eight major tri-state scope items;
- Good / Partial / Not directly comparable states;
- below / within / above range only when permitted.

Unknown GST and a different roof system block direct price-position output.

Draft project pricing is withheld publicly. Review mode may show it only as an explicit calibration preview.

## Phase 6 SEO/content behavior to preserve

New crawlable pages:

- `/guides/compare-roofing-quotes`
- `/pricing/new-roof-cost`
- `/roofing/membrane`

Do not merge new-build cost into reroof cost. They intentionally own different search/project intents.

Do not broadly rewrite the existing high-signal pages listed in `SEARCH_COVERAGE_MATRIX.md` while integrating Package C.

Keep contractor cost-guide figures source-specific and preserve their limitations. They are not a RoofHub national tariff.

## Required gates

Run with a clean dependency tree:

```sh
npm ci
npm test
npm run typecheck
npm run build
```

Do not declare Package C complete until every gate is green.

Expected new Package C checks include:

- Quote Checker: 13,188 checks, including 6,561 exhaustive reroof scope permutations;
- search/content architecture: 60 checks;
- all Package A/B/content/math tests must remain green.

## Required preview QA

### Quote Checker

- fresh tab with no saved project;
- saved Quick Estimate project;
- saved Detailed Estimate project;
- GST included / plus GST / not sure;
- same / different / unknown roof system;
- aligned, mismatched and unknown scope;
- public draft-rate guard off;
- calibration review mode on;
- membrane project stays unpriced;
- Ask RoofHub explains without contractor-quality judgement;
- refine/build estimate keeps project context;
- mobile and print output.

### Search/content

- canonicals and metadata for all three new pages;
- sitemap registration and expected indexability;
- article source rendering;
- `/pricing/new-roof-cost` CTA preselects `project=new`;
- `/roofing/membrane` CTA preselects `product=membrane` and does not produce a fake price;
- `/guides/compare-roofing-quotes` opens Quote Checker;
- pricing/guides/roofing hubs expose the intended new pages;
- updated reroof/roofing-cost/long-run pages retain evidence and source structure;
- protected early-ranking product/comparison articles remain intact;
- no 404s, redirect chains or duplicate canonicals.

## Important source-tree fix included

A dependency-less QA pass found two Package B Assistant typing defects. Package C fixes them:

- use `PricingObservation.roofSystem`, not a non-existent `.system` property;
- allow optional price bounds in the Assistant observation formatter.

Preserve those fixes during reconciliation.

## Return to me

Please report:

1. Exact files changed during reconciliation.
2. Any Package B integration fixes you preserved and why.
3. `npm test`, `npm run typecheck` and `npm run build` results.
4. Quote Checker desktop/mobile QA notes.
5. Pricing-guard/review-mode QA result.
6. Confirmation membrane remains unpriced.
7. New route/canonical/sitemap/indexability QA.
8. Any content/source changes you had to make and why.
9. Preview URL.
10. Any remaining issue that needs a product/pricing decision rather than a coding fix.

Please implement the package rather than only reviewing it.
