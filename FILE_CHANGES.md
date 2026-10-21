# File Changes

`app/api/enquiry/route.ts` | Added server-instance rate limiting and a validated structured project-enquiry pathway while preserving existing contact and detailed-estimator submissions. | Creates the Phase 1 lead boundary and improves abuse protection.

`app/privacy/page.tsx` | Updated Clarity, analytics, session-storage, project-enquiry and partner-sharing disclosures. | Makes the policy match current analytics behavior and the new shared project/enquiry foundation.

`components/RoofHubEstimator.tsx` | Loads the existing estimator through the typed adapter, registers detailed-tool context, emits the shared analytics event, and mirrors non-sensitive project state into RoofProject. | Connects the existing detailed tool to the shared platform without changing its pricing engine.

`data/observations.ts` | Classified verified observation `bm-09` as membrane. | Adds explicit membrane taxonomy without inventing new evidence.

`data/types.ts` | Added `membrane` to the shared RoofSystem taxonomy and label map. | Prepares shared data types for Phase 2 product coverage.

`lib/analytics-events.ts` | Added typed RoofHub funnel event and coarse context definitions. | Establishes a privacy-conscious analytics contract for future tools.

`lib/client/analytics.ts` | Added client event dispatcher for GA4 and Microsoft Clarity with coarse, query-free context. | Gives tools one instrumentation path that does not accept project PII.

`lib/client/roof-project-store.ts` | Added tab-scoped RoofProject session store with validation and graceful storage failure. | Lets future tools share non-sensitive project state without accounts or cross-tab leakage.

`lib/client/tool-context-store.ts` | Added active page/tool/step external store. | Gives the future assistant structured current-screen context.

`lib/enquiry.ts` | Added versioned project-enquiry schema, validation and LeadEnvelope conversion. | Separates non-sensitive RoofProject state from contact/consent data.

`lib/estimator/detailed-adapter.ts` | Added typed same-origin loader for the existing browser estimator runtime. | Centralizes access to the deterministic estimator without moving or rewriting its core.

`lib/estimator/project-adapter.ts` | Added detailed-estimator to RoofProject mapping that excludes custom/private rates. | Allows measured projects to participate in the shared platform safely.

`lib/estimator/rate-card.ts` | Added versioned rate-card registry and public-approval guard. | Prevents the current draft card from accidentally powering a public quick estimate and records membrane as not configured.

`lib/roof-project.ts` | Added versioned shared RoofProject model and runtime parser/sanitizer. | Creates the central non-sensitive state model used by future tools and assistant flows.

`lib/server/rate-limit.ts` | Added bounded in-memory fixed-window request limiter using hashed client keys. | Adds application-layer abuse protection to enquiry submissions.

`lib/tool-context.ts` | Added shared tool/page context types and path classification. | Establishes a stable context contract for tool and assistant integration.

`package.json` | Added `check:foundation` and included it in `npm test`. | Makes Phase 1 regression checks part of the standard test gate.

`scripts/check-foundation.cjs` | Added shared-foundation validation and detailed-estimator golden regression tests. | Proves the new architecture does not change baseline estimator results or leak custom rates into shared state.

`scripts/fixtures/detailed-estimator-golden.json` | Added frozen baseline outputs for three representative detailed-estimator scenarios. | Provides explicit calculation-regression protection for future phases.

`PHASE1_HANDOFF.md` | Added Phase 1 architecture, test, limitation and Phase 2 readiness notes. | Gives the integration agent a concise implementation handoff.

`FILE_CHANGES.md` | Added return-package change manifest. | Required by the RoofHub external-agent handoff contract.
