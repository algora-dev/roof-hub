# RoofHub Phase 2 Quick Estimate Handoff

**Date:** 20 October 2026  
**Phase:** 2, Quick Estimate  
**Built on:** RoofHub Phase 1 Shared Foundation return package  
**Purpose:** add a low-friction roof estimating journey that works from approximate information, uses the existing deterministic RoofHub estimator for configured pricing, shares one RoofProject with the detailed estimator, and never invents missing rates.

## What changed

### Quick Estimate route

Added `/tools/roof-estimate` and a permanent `/tools/quick-estimate` alias.

The tool is intentionally `noindex` while the public estimator rate card remains draft.

The flow is one question per screen and supports:

- new roof, reroof or unsure;
- existing roof type where relevant;
- illustrated roof shape choices plus "not sure";
- size bands plus optional supplied area;
- explicit area basis: building footprint, total floor area or actual roof area;
- pitch bands plus optional exact degrees;
- corrugate, five-rib, tray/standing seam, pressed metal tile, membrane or undecided;
- storeys and selected complexity flags;
- "I don't know" paths without breaking the estimate.

The wording is broad enough for homeowners, builders, roofers and other NZ users rather than assuming every user owns the building.

### Coherent approximate geometry

Added a pure Quick Estimate geometry layer in `lib/quick-estimate/`.

It adapts the strongest geometry pattern from the Apex reference implementation but keeps RoofHub's pricing authority separate.

Approximate answers generate coherent low/high roof scenarios rather than applying arbitrary percentage multipliers to a total price.

Important behavior:

- unknown roof shape deliberately widens from a simple coherent roof to a more complex coherent roof;
- unknown size deliberately widens the area range;
- supplied actual roof area is preserved exactly at both range endpoints;
- supplied footprint and total-floor-area values are converted with disclosed assumptions;
- exact pitch replaces the pitch band;
- storeys affect access assumptions, not roof material geometry;
- roof quantities include area, ridge, hip, valley, verge/eaves and relevant junction geometry.

### Product-pitch safeguards

The Quick Estimate model includes representative minimum-pitch safeguards based on existing RoofHub technical source data:

- corrugate: 8 degrees;
- five-rib: 3 degrees;
- pressed metal tile: 12 degrees;
- tray / standing seam: 3 degrees.

If an exact pitch is below the representative minimum, the product is not priced as compatible.

If an approximate pitch band crosses a representative minimum, the result remains partial and visibly asks for actual pitch/product confirmation. The pricing endpoint is never silently modelled below the representative product minimum.

### One deterministic pricing authority

`lib/quick-estimate/pricing.mjs` translates the generated quantities into projects for the existing RoofHub detailed estimator and calls its existing `calculateEstimate` function.

No second price engine was created.

Configured explicit detailed-estimator rules can affect the Quick Estimate. For example, two-storey/difficult-access cases can affect configured scaffold/access pricing.

Unconfigured complexities do not receive fake multipliers. Skylights/chimneys, dormers, attached flat sections and unsupported junction work are instead shown as missing/uncertain scope where relevant.

No file in `public/roofhub-estimator/src/core/` was changed.

### Honest partial and unpriced states

The result can be:

- `complete`: all modelled scope used by this estimate is configured;
- `partial`: a usable configured estimate exists but material scope or suitability remains unresolved;
- `unpriced`: RoofHub does not have an approved/configured pricing pathway for the selected product;
- `incompatible`: supplied pitch/product combination fails the representative compatibility safeguard.

Examples:

- unknown reroof removal remains partial;
- Decramastic keeps asbestos/removal uncertainty visible;
- unpriced skylight complexity does not secretly alter the total;
- tray/pressed-metal results stay partial where detailed component rates are missing;
- membrane stays unpriced rather than borrowing a metal-roof rate.

A new-build project no longer receives a false "existing roof removal" warning merely because existing roof is unknown.

### Draft-rate-card publication guard

The current detailed estimator card remains registered as:

`roofhub-nz-draft-2026-09-22`

It remains `draft`, and source GST treatment is not yet marked confirmed.

Therefore the public Quick Estimate does **not** show the draft price numbers by default.

For staging/calibration only:

```sh
NEXT_PUBLIC_ROOFHUB_QUICK_ESTIMATE_REVIEW=1
```

shows the calculated draft values with explicit calibration/draft messaging.

Keep the variable `0` or blank on public production until the estimator rate card has been reviewed and explicitly approved.

This guard is intentional. Do not work around it by hard-coding the preview numbers into the UI.

### Shared RoofProject persistence

Quick Estimate reads/writes the Phase 1 tab-scoped shared `RoofProject`.

Approximate Quick Estimate measurements are stored with explicit provenance:

- `basis: "estimated"`;
- `source: "quick-estimate"`.

Draft calibration pricing is only copied into shared project state when calibration review mode is deliberately enabled. Unapproved public pricing is not persisted as though it were an approved RoofHub result.

### Quick to Detailed handoff

The result action **Make this estimate more accurate** opens:

`/tools/detailed-roof-estimator?from=quick-estimate`

The detailed estimator then imports Quick Estimate quantities as approximate starting values.

The imported project is deliberately marked as unreviewed and access remains unsure. The UI tells the user that these quantities were estimated from Quick Estimate and should be replaced with measured values where known.

This means builders, roofers and more technical users can graduate to the existing detailed tool without starting again, while RoofHub never labels approximate geometry as measured.

### Optional structured enquiry

Quick Estimate result includes an optional project enquiry using the Phase 1 structured enquiry endpoint.

The user sees their result first. Contact details are not required to start or complete Quick Estimate.

Help choices include:

- understand the project;
- get a written quote;
- get multiple comparable quotes;
- review an existing quote.

The enquiry carries the existing RoofProject so the user does not re-enter roof data. Partner-sharing consent remains separate from ordinary contact consent.

### Tools discovery

The Tools page now exposes Quick Roof Estimate as the primary low-friction estimating tool while retaining the advanced/detailed tooling.

## Calibration reference

Added:

`docs/quick-estimate-calibration.json`

It contains 12 representative scenarios generated directly from the current code. It is a calibration artifact, not published market evidence.

The file explicitly warns that the current estimator card is draft and source GST treatment is not fully confirmed.

Use it when reviewing whether the existing rate card produces sensible public-facing ranges before approval.

## Automated QA

### Full test suite passed

```sh
npm test
```

Current result:

- 27 published observation references verified;
- all 10 cornerstone routes present and registered;
- research checks: 3,101 passed;
- 17 articles;
- 115 registered sources;
- 22 attributed projects;
- 23 unique rechecked price observations;
- 183 maths/rate-integrity cases passed;
- 23 pressed-tile component-state scenarios passed;
- 13 Phase 1 shared-foundation/regression cases passed;
- **6,079 Quick Estimate geometry, compatibility and pricing cases passed**.

The Quick Estimate harness covers:

- every roof-shape, size-band and pitch-band combination;
- exact-area preservation;
- exact-pitch override;
- total-floor-area/storey conversion;
- material geometry independence from storeys;
- product minimum-pitch safeguards;
- membrane no-fabrication behavior;
- configured corrugate/five-rib calculation through the existing engine;
- partial tray/pressed-metal scope;
- unknown reroof removal;
- new-build removal correctness;
- unknown project-type removal uncertainty;
- Decramastic/asbestos uncertainty;
- skylight no-fake-multiplier behavior;
- configured access/scaffold behavior;
- unknown-storey range widening;
- unknown-shape range widening.

### Additional checks passed

- changed/new MJS modules passed `node --check`;
- changed/new TS/TSX implementation files passed TypeScript syntax transpilation;
- RoofProject persistence and Quick-to-Detailed conversion were exercised independently;
- changed Phase 2 files were checked against the repository's no-em-dash convention.

### Could not complete in this environment

A clean dependency installation timed out in the current execution environment. Therefore a real Next.js/React typecheck and production build could not be completed here.

The integration agent must run:

```sh
npm ci
npm test
npm run typecheck
npm run build
```

The inability to run `typecheck`/`build` here is a dependency-install limitation, not a known TypeScript error. Do not skip those gates during integration.

## Production behavior intentionally deferred

The Phase 2 package does **not**:

- approve the draft rate card;
- make membrane pricing up;
- index the Quick Estimate route;
- redesign the homepage;
- change the main navigation architecture;
- launch the Smart Assistant;
- launch Quote Checker;
- rewrite detailed-estimator core maths;
- create accounts or cloud project persistence.

Those boundaries are intentional.

## Recommended integration outcome

Integrate Phase 1 and Phase 2 as one Package A change set.

Before public release:

1. run all install/test/typecheck/build gates;
2. enable Quick Estimate calibration review only on staging/preview;
3. manually inspect the 12 calibration cases plus additional real NZ project examples;
4. decide whether the current rate card is suitable for public Quick Estimate use;
5. only then approve the rate card through the Phase 1 approval boundary;
6. verify the public route with review mode off;
7. test Quick-to-Detailed handoff on desktop and mobile;
8. test structured enquiry submission and consent behavior;
9. run post-deploy production checks.
