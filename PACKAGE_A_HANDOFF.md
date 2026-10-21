# RoofHub Package A Handoff: Phases 1 + 2

**Package:** Shared Foundation + Quick Estimate  
**Date:** 20 October 2026  
**Intended recipient:** implementation/integration agent

## What this package is

This is the single package to integrate in place of the earlier Phase 1-only return.

It contains:

### Phase 1: Shared Foundation

- versioned non-sensitive `RoofProject`;
- tab-isolated project store;
- tool/page context contract;
- privacy-conscious analytics contract;
- typed detailed-estimator bridge;
- detailed-estimator to shared-project adapter;
- versioned estimator rate-card approval boundary;
- membrane-ready shared taxonomy without membrane price fabrication;
- structured project enquiry and separate sharing consent;
- application-layer enquiry throttling;
- Clarity/session-storage/project-enquiry privacy updates;
- frozen detailed-estimator calculation regression fixtures.

### Phase 2: Quick Estimate

- `/tools/roof-estimate` low-friction estimator;
- illustrated roof shapes;
- approximate size and optional supplied area;
- pitch bands and optional exact pitch;
- new/reroof/unknown project flow;
- product choice and product compatibility safeguards;
- coherent low/high geometry scenarios;
- pricing through the existing deterministic detailed estimator;
- explicit complete/partial/unpriced/incompatible result states;
- shared RoofProject persistence;
- Quick-to-Detailed estimator handoff;
- optional structured project enquiry;
- tools-page discovery;
- calibration preview mode;
- 12-case calibration reference;
- 6,079-case Quick Estimate regression harness.

## Architecture rule to preserve

There must be one project model and one deterministic pricing authority.

Do not create a second independent Quick Estimate rate table during integration.

Do not move pricing arithmetic into React components or the future LLM.

The Quick Estimate geometry layer estimates quantities. The existing RoofHub estimator calculates configured prices. The Phase 1 rate-card registry decides whether those calculated prices are approved for public presentation.

## Critical public-release guard

The current estimator rate card is deliberately still draft.

Keep:

```sh
NEXT_PUBLIC_ROOFHUB_QUICK_ESTIMATE_REVIEW=0
```

in public production until the rate card has been reviewed and explicitly approved.

Use `1` only on a controlled preview/staging deployment to inspect draft calibration results.

The Quick Estimate route remains noindex for the same reason.

Do not remove these safeguards merely to make the new tool display a price immediately.

## Membrane rule

Membrane is now a first-class product in shared taxonomy and Quick Estimate UX, but it remains `not-configured` for estimator pricing.

The correct current behavior is an honest unpriced state.

Do not substitute a long-run, tray or generic $/m2 rate during integration.

## Detailed estimator rule

No detailed estimator core pricing module was rewritten.

The existing detailed estimator remains the arithmetic authority.

One UI-only label was changed so imported Quick Estimate quantities are identified as **estimated from Quick Estimate** rather than appearing measured.

Treat any integration conflict inside `public/roofhub-estimator/src/core/` as a red flag and investigate before accepting it.

## Integration sequence

1. Start from the newest production RoofHub branch/tree.
2. Compare it against this package before applying changes blindly.
3. Integrate the Phase 1 foundation first.
4. Run the standard tests.
5. Integrate the Phase 2 Quick Estimate files/wiring.
6. Install dependencies from lockfile.
7. Run all release gates.
8. Deploy to preview/staging with calibration review mode enabled if desired.
9. Manually review pricing/calibration and UX.
10. Keep public review mode off until explicit rate-card approval.

## Required release gates

```sh
npm ci
npm test
npm run typecheck
npm run build
```

Expected `npm test` includes:

- research/content gates;
- 183 maths/rate-integrity cases;
- 23 pressed-tile scenarios;
- 13 Phase 1 foundation/regression cases;
- 6,079 Quick Estimate cases.

After deployment, run the project's production smoke/check workflow as appropriate.

## Manual QA priorities

### Quick Estimate

Test on desktop and mobile:

- new roof;
- reroof;
- unsure project type;
- unknown existing roof;
- each illustrated roof shape;
- unknown roof shape;
- each size band;
- exact actual roof area;
- building footprint input;
- total floor area input for one and two storeys;
- low/typical/steep/unknown pitch;
- exact pitch;
- corrugate;
- five-rib;
- tray;
- pressed metal tile;
- membrane;
- product undecided;
- difficult access;
- two-storey;
- skylight/chimney complexity.

### Handoff

Test:

Quick Estimate → **Make this estimate more accurate** → Detailed Estimate.

Confirm:

- project does not restart;
- approximate quantities are imported;
- imported quantities are labelled estimated;
- user can replace them with measured values;
- detailed estimator calculations still behave normally.

### Enquiry

Confirm:

- estimate/result is available before contact details;
- known roof information is carried into the project enquiry;
- partner-sharing consent remains separate;
- existing contact and detailed-estimator enquiry routes still work.

## Calibration decision required before public price launch

Review:

`docs/quick-estimate-calibration.json`

and additional real-world representative NZ cases.

The current generated figures are **calibration outputs from a draft card**, not an assertion that RoofHub has approved those ranges for public market use.

The approval decision should be explicit and versioned rather than inferred from deployment.

## Documents in this package

- `PHASE1_HANDOFF.md`
- `PHASE2_HANDOFF.md`
- `PACKAGE_A_HANDOFF.md`
- `FILE_CHANGES.md` (Phase 1 changes)
- `FILE_CHANGES_PACKAGE_A.md` (combined change summary)
- `IMPLEMENTATION_AGENT_PROMPT.md`
- `docs/quick-estimate-calibration.json`
