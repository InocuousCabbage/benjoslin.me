import { site, homeCards, homeFooterPhoto } from "@/lib/site";
import { SectionBlock } from "@/components/section-block";

/**
 * Home page. Full visual clone of enzosison.com per Ben's 2026-07-20 pivot,
 * iter-6 spacing rhythm, iter-7 block redesign (B1+D2+D4+D6) + grain
 * overlay (D5, mounted globally in root layout).
 *
 * Layout:
 * - Sparse hero: just the site name. min-h + items-center for Enzo-matched
 *   vertical rhythm.
 * - Numbered typographic section blocks with hairline dividers, cursor-
 *   tracked radial sheen on hover, and kinetic arrow micro on the
 *   "Read more" affordance. SectionBlock handles all of that.
 * - Optional lifestyle photo slot at the bottom that renders nothing when
 *   homeFooterPhoto is null.
 */
export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-6">
      {/* Hero rhythm matched to enzosison.com per Ben's iter-6 feedback
       * ("sizing above and below my name should be larger"). */}
      <header className="flex min-h-[58vh] items-center py-20 md:min-h-[64vh] md:py-28">
        <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
          {site.name}
        </h1>
      </header>

      <nav aria-label="Sections" className="pb-24 sm:pb-32">
        <ul className="flex flex-col">
          {homeCards.map((card, i) => (
            <SectionBlock
              key={card.href}
              index={i}
              title={card.title}
              subtitle={card.subtitle}
              href={card.href}
            />
          ))}
        </ul>
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
