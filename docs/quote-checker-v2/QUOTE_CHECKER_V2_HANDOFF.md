# RoofHub Quote Checker V2 patch handoff

**Date:** 2026-10-21
**Purpose:** remove the dead-end Quote Checker result exposed by a real user test and make a usable RoofHub price baseline part of the checker journey.

## Root cause

The Phase 5 Quote Checker only read `RoofProject.estimate`. It did not create one. A visitor could answer every quote-scope question and still reach a result with:

- product match: same system;
- unresolved scope questions: 0;
- no price position;

because they had not previously completed Quick Estimate or Detailed Estimator.

Unknown GST was also treated as a hard blocker even though RoofHub can safely show both valid GST interpretations.

## What V2 changes

### 1. Explicit baseline step before scope/result

Flow is now:

`amount -> product -> baseline -> scope -> result`

If a saved Quick/Detailed estimate exists, Quote Checker reuses it.

If not, the visitor gets three clear options:

1. **Create a compact baseline inside Quote Checker** (recommended).
2. **Open the full Quick Estimate** and return.
3. **Open the Detailed Estimator** and return.

The compact option asks only enough roof facts to create an indicative comparison range. It calls the existing Quick Estimate geometry and existing detailed-estimator pricing runtime. No second price engine or rate card was created.

### 2. Compact baseline inputs

The user supplies/chooses:

- new roof or re-roof;
- roofing system;
- approximate size or known area;
- roof shape (not sure allowed);
- pitch (not sure allowed);
- storeys (not sure allowed);
- existing roof for reroof (not sure allowed);
- difficult access flag.

Only project type, a priced roof system, and approximate size/area are mandatory.

### 3. Unknown GST no longer kills the result

When GST is unknown, Quote Checker now shows:

- amount if GST is already included;
- amount if GST is extra;
- price position of each scenario against the same RoofHub baseline.

If the two scenarios lead to different positions, the checker says GST changes the price position rather than fabricating one answer.

### 4. Result hierarchy improved

The result now leads with **"Here's what RoofHub found"** and separately reports:

- comparison quality;
- product match;
- scope differences;
- unresolved scope questions;
- price/GST scenarios.

A missing baseline no longer makes the useful scope analysis look like a failed tool.

### 5. Estimator return paths

`QuickRoofEstimate.tsx` now detects `?from=quote-checker` and offers **Use this estimate in Quote Checker**.

`RoofHubEstimator.tsx` detects `?from=quote-checker`, can import compatible quick-estimate measurements, explains that it is building the detailed comparison baseline, and provides a return path to Quote Checker.

Quote answers remain in session-scoped `RoofProject` while the user moves between tools.

### 6. Printable result cleanup

Quote Checker print CSS hides the normal site header/footer, mobile drawer, Ask RoofHub launcher/dialog and keeps result/table blocks together where possible. This fixes the supplied PDF problem where normal navigation/assistant UI cut through the printed quote report.

## Important integration note

This patch was developed on the Package C source snapshot. The production/integration branch is newer.

**Merge this patch. Do not overwrite newer work.** In particular preserve:

- the live V1 price activation and disclosure already requested/implemented;
- GPT-6 Luna / low-reasoning Assistant configuration;
- roof-shape cleanup;
- Knowledge & Authority V3 changes;
- any legitimate fixes made by the implementation agent after Package C.

The patch deliberately does **not** include `lib/estimator/rate-card.ts` or the estimator's underlying rate values. Its baseline builder expects the newest branch's live V1 pricing decision to remain in force.

## Files

Core V2:
- `components/quote-checker/QuoteChecker.tsx`
- `components/quote-checker/QuoteChecker.module.css`
- `lib/quote-checker/index.mjs`
- `lib/quote-checker/index.d.mts`
- `lib/quote-checker/project-adapter.ts`
- `lib/quote-checker/baseline.ts` (new)

Cross-tool return paths:
- `components/quick-estimate/QuickRoofEstimate.tsx`
- `components/RoofHubEstimator.tsx`

Regression:
- `scripts/check-quote-checker.mjs`

Documentation:
- `docs/quote-checker-v2/DECISION_MODEL.md`
- this handoff
- agent prompt
- file manifest / unified diff

## QA completed on source snapshot

`npm test` passes.

Key counts:
- research: 3,480;
- maths/rate integrity: 183;
- pressed-tile harness: 23;
- shared foundation: 13;
- Quick Estimate: 6,079;
- Assistant architecture/pricing/privacy: 19;
- conversion: 20;
- **Quote Checker V2: 13,204 checks, including all 6,561 reroof scope permutations**;
- Package C search/content: 60.

Changed TS/TSX source files were syntax-transpiled successfully with TypeScript 5.8.3.

## Agent release gates

On the newest integrated branch run:

```bash
npm ci
npm test
npm run typecheck
npm run build
```

Then manually test at minimum:

1. Direct visitor with no saved project -> Quote Checker -> compact baseline -> scope -> actual price result.
2. Existing Quick Estimate -> Quote Checker reuses baseline.
3. Existing Detailed Estimate -> Quote Checker reuses measured baseline.
4. Quote Checker -> full Quick Estimate -> Return -> price comparison appears.
5. Quote Checker -> Detailed Estimator -> Return -> detailed range appears.
6. GST included.
7. GST excluded.
8. GST unknown where both scenarios have same price position.
9. GST unknown where the two scenarios have different positions.
10. Same product.
11. Different product -> build matching baseline.
12. Scope mismatch -> price position remains visible where defensible, but comparability is partial.
13. Missing baseline -> scope-only result still tells the visitor what was learned and has a direct baseline CTA.
14. Membrane -> no invented price.
15. Print result -> no site header/footer/Assistant overlay through the report.
16. Mobile baseline form and result.

## Desired production outcome

A visitor who spends time entering a quote should never arrive at a seemingly empty result merely because they did not know RoofHub required an estimate first. The requirement is now explained and resolved before the result, with the shortest possible path to a comparison baseline.
