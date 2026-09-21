# RoofHub NZ — Website v0.1

A real, navigable RoofHub foundation intended for GitHub + Vercel deployment and rapid iteration.

## What is included

- Next.js App Router + TypeScript.
- RoofHub's approved monochrome logo mark (copied from the handoff package; transparent padding trimmed only).
- Design tokens implemented as CSS custom properties.
- Responsive header, mobile menu and footer.
- `/` homepage.
- `/pricing` pricing authority/tool prototype.
- `/tools` integration hub for existing roofing tools.
- `/guides` guide/research hub.
- `/guides/how-to-prepare-for-a-roofing-quote` representative long-form article layout.
- `/about` business-model page.
- Strong staging noindex controls, **off by default**.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import the repository into Vercel.
3. Set environment variables:
   - `ALLOW_INDEXING=false`
   - `NEXT_PUBLIC_SITE_URL=https://roofhub.co.nz`
4. Deploy.
5. Connect `roofhub.co.nz` in Vercel's Domains settings when desired.

## IMPORTANT — indexing is disabled by default

The build uses **three separate safeguards** while `ALLOW_INDEXING` is not exactly `true`:

1. Page-level robots metadata (`noindex`, `nofollow`, `noarchive`, `nosnippet`).
2. Dynamic `/robots.txt` that disallows `/` for all crawlers.
3. Global `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` HTTP response header via `middleware.ts`.

The preview site also displays a small "search indexing is disabled" banner.

### When RoofHub is genuinely ready to index

Set in Vercel:

```text
ALLOW_INDEXING=true
```

Then redeploy. This changes the metadata, robots file and HTTP header behaviour together. Verify `/robots.txt` and inspect page source/headers before launch.

## Content status

This is a design-system implementation and navigation prototype. Any pricing numbers or technical statements explicitly marked as draft/demo must **not** be treated as final NZ roofing guidance. Integrate approved RoofHub calculators/data and authoritative NZ sources before enabling indexing.

## Agent rule

Before adding new UI, refer to the RoofHub handoff package's `Design/System/` files. Reuse these components and tokens; do not redesign the system page-by-page.
