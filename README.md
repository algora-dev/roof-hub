# RoofHub NZ — production hardening candidate v0.5

RoofHub is a Next.js 15 / React 19 website for independent New Zealand roofing pricing, guides and estimating tools.

## Current state

This tree includes:

- production crawl/index controls;
- canonical `https://www.roofhub.co.nz` handling;
- 10 cornerstone roofing/pricing/measurement resources;
- shared evidence and pricing-observation architecture;
- methodology, sources/corrections, privacy and terms surfaces;
- hidden server-side contact/quote delivery endpoint;
- the detailed roof estimator, intentionally `noindex` while its rate card remains provisional;
- post-deploy production and IndexNow scripts.

Read **`PRODUCTION-READY-HANDOFF.md` first** for Vercel variables and the launch order.

## Local build

```bash
npm ci
npm run typecheck
npm run build
npm run dev
```

## Canonical domain

The current Vercel configuration already has:

- `roofhub.co.nz` → permanent redirect → `www.roofhub.co.nz`
- `www.roofhub.co.nz` → Production

Use:

```text
NEXT_PUBLIC_SITE_URL=https://www.roofhub.co.nz
```

## Indexing safety switch

Keep this during staging:

```text
ALLOW_INDEXING=false
```

When the production checklist passes, change it to `true` and redeploy. The same switch controls page metadata, middleware headers, robots and sitemap generation.

## Enquiry delivery

No recipient email address is rendered publicly. Contact and quote forms send to the server route `/api/enquiry` and then through the configured transactional email provider.

Required production secrets are documented in `PRODUCTION-READY-HANDOFF.md`.

## Post-deploy checks

```bash
npm run check:production
npm run indexnow
```

Use `EXPECT_INDEXING=false npm run check:production` while the site is deliberately still noindex.
