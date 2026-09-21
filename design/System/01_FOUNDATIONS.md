# RoofHub Design System — 01 Foundations

Status: **Source of truth**  
Brand intent: practical, trustworthy, data-driven, calm, useful, unmistakably New Zealand without cliché.

## 1. Brand behaviour

RoofHub is a roofing research, measurement, pricing and project-planning platform — not a roofing contractor. The interface should therefore feel closer to a high-quality research/product platform than a trade-services lead-gen site.

Design principles:

- Information first; conversion second.
- Calm confidence, not sales pressure.
- Strong hierarchy and generous whitespace.
- Technical information should feel understandable, not dumbed down.
- Tools should feel precise but must visually preserve uncertainty where the result is preliminary.
- Use photography and colour to create warmth; keep core UI restrained.
- The logo is normally monochrome. Brand colours belong primarily to the interface, illustrations, states, data visualisation, backgrounds and accents.

## 2. Logo

Canonical files are in `../Logo/`. Do not recreate the mark from screenshots.

Preferred use:

- Light interface: black logo on off-white/white.
- Dark interface/photo overlay: white logo.
- The black-on-white and white-on-black supplied exports may be used where a fixed background is required.

Rules:

- Preserve original aspect ratio.
- Never recolour the logo sage or terracotta.
- Never add gradients, strokes, shadows, bevels or transparency effects.
- Never rotate, skew or stretch.
- Avoid placing directly over busy photography unless a calm dark/light overlay gives sufficient contrast.
- Clear space: minimum `0.5 × logo-mark height` on all sides; prefer `1 ×` where room allows.
- Minimum digital icon size: 24 px. Minimum full lockup height: 28 px. Prefer 32–40 px in headers.

## 3. Colour system

### Core colours

| Token | Hex | Primary use |
|---|---|---|
| Sage 500 | `#7A8F7A` | Supporting brand colour, trust, UI accents |
| Terracotta 500 | `#C15A3C` | Primary action/accent colour |
| Charcoal 500 | `#2E2E2E` | Primary text / dark surfaces |
| Off White | `#F7F6F2` | Default warm page background |
| White | `#FFFFFF` | Cards, controls, high-contrast surfaces |

### Sage scale

| Level | Hex | Use |
|---|---|---|
| 900 | `#434F43` | Deep data/overlays, dark sage sections |
| 800 | `#536153` | Strong supporting accents |
| 700 | `#627262` | Hover/pressed states |
| 600 | `#6E816E` | Strong secondary controls |
| 500 | `#7A8F7A` | Base sage |
| 400 | `#92A392` | Charts/graphics |
| 300 | `#A9B6A9` | Soft UI elements |
| 200 | `#C3CDC3` | Dividers/background accents |
| 100 | `#DEE3DE` | Subtle surface/tint |
| 50 | `#EFF2EF` | Very light section background |

### Terracotta scale

| Level | Hex | Use |
|---|---|---|
| 900 | `#6A3221` | Deep accents only |
| 800 | `#833D29` | Strong pressed/dark states |
| 700 | `#9A4830` | Hover/pressed |
| 600 | `#AE5136` | Strong action variant |
| 500 | `#C15A3C` | Primary CTA/accent |
| 400 | `#CC785F` | Charts/graphics |
| 300 | `#D79480` | Supporting graphics |
| 200 | `#E3B5A7` | Soft overlay/surface |
| 100 | `#F0D6CE` | Subtle surface/tint |
| 50 | `#F8EBE8` | Very light section background |

### Neutral scale

| Level | Hex | Use |
|---|---|---|
| Charcoal 900 | `#191919` | Darkest text/background |
| Charcoal 700 | `#252525` | Strong text |
| Charcoal 500 | `#2E2E2E` | Brand charcoal |
| Neutral 400 | `#777777` | Secondary text (only where contrast passes) |
| Neutral 300 | `#A1A1A1` | Disabled/decorative |
| Neutral 200 | `#D5D7DA` | Borders/dividers |
| Neutral 100 | `#E5E7EB` | Soft border/surface |
| Neutral 50 | `#F2F4F5` | Cool utility background |
| Off White | `#F7F6F2` | Main warm background |
| White | `#FFFFFF` | Cards/controls |

### Colour role rules

- **Terracotta is the action colour**, not the dominant page colour. Use it for primary CTAs, selected/high-priority states, key chart series and small moments of emphasis.
- **Sage should appear more frequently than terracotta across supporting UI**: secondary buttons, trust modules, success states, badges, section tints, charts, overlays, methodology and supporting graphics.
- Do not fill every section with brand colour. Most pages should remain predominantly off-white/white/charcoal.
- Prefer Sage 50/100 for broad backgrounds; Sage 500–700 for controls and compact UI.
- Prefer Terracotta 50/100 for broad accent surfaces; Terracotta 500 for buttons and concise accents.
- Never use colour alone to communicate status.

Recommended page-level visual balance: roughly 70–80% neutral/off-white/white, 12–20% sage family, 5–10% terracotta family.

## 4. Typography

Primary family: **Plus Jakarta Sans**. If unavailable, use:

`"Plus Jakarta Sans", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

Recommended weights: 400, 500, 600, 700.

### Type scale

| Style | Desktop | Mobile | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| Display/Hero | 64 px | 42 px | 700 | 1.05 | -0.035em |
| H1 | 52 px | 38 px | 700 | 1.08 | -0.03em |
| H2 | 36 px | 30 px | 600 | 1.15 | -0.02em |
| H3 | 26 px | 23 px | 600 | 1.25 | -0.01em |
| H4 | 20 px | 19 px | 600 | 1.3 | 0 |
| Lead | 20 px | 18 px | 400 | 1.55 | 0 |
| Body | 16 px | 16 px | 400 | 1.6 | 0 |
| Small | 14 px | 14 px | 400 | 1.5 | 0 |
| Caption/Meta | 12 px | 12 px | 500 | 1.45 | 0.06em |
| Button | 15–16 px | 15–16 px | 600 | 1 | 0 |

Rules:

- Never introduce a page-specific type size when an existing type token works.
- Limit readable body copy to roughly 65–75 characters per line.
- Headlines may use sentence case. Avoid Title Case everywhere.
- All-caps is reserved for compact metadata/eyebrows and should use increased tracking.

## 5. Spacing

Base spacing scale (px): `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`.

Rules:

- Use tokens only. Do not introduce arbitrary 18 px / 27 px / 53 px gaps.
- Standard card padding: 24 px desktop; 20 px tablet/mobile.
- Standard section vertical padding: 64–96 px desktop; 48–64 px mobile.
- Hero-to-next-section separation: usually 80–96 px.
- Compact utility sections: 32–48 px.

## 6. Widths and grid

- Max general content width: 1200 px.
- Wide tool/data pages may use 1360 px where justified.
- Reading column: 720–780 px.
- Desktop grid: 12 columns, 24 px gutters.
- Tablet grid: 8 columns, 20 px gutters.
- Mobile grid: 4 columns, 16 px gutters.
- Page side padding: desktop 32 px minimum; tablet 24 px; mobile 16 px.

## 7. Radius, border and shadow

Radius scale: 4, 8, 12, 16, 24 px; `9999px` only for pills.

Defaults:

- Button: 10–12 px.
- Input: 8–10 px.
- Card: 12–16 px.
- Large media/hero panel: 16–24 px.

Borders:

- Default: `1px solid #E5E7EB`.
- Strong: `1px solid #D5D7DA`.
- Selected sage: `1px solid #7A8F7A`.
- Error: accessible red token defined in CSS.

Shadows should be restrained. Default elevated card shadow: `0 6px 20px rgba(25,25,25,.07)`. Avoid visible “floating UI” everywhere.

## 8. Photography and imagery

Use:

- Real New Zealand homes, roofs, landscapes and working contexts.
- Modern and ordinary housing — not only luxury architecture.
- Natural light and believable conditions.
- Roof details where technically relevant.
- People only where authentic and useful.

Avoid:

- Generic US/European suburban imagery.
- Overly staged tradie stock photography.
- Extreme HDR or orange/teal grading.
- Decorative images unrelated to the content.

Overlays may use sage/charcoal tints. Maintain readable contrast and do not tint images so strongly that roof condition/material becomes misleading.
