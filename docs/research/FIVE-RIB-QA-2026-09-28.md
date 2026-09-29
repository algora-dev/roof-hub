# RoofHub five-rib v0.8 QA record

## Baseline

Applied to `roof-hub-main-cf6343f-2026-09-28.zip`. The overlay manifest records the archive hash plus before/after hashes for supplied files. No files are deleted.

## Passed in this environment

| Check | Result and limits |
|---|---|
| `npm test` | Passed using the available global TypeScript module for dependency-independent tests. |
| Research checks | 2,552 validation assertions, 17 articles, 90 registered source records, 18 project accounts and 22 distinct referenced price observations. Assertions validate structure/provenance fields; they are not 2,552 independently verified facts. |
| Maths and rate integrity | 115 cases passed, including both existing estimator calculation smoke tests in the content checker. |
| Data/maths semantic typecheck | Passed for the research types/index, five-rib/corrugate metadata, statistics, observations and shared maths modules in a standalone strict TypeScript configuration. This is not the full app typecheck. |
| Component callback harness | 20 scenarios passed against the transpiled components: quote edits, GST blocking, plan/actual switching, bad inputs, independent minimum orders, clear-both action, conditional cover, five-rib download heading, guide shortcuts and dynamic counts. A small test hook harness was used, not React hydration. |
| Offline layout rendering | 19 pages: all 17 article components plus Sources and Methodology. Five widths (320, 390, 768, 1024, 1440) with disclosures collapsed and expanded: 190 layout states. |
| Layout/markup results | No document-level horizontal overflow or out-of-viewport text/controls outside the intended scrollable tables. No duplicate IDs, missing control labels, unresolved in-page anchors, broken internal route references or visible em dashes found in those rendered pages. |
| Native keyboard disclosure | Mobile contents summary opens and closes with Enter. Full accessibility testing is still required in the real app. |
| Release boundaries | 58 protected files byte-identical, including estimator assets, private API, indexing/site configuration, analytics and brand assets. All 67 prior pricing observations and 15 unrelated article records are unchanged. |

## Preview limitations

Previews were rendered from actual TSX and repository CSS using an offline component loader and Chromium. Local logo assets were used; unavailable web fonts fell back to the existing font stack. These are layout previews, not deployed-site screenshots. No font files are redistributed.

The browser environment blocked localhost navigation, so layout HTML was loaded directly into Chromium. Source-link existence was researched separately; responsive checks validate internal routes and anchors, not the continuing live availability of every third-party page.

## Not certified here

`npm ci` failed with package-download DNS errors (`EAI_AGAIN`), followed by npm's `Exit handler never called` failure. Therefore the exact locked Next/React dependency graph, full `npm run typecheck`, `npm run build`, React hydration, live email delivery and production deployment have not been independently certified for this overlay.

Do not replace a real Vercel/CI build with the offline checks above.

## Required integration checks

```bash
npm ci
npm test
npm run typecheck
npm run build
```

In a preview deployment, verify:

1. `/roofing/five-rib`: 39 source URLs, eight profile entries, five priced listings, three held listings, seven project accounts. Price tables and closed-disclosure text are present in server HTML.
2. `/guides/corrugated-vs-five-rib`: hypothetical labels, editable quotes, GST, plan/actual switching, independent minimum quantities and validation. Clearing both quotes removes the illustrative inputs.
3. `/roofing/corrugated`: existing default calculator values, article, examples, navigation and download still behave as before.
4. `/sources` and `/methodology`: dynamic signature matches cited records (89 source pages, 22 price records, 18 projects and 17 articles for this snapshot). Do not replace these with hard-coded future targets.
5. Mobile at 320/390 px: native disclosures, table scrolling, source links, controls and focus states work. The full Header mobile menu remains an existing app component and needs normal hydration checks.
6. Download a five-rib calculation. Confirm the heading, inputs, GST, limitations and source notes. No numeric data silently transfers to the detailed estimator.
7. Follow a contextual article enquiry. Existing private API and delivery configuration remain intact; confirm success/failure handling without exposing the destination.
8. Confirm metadata/canonical and structured citations use the existing routes. Keep production indexing enabled as currently configured; keep estimator `noindex` unchanged.
9. Check current supplier offers before presenting them as purchasable quotes. Some research used indexed/cached text, and several technical fields deliberately remain unresolved.

No live-site change, IndexNow submission, Search Console action or message send was performed from this environment.
