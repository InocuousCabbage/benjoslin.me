import type { CareerPhase } from "@/lib/content";

/**
 * Presentational Career log. Accepts phases as a prop so render-layer
 * tests can mount fixture data. The default export in
 * app/career/page.tsx wraps this with the real `career` from
 * lib/content.ts.
 *
 * Optional-field discipline (Phase 2 dispatch + iter-M2 render-tests):
 * - role.impact renders NOTHING when absent (undefined or empty).
 * - role.initiatives renders NOTHING when empty; renders <ul> only
 *   when length > 0.
 * Render tests in career-log.test.tsx pin both behaviors under fixture
 * variants so a refactor that removes the conditional (always
 * rendering the impact <p> or the initiatives <ul>) fails via
 * observable DOM presence, not source-shape regex.
 */
export function CareerLog({ phases }: { phases: CareerPhase[] }) {
  return (
    <div className="flex flex-col gap-16 sm:gap-20">
      {phases.map((phase, phaseIndex) => (
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
                    <p
                      data-testid="role-impact"
                      className="text-sm text-white/70 sm:text-base"
                    >
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
  );
}
