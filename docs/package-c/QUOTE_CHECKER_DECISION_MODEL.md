# Quote Checker decision model

Reviewed: 20 October 2026

Quote Checker is a scope-comparison tool, not a contractor-rating tool.

## Inputs

- quoted total
- GST basis: included, excluded or unknown
- same roofing system: same, different or unknown
- major scope states: included, excluded or unknown
- current shared RoofProject and, where available, a RoofHub indicative range

## GST normalisation

- GST included: compare the supplied total as inclusive.
- GST excluded: multiply by 1.15 before comparison.
- GST unknown: do not assign above/within/below status.

## Comparability

### Good comparison
The roofing system aligns, required comparison inputs are known and the major scope lines align with the RoofHub reference scope.

### Partial comparison
A price comparison is possible but one or more important scope items or the product match is unknown/misaligned. The result must explain those differences.

### Not directly comparable yet
Used when the GST basis is unknown, the proposed roofing system is different, no RoofHub reference range is available, or the quote amount is invalid.

## Price position

Only after the comparison is not blocked can Quote Checker say the normalised total is:

- below the RoofHub indicative range
- within the RoofHub indicative range
- above the RoofHub indicative range

These labels are not quality, fairness or value judgements.

## No fabricated adjustments

A scaffold exclusion, gutter inclusion or repair allowance never becomes an invented dollar adjustment. It changes comparability and explanation only unless RoofHub has an explicit approved calculation rule for that component.

## Pricing authority

The Quote Checker inherits the same rate-card approval boundary as Quick Estimate. Package C does not approve `roofhub-nz-draft-2026-09-22`. Membrane remains `not-configured`.
