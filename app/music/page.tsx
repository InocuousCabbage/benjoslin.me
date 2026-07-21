import type { Metadata } from "next";
import { tracks } from "@/lib/content";
import { TrackList } from "@/components/track-list";

export const metadata: Metadata = {
  title: "Music",
  alternates: { canonical: "/music" },
};

/**
 * Music page (Phase 5 scaffold dispatch). Ben's own SoundCloud tracks
 * (audio production hobby, Ithaca College minor in Audio Production).
 * Data lives in lib/content.ts as `tracks: Track[]`; rendering lives
 * in TrackList. This component wires the two together and owns the
 * eyebrow label + intro copy.
 *
 * Eyebrow-only heading treatment matches the Phase 2 L1 pattern used
 * on /career, /education, /projects, /photo: small uppercase "Music"
 * label instead of a display h1.
 *
 * Intro copy is a placeholder Ben can edit during populate. It reads
 * first-person so the page frames the tracks as his own work rather
 * than a generic playlist.
 *
 * Ships with tracks = [] as an intentional scaffold state. TrackList
 * handles the empty branch with a graceful placeholder so /music is
 * reachable and the layout / typography can be Ben-eyeballed before
 * SoundCloud URLs land in a populate PR.
 *
 * Dark theme + typography match Phase 0 clone.
 */
export default function MusicPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <header className="mb-12 flex flex-col gap-4 sm:mb-16">
        <h1 className="text-sm uppercase tracking-widest text-white/60">
          Music
        </h1>
        <p
          data-testid="music-intro"
          className="text-base text-white/70 sm:text-lg"
        >
          Original tracks I record on the side.
        </p>
      </header>
      <TrackList tracks={tracks} />
    </div>
  );
}
