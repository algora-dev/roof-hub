# RoofHub Package A File Changes

This file summarizes the combined Phase 1 + Phase 2 implementation. `FILE_CHANGES.md` retains the detailed Phase 1-only manifest.

## Phase 1 foundation

See `FILE_CHANGES.md` for the Phase 1 file-by-file list. In summary, Phase 1 added or changed:

- `lib/roof-project.ts`;
- `lib/client/roof-project-store.ts`;
- `lib/tool-context.ts`;
- `lib/client/tool-context-store.ts`;
- `lib/analytics-events.ts`;
- `lib/client/analytics.ts`;
- `lib/estimator/detailed-adapter.ts`;
- `lib/estimator/project-adapter.ts`;
- `lib/estimator/rate-card.ts`;
- `lib/enquiry.ts`;
- `lib/server/rate-limit.ts`;
- `app/api/enquiry/route.ts`;
- `app/privacy/page.tsx`;
- `components/RoofHubEstimator.tsx`;
- `data/types.ts` and `data/observations.ts`;
- foundation regression fixtures and checks;
- Phase 1 package documentation.

## Phase 2 additions

`app/tools/roof-estimate/page.tsx`  
Adds the canonical Quick Estimate page. It is deliberately noindex while the current public estimator rate card remains draft.

`app/tools/quick-estimate/page.tsx`  
Adds a permanent alias redirect to `/tools/roof-estimate`.

`components/quick-estimate/QuickRoofEstimate.tsx`  
Adds the one-question-per-screen Quick Estimate journey, shared project persistence, pricing/result handling, calibration-review behavior, analytics hooks and refinement/enquiry actions.

`components/quick-estimate/QuickRoofEstimate.module.css`  
Adds responsive Quick Estimate presentation, illustrated selection cards, result layout and mobile controls.

`components/quick-estimate/RoofIllustration.tsx`  
Adds roof-shape and pitch SVG illustrations driven by the same conceptual geometry used by the model.

`components/quick-estimate/QuickEstimateEnquiry.tsx`  
Adds an optional structured project-enquiry UI after the estimate result with separate partner-sharing consent.

`lib/quick-estimate/model.mjs`  
Defines Quick Estimate size/pitch bands, roof templates, product mapping and representative product-minimum-pitch safeguards.

`lib/quick-estimate/geometry.mjs`  
Generates coherent roof geometry and component lengths from approximate roof templates.

`lib/quick-estimate/engine.mjs`  
Builds low/high geometry scenarios, converts supplied area bases, handles exact overrides and computes estimate-detail level.

`lib/quick-estimate/pricing.mjs`  
Adapts Quick Estimate quantities into the existing deterministic RoofHub estimator, preserves incomplete scope, enforces product-pitch handling and refuses fabricated membrane pricing.

`lib/quick-estimate/index.mjs`  
Exports the pure Quick Estimate model/geometry/engine API.

`lib/quick-estimate/index.d.mts`  
Adds TypeScript declarations for the Quick Estimate modules.

`lib/quick-estimate/project-adapter.ts`  
Maps between Quick Estimate, the shared RoofProject and an initial detailed-estimator project while preserving estimated-vs-measured provenance.

`components/RoofHubEstimator.tsx`  
Extended from Phase 1 to import shared Quick Estimate quantities when opened with `?from=quick-estimate` and to show an estimated-quantity handoff notice.

`public/roofhub-estimator/src/ui/views.mjs`  
UI-only wording change: Quick Estimate imported quantities are labelled `estimated from Quick Estimate`. Detailed-estimator core calculation files remain untouched.

`app/tools/page.tsx`  
Adds Quick Roof Estimate to tool discovery and broadens the tools-page framing.

`data/siteRoutes.ts`  
Registers `/tools/roof-estimate` as a non-indexable tool route.

`app/globals.css`  
Adds minimal styling for the Quick-to-Detailed import notice.

`.env.example`  
Adds `NEXT_PUBLIC_ROOFHUB_QUICK_ESTIMATE_REVIEW=0` and documents that it is calibration-only until rate-card approval.

`package.json`  
Adds `check:quick-estimate` and `quick:reference`; includes the Quick Estimate regression harness in `npm test`.

`scripts/check-quick-estimate.mjs`  
Adds 6,079 Quick Estimate geometry, compatibility, uncertainty and pricing regression cases.

`scripts/quick-estimate-reference.mjs`  
Generates representative calibration cases from current code.

`docs/quick-estimate-calibration.json`  
Stores 12 generated calibration scenarios with an explicit draft-rate-card warning.

`PHASE2_HANDOFF.md`  
Documents Phase 2 architecture, behavior, QA and production safeguards.

`PACKAGE_A_HANDOFF.md`  
Provides the combined Phases 1 + 2 integration handoff.

`IMPLEMENTATION_AGENT_PROMPT.md`  
Provides the concise copy-paste integration prompt for the implementation agent.

`FILE_CHANGES_PACKAGE_A.md`  
This combined package manifest.
