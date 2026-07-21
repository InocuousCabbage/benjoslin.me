# benjoslin.me

Ben Joslin's personal website. Next.js 16 App Router + Tailwind v4, deployed on Vercel.

Visual language is a full clone of [enzosison.com](https://enzosison.com): dark theme, sparse typographic home hero, section blocks with a Read-more affordance, small footer social row.

## Local dev

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Tests

```bash
npm test
```

Runs `vitest`. The `lib/copy-guards.test.ts` suite enforces Ben's standing rules (no em dashes, no AI-tell adjectives, no aspirational-completeness "done" phrasings) plus structural expectations for the pivoted visual clone (dark palette, Inter + Geist fonts, typographic section links, Enzo-pattern footer icon row).

## Stack

- Next.js 16 (App Router, TypeScript, SSG)
- Tailwind v4
- next/font for Inter (body) + Geist (display); both matched to enzosison.com's compiled Tailwind
- Native cursor site-wide
- sharp available for image processing in future phases
- vitest for the copy-guards + structural tests

## Structure

- `app/` App Router pages. `/career`, `/education`, `/projects`, `/photo`, `/music` all resolve through `app/[section]/page.tsx` and ship as ComingSoon stubs until each phase lands.
- `components/` UI. `site-header.tsx` = sticky top nav (Home + 5 sections, small font, white/60 to white on hover). `site-footer.tsx` = copyright line + inline SVG social icons (LinkedIn / GitHub / Instagram). `current-year.tsx` = client component that renders the live year so the footer doesn't freeze at build time. `coming-soon.tsx` = placeholder for stub routes.
- `lib/site.ts` = canonical site facts (name, domain, socials pinned to exact known handles) plus `homeCards` and the optional `homeFooterPhoto` slot for the Enzo-style lifestyle photo at the bottom of the home page.
- `lib/copy-guards.test.ts` = the regression guard suite.
