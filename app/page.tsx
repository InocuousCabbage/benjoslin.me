import Link from "next/link";
import { site, homeCards } from "@/lib/site";

/**
 * Home page. Per Ben's spec: hero = just the name (no headshot, no one-liner).
 * Below the hero, 5 section cards drill down to /career, /education,
 * /projects, /photo, /music. Card pattern mirrors enzosison.com's home layout
 * (Ben's reference).
 */
export default function Home() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <header className="mb-16 sm:mb-24">
        <h1 className="font-display text-6xl font-semibold tracking-tight sm:text-8xl">
          {site.name}
        </h1>
      </header>

      <nav aria-label="Sections" className="grid gap-4">
        {homeCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex items-start justify-between gap-6 rounded-lg border border-border bg-card px-6 py-6 transition-colors hover:border-[color:var(--hover-blue)]"
          >
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground group-hover:text-[color:var(--hover-blue)] sm:text-3xl">
                {card.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                {card.subtitle}
              </p>
            </div>
            <span
              aria-hidden
              className="pt-2 text-2xl text-muted-foreground transition-colors group-hover:text-[color:var(--hover-blue)]"
            >
              &rarr;
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
