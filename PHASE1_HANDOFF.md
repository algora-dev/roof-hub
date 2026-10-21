# RoofHub Phase 1 Shared Foundation Handoff

**Baseline:** `61b836c` live handoff supplied 20 October 2026  
**Phase:** 1, Shared Foundation  
**Purpose:** add the common project, pricing-boundary, context, analytics and enquiry infrastructure needed by Quick Estimate, Ask RoofHub and Quote Checker without changing the existing detailed-estimator calculation engine.

## What changed

### Shared RoofProject

Added `lib/roof-project.ts` with a versioned, non-sensitive project schema covering:

- project type;
- existing and desired roof systems;
- geometry and approximate sizing fields;
- measured component entries;
- estimate summary and provenance;
- future quote-check state;
- current tool context.

The shared schema deliberately does not contain name, email, phone, exact address, uploaded files or private custom rate overrides.

### Browser project store

Added `lib/client/roof-project-store.ts`.

It uses `sessionStorage`, not `localStorage`, so the current project is isolated to the browser tab and is not an account or cloud record. Storage failure is non-fatal.

### Tool and page context

Added `lib/tool-context.ts` and `lib/client/tool-context-store.ts`.

This gives future Ask RoofHub integration a structured way to know the current path, page kind, active tool and active step without scraping visible DOM content.

### Analytics contract

Added `lib/analytics-events.ts` and `lib/client/analytics.ts`.

The event contract supports the planned estimate, quote checker, assistant, CTA and enquiry funnel. The client implementation strips query strings and only accepts coarse context fields. It does not accept contact details, exact addresses, uploaded content or conversation text.

The existing detailed estimator now emits `advanced_estimator_open` through the shared analytics helper.

### Detailed-estimator adapter

Added `lib/estimator/detailed-adapter.ts` and `lib/estimator/project-adapter.ts`.

The existing public estimator runtime remains the pricing authority. The React wrapper now loads it through a typed adapter and mirrors non-sensitive estimator state into the shared RoofProject.

Private custom rate overrides and custom line items are not copied into shared RoofProject state.

No file in `public/roofhub-estimator/src/core/` was changed.

### Rate-card approval boundary

Added `lib/estimator/rate-card.ts`.

The current detailed-estimator card is registered as draft and is explicitly blocked from use as an approved public quick-estimate card. This adds the approval gate Phase 2 will rely on without duplicating rate values.

Membrane exists in the shared product taxonomy, but its estimator coverage is marked `not-configured`. No membrane price has been invented or activated.

### Membrane taxonomy

Extended the research `RoofSystem` union with `membrane` and classified the existing verified `bm-09` membrane observation accordingly.

This is a taxonomy change only. It does not make the current detailed estimator price membrane roofing.

### Structured project enquiries

Added `lib/enquiry.ts` and a new `kind: "project"` pathway in `/api/enquiry`.

The existing contact and detailed-estimator quote pathways remain compatible.

Project enquiries validate:

- schema version;
- requested-help type;
- contact identity and email;
- explicit contact consent;
- separate roofing-partner sharing consent;
- RoofProject schema.

### Enquiry abuse protection

Added `lib/server/rate-limit.ts` and applied it to `/api/enquiry`.

The current protection is an in-memory, hashed-client-key, fixed-window limiter in addition to the existing same-origin check, honeypot, body-size limit and validation.

Important limitation: the in-memory limiter is per server instance. It is a useful application-layer throttle but is not a globally durable Vercel rate limiter. Platform WAF/rate limiting or a shared store can be added later if traffic or abuse warrants it.

### Privacy policy

Updated `/privacy` to accurately disclose:

- Microsoft Clarity heatmaps and session replay;
- optional Google Analytics;
- browser session storage used by roofing tools;
- project-enquiry data;
- roofing-partner sharing only where consent is recorded;
- coarse analytics-event boundaries.

## Regression protection

Added `scripts/check-foundation.cjs` and `scripts/fixtures/detailed-estimator-golden.json`.

The golden fixture freezes three representative detailed-estimator outputs from the original supplied baseline:

1. 200 m2 corrugate new roof;
2. 165 m2 five-rib reroof with concrete removal plus ridge and valley quantities;
3. 145 m2 pressed-metal reroof with non-asbestos Decramastic removal.

The Phase 1 test proves those subtotal, GST and total ranges remain exactly unchanged.

It also tests:

- RoofProject round-trip validation;
- invalid-schema rejection;
- invalid numeric sanitisation;
- membrane taxonomy;
- rate-card public-approval blocking;
- private custom-rate exclusion from shared state;
- structured project-enquiry validation;
- server-instance enquiry rate limiting.

## Tests run

### Passed

`npm test`

- 27 published observation references verified;
- all 10 cornerstone routes present;
- research checks: 3065 passed;
- 17 articles;
- 115 registered sources;
- 22 attributed projects;
- 23 unique rechecked price observations;
- 183 maths and rate-integrity cases passed;
- 23 pressed-tile component-state scenarios passed;
- 13 new shared-foundation and detailed-estimator regression cases passed.

A TypeScript syntax-transpile check also passed for all 15 changed/new TypeScript and TSX implementation files.

### Could not complete in this environment

`npm run typecheck` and `npm run build` require the project's Next.js, React and type packages. The supplied handoff contains no installed dependency tree. A clean `npm ci` was attempted but could not complete in this environment.

The integration agent must therefore run the normal release gates with a complete dependency install:

```sh
npm ci
npm test
npm run typecheck
npm run build
```

`npm run check:production` remains a post-deployment live-site gate.

## Production behavior intentionally unchanged

- No homepage redesign.
- No navigation redesign.
- No Quick Estimate UI.
- No Smart Assistant UI.
- No Quote Checker UI.
- No URL migrations.
- No sitemap/robots/canonical changes.
- Detailed estimator remains noindex.
- Detailed estimator core pricing and rate values remain unchanged.
- Existing contact and detailed quote submission contracts remain supported.

## Phase 2 readiness

Phase 2 can now build Quick Estimate against:

- one shared RoofProject schema;
- one session project store;
- one typed detailed-estimator bridge;
- one rate-card approval boundary;
- one analytics contract;
- one structured project-enquiry pathway;
- a product taxonomy that already reserves membrane without pretending membrane pricing is approved.

The next planning pass should start from the integrated Phase 1 production tree, not from the original `61b836c` handoff.
