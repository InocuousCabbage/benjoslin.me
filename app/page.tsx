import Link from "next/link";
import { site, homeCards, homeFooterPhoto } from "@/lib/site";

/**
 * Home page. Full visual clone of enzosison.com per Ben's 2026-07-20 pivot.
 *
 * Layout:
 * - Sparse hero: just the site name (no headshot, no tagline).
 * - 5 typographic section blocks (Career, Education, Projects, Photo,
 *   Music). Each = H2 + one-line teaser + "Read more" arrow. NOT shadcn
 *   Cards; matches Enzo's typographic-link pattern.
 * - Optional lifestyle photo + caption at the bottom (Enzo has "Surfing at
 *   Shell Beach" there). Renders NOTHING if homeFooterPhoto is null so
 *   Phase 0 doesn't ship an empty slot; Ben backfills in a later phase.
 */
export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-6">
      {/* Hero rhythm matched to enzosison.com per Ben's iter-6 feedback
       * ("sizing above and below my name should be larger"): viewport-
       * anchored min-height with vertical centering plus generous py- so
       * the name breathes on any viewport. Enzo compiled CSS:
       * min-h-[58vh] md:min-h-[64vh] py-20 md:py-28 items-center. */}
      <header className="flex min-h-[58vh] items-center py-20 md:min-h-[64vh] md:py-28">
        <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
          {site.name}
        </h1>
      </header>

      <nav aria-label="Sections" className="flex flex-col gap-10 pb-24 sm:gap-12 sm:pb-32">
        {homeCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex items-start justify-between gap-6"
          >
            <div>
              <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-white transition-opacity group-hover:opacity-90 sm:text-4xl">
                {card.title}
              </h2>
              <p className="mt-2 text-base text-white/60 group-hover:text-white/80 sm:text-lg">
                {card.subtitle}
              </p>
              <p className="mt-3 flex items-center gap-2 text-sm text-white/60 group-hover:text-white">
                Read more
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </p>
            </div>
          </Link>
        ))}
      </nav>

      {homeFooterPhoto ? (
        <section className="mt-24 border-t border-white/10 pt-10 sm:mt-32">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={homeFooterPhoto.src}
            alt={homeFooterPhoto.alt}
            width={homeFooterPhoto.width}
            height={homeFooterPhoto.height}
            className="w-full max-w-md rounded-md"
          />
          <p className="mt-3 text-sm text-white/60">{homeFooterPhoto.caption}</p>
        </section>
      ) : null}
    </div>
  );
}
