# Copy-paste prompt for the RoofHub implementation agent - Package B

I have attached **RoofHub Package B: Phases 3 + 4 (Smart Assistant + Site/Conversion Redesign)**.

This package is built on top of Package A, which you are integrating now. Once Package A is green, please integrate Package B into the **newest integrated production tree**, not into an older snapshot.

Read these first:

1. `PACKAGE_B_HANDOFF.md`
2. `PHASE3_ASSISTANT_HANDOFF.md`
3. `PHASE4_UX_HANDOFF.md`
4. `FILE_CHANGES_PACKAGE_B.md`
5. `docs/package-b/ASSISTANT_ARCHITECTURE.md`

Treat those as the implementation specification.

## Required approach

- Preserve genuine fixes/changes you made while integrating Package A. Reconcile rather than blindly overwrite.
- Integrate/test Phase 3 first, then Phase 4, even though they are supplied in one package.
- Preserve the existing deterministic estimator arithmetic and the shared RoofProject architecture.
- The AI may interpret, explain, retrieve and request structured actions. It must **not** become the price engine.
- Do not create another pricing table for the Assistant.
- Do not expose draft estimator pricing publicly.
- Do not invent membrane pricing.
- Keep the normal site and all normal tools fully usable if the AI service is unavailable.
- Preserve existing research URLs, evidence/source architecture, metadata, canonicals and structured data unless the supplied handoff explicitly changes presentation around them.
- Keep the site useful to homeowners, builders, roofers and other building professionals. Do not turn the redesign back into a homeowner-only lead funnel.
- Do not add Phase 5 Quote Checker/PDF uploads/CRM work during this integration.

## Assistant configuration

Server-only:

```sh
OPENAI_API_KEY=
ROOFHUB_ASSISTANT_MODEL=gpt-5.4-mini
```

For reliable serverless assistant session continuity, configure either:

```sh
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

or the supported Upstash equivalents documented in `.env.example`.

Do not prefix provider secrets with `NEXT_PUBLIC_`.

## Pricing calibration guard

Public production must still keep:

```sh
NEXT_PUBLIC_ROOFHUB_QUICK_ESTIMATE_REVIEW=0
```

The current estimator card is still draft. This guard applies to both Quick Estimate and Ask RoofHub project pricing.

A controlled preview may use `1` for calibration testing only. Do not treat that as rate-card approval.

## Required release gates

After integration run:

```sh
npm ci
npm test
npm run typecheck
npm run build
```

Do not declare integration complete while any gate fails.

Expected Package B test additions:

- 19 Smart Assistant architecture/pricing/privacy cases;
- 20 site/conversion journey cases;

along with all Package A/content/math tests.

## Required preview QA

### Ask RoofHub

- Homepage prompt works.
- Persistent launcher works on desktop/mobile.
- Close/reopen works.
- Article questions use relevant RoofHub evidence/source links.
- Quick Estimate current-step help works.
- Detailed Estimate current-step help works.
- Conversational roof facts update the same RoofProject.
- Project price requests call deterministic calculation.
- Draft public pricing remains hidden.
- Membrane stays unpriced.
- Two independent tabs do not leak assistant/project state.
- AI/provider failure does not break ordinary site/tools.
- General analytics does not contain assistant conversation text or contact details.

### Site/conversion

- Homepage hierarchy is strong on desktop/mobile.
- Header/mobile navigation is correct.
- `/tools` clearly separates Quick and Advanced tools.
- Professional users can go directly to measured tools.
- Test contextual article CTAs and estimator presets on several article types.
- Check existing ranking article content/evidence is intact.
- Test `/contact` with a populated RoofProject.
- Confirm partner sharing requires explicit checkbox consent.
- Confirm general corrections/contact form still works.
- Confirm `/contact?topic=Pressed%20metal%20tile%20roof...` preserves that topic.
- Check metadata/canonicals/schema/sitemap.
- Review CLS and global assistant launcher overlap on real mobile widths.

After deployment run the normal RoofHub production smoke/check workflow as well.

## Return to me

Please report:

1. Exact files changed during reconciliation.
2. Any Package A differences you preserved and why.
3. Results of `npm test`, `npm run typecheck`, and `npm run build`.
4. Assistant provider/Redis configuration status (without exposing secrets).
5. Preview URL.
6. Concise desktop/mobile QA notes.
7. Any assistant session, tool-state or pricing-guard issues discovered.
8. Any SEO/metadata changes required during reconciliation.
9. Any remaining warnings that need a product decision rather than a coding fix.

Please implement the package rather than only reviewing it.
