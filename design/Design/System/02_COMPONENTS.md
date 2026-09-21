# RoofHub Design System — 02 Components

Every component must consume design tokens rather than local one-off values.

## 1. Navigation

### Desktop header

- Height: 72–80 px.
- Background: off-white/white; may become subtly opaque/blurred when sticky.
- Full monochrome logo left.
- Primary navigation centre/right.
- One primary CTA maximum.
- Search may be icon-only until activated.
- Avoid crowded mega-nav until content volume requires it.

### Mobile header

- Height: 64–72 px.
- Logo + search + menu.
- Drawer navigation with large tap targets (minimum 44 × 44 px).

## 2. Buttons

### Primary

Terracotta 500 background, white text. Used for the single most important action in a section.

- Default: `#C15A3C`
- Hover: `#AE5136` or `#9A4830`
- Focus: visible 2–3 px accessible focus ring.
- Disabled: neutral/sage muted state, never just opacity below readable contrast.

### Secondary

Sage 600/700 background, white text. Use for supportive actions and utility actions.

### Outline

White/off-white background, 1 px charcoal or sage border. Use where the action matters but should not compete with the primary CTA.

### Ghost

No persistent container; subtle Sage 50 hover fill. Use for low-emphasis controls.

### Text link

Inline text + optional arrow. Terracotta for editorial/action links; sage may be used in tool/methodology contexts.

Button heights:

- Small: 36 px.
- Medium/default: 44 px.
- Large: 52 px.

Touch target must remain at least 44 × 44 px even if visual control is smaller.

Rules:

- Normally one primary CTA per section.
- Never place two equally strong terracotta CTAs side by side.
- Button labels begin with verbs where possible: `Measure roof`, `View estimate`, `Compare materials`, `Ask RoofHub`.

## 3. Forms

Inputs:

- Height: 44–48 px.
- Background: white.
- Border: Neutral 100/200.
- Radius: 8–10 px.
- Visible labels are mandatory; placeholders are examples, not labels.
- Helper/error text directly below field.
- Success may use Sage 700/100; errors use the dedicated error token.

Required states: default, hover, focus, populated, disabled, success, error.

File upload:

- Dashed/soft bordered drop zone.
- Explicit supported type/size text.
- Show file status and removal action.
- For roof photos/plans, explain that outputs are preliminary when applicable.

## 4. Cards

Cards are content containers, not decoration. Do not wrap every piece of content in a card.

Core variants:

- Guide card.
- Tool/calculator card.
- Result/estimate card.
- Material/system card.
- Article/resource card.
- Methodology/evidence card.
- Stat/metric card.
- Provider/specialist card (future).

Base card:

- White or Sage 50 background.
- 1 px border.
- 12–16 px radius.
- 24 px padding.
- Shadow only when elevation aids hierarchy.

Card hierarchy: eyebrow/meta → title → explanatory text → evidence/status → action.

## 5. Result / estimate blocks

These are critical RoofHub components.

Always separate:

- User-supplied values.
- Inferred/calculated values.
- Assumptions.
- Unknowns.
- Estimated range/result.
- Confidence or uncertainty note where relevant.
- Formal quote/professional inspection boundary.

Do not visually present a preliminary estimate like a final invoice or certified report.

Recommended structure:

1. Result headline/value.
2. Range/units/GST treatment.
3. Key assumptions.
4. Included/excluded items.
5. `Refine estimate` secondary action.
6. Optional `Ask RoofHub` primary action only after value has been shown.

## 6. Tables and comparisons

- Use tables for actual comparison/data, not layout.
- Sticky first column may be used on mobile if needed.
- Use zebra tint sparingly; Sage 50 is preferred to grey-heavy striping.
- Highlight differences with text/icons as well as colour.
- No preselected “winner” in neutral material comparisons.

## 7. Tabs, accordions, breadcrumbs, badges

Tabs:

- Use when views are peers and users benefit from switching without losing context.
- Active indicator may use Sage 700 or Terracotta 500 depending context.

Accordion:

- Best for FAQs and secondary detail, not critical information.
- Entire header row clickable.

Breadcrumbs:

- Show on deep content/tool pages.
- Keep small and quiet.

Badges:

- Sage family: informational/trusted/methodology.
- Terracotta family: new/high-attention/action-oriented.
- Neutral: category/meta.

## 8. Alerts / notices

Types: info, success, warning, error.

RoofHub-specific notice type: **preliminary / limitation**. Use Sage 50 or warm neutral surface with clear icon and concise explanatory text.

Never hide major exclusions only in an accordion or tooltip.

## 9. CTAs

CTA hierarchy:

1. Give the user value first.
2. Then present the next action.
3. Do not gate calculators/basic answers behind contact details.

Approved CTA modules:

- Inline CTA after useful content/result.
- Full-width end-of-page CTA.
- Tool-result CTA.
- Contextual “Ask RoofHub” panel.

Avoid repetitive CTAs after every paragraph/section.

## 10. Icons

Use one consistent line-icon family/style.

- 2 px-ish visual stroke at normal size.
- Rounded joins/caps where available.
- Prefer familiar metaphors.
- Do not mix filled, skeuomorphic and outline families casually.
- Decorative icon backgrounds can use Sage 50/100 or Terracotta 50/100.
