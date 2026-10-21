# RoofHub Phase 5 Handoff: Quote Checker MVP

**Date:** 20 October 2026  
**Baseline:** Package B, complete source through Phase 4

## Goal

Add a high-intent Quote Checker that helps a New Zealander understand whether a roofing quote is genuinely comparable with the same RoofHub project before interpreting the headline price.

This is decision support, not a contractor rating, legal opinion or automatic lead funnel.

## New route

`/tools/quote-checker`

The route is deliberately `noindex` in Phase 5. The crawlable search surface is the companion editorial guide `/guides/compare-roofing-quotes` added in Phase 6.

## User flow

1. Enter quoted amount.
2. Mark GST included / excluded / unsure.
3. Confirm whether the quote is for the same roofing system as the saved RoofProject.
4. Mark major scope items included / excluded / unsure.
5. Receive a comparability result and, only when allowed, a price-position result.

The tool works with or without a pre-existing RoofProject:

- with a project, it can reuse the stored project/estimate context;
- without a project, it can still check quote scope and then route the user into RoofHub estimating without requiring contact details.

## Comparability states

### Good comparison

The required comparison inputs are known, the roofing system aligns and the major scope items align with the RoofHub reference scope.

### Partial comparison

A price position may be shown, but one or more product/scope facts are unknown or different. The tool explains why.

### Not directly comparable yet

The tool blocks the price-position label when:

- GST basis is unknown;
- the quote uses a different roofing system;
- no usable RoofHub reference range exists;
- the quote amount is invalid.

## Price labels

When comparison is permitted, Quote Checker may say only:

- below the RoofHub indicative range;
- within the RoofHub indicative range;
- above the RoofHub indicative range.

It does **not** infer:

- overpriced;
- cheap;
- unfair;
- poor value;
- good/bad contractor;
- which quote should win.

## Scope model

V1 tracks eight major scope areas:

- old-roof removal and disposal;
- scaffold / edge protection / assessed access;
- underlay;
- flashings;
- gutters and downpipes;
- timber/structural repairs;
- asbestos testing/specialist removal;
- consent/design/engineering fees.

Every item is tri-state: included, excluded, unknown.

A mismatch changes **comparability**. It does not create a made-up dollar adjustment.

## GST

The pure calculation model uses the NZ 15% GST rate only when the user explicitly says the quote is GST exclusive.

- incl -> unchanged;
- excl -> multiply by 1.15;
- unknown -> do not normalise, therefore no direct price-position label.

## Pricing authority

Quote Checker uses the same Phase 1/2 estimator-rate approval registry.

Package C does not approve `roofhub-nz-draft-2026-09-22`.

Public mode therefore withholds a draft RoofHub project range.

Controlled review mode can expose the deterministic draft range for calibration only:

```sh
NEXT_PUBLIC_ROOFHUB_QUICK_ESTIMATE_REVIEW=1
```

The UI labels that output as a calibration preview. Do not use this setting as a substitute for rate-card approval.

Membrane remains unpriced because its estimator pathway is still `not-configured`.

## Shared project state

Quote answers are persisted into the existing non-sensitive `RoofProject.quoteCheck` object:

- quoted amount;
- GST basis;
- known inclusions;
- known exclusions;
- comparison status;
- comparability.

No contact data is added to RoofProject.

The selected quote/product-match state is encoded in the existing inclusion/exclusion arrays, so Phase 5 does not require a RoofProject schema migration.

## Assistant integration

Ask RoofHub can now route users to Quote Checker through the allowlisted tool action.

The Assistant system contract explicitly treats Quote Checker as scope/comparability decision support rather than a contractor-quality judgement.

The model still cannot generate project prices. Any project range must come from deterministic RoofHub calculation and the same rate-card guard.

## Analytics

Phase 5 uses the already-approved analytics contract:

- `quote_checker_start`
- `quote_checker_result`

Only non-sensitive context such as project type, roof system and comparability state is sent. Quote amount and conversation/contact data are not added to the general analytics payload.

## Files

New:

- `app/tools/quote-checker/page.tsx`
- `components/quote-checker/QuoteChecker.tsx`
- `components/quote-checker/QuoteChecker.module.css`
- `lib/quote-checker/index.mjs`
- `lib/quote-checker/index.d.mts`
- `lib/quote-checker/project-adapter.ts`
- `scripts/check-quote-checker.mjs`
- `docs/package-c/QUOTE_CHECKER_DECISION_MODEL.md`

Integrated with:

- homepage;
- tools hub;
- site route registry;
- assistant action/navigation types and orchestrator;
- shared RoofProject.

## Automated QA

`check:quote-checker` currently passes **13,188 checks**.

That includes every one of the **6,561** possible three-state scope combinations for the eight reroof scope items.

The regression suite verifies:

- GST normalisation;
- good/partial/not-direct comparability;
- above/within/below position;
- product mismatch blocking;
- missing-reference blocking;
- no fabricated scope-price adjustment;
- rate-card approval guard;
- noindex boundary;
- required neutral language.

## Manual preview QA

Test at minimum:

1. Fresh tab, no RoofProject -> quote scope check -> build estimate CTA.
2. Existing Quick Estimate project -> Quote Checker.
3. Existing Detailed Estimate project -> Quote Checker.
4. GST included vs plus GST vs unsure.
5. Same vs different vs unknown roofing system.
6. Every major scope item can move between included/excluded/unknown.
7. Draft rate guard off -> no public project-price comparison.
8. Review mode on -> explicit calibration language.
9. Membrane project -> no fabricated RoofHub membrane price.
10. Result -> Ask RoofHub uses neutral decision-support language.
11. Result -> refine/build estimate retains project state.
12. Mobile layout, print result and browser back/forward behaviour.

## Deliberately not in Phase 5

- PDF/image quote upload;
- OCR;
- automatic line-item extraction;
- multi-quote side-by-side extraction;
- contractor ranking;
- contractor fraud/fairness scoring;
- automatic referral;
- invented regional price multipliers.

Those belong to later phases after the manual comparison model has real usage data.
