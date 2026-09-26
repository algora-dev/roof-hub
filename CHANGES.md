# RoofHub production hardening changes — 26 September 2026

## Search/canonical
- Added `lib/site.ts` as the canonical URL/indexing source of truth.
- Unified page metadata, middleware, robots and sitemap around explicit `ALLOW_INDEXING`.
- Canonicalised the site to `https://www.roofhub.co.nz` to match the supplied Vercel configuration.
- Added backup bare-domain 308 redirect and non-canonical-host noindex protection.
- Added stable route-level sitemap review dates.
- Added Organization/WebSite/Article/Breadcrumb structured data.
- Added post-deploy `scripts/check-production.mjs`.
- Hardened IndexNow to derive/validate the canonical host.

## Public content
- Reworked homepage and main hubs to remove development/prototype language.
- Added 10 cornerstone resources for roofing costs, reroofing, main roof systems, pitch, scaffold and roof measurement.
- Added/refined methodology, sources/corrections, About, contact, privacy and terms pages.
- Replaced the representative draft quote guide with public-ready editorial copy.

## Evidence architecture
- Added reusable cornerstone/evidence components.
- Added technical-source registry and evidence helpers.
- Kept raw observations separate from derived RoofHub interpretation.

## Enquiries/privacy
- Added private `/api/enquiry` server route for contact and detailed-estimator quote requests.
- Public pages render no destination email address.
- Added client contact form with validation and honeypot.
- Detailed estimator is wired to the same server route.
- Updated privacy copy for transactional email delivery.

## Estimator
- Detailed estimator remains accessible but intentionally `noindex` and excluded from sitemap until its rate card is approved.
- Replaced internal “development/before public launch” phrasing with visitor-facing “preliminary planning estimate” language.
- Preserved explicit incomplete/unpriced-item behaviour and no fake delivery-success state.

## Cleanup
- Removed unused `PricingPrototype.tsx` demo calculator.
- Updated README/START HERE and added production deployment handoff.
