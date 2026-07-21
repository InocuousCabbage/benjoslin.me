import type { Metadata } from "next";
import { education } from "@/lib/content";
import { EducationList } from "@/components/education-list";

export const metadata: Metadata = {
  title: "Education",
  alternates: { canonical: "/education" },
};

/**
 * Education page (Phase 2 dispatch, mirrors enzosison /education card
 * pattern). Data lives in lib/content.ts; rendering lives in
 * EducationList. This component wires the two together + owns the
 * eyebrow label.
 *
 * Eyebrow-only heading treatment per L1 (Ben post-preview): the h1 is
 * a small uppercase "Education" label matching enzosison's minimalist
 * page-header pattern. No large display heading below.
 *
 * Dark theme + typography match Phase 0 clone.
 */
export default function EducationPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <header className="mb-16 sm:mb-20">
        <h1 className="text-sm uppercase tracking-widest text-white/60">
          Education
        </h1>
      </header>
      <EducationList schools={education} />
    </div>
  );
}
