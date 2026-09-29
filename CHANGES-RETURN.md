# RoofHub Pressed Metal Tile Reference Guide v0.9

**Changed/additional files only. Apply over the current repository; do not replace the repository with this ZIP.**

Baseline: `roof-hub-main-cf6343f-2026-09-28.zip` plus the v0.8 five-rib overlay. No fresher post-v0.8 source export was supplied. Compare the baseline hashes in `V09-OVERLAY-MANIFEST.json` with your current files and reconcile any intervening edits before applying a shared file.

## Purpose

Expand the existing `/roofing/pressed-metal-tile` into a source-backed modern new-roof guide, with separate replacement coverage. Add a practical panel-quantity worksheet, reader-supplied panel prices and an optional installer-gauge batten check. Do not change the estimator's pricing or launch configuration.

## What is implemented

- Eleven sections, eight FAQs and 37 linked source pages.
- Nine selected Gerard-family profiles. Metrotile's legacy name is not counted as an independent current manufacturer.
- Four installed/replacement guide-price observations from three publishers, with dates, GST and scope attached. No pooled national range.
- Six project accounts from four publishers, including new-home examples. Undisclosed roof area and cost stay undisclosed.
- Panel quantities for actual area or pitch-adjusted horizontal roof projection, whole panels, optional user allowance, minimum orders and pack rounding.
- Optional per-panel quote and GST basis. No supplier price is pre-filled. Unknown GST stays unknown.
- CF Slate and Calibre published coverage conflicts are displayed; their automatic presets are disabled.
- Separate optional batten arithmetic requires an installer-provided gauge and is not a design or purchase schedule. Not offered for Calibre's cited plywood system.
- A text worksheet download, with inputs, provenance and exclusions. No automatic transfer into the detailed estimator is claimed.
- Dynamic source/methodology counts now consume the new evidence block type.

## Intentional corrections and boundaries

The existing Eastern Beach project said Trimrib. The actual builder page describes **T-rib**. Its record and source note are corrected, keeping IDs intact so existing links continue working. The five-rib article's review date advances because it uses that shared project record; its prose and pricing are unchanged.

All 71 previous pricing-observation objects are unchanged. `tt-01` remains provisional. A new observation, `tile-rs-20260929`, records the currently displayed but undated Roofing Systems $90/m² installed/GST-inclusive guide, with `rangeEligible: false`. It is not promoted into a current materials rate.

Fifty-seven protected files are byte-identical, including the detailed estimator, indexing/canonical configuration, analytics, forms/API, brand assets and deployment files. Fifteen other article records are unchanged. No new dependency or font asset is included.

## Pricing gap, deliberately not hidden

This research did not verify a current NZ per-panel material price with all necessary purchase conditions. The public worksheet uses a price only when the reader enters one. Do not derive panel prices by subtracting the owner's labour allowance from an installed guide. Do not force the public evidence into a universal “pressed tile is cheapest” claim.

The owner's $8 to $10.50/m² labour input remains internal and unchanged. A current, scoped supplier or installer rate sheet is the next useful input for improving the market rate card. The current release still delivers useful planning quantities, complete-system quote checklists and dated source prices without fabricating that missing figure.

## Integration instructions

1. Commit or back up the current repository.
2. Read the overlay manifest. Keep all files not listed in it. Resolve hash conflicts, especially shared JSON, renderer and test files, rather than blindly overwriting newer work.
3. Apply all payload files, including new maths/data/components and the new test harness together.
4. Run:

```bash
npm ci
npm test
npm run typecheck
npm run build
```

5. Follow `docs/pressed-tile-v09/QA.md` in a preview deployment. Test the worksheet with the real React runtime, source disclosures, mobile layouts, text download and contextual enquiry links.
6. Preserve live environment variables and currently enabled indexing. This is a content/tool update to an already-live site, not the original pre-launch procedure. Do not revert production to `ALLOW_INDEXING=false` just because an older handoff described a staged launch.
7. Deploy only after the dependency-resolved checks pass. Use the existing production checker against the deployed canonical host.

## What was and was not tested here

Pass: repository tests (3,032 research assertions, 183 mathematics/rate cases and 23 component-state harness scenarios), strict data/maths TypeScript, syntax transpilation of 82 TS/TSX files, and 170 offline article layout states. Evidence assertions validate structure and provenance, not independent invoice accuracy.

Not certified: a full Next build or actual React hydration. Dependency installation failed in this environment. Offline screenshots use the real component/CSS output and fallback fonts, not a running production Next application. No deployment or live email transmission was performed.

## Documents

- `docs/pressed-tile-v09/RESEARCH.md`: claims, exclusions, source URLs, conflicts and scope decisions.
- `docs/pressed-tile-v09/QA.md`: completed tests, limitations and preview acceptance checklist.
- `docs/pressed-tile-v09/INTEGRITY.json`: recorded preservation checks and derived counts.
- `V09-OVERLAY-MANIFEST.json`: per-file baseline/output hashes.

Keep the research qualifiers during integration. They are part of the answer, not development notes to delete.
