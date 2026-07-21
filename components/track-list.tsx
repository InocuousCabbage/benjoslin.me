import type { Track } from "@/lib/content";

/**
 * Presentational SoundCloud track list. Accepts tracks as a prop so
 * render-layer tests can mount fixture data. The default export in
 * app/music/page.tsx wraps this with the real `tracks` from
 * lib/content.ts.
 *
 * Content is Ben's own SoundCloud tracks (audio production hobby).
 * Layout is a stacked list of 166px-tall SoundCloud iframe embeds
 * (matches the SoundCloud player default). Not masonry: embeds are
 * uniform height per track, so a simple stack reads cleaner.
 *
 * Empty-state discipline (Phase 5 scaffold, mirrors Photo scaffold):
 * - tracks.length === 0 renders a graceful "Music coming soon"
 *   placeholder so /music is reachable + typography stable before
 *   Ben populates.
 * - tracks.length > 0 renders one card per track with the embed +
 *   optional date eyebrow + optional description.
 *
 * SoundCloud color param: light grey (#cccccc, approx site white/80
 * tier) chosen from Ben's three options over pure white (would blast
 * the waveform and fight typographic hierarchy) and mid-grey #a0a0a0
 * (too muted for the waveform against the dark background). Ben can
 * flip to any hex during populate.
 *
 * Dark theme + typography match Phases 0-4.
 */

const SOUNDCLOUD_ACCENT = "cccccc";

function embedSrc(soundcloudUrl: string): string {
  const params = new URLSearchParams({
    url: soundcloudUrl,
    color: `#${SOUNDCLOUD_ACCENT}`,
    auto_play: "false",
    hide_related: "false",
    show_comments: "false",
    show_user: "true",
    show_reposts: "false",
    show_teaser: "true",
  });
  return `https://w.soundcloud.com/player/?${params.toString()}`;
}

export function TrackList({ tracks }: { tracks: Track[] }) {
  if (tracks.length === 0) {
    return (
      <div
        data-testid="track-empty"
        className="flex flex-col gap-3 border-t border-white/10 pt-8"
      >
        <p className="text-sm text-white/60 sm:text-base">
          Music coming soon.
        </p>
      </div>
    );
  }

  return (
    <ul data-testid="track-list" className="flex flex-col gap-12 sm:gap-16">
      {tracks.map((track) => (
        <li key={track.soundcloudUrl} className="list-none">
          <article className="flex flex-col gap-3 border-t border-white/10 pt-8">
            {track.date ? (
              <p
                data-testid="track-date"
                className="text-xs uppercase tracking-widest text-white/40 tabular-nums"
              >
                {track.date}
              </p>
            ) : null}
            {track.title ? (
              <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
                {track.title}
              </h2>
            ) : null}
            {track.description ? (
              <p
                data-testid="track-description"
                className="text-sm text-white/70 sm:text-base"
              >
                {track.description}
              </p>
            ) : null}
            <div
              data-testid="track-embed"
              className="w-full overflow-hidden rounded-sm bg-white/5"
            >
              <iframe
                src={embedSrc(track.soundcloudUrl)}
                title={track.title ?? "SoundCloud player"}
                width="100%"
                height="166"
                scrolling="no"
                loading="lazy"
                allow="autoplay"
                className="block w-full border-0"
              />
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
