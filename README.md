# RoofHub NZ — Website v0.2

Presentation-ready preview foundation for RoofHub.co.nz.

## What changed from v0.1
- Added a restrained NZ-oriented architectural visual layer to homepage, pricing, guides and about.
- Tightened NZ wording and made prototype pricing explicitly NZD.
- Added an explicit note that GST treatment is not yet configured in the demo estimator.
- Preserved the design-system component structure and existing noindex controls.
- Added `docs/MEDIA_NOTES.md` so provisional imagery is reviewed before public indexing.

## Indexing
Keep `ALLOW_INDEXING=false` while building/testing. This controls metadata, robots behaviour, HTTP headers and the preview banner together.

## Deployment
1. `npm install`
2. `npm run build`
3. Push to GitHub.
4. Import into Vercel.
5. Set `NEXT_PUBLIC_SITE_URL=https://roofhub.co.nz`.
6. Set `ALLOW_INDEXING=false` until launch approval.

## Important
The pricing calculator is UI/demo arithmetic only. Do not publish it as real NZ market pricing. Replace it with the audited RoofHub pricing core before launch.
