# RoofHub Package B Handoff: Phases 3 + 4

**Package:** Smart Assistant + Site/Conversion Redesign  
**Date:** 20 October 2026  
**Baseline:** RoofHub Package A (Phases 1 + 2)

## What this package is

Package B contains the complete source tree through **Phase 4**.

It assumes Package A's architecture remains intact:

- one shared non-sensitive `RoofProject`;
- one deterministic estimator authority;
- versioned rate-card approval boundary;
- Quick Estimate -> Detailed Estimate shared-state handoff;
- membrane represented honestly but not priced without an approved pathway.

Package B then adds:

### Phase 3 - Ask RoofHub Smart Assistant

- prominent homepage assistant prompt;
- persistent global launcher;
- substantial desktop workspace + full-screen mobile experience;
- current page/tool/step awareness;
- shared RoofProject context;
- structured project updates;
- RoofHub research/evidence retrieval;
- deterministic estimator tool calls;
- allowlisted navigation/actions;
- optional Redis-backed server sessions;
- explicit tab-session isolation;
- rate limiting;
- AI outage fallback;
- assistant privacy/terms disclosures;
- 19-case assistant architecture/pricing/privacy regression suite.

### Phase 4 - Site & Conversion Redesign

- inclusive “roofing website for New Zealanders” positioning;
- homepage reorganized around useful actions rather than methodology first;
- simplified primary navigation;
- Estimate a roof primary CTA;
- Quick vs Advanced tool hierarchy;
- professional user pathways preserved;
- contextual article -> estimator presets;
- Ask RoofHub article actions;
- structured project enquiry using existing RoofProject context;
- explicit contractor-sharing consent;
- generic corrections/contact form retained;
- pressed-metal-tile contact-topic bug fixed;
- 20-case site/conversion regression suite.

## The core architecture rule

Do not turn Package B into “an AI website.”

RoofHub still has four separate layers:

```text
Crawlable knowledge/evidence
        +
Structured RoofProject
        +
Deterministic calculation tools
        +
Optional conversational interface
```

The Assistant makes the first three easier to use. It does not replace them.

## Integration order

Package B is internally separable even though it is delivered together.

Recommended implementation-agent order:

1. Confirm Package A is integrated and its release gates are green.
2. Reconcile any Package A production changes against this full source tree.
3. Integrate Phase 3 Assistant server architecture.
4. Run tests/typecheck/build.
5. Integrate Phase 3 client UI and global launcher.
6. Run tests/typecheck/build and preview QA.
7. Integrate Phase 4 homepage/nav/tools/article/contact changes.
8. Run complete tests/typecheck/build.
9. Deploy preview.
10. Test desktop/mobile/assistant/project-state journeys.
11. Only then promote to production.

If the implementation agent changed Package A during its current integration, **the current production branch is authoritative**. Reconcile those genuine fixes rather than blindly replacing them with this snapshot.

## Assistant environment

Required for live AI responses:

```sh
OPENAI_API_KEY=
ROOFHUB_ASSISTANT_MODEL=gpt-5.4-mini
```

The model setting is server-side and overrideable.

Recommended on serverless production for reliable conversation continuity:

```sh
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

or the supported Upstash equivalents.

Without Redis, process-memory fallback works for development but conversation history is not guaranteed across serverless instances.

## Pricing guard remains mandatory

Package B does not approve the estimator rate card.

Public production must still keep:

```sh
NEXT_PUBLIC_ROOFHUB_QUICK_ESTIMATE_REVIEW=0
```

The Assistant uses the same guard.

Therefore:

- the model cannot invent a price to bypass the guard;
- draft project prices stay hidden publicly;
- review/calibration mode may expose deterministic draft numbers only in controlled preview;
- membrane remains unpriced.

Do not weaken this to make the Assistant appear more capable.

## Privacy/security rules

Preserve all of the following:

- OpenAI key server-only;
- no personal contact fields in assistant project patches;
- no assistant conversation text in general analytics;
- server validation of every model-requested action;
- navigation route allowlist;
- IP + session limits;
- bounded message length/history/tool rounds;
- consented form for project/contact details;
- explicit partner-sharing checkbox;
- no automatic sharing with roofing businesses.

## Test status in this build workspace

Final local suite:

```text
Research checks: 3,154 passed
Research articles: 17
Registered sources: 115
Attributed projects: 22
Unique rechecked price observations: 23
Math/rate-integrity: 183 passed
Pressed-tile component scenarios: 23 passed
Phase 1 foundation/regression: 13 passed
Quick Estimate: 6,079 passed
Smart Assistant: 19 passed
Site/conversion: 20 passed
```

`npm test` is green.

Changed TypeScript/TSX files also passed syntax transpilation with TypeScript 5.8.3.

## Gates not executable in this workspace

A complete dependency install could not be completed in this environment. `npm ci --offline` confirms at least one package is not cached, and the networked install does not complete here.

Therefore the implementation agent **must** run against the integrated real tree:

```sh
npm ci
npm test
npm run typecheck
npm run build
```

Do not ship Package B if typecheck/build fails.

`npm run check:production` was also not meaningful in this isolated workspace because its live HTTP requests cannot reach the deployed site. Run it after preview/production deployment.

## Manual QA: critical journeys

### Assistant

- Homepage Ask RoofHub -> normal question.
- Global launcher -> close -> reopen.
- Article -> Ask RoofHub about this page.
- Quick Estimate step -> Ask what this step means.
- Detailed Estimate step -> Ask what this step means.
- Conversationally supply roof details -> confirm shared project updates.
- Ask project cost -> verify deterministic tool only.
- Public pricing guard off -> no draft numeric project result.
- Membrane -> no fabricated price.
- Two tabs -> no state/conversation leakage.
- Mobile -> full-screen assistant without obscuring core tool controls.
- AI unavailable -> ordinary site/tools remain usable.

### Conversion/site

- Homepage clarity on desktop/mobile.
- Header and mobile navigation.
- `/tools` Quick vs Advanced grouping.
- Key ranking articles retain content/source structure.
- Article contextual CTA correctly presets Quick Estimate.
- Quick Estimate can still graduate into Detailed Estimate.
- `/contact` automatically reflects existing project context.
- Project enquiry does not require retyping roof facts.
- Contractor-sharing consent stays optional and separate.
- Corrections/general form still works.
- Pressed-metal-tile contact link retains its topic.
- Canonicals/metadata/schema/sitemap remain valid.
- Check CLS and launcher overlap on real devices.

## Read these documents

1. `PACKAGE_B_HANDOFF.md`
2. `PHASE3_ASSISTANT_HANDOFF.md`
3. `PHASE4_UX_HANDOFF.md`
4. `FILE_CHANGES_PACKAGE_B.md`
5. `docs/package-b/ASSISTANT_ARCHITECTURE.md`
6. Package A handoffs already included in the source tree for foundation/Quick Estimate context.

## Do not expand scope during integration

Package B does **not** include Phase 5 Quote Checker.

The Assistant may explain what to check in an existing quote or route a user to project help, but do not invent an unfinished Quote Checker route or PDF-upload system during this integration.

Package B also does not include partner CRM/lead routing, accounts, dashboards, or quote-document extraction.

