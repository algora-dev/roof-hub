# RoofHub Phase 6 Handoff: Search and Mega-Source Expansion

**Date:** 20 October 2026  
**Baseline:** Phase 5 on Package B

## Goal

Expand RoofHub's commercial and technical search coverage without flattening the evidence model or damaging the early search relevance already visible on product/comparison pages.

The working rule is:

> Best answer + strongest evidence + most useful tool + clearest next action.

Not “publish the longest page” and not “replace every existing page because a bigger keyword exists.”

## Evidence used to choose the work

The supplied GSC export shows early page-one relevance for specific product/comparison questions, while broad commercial queries are much weaker.

Examples from the supplied export:

- `/guides/corrugated-vs-five-rib`: 80 impressions, 3 clicks, avg position 7.81;
- `/roofing/five-rib`: 151 impressions, avg position 8.56;
- `/roofing/corrugated`: 69 impressions, avg position 7.72;
- `/guides/colorsteel-vs-zincalume`: 71 impressions, avg position 7.07;
- `/guides/how-long-does-a-metal-roof-last`: 43 impressions, avg position 7.67;
- `/pricing/roofing-costs`: 120 impressions, avg position 43.11;
- `/pricing/reroof-cost`: 32 impressions, avg position 62.59;
- query `roof replacement cost nz`: 23 impressions, avg position 81.35;
- query `new roof cost`: 12 impressions, avg position 82.92;
- query `new roof cost nz`: 5 impressions, avg position 45.6.

The supplied generative-search export also shows RoofHub surfacing mostly on comparison/product pages. Therefore Package C protects those early winners and expands adjacent intent rather than rewriting everything.

See `docs/package-c/SEARCH_COVERAGE_MATRIX.md` for the detailed create/strengthen/leave-alone decisions.

## New crawlable authority pages

### `/guides/compare-roofing-quotes`

Owns the quote-comparison intent:

- same GST basis;
- quote vs estimate;
- product/system alignment;
- removal/access/underlay/flashings/rainwater/repairs;
- variations;
- contractor information beyond price;
- residential building contract threshold context;
- direct path into Quote Checker.

Primary sources added include Consumer Protection, Commerce Commission, Inland Revenue, Building Performance and RANZ.

### `/pricing/new-roof-cost`

Owns new-build/new-installation budgeting rather than roof replacement.

Key boundary:

- new roof = no default old-roof removal/disposal;
- reroof = existing roof/removal/condition risk remains visible.

A July 2026 Tasman Roofing guide is used as **source-specific current market context**, not as a RoofHub national tariff or automatic estimator rate.

The contextual CTA starts Quick Estimate with `project=new`.

### `/roofing/membrane`

Adds the missing membrane system authority surface.

Covers:

- TPO / thermoplastic single-ply;
- butyl/EPDM;
- torch-on modified bitumen;
- liquid-applied systems;
- substrate;
- falls and drainage;
- outlets/junctions/penetrations;
- product-specific appraisals and installer pathways;
- membrane quote checklist.

The page explicitly states that RoofHub's estimator does **not** yet publish a membrane price. The taxonomy can carry membrane into the project, but the price remains unconfigured until an approved calculation/evidence path exists.

## Strengthened existing pages

### `/pricing/roofing-costs`

- clearer new-build vs replacement distinction;
- current 2026 market-guide context;
- direct Quote Checker path;
- existing pricing-basis/evidence architecture retained.

### `/pricing/reroof-cost`

Title strengthened around `roof replacement cost NZ` while retaining the existing URL.

- keeps older Delta example because its scope is explicit;
- adds current 2026 contractor-guide context without calling it a national tariff;
- adds like-for-like quote comparison path.

### `/roofing/long-run`

Only a light touch:

- current source-specific cost-guide context;
- estimator action;
- technical structure preserved.

## Pages deliberately left structurally alone

The content regression locks pre-Package-C editorial dates for:

- `corrugate-vs-five`;
- `five-rib`;
- `corrugated`;
- `colorsteel-zincalume`;
- `lifespan`.

Those pages already show the strongest search relevance in the supplied GSC data. Do not broadly rewrite them during integration.

## Fresh source registry additions

Package C adds reviewed source records for:

- Consumer Protection quote/estimate guidance;
- Commerce Commission quote/estimate guidance;
- Inland Revenue GST rate;
- Building Performance contract requirements;
- RANZ comparing roofing quotes;
- Tasman Roofing 2026 new-roof cost guide;
- Solution Roofing 2026 roof-replacement guide;
- BRANZ membrane guidance;
- Building CodeHub / BRANZ membrane appraisal example;
- Nuralite membrane-system overview;
- ARDEX NZ TPO system page.

Current contractor cost guides remain editorial evidence. They are **not** injected into `data/observations.ts` or the estimator rate card by Package C.

## Search intent boundaries

### New roof cost

`/pricing/new-roof-cost`

Owns: new build, extension, new installation, builder allowance, early design budget.

### Roof replacement / reroof cost

`/pricing/reroof-cost`

Owns: replacement, strip-out, disposal, scaffold/access and existing-condition risk.

### Roofing costs umbrella

`/pricing/roofing-costs`

Owns: explaining pricing bases and routing to the correct project type.

### Roofing quote comparison

`/guides/compare-roofing-quotes`

Owns: decision framework. `/tools/quote-checker` is the noindex interactive application.

### Membrane roofing

`/roofing/membrane`

Owns: membrane technical/system intent. It does not pretend an approved cost engine exists yet.

## Contextual actions

`lib/article-actions.ts` now preserves intent into tools:

- new-roof cost -> Quick Estimate with `project=new`;
- membrane -> Quick Estimate with `product=membrane`;
- quote comparison -> Quote Checker directly.

Homepage, pricing, guides and roofing hubs expose the new paths. Ask RoofHub's destination catalogue also includes them.

## Automated regression

New `check:package-c-search` currently passes **60 checks**.

It locks:

- new search routes and sitemap entries;
- distinct new-roof vs replacement titles;
- source-specific cost-guide caveats;
- Quote Checker editorial-to-tool path;
- new-roof and membrane estimator presets;
- draft estimator-rate status;
- membrane `not-configured` status;
- Quote Checker noindex state;
- detailed-estimator noindex/release boundary;
- no leakage of contractor editorial guides into estimator rates;
- structural conservatism on early high-signal articles.

## Integration/SEO QA

After preview deployment verify:

- canonicals for all three new pages;
- article structured data and source rendering;
- sitemap includes the three crawlable pages and excludes tool routes according to existing logic;
- internal links resolve without redirects;
- Quick Estimate receives the correct new-roof/membrane presets;
- Quote Checker links from the guide;
- updated broad-cost pages have no accidental duplicate title/canonical;
- high-signal existing product/comparison pages remain unchanged except intended surrounding hub links;
- mobile content is readable and CTAs do not crowd evidence/source components.

Then submit/inspect the new crawlable URLs in the normal Search Console workflow rather than mass-resubmitting unchanged pages.
