# Pressed Metal Tile v0.9: QA and release checks

Review date: 29 September 2026.

## Completed in this environment

| Check | Result | What it establishes |
|---|---|---|
| `npm test` | Pass | Existing content/core gates, 3,032 research assertions, 183 mathematics/rate cases, 23 component-state harness scenarios |
| Strict TypeScript on data and pure maths modules | Pass | Panel maths, shared roof maths, pressed-tile registry/helpers, research index/stats and pricing types/observations resolve and typecheck with available TypeScript |
| TS/TSX syntax transpilation | 82 files, no syntax errors | Parsing/transpilation only, not complete framework typechecking |
| Changed JavaScript test scripts | Syntax pass | `node --check` on check-research, check-math and check-tile-ui |
| Offline layouts | 170 states, no failures | 17 actual article components at 360, 390, 768, 1024 and 1440 px, disclosures collapsed and expanded |
| Layout checks | Pass | One H1, unique IDs, matching same-page anchors, labelled worksheet fields and no document-level horizontal overflow |
| Existing observations | 71 unchanged | Raw observation objects were compared with the v0.8 baseline |
| Protected source files | 57 byte-identical | Estimator, deployment/indexing, analytics, enquiry handling, core brand assets and design configuration |
| Other article records | 15 unchanged | Pressed-tile article expanded; five-rib review date updated for the shared Eastern Beach correction |
| Em dashes and private recipient leakage | Pass | Existing public-source regression guards remain in place |

The research assertion count tests data structure, identifiers, dates, source links and provenance rules. It is not a count of independently verified market facts or audited invoices.

## Boundaries of these tests

Dependencies could not be installed successfully. Two `npm ci` attempts were made; the npm log reported an exit-handler failure and registry requests failed DNS checks. The available global TypeScript was used for dependency-independent checks. No full Next.js production build, real React hydration, deployed Vercel inspection or live email delivery was certified.

Layout previews use a lightweight offline rendering harness executing the actual TSX components and CSS. They use fallback fonts. The component-state test invokes the real worksheet functions and event handlers in a small hook harness; it is not a browser-based React E2E test. Native disclosures and rendered layout were checked in Chromium. A real preview deployment must still pass the tests below.

## Run in the agent's dependency-resolved environment

```bash
npm ci
npm test
npm run typecheck
npm run build
```

`npm test` now includes `scripts/check-tile-ui.cjs` through the maths test runner. There are no new package dependencies. Do not commit generated dependency folders or build output.

## Preview deployment acceptance

1. Open `/roofing/pressed-metal-tile`. Confirm the existing route, correct title, canonical and current indexability are retained. Do not create a duplicate slug.
2. Confirm all 11 sections, nine profile rows, four dated/scope-labelled pricing observations, six project accounts and 37 source-page links render. Evidence inside disclosures must be in the initial HTML.
3. Default worksheet: Classic, 200 m² actual area, 0% extra, pack size 1, no minimum. Expect **430 panels**, no dollar result.
4. Change to horizontal plan area at 25°. Expect approximately **220.68 m²** and **475 panels**, before extra allowance. Change back to actual and expect 430.
5. Set actual 200 m² with 5% extra. Expect **452 panels** before supplier rules. 10% gives 473, not 474 from floating-point noise.
6. Reset extra to 0. Enter a hypothetical NZD 12 per panel. Unknown GST shows **$5,160 on the quoted basis**, without calling it GST-inclusive. Excluding GST shows **$5,934 including GST**. Including GST shows $5,160.
7. Set minimum 451 and packs of 20. Expect **460 panels**. Clear/reset the rules afterwards.
8. Select CF Slate or Calibre. No disputed density should populate automatically. Enter a supplier-confirmed density to proceed. These are arithmetic permissions, not design approval.
9. Change profile after entering a quote. The price, tax, pack/minimum and support assumptions must reset. Area and its basis should remain.
10. Optional batten check: no gauge is preset. On a confirmed batten-supported system, 200 m² at a user-entered 400 mm gauge gives **500 lm as a separate approximation**, not a cutting list. Calibre should not offer a generic batten check.
11. Try blank, zero, negative and nonfinite values; invalid pack fractions; invalid plan pitch; and a price with unknown GST. No NaN, Infinity, misleading price or enabled invalid export should appear.
12. Download the worksheet. Verify inputs, source URL, quantity, tax basis, exclusions and any pitch warning are included. Verify a download error does not erase inputs or falsely claim completion.
13. Open the detailed estimator using the CTA. It must remain unchanged. Do not claim article measurements transfer automatically.
14. Check project-enquiry and correction links retain the source-page context, and the private recipient stays server-side. No test enquiry was sent by this release.
15. Browse `/roofing/five-rib` and confirm Eastern Beach now uses the builder's T-rib description. Browse corrugated and the comparison worksheets for regressions.
16. Check `/sources` and `/methodology`: dynamic counts should be 114 cited source pages, 23 cited price observations, 22 project accounts and 17 articles at this release. Stored source records total 115, which is a different metric.
17. Inspect 390 px mobile and desktop layouts. Check keyboard focus, disclosure navigation, horizontally scrollable evidence tables and browser console errors with the real application fonts/runtime.
18. Preserve production environment variables, enabled indexing, current host redirects, Clarity and enquiry credentials. Use the existing production checker after deployment without changing its indexing expectations unnecessarily.

## Research-specific acceptance

- No guide price becomes a panel price or a claimed national average.
- The old provisional `tt-01` row stays provisional; the new Roofing Systems record is separate and excluded from derived ranges.
- No published house floor area becomes measured roof area.
- No project is assigned a fabricated roof cost.
- The Kumeu gallery is not described as a verified dated new build.
- Tamahere is identified as asphalt replacement, not old-metal-tile replacement.
- No automatic Calibre/CF Slate density or Calibre batten spacing is introduced during integration.
- No third-party photography is copied and no new licence claim is invented.
