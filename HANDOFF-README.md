# RoofHub Full-Source Handoff (external review / audit / edit round)

**Baseline commit:** `61b836c` (v0.9 pressed-metal-tile-reference) - matches live https://www.roofhub.co.nz as of 2026-10-20.
**Live site:** https://www.roofhub.co.nz (www is canonical; apex redirects to www).
**What this package is:** the entire live codebase, source-complete, for an external agent to review, audit and edit. Hand the result back to Ron (integration agent) as a return zip. This package does NOT authorise deployment; integration, gates and deployment are Ron's.

## READ FIRST (in this order)

1. `docs/EXTERNAL_AGENT_HANDOFF.md` - the standing integration contract: stack, file placement per content type, the `pageMetadata` helper rule, non-negotiables. Do not fight the stack.
2. `docs/AGENT_IMPLEMENTATION_NOTES.md` - notes from prior external rounds.
3. `docs/component-contracts.reference.json` + `docs/design-tokens.reference.json` - component/design contracts.
4. `docs/MEDIA_NOTES.md` - media handling notes.

## Stack summary

- Next.js 15 App Router, React 19, TypeScript strict.
- Server components by default; `"use client"` only for genuine interactivity.
- **Vanilla CSS with design tokens** (`app/globals.css`, `app/evidence.css`). **NO Tailwind.** Palette: sage greens `--sage-*`, terracotta `--terra-*`, charcoal `--charcoal-*`, neutrals, off-white; radii `--radius-*`.
- No database. Enquiry delivery via Resend email API (server-side only).

## Running locally

```sh
npm ci
npm run dev        # picks port 3001
npm run build
```

`.env.example` documents all env vars. **`ALLOW_INDEXING=false` is the default and is deliberate:** a local/dev build renders noindex metas and a locked robots posture. Production (Vercel) sets it true. Do not flip indexing behaviour, canonical URL strategy or robots machinery.

- `NEXT_PUBLIC_SITE_URL=https://www.roofhub.co.nz` (canonical host).
- Enquiry delivery trio is server-only (`ROOFHUB_INQUIRY_TO`, `ROOFHUB_FROM_EMAIL`, `RESEND_API_KEY`). Never expose these or prefix them NEXT_PUBLIC_.

## Release gates (any return must pass these on Ron's side; run what you can)

```sh
npm test                # = check:content + check:research + check:math
npm run check:research  # every research claim/observation resolves to a registered source
npm run typecheck
npm run build
npm run check:production
```

The research/source discipline is enforced by script, not by convention: pricing observations live in `data/observations.ts` as typed records; `scripts/check-research.mjs` verifies every claim against registered sources. Never inline unsourced numbers.

## Owner rules (non-negotiable)

1. **NO em dashes anywhere in copy** (UI text, prose, metadata, comments, docs). Use commas, full stops or hyphens.
2. **Never invent pricing, evidence or sources.** NZ market, GST 15%. Every number is a labelled observation with provenance, or it does not ship.
3. One URL per search intent. Short, stable, hyphenated slugs. No URL variants of the same intent.
4. Use the shared `pageMetadata` helper as the ONLY metadata export. Never hand-roll metadata.
5. `/tools/detailed-roof-estimator` is deliberately noindex (rate-card approval gate). Leave that status alone.
6. Do not send real enquiries during QA; do not enable indexing flags; do not change sitemap/robots/canonical machinery.

## Live state snapshot (2026-10-20)

- 29 sitemap URLs, robots allow-all except `/api/`.
- GSC property live (sc-domain:roofhub.co.nz), IndexNow in use (key file in `public/`).
- Content rounds v0.6-v0.9 shipped (cornerstone rewrites, corrugated / five-rib / pressed-metal-tile reference guides with research registers).

## Return format

Return a zip containing either the full modified source tree or only changed files, plus a `FILE_CHANGES.md` manifest at the root: one line per file, `path | what changed | why`. If your container lacks npm registry access, run whatever static checks you can and note it; Ron runs the full gates and a 3-way verify (your manifest vs normalised diff vs baseline) before anything ships.
