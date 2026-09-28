# Corrugated roofing reference guide: research register

Review date: 28 September 2026  
Content release: v0.7  
Public route: `/roofing/corrugated`  
Baseline: `roofhub-codebase-post-v0.6.zip`, the agent's post-v0.6 production snapshot.

## What this release establishes

The page links 41 unique source-page URLs. That is not 41 suppliers, 41 independent corroborations of each claim, or 41 verified transactions. Its main cohorts are six manufacturer comparisons, six priced listings from four supplier businesses, two additional supplier listings withheld from conversion, and seven published project accounts from six publishers. Different source cohorts answer different questions.

The page contains eleven main sections, a contextual sheet-budget worksheet, source-specific area examples, and linked project accounts. It is deliberately not a pooled national pricing survey. Expansion is about better evidence and interpretation, not a larger headline price span.

The review used public pages and publicly indexed product excerpts where direct extraction was incomplete or blocked. No checkout, stock, freight, installer invoice, site inspection or supplier quotation was verified. Pricing should be rechecked before purchase. `verified` in the observation system means the stated information was observed in the public source; it does not certify the supplier's performance or make unknown fields known.

## Price cohort and conversion decisions

| Observation | Published amount | Known basis and caveats | Treatment |
|---|---|---|---|
| `lr-18`, Bitz & Piecez | $17.49/lm, incl GST | Painted steel with 0.5 mm stated gauge, not established as BMT or COLORSTEEL. The 780 mm cover comes from the seller's archived Trade Me listing, not a newly verified technical drawing. | Conditional $22.4230769/m² coverage arithmetic, always qualified. Existing source record and estimator rates unchanged. |
| `corr-rc-maxam-20260928`, Residential & Commercial Roofing | $27.80/lm, excl GST | COLORSTEEL MAXAM, 0.55 stated gauge, approximately 760 mm cover, 50 lm minimum order. | $31.97/lm including GST; approximately $42.0657895/m². Minimum quantity is applied in the worksheet. No stock or freight promise. |
| `corr-bunnings-painted-20260928` | $30.35/lm | Armorsteel Ironsand, 0.4 stated gauge. Public indexed listing gives 845 mm sheet width, not a confirmed effective cover. GST unconfirmed in captured evidence. | Preserve listed $/lm and unknown tax. No covered-area or tax-inclusive conversion. |
| `corr-bunnings-zinc3-20260928` | $64.94 per 3 m sheet | Armorsteel zinc-labelled finish, 0.4 stated gauge. Effective cover and tax basis not established. Do not relabel it ZINCALUME without documentation. | Divide by 3 for $21.6466667/lm on the original unknown GST basis only. |
| `corr-bunnings-galv3-20260928` | $67.93 per 3 m sheet | Armorsteel galvanised, 0.4 stated gauge; effective cover and tax basis unconfirmed. | Divide by 3 for $22.6433333/lm on the original unknown GST basis only. |
| `corr-mitre-slimline-20260928` | $29.97/lm, incl GST | Mitre 10 Slimline Corrugated. GST basis supported by the payment policy. Product title and width fields do not establish an unambiguous effective cover. Thickness/coating unconfirmed. | Keep $/lm. Do not invent a $/m². |

Bunnings and Mitre 10 observations were visible in public indexed product listings. The on-page conditions say to confirm the current selected product price. The extra precision above is calculation audit detail, not a recommendation to display many decimal places to a homeowner.

Two additional suppliers were reviewed but not turned into calculation inputs:

- Roof Crowd: a $16.41-$26.40 excl-GST catalogue range does not by itself establish the selected coating/thickness variant and charging unit. No assumption that the displayed range is an applicable $/lm quote.
- WBS Henderson: the selected 3 m Custom Orb listing exposes two GST-inclusive prices, $68.85 and $88.08, without a sufficiently clear active-price distinction in the retrieved information. Neither was silently chosen.

Seconds, recycled stock and Musgroves are not used to establish this new-material comparison. No mean, median, low/high national material band or cheapest-brand ranking is produced from these heterogeneous records. The five newly added observations are `rangeEligible: false` and do not become estimator rates.

## Installed pricing context is separate

The opening table and examples deliberately preserve these boundaries:

- Arcline's February 2024 long-run guide is historical, measured on flat plan area and not a current corrugate-only rate. GST is not supplied. It cannot be applied to pitched area without changing the basis.
- Delta's 2025 corrugated reroof example is historical and includes GST, removal and scaffolding. It is not a supply-only sheet rate or a current invoice. Historical ENDURA naming is not a current coating recommendation.
- Edwards & Hardy's March 2026 whole-job long-run range is not attached to a matched roof area or confirmed GST basis. Do not divide it by an invented 200 m² to create a unit rate.

The 100/150/200/250 m² comparison uses two source-specific sheet calculations and Delta's dated full-reroof guide in separate columns. These are worked arithmetic examples, not four real jobs, interchangeable specifications, or additions to one another.

## Calculation rules

- Convert a fixed-length sheet price into $/lm only when sheet length is known.
- Convert explicitly ex-GST prices to incl-GST using the current NZ 15% GST convention documented by IRD. Leave unknown tax unknown.
- Covered-area rate = price per lm / (effective cover mm / 1000). Never substitute overall sheet width.
- A single-pitch plan projection becomes sloping area through area / cos(pitch). The projection must already include the roof outline and eaves. Actual area bypasses this conversion.
- Continuous-length allowance = sloping area / effective cover. Apply only the reader's extra-material percentage, then the known supplier minimum order.
- Side laps are already accounted for in effective cover. Do not deduct them again.
- This is not a full-sheet count, cutting schedule, span design, product approval, installed quotation or complete roofing budget.
- Labour, flashings, underlay, fixings, freight, removal and access are not included by the sheet worksheet.
- Example rates are not injected into the existing estimator. Inputs are not transferred automatically; the UI says so and offers a calculation text export.

## Technical evidence boundaries

The manufacturer comparison covers Metalcraft, Dimond, Freeman, The Roofing Store, Steel & Tube and Roofing Industries. It distinguishes ordinary shallow corrugate from True Oak's deeper system. Steel & Tube cover information is explicitly labelled as retailer information where the manufacturer's current drawing was not established.

Manufacturer pitch headlines remain subject to their stated conditions. The guide discusses installed pitch, long roof runs, deflection, rainfall, and end laps rather than promising that one minimum applies to every corrugated roof. The True Oak 4-degree Herne Bay account is not presented as generic 4-degree corrugate approval.

NZMRM is used for profile, grade, thickness, moisture, underlay and durability context. Current manufacturer sources are used for coatings and care. Older ENDURA/MAXX project labels are dated observations, not new warranty advice. MBIE and WorkSafe are used for exemption and safety context instead of adopting a contractor blog's blanket consent/safety statement. No paid standard, installation table or contractor article is reproduced wholesale.

## Project cohort

Every project account stays attributed. None of these selected accounts establishes both a measured roof area and final roofing price. Missing amounts stay null and display as "Not published". They demonstrate design and project context, not a seven-job cost study.

### Different roofs on one new home

Publisher: Steel & Tube  
Location: Kennedys Bush, Canterbury  
Source: https://promos.steelandtube.co.nz/custom-orb-award-winning-home

A single house can need multiple systems. Do not apply a corrugated rate to every surface without checking the roof plan.

### Keeping a villa roofline

Publisher: Roofing Industries  
Location: Herne Bay, Auckland  
Source: https://www.roof.co.nz/blog/herne-bay-villa-and-true-oak-r-corrugate

A profile-specific solution can matter more than a generic material category. This case does not establish a minimum pitch for every corrugated roof.

### Replacement with associated upgrades

Publisher: Coldrick Roofing  
Location: Tauranga  
Source: https://www.coldrickroofing.co.nz/re-roof-tauranga/

Two reroof totals are not comparable until the associated work is matched.

### Working around a hillside site

Publisher: Kings Roofing  
Location: Brooklyn, Wellington  
Source: https://kingsroofing.co.nz/project/re-roof-project/

The new covering is only part of the cost. Compare access and flashing scope before comparing total prices.

### A coastal specification in context

Publisher: Element Roofing  
Location: Island Bay, Wellington  
Source: https://elementroofing.co.nz/projects/coastal-island-bay/

A dated project helps explain exposure-driven specification. Obtain current coating and warranty advice rather than copying an old product name.

### Corrugate above, another profile below

Publisher: Element Roofing  
Location: Brooklyn, Wellington  
Source: https://elementroofing.co.nz/projects/suburban-brooklyn/

Roof material identification and pitch both affect the scope. An attractive corrugated upper roof does not establish suitability on its low-pitch extension.

### Coordinating roof and exterior work

Publisher: Wellington Long Run Roofing  
Location: Kelburn, Wellington  
Source: https://www.wellingtonroof.co.nz/our-projects/

A shared scaffold package can blur the apparent roof price. Ask how common access costs are allocated between trades.

No contractor photographs were copied, hotlinked or licensed for RoofHub in this release. The cards link to the original accounts and photographs. The cover-width illustration is original HTML/CSS, not a manufacturer's fabrication drawing.

## Source-page register

The following URLs are the 41 citations included by the rendered Article schema and visible source list. Some source pages support only a narrow claim, such as GST treatment or effective cover. Several pages can share a publisher.

1. **Metalcraft**, Corrugate product specifications. https://www.metalcraftgroup.co.nz/products/roofing-and-cladding/products/corrugate/  
   Publication: not stated; checked: 2026-09-28. 

2. **Dimond**, Corrugate product specifications. https://www.dimond.co.nz/products/corrugate  
   Publication: not stated; checked: 2026-09-28. 

3. **Bitz & Piecez**, Roofing products and public prices. https://www.bitzandpiecez.co.nz/products/  
   Publication: not stated; checked: 2026-09-28. Retail listing, not a like-for-like COLORSTEEL specification. Thickness is described as gauge, not confirmed BMT. Effective cover must be confirmed before converting to square metres.

4. **Residential & Commercial Roofing**, MAXAM corrugated sheets, 0.55 stated gauge. https://residentialroofing.co.nz/product/colorsteel-maxam-corrugated-sheets-strong-0-55-gauge/  
   Publication: not stated; checked: 2026-09-28. Description states NZD 27.80/lm plus GST, about 760 mm cover and a 50 lm minimum. The headline total is a minimum-order amount, not a metre rate.

5. **Mitre 10**, Roofing Industries Slimline corrugated iron, colour. https://www.mitre10.co.nz/shop/roofing-industries-slimline-corrugated-iron-762mm-colour/p/166973  
   Publication: not stated; checked: 2026-09-28. NZD 29.97/lm. Product title says 762 mm but the retrieved width field is inconsistent. Thickness and confirmed usable cover are not established here.

6. **Arcline Architecture**, Roofing types and prices. https://arcline.co.nz/roofing-types-prices/  
   Publication: 2024-02-10; checked: 2026-09-28. Historical budgeting guide. Long-run rate is explicitly based on plan area. GST is not stated. Rates are not current supplier offers.

7. **Delta Roofing**, Roof replacement cost NZ, 2025 guide. https://deltaroofing.co.nz/articles/roof-replacement-cost-nz.html  
   Publication: 2025; checked: 2026-09-28. Historical budgeting guide, not a 2026 quotation. It names older coating products. Its price table includes GST, scaffolding and removal/disposal.

8. **Edwards & Hardy**, New roof cost NZ: 2026 price guide. https://www.edwardsandhardy.co.nz/blog/new-roof-cost-nz  
   Publication: 2026-03-16; checked: 2026-09-28. Broad whole-job estimates, not documented billed projects; GST is not specified.

9. **Bitz & Piecez**, Seller specification: corrugate effective cover. https://www.trademe.co.nz/a/marketplace/building-renovation/building-supplies/roofing/roofing-iron/listing/6123939424  
   Publication: not stated; checked: 2026-09-28. Archived seller listing, closed September 2026. Used only to cross-check 780 mm cover, not as an active price offer. Confirm the same profile on the current order.

10. **Bunnings New Zealand**, Armorsteel 0.4 mm Ironsand corrugated roofing, per metre. https://www.bunnings.co.nz/armorsteel-845-x-0-4mm-ironsand-corrugated-roofing-steel-l-m_p0065120  
   Publication: not stated; checked: 2026-09-28. Fetched listing shows NZD 30.35/lm. Effective cover and GST wording were not established in the retrieved product text. 845 mm is not assumed to be effective cover.

11. **Bunnings New Zealand**, Armorsteel 0.4 mm zinc corrugated sheet, 3 m. https://www.bunnings.co.nz/armorsteel-845-x-3000mm-zinc-0-4-corrugated-roofing-steel_p0116969  
   Publication: not stated; checked: 2026-09-28. NZD 64.94 per 3 m sheet. GST and effective cover not established in retrieved product text; no tax-inclusive area conversion is published.

12. **Bunnings New Zealand**, Armorsteel 0.4 mm galvanised corrugated sheet, 3 m. https://www.bunnings.co.nz/armorsteel-845-x-3000mm-galvanised-0-4-corrugated-roofing-steel_p0116971  
   Publication: not stated; checked: 2026-09-28. NZD 67.93 per 3 m sheet. Same retailer as the zinc and painted observations, not independent market quotes.

13. **Mitre 10**, Payment and pricing policy. https://www.mitre10.co.nz/payment  
   Publication: not stated; checked: 2026-09-28. States quoted prices include GST. This policy establishes tax basis, not effective cover or product gauge.

14. **Roof Crowd**, Custom Orb profile, materials and dimensions. https://roofcrowd.co.nz/product/custom-orb-corrugated-iron/  
   Publication: not stated; checked: 2026-09-28. Used for specifications. The category price range is not used as a verified per-metre cash price without a confirmed unit and variant.

15. **Roof Crowd**, Roofing profile catalogue. https://roofcrowd.co.nz/our-products/roofing-profiles/  
   Publication: not stated; checked: 2026-09-28. Custom Orb catalogue range is NZD 16.41 to 26.40 excluding GST. The retrieved catalogue does not establish the charging unit or variant at each endpoint, so this is not treated as a per-metre quote.

16. **WBS Henderson**, Steel & Tube Custom Orb ZINCALUME, 3 m. https://wbshenderson.co.nz/shop/p0037980-3000-s-t-custom-orb-corrugated-iron-roofing-cladding-851mm-x-3000mm-zincalume-30825  
   Publication: not stated; checked: 2026-09-28. Fetched page shows NZD 68.85 and 88.08, both tax-inclusive, without an unambiguous active-price distinction. Kept out of the priced ledger pending confirmation.

17. **Inland Revenue**, Charging GST. https://www.ird.govt.nz/gst/charging-gst  
   Publication: not stated; checked: 2026-09-28. 15% standard GST conversion is applied only where the source expressly identifies its tax basis.

18. **Steel & Tube**, Custom Orb specification overview. https://steelandtube.co.nz/specifiers/custom-orb  
   Publication: not stated; checked: 2026-09-28. Eight-degree roof pitch is stated. Confirm the current product drawing before ordering cover-dependent quantities.

19. **New Zealand Steel**, ZINCALUME product information. https://www.nzsteel.co.nz/products/zincalume/  
   Publication: not stated; checked: 2026-09-28. Describes the 2025 transition to the AM125 aluminium/zinc/magnesium coating. Historical AZ specifications are not treated as current.

20. **Freeman Roofing**, Corrugate profile and pitch guidance. https://www.freemanroofing.co.nz/roofing-profiles/corrugate/  
   Publication: not stated; checked: 2026-09-28. Approximate dimensions; distinguishes continuous sheets from end-lapped roofs.

21. **The Roofing Store**, TRS Corrugate specifications. https://www.theroofingstore.co.nz/steel-roofing-cladding-products/longrun-profile/corrugate/  
   Publication: not stated; checked: 2026-09-28. Published spans and fasteners have design conditions; they are not a universal fixing schedule.

22. **Roofing Industries**, True Oak Corrugate. https://www.roof.co.nz/product/true-oak-corrugate  
   Publication: not stated; checked: 2026-09-28. Special deeper corrugate. The fetched page also contains unrelated tray-profile blocks; those were not used as True Oak specifications.

23. **Roofing Industries**, Herne Bay villa with True Oak corrugate. https://www.roof.co.nz/blog/herne-bay-villa-and-true-oak-r-corrugate  
   Publication: not stated; checked: 2026-09-28. Manufacturer-reported project, not an independently audited result or published quote.

24. **NZ Metal Roofing Manufacturers**, Code of Practice: profiles, grades and thickness. https://www.metalroofing.org.nz/cop/structure/profiles  
   Publication: not stated; checked: 2026-09-28. Thickness, steel grade, profile and loading need to be considered together. Consult the current code for design.

25. **WorkSafe New Zealand**, Scaffolding in New Zealand. https://www.worksafe.govt.nz/topic-and-industry/working-at-height/scaffolding-in-new-zealand/  
   Publication: not stated; checked: 2026-09-28. 

26. **NZ Metal Roofing Manufacturers**, Code of Practice: roof pitch and runoff capacity. https://www.metalroofing.org.nz/cop/roofing/roof-pitch  
   Publication: not stated; checked: 2026-09-28. Generic minimum pitches are conditional, not approval of any individual product or roof. Online access may request registration.

27. **COLORSTEEL**, COLORSTEEL MAXAM product information. https://www.colorsteel.co.nz/products/solutions/colorsteel-maxam/  
   Publication: not stated; checked: 2026-09-28. Site exposure, details and maintenance affect suitability and warranty. Not a universal coastal clearance rule.

28. **COLORSTEEL**, Care and maintenance guidance. https://www.colorsteel.co.nz/resources/colorsteel-care/  
   Publication: not stated; checked: 2026-09-28. Refer to the current maintenance schedule for the actual product and site; cleaning requires safe access.

29. **Element Roofing**, Coastal Island Bay project. https://elementroofing.co.nz/projects/coastal-island-bay/  
   Publication: 2021; checked: 2026-09-28. 2021 project using a legacy MAXX specification. Not evidence that the same named product is the current choice for every coastal roof.

30. **Element Roofing**, Suburban Brooklyn reroof. https://elementroofing.co.nz/projects/suburban-brooklyn/  
   Publication: 2021; checked: 2026-09-28. 2021 project includes asbestos-cement removal and different profiles on upper and lower roofs. Historical ENDURA terminology retained as attribution.

31. **NZ Metal Roofing Manufacturers**, Code of Practice: underlay and internal moisture. https://www.metalroofing.org.nz/cop/internal-moisture/underlay  
   Publication: not stated; checked: 2026-09-28. Explains moisture absorption, support and ventilation. Not reproduced as an installation specification.

32. **Steel & Tube**, Custom Orb on a Kennedys Bush home. https://promos.steelandtube.co.nz/custom-orb-award-winning-home  
   Publication: 2026-08-28; checked: 2026-09-28. Publisher-reported project. Corrugated pitched areas and membrane flat areas belong to one home, not one universal roof specification.

33. **Coldrick Roofing**, Re-roof in Tauranga. https://www.coldrickroofing.co.nz/re-roof-tauranga/  
   Publication: not stated; checked: 2026-09-28. 

34. **Kings Roofing**, Brooklyn re-roof project. https://kingsroofing.co.nz/project/re-roof-project/  
   Publication: not stated; checked: 2026-09-28. Publisher reports completion in June 2025. Work account and photographs, not a published invoice or independent inspection.

35. **Wellington Long Run Roofing**, Central Terrace, Kelburn project account. https://www.wellingtonroof.co.nz/our-projects/  
   Publication: not stated; checked: 2026-09-28. Multiple projects share this page. Only the named Central Terrace account is used; no price or measured roof area is disclosed.

36. **MBIE Building Performance**, Exemption 1.1: general repair, maintenance and replacement. https://www.building.govt.nz/projects-and-consents/planning-a-successful-build/scope-and-design/check-if-you-need-consents/building-work-that-doesnt-need-a-building-consent/technical-requirements-for-exempt-building-work/1-general-alterations-maintenance-and-removal/1-1-general-repair-maintenance-and-replacement  
   Publication: not stated; checked: 2026-09-28. Examples explain the exemption; they do not determine consent requirements for an individual property.

37. **WorkSafe New Zealand**, Working with or near asbestos. https://www.worksafe.govt.nz/topic-and-industry/asbestos/asbestos-information-for-tradespeople/working-with-or-near-asbestos/  
   Publication: not stated; checked: 2026-09-28. 

38. **NZ Metal Roofing Manufacturers**, NZ Building Code clause B2 and durability. https://www.metalroofing.org.nz/cop/durability/nzbc-clause-b2  
   Publication: not stated; checked: 2026-09-28. 

39. **Dimond**, Hi Five product specifications. https://www.dimond.co.nz/products/hi-five  
   Publication: not stated; checked: 2026-09-28. The overview states 765 mm cover, while the performance section states 755 mm. RoofHub flags this conflict rather than choosing an ordering width.

40. **NZ Metal Roofing Manufacturers**, Pressed metal tiles, Code of Practice. https://www.metalroofing.org.nz/cop/other-products/pressed-metal-tiles  
   Publication: not stated; checked: 2026-09-28. 

41. **Dimond**, Eurotray Angle Seam. https://www.dimond.co.nz/products/eurotray-angle-seam  
   Publication: not stated; checked: 2026-09-28. 

## Refresh and corrections

Before updating a listing, confirm the same product, gauge/BMT wording, coating, unit, tax basis, effective cover, minimum quantity and stock conditions. Update the source and observation records together; retain a publication date separately from the new checking date. Re-run the tests and regenerate both the ledger and examples from data.

Evidence priorities after this release are confirmed current supplier cover/tax details, comparable new-roof installation quotes, and permissioned project data with area, scope, GST and price together. A licensed photo or an actual cost/area pair is more useful than another generic article repeating an unsourced range. Do not expand the count merely to make the evidence badge larger.
