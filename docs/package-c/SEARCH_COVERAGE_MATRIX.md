# Package C search and content coverage matrix

Reviewed: 20 October 2026

This document records why Package C creates, strengthens or deliberately leaves alone each search surface. Search performance comes from the Google Search Console exports supplied with this project. Public competitor/source observations were rechecked on 20 October 2026.

## Decision rules

- Do not rewrite a page simply because a larger keyword exists.
- Protect pages already showing page-one or near-page-one relevance unless a factual or conversion fix is needed.
- Give new-build cost, replacement cost and quote comparison separate search intents.
- Keep editorial market evidence separate from estimator rates.
- A current contractor guide is a source-specific observation, not a national tariff.
- Build a useful tool or decision path behind commercial-intent content rather than producing search-only copy.

## Current RoofHub signal

| Search surface | GSC signal | Package C decision |
| --- | --- | --- |
| `/guides/corrugated-vs-five-rib` | 80 impressions, 3 clicks, avg position 7.81 | Leave article structure alone. Preserve the early page-one signal. |
| `/roofing/five-rib` | 151 impressions, avg position 8.56 | Leave article structure alone. |
| `/roofing/corrugated` | 69 impressions, avg position 7.72 | Leave article structure alone. |
| `/guides/colorsteel-vs-zincalume` | 71 impressions, avg position 7.07 | Leave article structure alone. |
| `/guides/how-long-does-a-metal-roof-last` | 43 impressions, avg position 7.67 | Leave article structure alone. |
| `/roofing/long-run` | 185 impressions, avg position 43.52 | Strengthen only the cost context and internal action. Preserve technical structure. |
| `/pricing/roofing-costs` | 120 impressions, avg position 43.11 | Strengthen. Clarify new build vs replacement and connect Quote Checker. |
| `/pricing/reroof-cost` | 32 impressions, avg position 62.59 in supplied page export; query `roof replacement cost nz` has 23 impressions at position 81.35 | Strengthen and retitle around roof replacement/reroof intent. Keep its URL. |
| `new roof cost` query family | `new roof cost` 12 impressions at position 82.92; `new roof cost nz` also present in supplied data | Create `/pricing/new-roof-cost` rather than forcing this intent into the reroof page. |
| Quote comparison | High commercial relevance, no dedicated RoofHub authority page in Package B | Create `/guides/compare-roofing-quotes` and pair it with Quote Checker. |
| Membrane roofing | Missing from the previous RoofHub system hub and estimator rate path | Create `/roofing/membrane` as technical authority. Do not fabricate a price range. |

Google generative search features in the supplied export are already surfacing RoofHub mainly for comparison/product pages. Package C therefore keeps those strong pages conservative and uses new content to extend the same evidence-plus-tool pattern into commercial decisions.

## Competitor and source coverage

| Query family | What current results tend to do | RoofHub gap/opportunity | Package C response |
| --- | --- | --- | --- |
| roofing quote comparison | Quote marketplaces collect details and source contractor quotes; consumer/industry guidance explains comparison principles | A neutral tool for checking a quote the user already has, with scope and GST comparability before price judgement | Quote Checker + `/guides/compare-roofing-quotes` |
| new roof cost NZ | Contractor cost guides publish broad ranges and per-m2 figures | Separate new-build allowance from reroof removal and keep source limitations visible | `/pricing/new-roof-cost` + project=new estimator preset |
| roof replacement cost NZ | Contractor guides publish ranges with inconsistent inclusions | Match removal, disposal, scaffold/access, underlay, flashings and repairs before comparing totals | Strengthened `/pricing/reroof-cost` + Quote Checker |
| roofing costs NZ | Broad cost pages often combine materials, installation and replacement | Preserve pricing basis, GST and scope instead of one blended average | Strengthened `/pricing/roofing-costs` |
| long-run roofing prices | Current results mix product prices and installed project guides | Explain lineal vs area vs complete-project bases and give current source-specific context | Light update to `/roofing/long-run` only |
| membrane roofing NZ | Manufacturer/technical sources explain proprietary systems; local cost pages can reduce the subject to area rates | Explain system family, substrate, falls, drainage and installer pathway before price | `/roofing/membrane`; estimator remains unpriced |

## Fresh source set added in Package C

### Quote comparison and consumer protection
- Consumer Protection: `Quotes and estimates`
- Commerce Commission: `Quotes, estimates and invoicing`
- Inland Revenue: current GST rate (15%)
- Building Performance: residential building contract requirements
- Roofing Association of New Zealand: `Comparing Quotes`

### Current market context
- Tasman Roofing, 24 July 2026: new-roof cost guide. Contractor-authored and not treated as a national survey.
- Solution Roofing, 10 May 2026: roof-replacement cost guide. Service-area context retained.
- Existing RoofHub evidence such as Edwards & Hardy and Delta remains dated and scoped rather than overwritten.

### Membrane roofing
- BRANZ: `Membranes do matter`
- Building CodeHub / BRANZ: product-specific butyl appraisal example
- Nuralite: membrane-system comparison
- ARDEX New Zealand: TPO roofing systems

## Cannibalisation boundaries

### `/pricing/new-roof-cost`
Owns: new build, extension, new installation, builder allowance, early design budget.
Does not own: strip-out/removal of an existing roof.

### `/pricing/reroof-cost`
Owns: reroof, roof replacement, removal/disposal, existing-condition risk.
Does not own: generic new-build roof allowance.

### `/pricing/roofing-costs`
Owns: umbrella explanation of pricing bases, evidence and scope.
Links users into the specific new-build or replacement page rather than duplicating both in full.

### `/guides/compare-roofing-quotes`
Owns: GST, scope, quote-vs-estimate, variation and decision framework.
The Quote Checker is the interactive application of the same model.

### `/roofing/membrane`
Owns: membrane system selection and technical decision context.
It explicitly does not claim an approved RoofHub membrane estimator rate.

## Pages intentionally not rewritten

The following articles retain their pre-Package-C editorial dates and structure because supplied GSC data already shows strong relevance:

- corrugated vs five-rib
- five-rib roofing
- corrugated roofing
- COLORSTEEL vs ZINCALUME
- metal roof lifespan

Future changes to these pages should be based on new query/page evidence or a concrete factual/UX issue, not a desire to make every page look newly updated.
