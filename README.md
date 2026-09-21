# RoofHub NZ — Website v0.4

Current deployment candidate for RoofHub.co.nz.

## What changed from v0.3

This pass responds to the live-preview review rather than adding more decorative assets.

- Removed all weak / rejected roof imagery from the website.
- The website now uses only **two approved scenic hero assets**.
- Rebuilt the homepage into a much longer, more complete experience with clear section rhythm.
- Reworked Pricing, Tools, Guides and About so they rely on typography, UI, data blocks and brand colour rather than forcing photography into cards.
- Removed body-scroll locking from the mobile navigation to reduce the risk of a page remaining unintentionally unscrollable.
- Explicitly set normal document overflow/min-height behaviour in the global CSS.
- Updated the representative guide page and all build-status wording to v0.4.
- Preserved all noindex controls.

## Approved website imagery

Only these two images are used by the current code:

- `public/media/hero-home.webp`
- `public/media/hero-secondary.webp`

Original PNG and WebP handoff copies are also stored in:

`Design/Website_Asset_Pack/v0_4/`

Do not add generated roof images casually. New imagery should be created for a specific page/use case and reviewed before it is committed.

## Noindex / preview mode

Keep:

```text
ALLOW_INDEXING=false
```

while the site is being built. This controls:

- page robots metadata;
- `robots.txt`;
- the `X-Robots-Tag` HTTP response header;
- the preview-build banner.

When launch is explicitly approved, set `ALLOW_INDEXING=true` in Vercel and redeploy.

## Deployment

1. `npm install`
2. `npm run build`
3. Push/update the GitHub repo.
4. Deploy through Vercel.
5. Set `NEXT_PUBLIC_SITE_URL=https://roofhub.co.nz`.
6. Keep `ALLOW_INDEXING=false` until launch approval.

## Important

The pricing calculator remains demo arithmetic and is clearly labelled as such. Replace it with the audited RoofHub pricing core before any public/indexed launch.
