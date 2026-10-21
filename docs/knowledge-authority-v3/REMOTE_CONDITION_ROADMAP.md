# Remote roof-condition decision-support roadmap

Date: 21 October 2026

V3 ships **text-based neutral triage only**. It does not ship photo diagnosis, address lookup, Google Earth scraping or aerial condition scoring.

## Stage 1 - V3: structured text triage

Ask RoofHub can ask a small number of condition questions:

- Is the issue local, in several areas or widespread?
- Is this the first occurrence or does it keep returning?
- Is the visible issue surface wear, local damage, perforation/missing material, or sagging/structural movement?
- Are active leaks in one area or multiple areas?
- Is asbestos suspected on an older textured/pressed-metal-tile roof?

The deterministic tool returns a conservative direction: repair plausible, restoration plausible, replacement plausible, inspection needed or safety first. It never returns a price or a diagnosis.

## Stage 2 - user-supplied photo review

Potential later capability:

- accept safely obtained exterior/ground-level or already-existing photos;
- ask the user what each image shows and when it was taken;
- identify visible features such as obvious missing material, broad surface deterioration or a suspect detail;
- clearly label image findings as visible observations rather than concealed-condition proof;
- retain a route to human/contractor inspection where uncertainty remains.

Do not ask a user to climb onto a roof or access an unsafe roof space for AI input.

## Stage 3 - reports and inspection-photo ingestion

Potentially ingest existing professional inspection reports, roofer photos and maintenance records. Keep extracted facts separate from RoofHub inference, just as quote-document intelligence should keep extraction separate from comparison.

## Stage 4 - optional address/aerial context

With explicit user consent, an address or aerial image can later help with:

- approximate geometry/roof form;
- number of obvious roof sections;
- visible large penetrations/additions;
- site/access context;
- preparing questions for an inspection or estimate.

It **must not** be used to claim reliable detection of corrosion depth, fixing condition, underlay, purlins/battens, membrane integrity, tile cracks below image resolution, or overall watertightness. Imagery may also be stale.

No V3 code should scrape Google Earth or build an address-based “roof condition score”.

## Stage 5 - neutral handoff/referral

Where the user wants help after triage, RoofHub can package the non-sensitive project facts and likely scope questions for a contractor or human review - only with explicit sharing consent.

A future commercial referral must not change the neutral triage result. Partner economics and editorial/decision logic stay separated.
