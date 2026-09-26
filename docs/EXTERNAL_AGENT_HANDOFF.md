# RoofHub — External Agent Handoff Contract

This document is the integration contract for page content/code produced outside this
repo. Follow it and output drops straight in. It is written for a producer that has
NOT seen the codebase.

---

## 1. Stack (do not fight it)

- **Next.js 15 App Router**, React 19, TypeScript strict.
- **Server components by default.** No client JS for editorial content. `"use client"`
  only for genuine interactivity.
- **Vanilla CSS with design tokens** (`app/globals.css` + `app/evidence.css`). There is
  NO Tailwind. Use existing classes; add styles to `evidence.css` if truly needed.
- Colors: sage greens `--sage-*`, terracotta `--terra-*`, charcoal `--charcoal-*`,
  neutrals `--neutral-*`, off-white `--off-white`. Radii `--radius-*`.

## 2. File placement

| Thing | Path |
|---|---|
| Pricing pages | `app/pricing/<slug>/page.tsx` |
| System guides | `app/roofing/<slug>/page.tsx` |
| General guides | `app/guides/<slug>/page.tsx` |
| Tool pages | `app/tools/<slug>/page.tsx` |
| New components | `components/<name>.tsx` (server component unless interactive) |
| Pricing observations | `data/observations.ts` (typed records only — see §5) |
| Styles (if needed) | append to `app/evidence.css` |

One URL per search intent. Short, stable, hyphenated slugs. Do not create URL variants
of the same intent.

## 3. Every page MUST (non-negotiables)

1. Call the shared metadata helper as the ONLY metadata export:

```tsx
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Corrugated roofing costs NZ",        // page title (suffix auto-added)
  description: "One-two sentence description.", // unique per page
  path: "/pricing/corrugated-roof-cost"        // canonical path — MUST match the URL
});
```

This wires canonical, OG card and robots. Never hand-roll metadata.

2. Render `<Breadcrumbs items={[{ label: "Home", href: "/" }, ...]} />` at the top.
3. Open with H1 + **direct answer in 2–5 sentences** immediately under it.
4. Show `<KeyFacts>` strip (NZ · NZD · GST basis · last reviewed · evidence count).
5. Numbers come from `data/` (observations/derived rates) — **never invented or
   hand-typed into JSX**. Distinguish material-only / supply+install / complete reroof.
6. State GST treatment for every figure. No figure without GST basis → mark "unknown".
7. `<MethodologyNote>` whenever prices are discussed.
8. `<Sources>` list with real URLs for every factual/numeric claim cluster.
9. Register the route in `app/sitemap.ts` (`routes` array).
10. Pass `npm run build` and `npm run typecheck` with zero new errors.

## 4. Available evidence components (server, no JS)

All in `components/evidence/`:

| Component | Props | Use |
|---|---|---|
| `Breadcrumbs` | `items: {label, href?}[]` | top of every page (+BreadcrumbList schema) |
| `KeyFacts` | `facts: {label, value}[]` | key facts strip under the direct answer |
| `PriceTable` | `rows: {label, range, basis, notes?}[]`, `caption` | primary HTML pricing table |
| `WorkedExample` | `title, lines: {label, value, highlight?}[], note?` | show-your-working example |
| `MethodologyNote` | `version, reviewedAt, evidenceCount, gstBasis` | compact methodology box |
| `Sources` | `sources: {name, url, tier, type, date?, note?}[]` | evidence list with tier badges |
| `RelatedTool` | `title, href, copy` | link card to the relevant tool/guide |
| `FaqBlock` | `faqs: {q, a}[]` | visible FAQ (+FAQPage schema). Only questions actually answered on-page |

Page anatomy order (blueprint): breadcrumbs → H1 → direct answer → KeyFacts →
PriceTable → relevant tool → factors → worked examples → technical detail →
alternatives → MethodologyNote → Sources → FAQ → RelatedTool. Quote CTA last, if at all.

## 5. Data model (the platform's core)

`data/types.ts`:

- `PricingObservation` — raw sourced record: category, roofSystem, item, amount
  low/high/exact, unit, priceBasis, gstBasis (incl|excl|unknown), region, observedAt,
  sourceUrl/Name/Type, evidenceTier (primary|market|editorial), status, notes.
- `RoofHubRate` — derived range: key, label, low, high, basis, gstBasis, reviewedAt,
  methodologyVersion, sourceObservationIds.
- `ProjectObservation` — real project example with inclusions.

Rules:
- Observations go in `data/observations.ts` as typed records with stable ids.
- Derived ranges come from `data/derive.ts` (`deriveRate`) — min/max of verified
  observations with matching unit + GST basis. Don't hand-type derived numbers.
- Statuses: only `verified` observations feed published ranges. Unknown-GST records
  may appear as market evidence context, never in headline derived ranges.
- Research inbox (pre-QA) lives at `research/*.md` in the workspace, not the repo.

## 6. Writing standards

- NZ terminology, NZD, answer-first. No generic intros, no word-count filler.
- Date volatile pricing ("Last reviewed: …").
- Distinguish: observed fact (cite source) / RoofHub calculation (show working) /
  assumption (label it) / third-party opinion (name it).
- No copying or close paraphrasing of competitor pages. No unsupported superlatives.
- No invented ratings, reviews, authors, offers or "expert reviewers".
- Author/reviewer attribution only for real people.

## 7. Images

Prefer original diagrams/SVG (inline or `public/`). No contractor photography. No
lifted manufacturer media without permission. Alt text required. Reserve dimensions.

## 8. Delivery checklist (per page)

1. `npm run build` + `npm run typecheck` pass locally
2. Route added to `app/sitemap.ts`
3. Canonical path matches actual URL
4. Every number traceable to an observation id or labelled assumption
5. Internal links: parent hub + relevant tool + 2–5 related guides (no orphans,
   descriptive anchors)
6. Hand to the implementation agent (Ron) → review → ONE squashed push to `main`
7. After deploy: `npm run indexnow` + spot-check live canonical/robots/status

## 9. Never do

- No `bg-orange-500`-style framework classes (no Tailwind exists here)
- No heavy client-side JS on editorial pages
- No meta/robots hacks outside `lib/seo.ts`
- No touching `app/api/`, auth, billing (none exist yet), or OpenClaw config
- No pushing directly — the implementation agent pushes once, batched
- No `noindex` on public content pages (indexing is env-controlled centrally)
- No pricing numbers that aren't backed by an observation record

## 10. Current state (2026-09-26)

- Live: home, /pricing (prototype, intentionally noindex), /tools (+ estimator,
  noindex pending rate-card approval), /guides (+1 guide), /roofing hub, /about,
  /methodology, /privacy, /terms, /contact. All indexable pages canonical + in sitemap.
- Indexing: on for production builds (env-controlled), previews stay noindex.
- Research inbox: reroof + benchmarks observation sets QA'd (see workspace
  `research/`); long-run + tiles/tray sets landing — these feed `data/observations.ts`.
- Next pages (per blueprint order): /pricing/roofing-costs, /pricing/reroof-cost,
  /roofing/long-run — content produced externally, integrated here.
