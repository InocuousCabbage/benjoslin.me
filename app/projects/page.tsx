import type { Metadata } from "next";
import { projects } from "@/lib/content";
import { ProjectList } from "@/components/project-list";

export const metadata: Metadata = {
  title: "Projects",
  alternates: { canonical: "/projects" },
};

/**
 * Projects page (Phase 3 dispatch, mirrors enzosison /projects vertical
 * card list). Data lives in lib/content.ts; rendering lives in
 * ProjectList. This component wires the two together + owns the
 * eyebrow label.
 *
 * Eyebrow-only heading treatment matches the Phase 2 L1 pattern on
 * /career and /education: a small uppercase "Projects" label instead
 * of a display h1.
 *
 * Dark theme + typography match Phase 0 clone.
 */
export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <header className="mb-16 sm:mb-20">
        <h1 className="text-sm uppercase tracking-widest text-white/60">
          Projects
        </h1>
      </header>
      <ProjectList projects={projects} />
    </div>
  );
}
