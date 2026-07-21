import type { Education } from "@/lib/content";

/**
 * Presentational Education list. Accepts schools as a prop so
 * render-layer tests can mount fixture data. The default export in
 * app/education/page.tsx wraps this with the real `education` from
 * lib/content.ts.
 *
 * Optional-field discipline (Phase 2 dispatch + iter-M2 render-tests):
 * - school.gradYear renders NOTHING when undefined.
 * - school.coursework section renders NOTHING when empty; renders
 *   only when length > 0.
 * Render tests in education-list.test.tsx pin both behaviors under
 * fixture variants.
 */
export function EducationList({ schools }: { schools: Education[] }) {
  return (
    <div className="flex flex-col gap-12">
      {schools.map((school) => (
        <article
          key={school.school}
          className="flex flex-col gap-4 border-t border-white/10 pt-8"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
              {school.school}
            </h2>
            {school.gradYear ? (
              <p
                data-testid="school-gradyear"
                className="text-sm text-white/50 tabular-nums"
              >
                {school.gradYear}
              </p>
            ) : null}
          </div>
          <p className="text-base text-white/70 sm:text-lg">{school.degree}</p>

          <div className="mt-2">
            <p className="text-xs uppercase tracking-widest text-white/40">
              Activities
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {school.activities.map((activity) => (
                <li
                  key={activity}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 sm:text-sm"
                >
                  {activity}
                </li>
              ))}
            </ul>
          </div>

          {school.coursework.length > 0 ? (
            <div
              data-testid={`school-coursework-${school.school.replace(/\s+/g, "-")}`}
              className="mt-2"
            >
              <p className="text-xs uppercase tracking-widest text-white/40">
                Coursework
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {school.coursework.map((course) => (
                  <li
                    key={course}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 sm:text-sm"
                  >
                    {course}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
