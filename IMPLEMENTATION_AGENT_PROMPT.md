# Copy-paste prompt for the RoofHub implementation agent

You are integrating **RoofHub Package A: Phases 1 + 2 (Shared Foundation + Quick Estimate)** into the newest RoofHub production codebase.

Use the attached Package A ZIP as the implementation source. Read these first:

1. `PACKAGE_A_HANDOFF.md`
2. `PHASE1_HANDOFF.md`
3. `PHASE2_HANDOFF.md`
4. `FILE_CHANGES_PACKAGE_A.md`
5. `docs/quick-estimate-calibration.json`

## Required approach

- Start from the newest production branch/tree and reconcile genuine newer production changes rather than blindly overwriting files.
- Preserve the existing detailed-estimator arithmetic. Do not rewrite `public/roofhub-estimator/src/core/` unless you find and document a real pre-existing defect.
- Preserve the Phase 1 rule of one shared non-PII `RoofProject` and one deterministic pricing authority.
- Do not create a second Quick Estimate rate table.
- Do not invent membrane pricing.
- Do not remove the public rate-card approval guard.
- Keep the Quick Estimate result ungated: a user must not need to submit contact details merely to use the tool or see an approved result.
- Keep professional use viable. Do not force builders/roofers through a homeowner lead-generation workflow.

## Critical environment rule

For public production keep:

```sh
NEXT_PUBLIC_ROOFHUB_QUICK_ESTIMATE_REVIEW=0
```

The current estimator card `roofhub-nz-draft-2026-09-22` is deliberately not approved for public Quick Estimate prices yet.

You may use `NEXT_PUBLIC_ROOFHUB_QUICK_ESTIMATE_REVIEW=1` on a controlled preview/staging deployment so we can review draft calibration outputs. Do not interpret that preview switch as rate-card approval.

The `/tools/roof-estimate` route should remain noindex until the pricing/calibration approval decision is made.

## Required gates

After integration run:

```sh
npm ci
npm test
npm run typecheck
npm run build
```

Do not declare the integration complete if any gate fails. Fix integration/type/build issues without weakening regression tests or bypassing the pricing approval boundary.

The expected test suite includes:

- RoofHub research/content checks;
- 183 maths/rate-integrity cases;
- 23 pressed-tile scenarios;
- 13 Phase 1 foundation/regression cases;
- 6,079 Quick Estimate cases.

## Required manual QA

On a preview/staging deployment:

1. Test `/tools/roof-estimate` on desktop and mobile.
2. Test new roof, reroof and unsure paths.
3. Test unknown roof shape/size/pitch paths.
4. Test optional actual roof area, footprint and total-floor-area inputs.
5. Test corrugate, five-rib, tray, pressed metal tile, membrane and undecided product paths.
6. Confirm incompatible/uncertain pitch-product combinations are not presented as certain.
7. Confirm unconfigured complexity remains visible instead of receiving hidden multipliers.
8. Confirm membrane remains honestly unpriced.
9. With staging calibration mode enabled, compare representative outputs against `docs/quick-estimate-calibration.json`.
10. Test **Make this estimate more accurate** into the detailed estimator. Approximate quantities must carry across as estimated, not measured.
11. Confirm users can replace imported approximate quantities with actual measurements.
12. Test the structured project enquiry and separate partner-sharing consent.
13. Regression-test existing contact/detailed-estimator enquiry behavior.
14. Run the normal post-deploy production smoke/check workflow.

## Handoff back to us

Return:

- exact files changed during reconciliation;
- results of `npm test`, `npm run typecheck` and `npm run build`;
- preview/staging URL;
- any conflicts with newer production code and how you resolved them;
- screenshots or concise notes for desktop/mobile Quick Estimate;
- any calibration outputs that differ from the supplied reference;
- any issues you believe require a pricing/product decision rather than a coding fix.

Do not approve the estimator rate card, enable public draft price display, or add membrane rates unless explicitly instructed after calibration review.
