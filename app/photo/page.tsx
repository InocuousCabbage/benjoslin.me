import type { Metadata } from "next";
import { photos } from "@/lib/content";
import { PhotoGrid } from "@/components/photo-grid";

export const metadata: Metadata = {
  title: "Photo",
  alternates: { canonical: "/photo" },
};

/**
 * Photo page (Phase 4 scaffold dispatch). Data lives in lib/content.ts;
 * rendering lives in PhotoGrid. This component wires the two together
 * plus owns the eyebrow label.
 *
 * Eyebrow-only heading treatment matches the Phase 2 L1 pattern used on
 * /career, /education, and /projects: a small uppercase "Photo" label
 * instead of a display h1.
 *
 * Ships with photos = [] as an intentional scaffold state. PhotoGrid
 * handles the empty branch with a graceful placeholder so /photo is
 * reachable and the layout / typography can be Ben-eyeballed before
 * originals land in a populate PR.
 *
 * Dark theme + typography match Phase 0 clone.
 */
export default function PhotoPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <header className="mb-16 sm:mb-20">
        <h1 className="text-sm uppercase tracking-widest text-white/60">
          Photo
        </h1>
      </header>
      <PhotoGrid photos={photos} />
    </div>
  );
}
