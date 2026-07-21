import type { Project } from "@/lib/content";

/**
 * Presentational Projects list. Accepts projects as a prop so
 * render-layer tests can mount fixture data. The default export in
 * app/projects/page.tsx wraps this with the real `projects` from
 * lib/content.ts.
 *
 * Optional-field discipline (Phase 3 dispatch, mirrors Phase 2 pattern):
 * - project.year renders NOTHING when absent.
 * - project.note renders NOTHING when absent; renders a small footer
 *   line when set (used for "migration in progress" style flags).
 * Render tests in project-list.render.test.tsx pin both behaviors
 * under fixture variants (behavior-relevant, not shape-only, per the
 * closed n=9 ironic-miss rule).
 *
 * Card pattern mirrors enzosison /projects vertical-list layout: each
 * project = year/eyebrow at top, name as h2, one-liner beneath, chip
 * row for stack, optional note, "View project" affordance. Anchor
 * links out to the external URL. Dark theme + typography match Phase 0.
 */
export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <ul className="flex flex-col gap-12 sm:gap-16">
      {projects.map((project) => (
        <li key={project.href} className="list-none">
          <article className="flex flex-col gap-3 border-t border-white/10 pt-8">
            {project.year ? (
              <p
                data-testid="project-year"
                className="text-xs uppercase tracking-widest text-white/40 tabular-nums"
              >
                Started {project.year}
              </p>
            ) : null}
            <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
              {project.name}
            </h2>
            <p className="text-sm text-white/70 sm:text-base">
              {project.oneLiner}
            </p>
            <ul
              data-testid="project-chips"
              className="mt-1 flex flex-wrap gap-2"
              aria-label={`${project.name} stack`}
            >
              {project.chips.map((chip) => (
                <li
                  key={chip}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 sm:text-sm"
                >
                  {chip}
                </li>
              ))}
            </ul>
            {project.note ? (
              <p
                data-testid="project-note"
                className="text-xs italic text-white/50"
              >
                {project.note}
              </p>
            ) : null}
            <p className="mt-2">
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
              >
                View project
                <span aria-hidden>&rarr;</span>
              </a>
            </p>
          </article>
        </li>
      ))}
    </ul>
  );
}
