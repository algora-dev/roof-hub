# Quote Checker V2 file changes

## New
- `lib/quote-checker/baseline.ts` - shared-engine compact baseline builder and minimum-input validation.
- `docs/quote-checker-v2/DECISION_MODEL.md` - revised comparison/baseline/GST decision model.
- `QUOTE_CHECKER_V2_HANDOFF.md`
- `IMPLEMENTATION_AGENT_PROMPT_QUOTE_CHECKER_V2.md`
- `FILE_CHANGES_QUOTE_CHECKER_V2.md`
- `QUOTE_CHECKER_V2.patch`

## Modified
- `components/quote-checker/QuoteChecker.tsx`
  - adds baseline step;
  - direct-entry roof-system selection;
  - compact baseline form;
  - Quick/Detailed estimator alternatives;
  - unknown-GST scenario result;
  - useful scope-first result hierarchy.
- `components/quote-checker/QuoteChecker.module.css`
  - baseline/scenario UI;
  - responsive styles;
  - clean print treatment.
- `lib/quote-checker/index.mjs`
  - GST scenario engine;
  - unknown GST becomes partial rather than a hard blocker;
  - revised reasons/baseline instructions.
- `lib/quote-checker/index.d.mts`
  - GST scenario types/return values.
- `lib/quote-checker/project-adapter.ts`
  - persists actual current Quote Checker step rather than hardcoding `result`.
- `components/quick-estimate/QuickRoofEstimate.tsx`
  - quote-checker entry provenance;
  - return-to-Quote-Checker CTA;
  - carries quote-checker origin into detailed refinement.
- `components/RoofHubEstimator.tsx`
  - quote-checker return banner;
  - allows quick measurements to initialise detailed estimator when coming from Quote Checker.
- `scripts/check-quote-checker.mjs`
  - V2 baseline architecture checks;
  - unknown-GST scenario cases;
  - preserved exhaustive 6,561 reroof scope permutations.

## Explicitly not changed
- detailed-estimator arithmetic;
- rate values;
- estimator rate-card activation file;
- membrane price configuration;
- RoofProject schema version;
- lead/enquiry sharing rules;
- Quote Checker noindex policy.
