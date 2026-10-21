# RoofHub Phase 3 Handoff: Smart Assistant

**Date:** 20 October 2026  
**Package:** Package B, Phase 3  
**Built on:** Package A (Shared Foundation + Quick Estimate)

## Goal

Add **Ask RoofHub** as a prominent but optional conversational layer across the site without making AI the authority for roofing prices, calculations, navigation destinations, or project truth.

The implementation follows this boundary:

```text
LLM
  understand questions
  explain approved RoofHub information
  collect user-supplied project facts
  choose allowlisted actions
        |
        v
RoofHub application layer
  validate project updates
  validate navigation
  enforce session/rate limits
  retrieve approved knowledge
        |
        v
Deterministic RoofHub estimator
  quantities
  pricing
  assumptions
  compatibility
        |
        v
RoofProject + user-visible result
```

## What was added

### Global assistant UI

- `components/assistant/AssistantLauncher.tsx`
- `components/assistant/AssistantLauncher.module.css`
- `components/assistant/AssistantHeroPrompt.tsx`
- `components/assistant/AskRoofHubButton.tsx`
- `lib/assistant/events.ts`

The launcher is mounted globally in `app/layout.tsx`.

Desktop uses a substantial assistant workspace rather than a tiny generic chat bubble. Mobile uses a full-screen assistant surface. Closing the assistant leaves a persistent Ask RoofHub launcher.

### Page and tool awareness

Each assistant request carries a sanitized context snapshot containing:

- current path;
- page kind;
- page/topic context where available;
- active RoofHub tool;
- active tool step.

Quick Estimate and Detailed Estimate already publish their current tool/step into the shared context store. The assistant can therefore explain the exact step the user is looking at without forcing a restart.

### Shared RoofProject awareness

The assistant reads the existing non-sensitive `RoofProject` in the active browser tab.

The model may propose only a narrow structured project patch. Server/client validation in `lib/assistant/project-patch.ts` allows roofing project fields such as:

- project type;
- existing roof;
- desired roof;
- roof shape;
- size/area;
- pitch;
- storeys;
- approved complexity flags.

It cannot use the project update tool to store names, email addresses, phone numbers or exact addresses.

### Deterministic estimating

`lib/assistant/pricing.mjs` converts the shared RoofProject into the existing Quick Estimate input model and then calls:

- Quick Estimate geometry; and
- the existing detailed-estimator pricing core.

The assistant does **not** calculate or invent project prices itself.

The Phase 1 rate-card approval boundary is preserved. The current draft rate card remains hidden from public assistant price output unless calibration review mode is explicitly enabled.

Membrane remains unpriced until an approved membrane calculation/rate path exists.

### Knowledge retrieval

`lib/assistant/knowledge.ts` retrieves compact context from:

- RoofHub research articles;
- RoofHub article/source relationships; and
- verified published pricing observations when the question has pricing intent.

Current-page context receives a retrieval bonus.

No unrelated default articles are injected when nothing matches. In that situation the model is explicitly told that no directly matching approved RoofHub excerpt was retrieved.

### Allowlisted actions

The model can request only explicit server-side tools:

- `update_project`
- `estimate_project`
- `navigate`
- `open_tool`
- `open_enquiry`

Navigation destinations are checked against RoofHub's registered routes/research routes in `lib/assistant/navigation.ts`.

### Server session isolation

The browser creates an opaque assistant session key in **tab-scoped sessionStorage** and sends it in:

`x-roofhub-assistant-session`

The server derives a scoped assistant session ID and stores only assistant session history/limits.

Production can use Redis-compatible REST persistence through either:

```text
KV_REST_API_URL
KV_REST_API_TOKEN
```

or:

```text
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

If no Redis configuration exists, local process memory is used. That is acceptable for local development but is not reliable conversation persistence across serverless instances.

### Limits and abuse protection

Current guards include:

- 1,800 characters per user message;
- 12 messages/minute/session;
- 80 messages/hour/session;
- 80 turns/session;
- 30 requests/minute/IP;
- 300 requests/hour/IP;
- maximum stored conversation history;
- maximum model tool rounds;
- 30-second upstream model timeout.

### Model connection

The server calls the OpenAI Responses API directly with `fetch`, so no new OpenAI SDK dependency is required.

Environment:

```text
OPENAI_API_KEY=
ROOFHUB_ASSISTANT_MODEL=gpt-5.4-mini
```

`ROOFHUB_ASSISTANT_MODEL` is an override. Keep the API key server-only.

If the model connection is unavailable or unconfigured, the normal RoofHub site/tools still work and Ask RoofHub falls back to safe tool links rather than breaking the page.

## Authority rules to preserve

Do not weaken these during integration:

1. The model interprets and explains. Software calculates and acts.
2. The assistant must not invent project prices, rates, ranges, measurements, sources or URLs.
3. Project prices must come through `estimate_project`.
4. Published pricing can be discussed only from retrieved approved evidence.
5. A RoofHub estimate is not a contractor quote.
6. A contractor quote must not be labelled unfair/bad/overpriced from price alone.
7. The assistant must not encourage climbing onto a roof.
8. Personal contact details belong in the consented project form, not assistant project state.
9. Project facts are stored only when the user actually supplies them.
10. Normal RoofHub tools remain usable if AI is unavailable.

## Privacy changes

`app/privacy/page.tsx` now discloses:

- optional AI-assisted processing;
- current OpenAI processing;
- current page/tool/project context sent with a question;
- temporary conversation continuity;
- tab-scoped client session state;
- separation of contact details from chat;
- conversation text excluded from general analytics.

`app/terms/page.tsx` now explains AI limitations and restates that deterministic calculator outputs remain indicative estimates rather than contractor quotes.

## Automated Phase 3 checks

`scripts/check-assistant.mjs` currently passes **19 cases** covering:

- draft-rate suppression;
- calibration-only pricing exposure;
- rate-card identity;
- membrane no-fabrication;
- deterministic pricing integration;
- explicit no-invent-price rule;
- navigation allowlisting;
- PII separation;
- tab session storage;
- session header;
- IP/session limits;
- coarse analytics only;
- privacy disclosure;
- server-only provider secret.

## Manual QA priorities

After real integration/build:

1. Open Ask RoofHub from homepage prompt.
2. Open from global launcher.
3. Close and reopen without losing the launcher.
4. Test full-screen mobile behavior.
5. Ask a factual question from a research article and inspect RoofHub sources.
6. Ask a question with no matching RoofHub evidence; confirm uncertainty is explicit.
7. Start Quick Estimate, open Ask RoofHub mid-step and ask what the step means.
8. Repeat inside Detailed Estimate.
9. Tell the assistant roof facts conversationally and confirm they appear in the shared project/tool.
10. Ask for project pricing and confirm deterministic tool behavior.
11. With public review mode off, confirm draft numeric project pricing is not exposed.
12. Confirm membrane does not receive fabricated pricing.
13. Open two independent tabs and confirm assistant conversations/projects do not leak.
14. Configure Redis on preview and confirm conversation continuity across requests/serverless invocations.
15. Remove/disable `OPENAI_API_KEY` and confirm the site and normal estimating tools remain usable.
16. Confirm assistant conversation text does not appear in GA/Clarity custom event payloads.

