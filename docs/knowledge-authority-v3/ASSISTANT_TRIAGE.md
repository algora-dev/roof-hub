# Ask RoofHub neutral condition triage

Date: 21 October 2026

## Purpose

The `assess_roof_condition` tool gives Ask RoofHub a deterministic, conservative way to discuss repair/restoration/replacement without allowing the model to invent a diagnosis or default to the most expensive option.

The design objective is **lowest adequate intervention**.

## Inputs

- `roofSystem`: metal | concrete-tile | pressed-metal-tile | membrane | other | unknown
- `issueSpread`: localised | multiple-areas | widespread | unknown
- `recurrence`: first-time | repeated-same-area | repeated-different-areas | unknown
- `surfaceCondition`: surface-wear | local-damage | perforation-or-missing-material | sagging-or-structural-movement | unknown
- `activeLeaks`: none | one-area | multiple-areas | unknown
- `suspectedAsbestos`: yes | no | unknown

Age is deliberately not a decision rule.

## Outputs

- `direction`: repair-plausible | restoration-plausible | replacement-plausible | inspection-needed | safety-first
- `confidence`: low | medium
- `plausibleOptions`
- `reasons`
- up to two `nextQuestions`
- `caution`

There is no price output. Pricing remains with RoofHub's deterministic estimator/rate-card system.

## Core rules

- Suspected asbestos → safety-first; do not pressure wash, drill, cut, scrape or disturb merely to investigate.
- Sagging/structural movement → inspection-needed.
- Widespread deterioration plus perforation/multiple leaks/repeated failures across different areas → replacement becomes plausible.
- A first-time local issue without evidence of broad failure → repair remains plausible.
- Surface wear on an otherwise serviceable metal/concrete/pressed-metal-tile roof → restoration can be plausible.
- Local perforation can still be repair-plausible at low confidence depending on compatibility and wider condition.
- Unknown/mixed facts → inspection-needed rather than model guesswork.

## Assistant behaviour

Before triage, ask only for the missing facts that could materially change direction. Spread, recurrence and visible failure mode usually matter more than exact age.

After triage:

- explain why the direction is only directional;
- present alternatives rather than a sales conclusion;
- state what an on-site inspection needs to establish;
- link to the most relevant decision resource;
- only offer referral/project help if the user wants it.

## Examples

**One local leak, first occurrence, local flashing damage**  
Direction: repair-plausible. The Assistant should not turn one defect into a reroof recommendation.

**Faded/serviceable concrete tiles, no multiple leaks**  
Direction: restoration-plausible. The Assistant should explain that broken tiles, pointing, flashings and substrate/underlay condition still need checking before coating.

**Widespread rust-through with leaks in several areas and repeated failures**  
Direction: replacement-plausible. The Assistant should still frame this as a reason to scope replacement, not a remote diagnosis.

**Older Decramastic with suspected asbestos**  
Direction: safety-first. Do not recommend destructive inspection or pressure washing.

**Sagging roof line**  
Direction: inspection-needed. Do not infer a cosmetic fix from photos/aerial imagery.
