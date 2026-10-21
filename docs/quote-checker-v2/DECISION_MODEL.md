# RoofHub Quote Checker V2 decision model

## Product problem fixed

Phase 5 could collect a complete quote scope and still finish with no useful price result when the active RoofProject did not already contain a RoofHub estimate. The result screen then told the visitor to build an estimate after they had already completed Quote Checker.

V2 moves the reference-price requirement into the journey before the result.

## Journey

1. Quote amount and GST basis.
2. Roofing system alignment.
3. RoofHub baseline.
4. Quote scope.
5. Result.

A baseline can come from any existing RoofProject estimate:
- Quick Estimate;
- Detailed Estimator;
- the compact Quick Estimate baseline built inside Quote Checker.

The compact baseline is not a new estimator. It calls the existing Quick Estimate geometry model, then the existing detailed-estimator runtime and the same rate card.

## Minimum compact-baseline inputs

Required:
- new roof or re-roof;
- roofing system on the quote;
- approximate size band OR a supplied area with its basis.

Allowed to remain unknown:
- roof shape;
- pitch;
- storeys;
- existing roof type;
- difficult access.

Unknown facts widen/qualify the baseline rather than being silently guessed.

Membrane remains unpriced until RoofHub has a configured public membrane estimator pathway.

## GST

Unknown GST is no longer a hard blocker.

If GST basis is unknown, Quote Checker computes two transparent incl-GST scenarios:
- if the typed quote amount already includes GST;
- if the typed quote amount is plus 15% GST.

If both scenarios land in the same position relative to the RoofHub range, that position may be stated with partial comparability. If they land in different positions, the UI shows both and does not collapse them into one headline status.

## Hard blockers for a direct price label

- no RoofHub reference estimate;
- missing/invalid quote amount;
- quote and reference are explicitly different roofing systems.

Unknown GST, unknown scope, scope differences and an unconfirmed product match reduce comparability but do not erase useful scope analysis.

## Result hierarchy

The result leads with what RoofHub found, not with the internal phrase "not directly comparable".

It separates:
- price position;
- GST uncertainty;
- roofing-system match;
- scope differences;
- unresolved scope questions.

Scope differences remain visible even when price comparison is unavailable.

## Safety / neutrality preserved

Quote Checker still must not:
- label a roofer overpriced, unfair, bad or fraudulent from price alone;
- assign fabricated dollar adjustments to unknown scope;
- invent membrane prices;
- bypass the shared estimator/rate-card architecture;
- treat a baseline estimate as a contractor quote.
