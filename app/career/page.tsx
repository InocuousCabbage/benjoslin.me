import type { Metadata } from "next";
import { career } from "@/lib/content";
import { CareerLog } from "@/components/career-log";

export const metadata: Metadata = {
  title: "Career",
  alternates: { canonical: "/career" },
};

/**
 * Phase-based Career page (Phase 2 dispatch, mirrors enzosison /tech).
 * Data lives in lib/content.ts; rendering lives in CareerLog. This
 * component wires the two together + owns the eyebrow label.
 *
 * Eyebrow-only heading treatment per L1 (Ben post-preview): the h1 is
 * a small uppercase "Career" label matching enzosison's minimalist
 * page-header pattern. No large display heading below.
 *
 * Dark theme + typography match Phase 0 clone.
 */
export default function CareerPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <header className="mb-16 sm:mb-20">
        <h1 className="text-sm uppercase tracking-widest text-white/60">
          Career
        </h1>
      </header>
      <CareerLog phases={career} />
    </div>
  );
}
