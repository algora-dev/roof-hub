# RoofHub Package B File Changes

**Baseline:** Package A (Phases 1 + 2)  
**Package B:** Phases 3 + 4

## New files

### Smart Assistant

- `app/api/assistant/route.ts`
- `components/assistant/AssistantLauncher.tsx`
- `components/assistant/AssistantLauncher.module.css`
- `components/assistant/AssistantHeroPrompt.tsx`
- `components/assistant/AskRoofHubButton.tsx`
- `lib/assistant/client-session.ts`
- `lib/assistant/events.ts`
- `lib/assistant/knowledge.ts`
- `lib/assistant/navigation.ts`
- `lib/assistant/orchestrator.ts`
- `lib/assistant/pricing.mjs`
- `lib/assistant/pricing.d.mts`
- `lib/assistant/project-patch.ts`
- `lib/assistant/rate-limit.ts`
- `lib/assistant/session-scope.ts`
- `lib/assistant/session.ts`
- `lib/assistant/types.ts`

### Conversion/context

- `components/ProjectEnquiryForm.tsx`
- `lib/article-actions.ts`

### Regression tests

- `scripts/check-assistant.mjs`
- `scripts/check-conversion.mjs`

### Package B documentation

- `PHASE3_ASSISTANT_HANDOFF.md`
- `PHASE4_UX_HANDOFF.md`
- `PACKAGE_B_HANDOFF.md`
- `FILE_CHANGES_PACKAGE_B.md`
- `IMPLEMENTATION_AGENT_PROMPT_PACKAGE_B.md`
- `docs/package-b/ASSISTANT_ARCHITECTURE.md`

## Modified files

- `.env.example` - assistant provider/model and optional Redis configuration.
- `app/about/page.tsx` - inclusive audience wording.
- `app/contact/page.tsx` - project-help workflow first, general corrections/contact retained.
- `app/globals.css` - homepage assistant, use-case, tool hierarchy, contextual article CTA and project-help styles/responsive rules.
- `app/layout.tsx` - global Assistant launcher.
- `app/page.tsx` - product-led homepage and prominent Ask RoofHub.
- `app/privacy/page.tsx` - assistant processing/session/analytics disclosure.
- `app/terms/page.tsx` - AI-assisted-answer disclaimer.
- `app/tools/page.tsx` - Quick vs Advanced tool hierarchy.
- `app/tools/roof-estimate/page.tsx` - Suspense boundary for URL preset handling and removal of nested `<main>`.
- `components/ContactForm.tsx` - project-help and pressed-metal-tile topics.
- `components/Footer.tsx` - inclusive platform positioning and project-help contact label.
- `components/Header.tsx` - simplified primary nav and Estimate a roof CTA.
- `components/content/ResearchArticle.tsx` - contextual estimate/assistant actions and revised sidebar/end CTA.
- `components/quick-estimate/QuickRoofEstimate.tsx` - article/context URL presets and source entry point.
- `data/siteRoutes.ts` - last-modified dates for materially changed product/legal routes.
- `lib/site.ts` - inclusive default site description.
- `lib/tool-context.ts` - section-root page-kind handling.
- `package.json` - assistant + conversion test scripts added to `npm test`.

## Intentionally not changed

- `public/roofhub-estimator/src/core/*` pricing/calculation arithmetic.
- Phase 1 rate-card approval status.
- membrane pricing status.
- Quick Estimate public noindex status.
- existing research article URLs.
- evidence source records or observation amounts.
- detailed-estimator rate values.

