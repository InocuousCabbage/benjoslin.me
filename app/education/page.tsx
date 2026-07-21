import type { Metadata } from "next";
import { education } from "@/lib/content";

export const metadata: Metadata = {
  title: "Education",
  alternates: { canonical: "/education" },
};

/**
 * Education page (Phase 2 dispatch, mirrors enzosison /education card
 * pattern). Data lives in lib/content.ts; this component is pure
 * render. Optional fields (gradYear, coursework) render nothing when
 * empty/absent so the layout collapses cleanly until Ben backfills.
 *
 * Dark theme + typography match Phase 0 clone.
 */
export default function EducationPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <header className="mb-16 sm:mb-20">
        <p className="text-sm uppercase tracking-widest text-white/40">
          Education
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          Where I studied
        </h1>
      </header>

      <div className="flex flex-col gap-12">
        {education.map((school) => (
          <article
            key={school.school}
            className="flex flex-col gap-4 border-t border-white/10 pt-8"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
                {school.school}
              </h2>
              {school.gradYear ? (
                <p className="text-sm text-white/50 tabular-nums">
                  {school.gradYear}
                </p>
              ) : null}
            </div>
            <p className="text-base text-white/70 sm:text-lg">
              {school.degree}
            </p>

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
    </div>
  );
}
