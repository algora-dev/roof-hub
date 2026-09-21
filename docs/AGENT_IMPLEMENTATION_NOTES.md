# RoofHub v0.1 — Agent implementation notes

## Purpose

This codebase is deliberately small. It exists to validate RoofHub's design language, page rhythm, responsive behaviour and integration slots before large-scale content or mature tools are added.

## Source-of-truth hierarchy

1. Current explicit user instruction.
2. Existing working production components / approved RoofHub tool APIs.
3. RoofHub handoff package `Design/System/*.md` and token files.
4. Canonical logo assets.
5. Reference-board imagery.

## Do not do these things

- Do not recolour/redraw the logo.
- Do not add blue as a generic SaaS accent.
- Do not introduce new button families for individual pages.
- Do not duplicate roofing formulas inside React components when approved calculators exist.
- Do not publish demo prices as NZ market pricing.
- Do not enable indexing simply because the domain is connected.
- Do not gate basic tool results behind contact capture.

## UI rule

Terracotta = primary actions / selective emphasis.
Sage = broader supporting UI, trust, methodology, success, tints, diagrams and secondary actions.
Neutral/off-white = most of the page.

## Immediate next build sequence

1. Deploy this v0.1 unchanged and inspect desktop/mobile on the real domain.
2. Tune typography/spacing only if necessary; update shared tokens instead of one-off page CSS.
3. Audit existing roofing calculators, pricing config, measurement code and smart-assistant code.
4. Integrate the real pricing engine into the existing `/pricing` result UI.
5. Add measurement as the second real tool.
6. Replace representative guide copy with researched/source-backed NZ content.
7. Add methodology/privacy pages before handling real uploads.
8. Only then expand site architecture and SEO content.
