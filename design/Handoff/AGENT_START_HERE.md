# RoofHub — Agent Start Here

You are building or editing RoofHub.co.nz.

## Mandatory first actions

Before producing code or changing UI:

1. Read all files in `Design/System/`.
2. Inspect the canonical logo assets in `Design/Logo/`.
3. Review `Design/Brand/Reference/` for visual intent.
4. Read the relevant existing components/templates in the codebase before creating anything new.
5. If working on the website build, review `Design/Website_Asset_Pack/v0_4/` and `Handoff/WEBSITE_V0_4_UPDATE.md`.

## Authority order

If instructions conflict, use this priority:

1. User's current explicit instruction.
2. Existing approved production component/API contract.
3. `Design/System/*.md` and `design-tokens.*`.
4. Canonical logo files.
5. Visual reference boards.

The text shown inside AI-generated reference images is **illustrative, not authoritative**. Never extract exact tokens, wording or logo geometry from those images when a source file/token exists.

## Non-negotiable build rules

- Reuse approved components before creating new ones.
- Use design tokens. Do not scatter raw one-off colours/sizes throughout components.
- Do not introduce new brand colours, fonts, button styles, radii, shadows or spacing values without approval.
- Do not redesign the logo.
- Do not recolour the logo.
- One primary CTA per section by default.
- Use sage broadly as the supporting UI family; use terracotta more selectively for primary actions/emphasis.
- Keep pages predominantly neutral/off-white/white.
- Build mobile-first and meet WCAG 2.2 AA.
- Keep useful answers/results visible before enquiry prompts.
- Preserve uncertainty in pricing, measurement and image analysis.
- Technical rules/prices must come from approved data/functions/sources — not from visual design copy or model improvisation.
- A new page should be assembled from approved page templates/sections wherever possible.
- A new component should be global and reusable; do not create a near-duplicate just for one page.

## Before completing any page

Check:

- Does it use existing tokens/components?
- Does the typography match the scale?
- Are section gaps on the spacing scale?
- Are primary/secondary CTAs correctly prioritised?
- Is sage present enough to balance terracotta without making the page green-heavy?
- Is the page mostly neutral?
- Is mobile intentionally designed?
- Are focus, hover, error, loading and empty states handled?
- Does it still work without AI/chat?
- Does the user get useful information before contact capture?
- Are assumptions/limitations clear?
- Is all placeholder/draft data explicitly marked in development?

## Change-control rule

If the requested design cannot be achieved within the existing system, do not quietly improvise. Explain the missing pattern and either:

1. Adapt the closest approved component, or
2. Propose a new reusable component/token and update this design system as part of the same change.
