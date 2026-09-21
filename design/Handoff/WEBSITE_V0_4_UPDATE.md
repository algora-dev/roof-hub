# RoofHub Website v0.4 — Agent Update

## Use this version

`Website/v0_4/` is the current deployment candidate.

## Why this update exists

The live-preview review found two issues:

1. Too much low-quality generated roofing imagery made the site feel synthetic and reduced trust.
2. The page experience felt too short and there was concern about pages becoming clipped/unscrollable.

v0.4 addresses both directly.

## Mandatory patch actions

1. Replace the current website implementation with `Website/v0_4/` or merge its changes exactly.
2. Commit only the two assets in `Website/v0_4/public/media/` for current photography.
3. Do not restore the rejected old `guide-roof-*`, aerial-roof or close-up roof image files.
4. Keep `ALLOW_INDEXING=false`.
5. Deploy and explicitly verify normal vertical scrolling on:
   - `/`
   - `/pricing`
   - `/tools`
   - `/guides`
   - `/guides/how-to-prepare-for-a-roofing-quote`
   - `/about`
6. Verify desktop, tablet and mobile widths.

## UX changes

- Homepage is now substantially longer and follows the approved page anatomy.
- Pricing, Tools and Guides are mostly UI/content-led rather than photo-led.
- About uses the secondary approved scenic image.
- Mobile navigation no longer changes `document.body.style.overflow`, removing a possible sticky scroll-lock failure mode.
- Global CSS explicitly preserves vertical document overflow and avoids fixed-height content sections.

## Image rule going forward

Use fewer images, but better images. Page-level scenic heroes are preferred. Do not generate a different roof image for every content card.
