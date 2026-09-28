# Corrugated reference guide: QA record

Date: 28 September 2026  
Release: v0.7  
Target: `/roofing/corrugated`

## Checks actually completed

| Check | Result | What it establishes |
|---|---|---|
| Repository `npm test` | Passed | Existing content gates and new recursive research/price checks run successfully. |
| Research validator | 2,071 assertions passed | Valid IDs, citations, dates, schema, routes, statuses, conversion prerequisites, exclusions, no em dashes and unchanged release boundaries. These are not 2,071 independently verified roofing facts. |
| Math and rate-integrity suite | 86 cases passed | Existing 46 cases plus 40 new cases cover tax, units, cover, plan/actual area, allowances, minimum orders, invalid values, overflow and sheet-count rounding. |
| Existing detailed estimator smoke tests | Passed | New-roof and reroof/removal calculations continue to work. |
| TypeScript/TSX syntax transpilation | 73 source files, zero syntax diagnostics | Syntax only. This is not a full semantic application typecheck. |
| Strict dependency-independent TypeScript check | Passed | The real math modules and research data access modules typecheck transitively using their real types and JSON records. No React/Next types were fabricated to claim application validation. |
| Static execution/rendering | All 17 article components rendered | Actual TSX, data and CSS were used, with a small off-repository JSX/hook renderer. Framework components were replaced only in the QA harness. |
| Layout inspection | 90 page/state/width combinations passed | All 17 articles at 1440, 1024, 768, 390 and 320 px, plus the corrugated page with all disclosures open at all five widths. No document-level horizontal overflow, duplicate IDs, missing H1, unresolved in-page anchors, unlabeled inputs, em dashes or missing local logo images in those static renders. |
| Client component wiring | 13 checks passed | Actual worksheet event handlers exercised with a minimal hook-state harness, including source switching, plan/actual changes, invalid input, custom GST, minimum quantity and text export. This is not React hydration or a real Next browser session. |
| Baseline integrity | Passed | All existing observation records, source records, project records and the other 16 article records are semantically unchanged. Protected configuration, API, analytics, brand and estimator files are byte-identical. |

## Visual review

Desktop and mobile screenshots were inspected for the main answer, source-led price ledger, manufacturer table and worksheet. The original global CSS and brand assets were used unchanged. The screenshots use the system fallback font because the host font was not fetched in this offline environment. No font files are included in this overlay.

The corrugated contents panel stays compact on phones. Native evidence disclosures can be opened without React. The quoted-price evidence, notes and project content exist in the server component output; they are not fetched only after clicking.

A pre-existing duplicate `questions` ID on the Decramastic article was found during shared-renderer checks. The renderer now chooses a non-colliding FAQ anchor without changing that article's editorial data or existing section anchors. All other article records remain unchanged.

## Tests NOT certified in this environment

`npm ci` was attempted with a short timeout. The npm tarball requests for locked React/React DOM/Next packages failed with `EAI_AGAIN` network/DNS errors, and the install timed out. Partial install files were removed and are not packaged. Package manifests and lockfile are unchanged.

Consequently a complete dependency-resolved `npm run typecheck`, `npm run build`, real React hydration, Next development/production navigation, and live server submission are NOT certified here. Static rendering and stubbed event tests must not be represented as those checks.

The live website was not deployed or changed. No email was sent. No Vercel environment values were inspected or modified, and no claims are made about new live Search Console results.

## Required deployment gate

From the existing repository with this overlay applied:

```bash
npm ci
npm test
npm run typecheck
npm run build
```

In the preview deployment, verify:

1. `/roofing/corrugated` has the new title, correct canonical, 41 cited source pages and the expected article metadata. Native disclosures work with keyboard and touch. Deep evidence exists in the response HTML.
2. The worksheet starts at an illustrative 200 m², is clearly sheet-only, produces about $8,413 incl GST for the selected R&C example and about $4,485 for the separate Bitz example, and retains all source caveats. These are different products, not ends of a national range.
3. Plan area exposes pitch and converts once; actual area ignores pitch. Empty/zero inputs show errors rather than a zero-cost answer. A custom quote is blocked until its GST basis is confirmed. The R&C minimum order changes a small-area subtotal.
4. Downloaded text retains source, scope, tax and exclusions. The full-estimator link opens the existing tool. The UI does not imply automatic transfer of quantities.
5. Contextual quote links preselect the existing `Roofing quote enquiry` topic and pass the page path. Corrections use the existing correction topic. Existing private email delivery remains unchanged.
6. The other article routes, especially the Decramastic FAQ anchors, still render. The existing estimator's noindex state and numeric rate card remain as before.
7. Check 390 px and desktop layouts using the real host font. Confirm no hydration errors, console exceptions or broken client navigation. Manually check the external source links that matter to publication; bot-protected responses in a tool are not proof of a dead public page.
8. Preserve the currently enabled production indexing configuration. Run the repository's existing production checker with indexing expected after deployment; do not set `ALLOW_INDEXING=false` because an older handoff advised it during initial launch.

These are release verification steps, not instructions to redesign the page or replace its source-specific prices with a blended range.
