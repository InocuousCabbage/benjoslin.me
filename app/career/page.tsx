import type { Metadata } from "next";
import { career } from "@/lib/content";

export const metadata: Metadata = {
  title: "Career",
  alternates: { canonical: "/career" },
};

/**
 * Phase-based Career page (Phase 2 dispatch, mirrors enzosison /tech).
 * Data lives in lib/content.ts; this component is pure render. Optional
 * fields (role.impact, role.initiatives) render nothing when
 * empty/absent so the layout collapses cleanly until Ben backfills.
 *
 * Dark theme + typography match Phase 0 clone. Wraps roles in
 * <ul>/<li> for correct AT semantics (iter-8 F5 pattern).
 */
export default function CareerPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <header className="mb-16 sm:mb-20">
        <p className="text-sm uppercase tracking-widest text-white/40">
          Career
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          Career log
        </h1>
      </header>

      <div className="flex flex-col gap-16 sm:gap-20">
        {career.map((phase, phaseIndex) => (
          <section
            key={phase.label}
            aria-label={phase.label}
            className="flex flex-col gap-6"
          >
            <div className="flex items-baseline gap-4 border-b border-white/10 pb-3">
              <span
                aria-hidden
                className="font-display text-2xl font-semibold tabular-nums text-white/30"
              >
                {String(phaseIndex + 1).padStart(2, "0")}
              </span>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {phase.label}
              </h2>
            </div>

            <ul className="flex flex-col gap-8">
              {phase.roles.map((role, roleIndex) => (
                <li key={`${role.company}-${role.title}`} className="list-none">
                  <article className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <div>
                        <h3 className="font-display text-lg font-semibold leading-tight text-white sm:text-xl">
                          {role.title}
                        </h3>
                        <p className="mt-1 text-sm text-white/60">
                          {role.company}
                        </p>
                      </div>
                      <p className="text-sm text-white/50 tabular-nums">
                        {role.dates}
                      </p>
                    </div>
                    {role.impact ? (
                      <p className="text-sm text-white/70 sm:text-base">
                        {role.impact}
                      </p>
                    ) : null}
                    {role.initiatives.length > 0 ? (
                      <ul
                        data-testid={`role-initiatives-${roleIndex}`}
                        className="mt-2 flex flex-col gap-1.5 text-sm text-white/60"
                      >
                        {role.initiatives.map((item) => (
                          <li
                            key={item}
                            className="flex gap-2 before:mt-2 before:h-px before:w-3 before:shrink-0 before:bg-white/30"
                          >
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
