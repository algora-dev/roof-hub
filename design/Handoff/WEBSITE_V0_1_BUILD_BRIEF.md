# RoofHub — Website v0.1 Build Brief

Purpose: build a real navigable design-system implementation before investing in final content at scale.

## Goal

Validate RoofHub's layout, component system, responsive behaviour and user journeys using representative draft content and real tool integration points.

Do **not** begin by producing dozens of SEO pages.

## Recommended initial routes

- `/` — homepage.
- `/pricing` — NZ roofing pricing authority page.
- `/tools` — tools hub.
- `/tools/roof-pricing` — pricing calculator shell/integration.
- `/tools/roof-measurement` — measurement shell/integration.
- `/roof-replacement` — repair/replacement authority page.
- `/materials` — materials overview.
- `/guides` — guides/research hub.
- `/about` — what RoofHub is.
- `/methodology` — calculations/evidence/uncertainty.
- `/contact` or `/ask-roofhub` — context-aware enquiry flow.
- `/privacy` — especially upload/image/privacy handling.

Routes may change after the existing roofing tools/code are audited.

## Content approach

Use **representative draft content**, not Lorem Ipsum. Draft content must resemble the final density and structure so design decisions are meaningful.

Clearly mark provisional price figures or technical assertions as placeholders in the development build unless verified against approved NZ data/sources.

## Build order

1. App shell: tokens, font, global background, accessibility baseline.
2. Header/navigation/footer.
3. Base primitives and shared components.
4. Homepage.
5. Tool/result layout.
6. Authority/article layout.
7. Comparison/table patterns.
8. Enquiry flow.
9. Responsive QA.
10. Design-system compliance pass.

## Definition of done for v0.1

- All major component variants exist and are reusable.
- Desktop/tablet/mobile are deliberately designed.
- No page-specific duplicate buttons/cards/forms.
- Logo usage is correct.
- Colour usage roughly follows the neutral/sage/terracotta balance.
- Accessibility basics pass.
- Content pages and tools share the same underlying visual system.
- At least one realistic pricing/result view exists.
- At least one long-form guide exists to test reading layouts.
- At least one comparison table exists to test dense content.
- At least one enquiry flow exists to test form patterns.
