# RoofHub — START HERE

This package is the production-hardening candidate prepared for `www.roofhub.co.nz`.

## Read in this order

1. **`PRODUCTION-READY-HANDOFF.md`** — exact Vercel/environment and launch sequence.
2. **`BLUEPRINT.md`** — long-term RoofHub platform/content/data strategy.
3. **`data/observations.ts`** — structured NZ pricing evidence pool.
4. **`data/siteRoutes.ts`** — canonical sitemap/review-date registry.
5. **`components/evidence/`** — shared answer/evidence presentation components.

## The important launch rule

Do not make multiple independent indexing decisions. `ALLOW_INDEXING` is the single switch used by metadata, middleware, robots and sitemap generation.

The intended launch flow is:

```text
Deploy noindex → test production/forms → enable indexing → redeploy → run production check → submit sitemap/IndexNow
```

The detailed estimator remains independently `noindex` until its preliminary rate card is approved. That does not block indexing the rest of RoofHub.
