# QA record — 26 September 2026

## Passed in this handoff environment

- `node scripts/check-content.mjs`
  - 49 published observation references resolve to `verified` records.
  - all 10 cornerstone routes exist.
  - all 10 cornerstone routes are registered for sitemap generation.
  - private T3 Labs destination email is absent from public-facing page/tool assets.
  - development-only wording is absent from public-facing pages/tools.
  - framework-independent new-roof estimator smoke test passes.
  - framework-independent reroof/removal estimator smoke test passes.
- `node --check` passed for all project `.mjs` scripts checked, including estimator core/UI and release scripts.
- TypeScript syntax transpilation passed for 55/55 `.ts` / `.tsx` source files (excluding declaration-only files).

## Build gate still required on the deployment/agent machine

A complete `npm ci` could **not** finish in this sandbox because npm package tarball requests failed with `EAI_AGAIN` (network/DNS unavailable). That means a real Next.js semantic typecheck/build could not be independently completed here.

Before deployment, run in an environment with npm registry access:

```bash
npm ci
npm run check:content
npm run typecheck
npm run build
```

Do not treat this QA note as a substitute for the normal Vercel/CI build gate.

## Post-deploy gate

With indexing still disabled:

```bash
EXPECT_INDEXING=false npm run check:production
```

After `ALLOW_INDEXING=true` and redeploy:

```bash
npm run check:production
npm run indexnow
```

Also manually submit one contact form and one detailed-estimator quote enquiry after the transactional email credentials are configured.
