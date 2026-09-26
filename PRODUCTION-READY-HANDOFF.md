# RoofHub production-ready handoff

**Canonical host:** `https://www.roofhub.co.nz`  
**Prepared:** 26 September 2026

This repository has been hardened around the Vercel domain configuration supplied by the owner:

- `www.roofhub.co.nz` = canonical production host.
- `roofhub.co.nz` = permanent `308` redirect to `www.roofhub.co.nz`.
- `roof-hub-sigma.vercel.app` may remain attached to Production, but application middleware marks any non-canonical host `noindex, nofollow` so it cannot become a duplicate search result.

**No Vercel domain change is required.**

## 1. Required Vercel environment variables

Set these on **Production** before launch:

```text
NEXT_PUBLIC_SITE_URL=https://www.roofhub.co.nz
ALLOW_INDEXING=false

NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<Search Console token>
NEXT_PUBLIC_BING_SITE_VERIFICATION=<Bing token>
NEXT_PUBLIC_GA_ID=<optional GA4 measurement id>

ROOFHUB_INQUIRY_TO=insights@t3labs.co.uk
ROOFHUB_FROM_EMAIL=RoofHub <forms@roofhub.co.nz>
RESEND_API_KEY=<server-side Resend key>
```

`ROOFHUB_INQUIRY_TO`, `ROOFHUB_FROM_EMAIL` and `RESEND_API_KEY` are server-only. Never prefix them with `NEXT_PUBLIC_`.

The destination address is **not rendered anywhere on the public site**. `/contact` and detailed-estimator enquiries POST to `/api/enquiry`, which sends the message server-side.

### Email setup requirement

The code uses Resend's HTTP API without adding another npm dependency. Before relying on the form:

1. Add/verify a sending domain in the Resend account.
2. Set `ROOFHUB_FROM_EMAIL` to a sender on that verified domain.
3. Set `RESEND_API_KEY` in Vercel Production.
4. Submit one real contact form and one detailed-estimator quote request.
5. Confirm both arrive at the private destination inbox and that Reply-To is the visitor's email.

Until those credentials are configured, forms fail visibly rather than falsely claiming a successful delivery.

## 2. Search-index launch sequence

Indexing is deliberately **opt-in**. Do not set `ALLOW_INDEXING=true` until the release checks below pass.

### While staging

```text
ALLOW_INDEXING=false
```

This causes:

- page-level `noindex` metadata;
- a site-wide `X-Robots-Tag: noindex...` response header;
- `robots.txt` to disallow crawling;
- the sitemap to contain no indexable URLs;
- a visible preview banner.

### Launch

1. Deploy with all other production variables set but `ALLOW_INDEXING=false`.
2. Confirm the site, forms and cornerstone pages manually.
3. Confirm `roofhub.co.nz` redirects permanently to `www.roofhub.co.nz`.
4. Set `ALLOW_INDEXING=true` and redeploy.
5. Run:

```bash
npm run check:production
```

6. Visit:
   - `https://www.roofhub.co.nz/robots.txt`
   - `https://www.roofhub.co.nz/sitemap.xml`
7. Verify the domain in Google Search Console and Bing Webmaster Tools.
8. Submit `/sitemap.xml` to both.
9. Inspect `/`, `/pricing/roofing-costs`, `/pricing/reroof-cost` and `/roofing/long-run` in Search Console's live URL test.
10. Run `npm run indexnow` after the sitemap is live.

The detailed estimator intentionally stays `noindex` until its provisional market rate card is approved. It is **not** included in the sitemap, but it is crawlable so search engines can see its page-level `noindex` directive.

## 3. What is now live-content ready

Ten cornerstone resources are implemented as server-rendered, answer-first pages:

1. `/pricing/roofing-costs`
2. `/pricing/reroof-cost`
3. `/roofing/long-run`
4. `/roofing/corrugated`
5. `/roofing/five-rib`
6. `/roofing/pressed-metal-tile`
7. `/roofing/tray-standing-seam`
8. `/guides/roof-pitch`
9. `/pricing/scaffolding-cost`
10. `/guides/roof-area`

Supporting surfaces are also implemented:

- `/pricing`
- `/roofing`
- `/guides`
- `/tools`
- `/methodology`
- `/sources`
- `/about`
- `/contact`
- `/privacy`
- `/terms`
- `/guides/how-to-prepare-for-a-roofing-quote`

The pages use shared evidence/source components and the repository's structured observation data rather than duplicating price claims ad hoc.

## 4. Search/canonical hardening included

- One canonical source of truth: `lib/site.ts`.
- `www.roofhub.co.nz` canonical throughout.
- Middleware backup redirect for bare domain.
- Non-canonical Vercel/preview hosts always noindexed.
- One explicit `ALLOW_INDEXING` switch is used by metadata, middleware, robots and sitemap.
- Real route review dates in `data/siteRoutes.ts`; sitemap dates no longer change on every deploy.
- Self-referencing canonicals for indexable pages.
- Organization + WebSite JSON-LD at site level.
- Article JSON-LD on cornerstone/editorial pages.
- Absolute canonical URLs in BreadcrumbList JSON-LD.
- Detailed estimator excluded from sitemap and page-level noindexed.
- `/api/` blocked in robots.
- IndexNow script derives the canonical host from `NEXT_PUBLIC_SITE_URL` and rejects mixed-host sitemap entries.
- `npm run check:production` checks statuses, canonicals, indexing state, robots, sitemap and bare-domain redirect.

## 5. Content/evidence rules to preserve

- Keep material-only, labour-only, supply/install and complete-project figures separate.
- Show GST basis; unknown GST remains unknown rather than silently normalised.
- Do not use provisional observations as published facts.
- Raw observations remain separate from RoofHub-derived planning ranges.
- Link sources close to the evidence they support.
- Do not copy contractor articles or unlicensed project photography.
- Keep the primary answer in HTML, not only inside JavaScript tools.
- Do not create thin indexable calculator-result URLs.

## 6. Detailed estimator status

The detailed estimator remains deliberately conservative:

- accessible from the website;
- `noindex` while its material/scaffold/GST rate card is provisional;
- clearly labelled as a preliminary planning estimate;
- no fake “sent” state if email delivery fails;
- quote payload excludes uploaded plan-image bytes and custom rate overrides;
- contact destination stays server-side.

The rest of the content site can be indexed even while this one tool remains noindex.

## 7. Build gate

Before pushing to production:

```bash
npm ci
npm run check:content
npm run typecheck
npm run build
```

After production deployment:

```bash
npm run check:production
```

If indexing is intentionally still disabled during the first deployment, run:

```bash
EXPECT_INDEXING=false npm run check:production
```

## 8. Next content/data work after launch

Do **not** immediately mass-publish hundreds of articles. After the first indexable release:

1. Watch Search Console crawl/index status.
2. Strengthen GST tagging and profile-specific supplier observations in `data/observations.ts`.
3. Improve RoofHub-derived “typical” ranges separately from raw observed market spans.
4. Add original RoofHub profile diagrams and data visualisations.
5. Build the simple homeowner questionnaire estimator against the same pricing/quantity model.
6. Add pages only when they answer a genuinely distinct search/user need.



See `QA.md` for the checks completed in the handoff environment and the build step that still must run in CI/Vercel.
