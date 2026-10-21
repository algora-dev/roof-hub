# RoofHub Package C Handoff: Phases 5 + 6

**Package:** Quote Checker MVP + Search/Mega-Source Expansion  
**Date:** 20 October 2026  
**Baseline:** RoofHub Package B (Phases 1-4)

## What this package contains

Package C is the complete RoofHub source tree through **Phase 6**.

It adds two logically separate layers:

### Phase 5 - Quote Checker MVP

- manual quote amount + GST basis;
- same/different/unknown roofing-system state;
- eight tri-state scope checks;
- Good / Partial / Not directly comparable comparability states;
- above / within / below indicative range only when comparison is defensible;
- no contractor-quality or fairness judgement;
- no fabricated scope dollar adjustments;
- shared RoofProject persistence;
- public draft-rate guard inherited from Quick Estimate;
- membrane no-price guard;
- Ask RoofHub routing;
- homepage/tools entry points;
- noindex interactive route;
- 13,188-case regression suite, including 6,561 exhaustive reroof scope permutations.

### Phase 6 - Search & Mega-Source Expansion

New crawlable pages:

- `/guides/compare-roofing-quotes`;
- `/pricing/new-roof-cost`;
- `/roofing/membrane`.

Strengthened existing surfaces:

- `/pricing/roofing-costs`;
- `/pricing/reroof-cost`;
- `/roofing/long-run`;
- pricing/guides/roofing hubs;
- homepage discovery links;
- contextual article actions;
- assistant destination catalogue.

The search work is based on the supplied GSC exports plus a fresh 20 October 2026 review of NZ government, industry, manufacturer and current contractor-guide sources.

## Architecture that must remain intact

```text
Raw/editorial evidence
        ↓
Approved estimator rate-card boundary
        ↓
Existing deterministic estimator
        ↓
Quick Estimate / Detailed Estimate / Quote Checker
        ↓
Ask RoofHub explanation and routing
```

Do not allow a fresh content source to become an estimator rate just because it publishes a dollar range.

Package C intentionally adds current cost-guide sources to the research registry without auto-promoting them into the deterministic rate card.

## Rate-card status

Still draft:

`roofhub-nz-draft-2026-09-22`

Package C does not approve it.

Public production should remain:

```sh
NEXT_PUBLIC_ROOFHUB_QUICK_ESTIMATE_REVIEW=0
```

Controlled preview/calibration may use `1` only for review.

This same guard now applies to Quote Checker price-position comparisons.

Membrane remains `not-configured` for estimator pricing.

## Integration order

The implementation agent should only start Package C after the newest Package B integration is green.

The agent's integrated production tree is authoritative for genuine reconciliation fixes. Do not blindly overwrite those fixes with this snapshot.

Recommended order:

1. Reconcile Package C against the newest integrated Package B branch.
2. Integrate Phase 5 pure Quote Checker model + tests.
3. Run tests/typecheck/build.
4. Integrate Quote Checker UI, shared project adapter and assistant/tool entry points.
5. Run tests/typecheck/build and preview QA.
6. Integrate Phase 6 source registry + new article routes/data.
7. Integrate Phase 6 hub/homepage/contextual-action updates.
8. Run complete tests/typecheck/build.
9. Deploy preview.
10. Perform the manual product/search QA in the phase handoffs.
11. Only then promote to production.

## Full automated test status in this workspace

```text
Content/core checks: passed
Research checks: 3,477 passed
Research articles: 20
Registered sources: 126
Attributed projects: 22
Unique rechecked price observations: 23
Math/rate-integrity: 183 passed
Pressed-tile component scenarios: 23 passed
Phase 1 foundation/regression: 13 passed
Quick Estimate: 6,079 passed
Smart Assistant: 19 passed
Site/conversion: 20 passed
Quote Checker: 13,188 passed
  - exhaustive reroof scope permutations: 6,561
Package C search/content boundaries: 60 passed
```

`npm test` is green.

## Typecheck/build status in this workspace

A clean `npm ci` could not complete in this environment and timed out. There is no usable installed Next/React dependency tree here.

A dependency-less global TypeScript pass therefore reports the expected missing `next`, `react`, JSX and Node type declarations and is **not** a valid production typecheck.

That pass did expose two independent Package B Assistant typing defects that were valid even without framework types:

- `PricingObservation.system` corrected to `PricingObservation.roofSystem`;
- optional observation amount bounds accepted as `undefined` by the formatter.

Those are fixed in this Package C source tree.

The implementation agent must run the real gates with a complete dependency install:

```sh
npm ci
npm test
npm run typecheck
npm run build
```

Do not ship if typecheck/build fails.

## Manual QA priorities

### Quote Checker

- fresh/no-project use;
- existing Quick Estimate and Detailed Estimate projects;
- GST incl/excl/unknown;
- same/different/unknown product;
- scope mismatches and unknowns;
- draft rate guard off/on;
- membrane project;
- Ask RoofHub explanation;
- mobile and print result.

### Search/content

- new URLs/canonicals/schema/sitemap;
- new-roof `project=new` preset;
- membrane `product=membrane` preset and no price fabrication;
- compare-quotes -> Quote Checker;
- broad pricing pages preserve evidence/source display;
- high-signal product/comparison articles remain structurally unchanged;
- internal links have no redirects/404s.

## Package documents

Read in this order:

1. `PACKAGE_C_HANDOFF.md`
2. `PHASE5_QUOTE_CHECKER_HANDOFF.md`
3. `PHASE6_SEARCH_CONTENT_HANDOFF.md`
4. `FILE_CHANGES_PACKAGE_C.md`
5. `docs/package-c/QUOTE_CHECKER_DECISION_MODEL.md`
6. `docs/package-c/SEARCH_COVERAGE_MATRIX.md`
7. `IMPLEMENTATION_AGENT_PROMPT_PACKAGE_C.md`

Package A and B handoffs remain included for foundation context.

## Scope deliberately deferred

Package C does not add:

- quote PDF/image extraction;
- OCR;
- multi-quote document intelligence;
- automatic contractor ranking;
- partner CRM/lead-routing operations;
- user accounts/dashboard;
- arbitrary regional pricing multipliers;
- an approved membrane rate card;
- automatic approval of the current draft metal-roof estimator rates.

Those later capabilities should build on real Quote Checker and Assistant usage rather than being guessed now.
