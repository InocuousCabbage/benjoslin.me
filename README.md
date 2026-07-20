# benjoslin.me

Ben Joslin's personal website. Next.js 16 App Router + Tailwind v4 + shadcn/ui + sharp, deployed on Vercel.

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

Runs `vitest`. Copy guards enforce Ben's standing rules (no em dashes, no AI-tell adjectives, no aspirational-completeness "done" phrasings) plus a few structural expectations about the home page and layout.

## Stack

- Next.js 16 (App Router, TypeScript, SSG)
- Tailwind v4 with shadcn/ui primitives (Card, Button, Badge)
- next/font for Raleway (display) + Roboto (body)
- sharp for image processing (Bellamy-proven pipeline)
- vitest for the copy-guards + structural tests

## Structure

- `app/` App Router pages. Each of `/career`, `/education`, `/projects`, `/photo`, `/music` ships as a ComingSoon stub in Phase 0 and gets populated in later phases.
- `components/` UI. `sphere-cursor.tsx` = the custom mix-blend-difference cursor that follows the mouse with a ~120ms trailing lag. `site-footer.tsx` = the minimal LinkedIn/GitHub/Instagram footer. `coming-soon.tsx` = the placeholder for stub routes.
- `lib/site.ts` = canonical site facts (name, domain, socials) plus the home card ordering.
- `lib/copy-guards.test.ts` = the regression guard suite.
