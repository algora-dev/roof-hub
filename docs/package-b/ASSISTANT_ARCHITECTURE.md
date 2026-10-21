# Ask RoofHub Architecture

## Trust boundary

Ask RoofHub is an interface over RoofHub systems, not a replacement for them.

```text
User
 |
 v
Assistant UI
 |  current page/tool step + non-sensitive RoofProject + question
 v
/api/assistant
 |-- tab-session validation
 |-- IP/session limits
 |-- project/context validation
 |
 v
Assistant orchestrator
 |-- RoofHub research retrieval
 |-- LLM interpretation/explanation
 |-- allowlisted structured tool requests
 |
 +--> update_project --> validated RoofProject patch
 +--> estimate_project --> Quick geometry --> existing deterministic estimator
 +--> navigate --> registered-route allowlist
 +--> open_tool --> known RoofHub tool routes
 +--> open_enquiry --> consented project form
```

## Project pricing

The model is never the price source.

`estimate_project` calls `lib/assistant/pricing.mjs`, which reuses Package A's Quick Estimate measurement model and the existing estimator core.

The same public approval guard applies to Assistant results. A draft rate card can be viewed only in explicit calibration-preview mode. Membrane remains unpriced until configured and approved.

## Knowledge

`lib/assistant/knowledge.ts` performs lightweight lexical retrieval over RoofHub's structured research content and verified public observations. It passes a compact set of relevant RoofHub excerpts/source notes into the model.

The model is told to state uncertainty when NZ-specific facts are not supported by retrieved context.

## Session model

Client:

- tab-scoped session key in `sessionStorage`;
- up to 20 turns retained locally for UI continuity;
- non-sensitive shared RoofProject remains in the existing tab project store.

Server:

- opaque derived session ID;
- short conversation history;
- per-session timestamps/limits;
- 8-hour rolling expiry;
- optional Redis REST persistence;
- process-memory development fallback.

No account is required.

## Analytics

The assistant emits coarse events only:

- assistant open;
- assistant question;
- assistant project update;
- assistant estimate.

The analytics event contract has no conversation-text field. Names, email, phone, exact address and uploaded documents also remain outside general analytics.

## Failure behavior

If AI is unavailable:

- pages render normally;
- Quick Estimate works normally;
- Detailed Estimate works normally;
- project state works normally;
- Ask RoofHub displays a safe fallback and routes to ordinary tools.

The assistant is therefore an enhancement, not a single point of failure.
