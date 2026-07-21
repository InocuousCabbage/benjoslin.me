"use client";

import { useEffect, useRef } from "react";
import type { Track } from "@/lib/content";
import { useMiniPlayer } from "@/lib/mini-player-context";
import {
  SC_EVENT,
  embedSrc,
  withSCWidget,
} from "@/lib/soundcloud-widget";

/**
 * Presentational SoundCloud track list. Accepts tracks as a prop so
 * render-layer tests can mount fixture data. The default export in
 * app/music/page.tsx wraps this with the real `tracks` from
 * lib/content.ts.
 *
 * Phase 5.5 update: each full-size embed intercepts its own PLAY
 * event and hands the track off to the site-wide mini-player. The
 * mini-player is the source of truth for audio; the full-size embed
 * pauses immediately after PLAY fires. There is a brief single-frame
 * blip while the SC widget starts + is paused by our binding; Ben
 * can eyeball on prod and I can iterate the UX if it feels wrong.
 *
 * Empty-state discipline (Phase 5 scaffold, mirrors Photo scaffold):
 * - tracks.length === 0 renders a graceful "Music coming soon"
 *   placeholder so /music is reachable + typography stable before
 *   Ben populates.
 * - tracks.length > 0 renders one TrackCard per entry.
 *
 * Dark theme + typography match Phases 0-4.
 */

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
      {tracks.map((track, index) => (
        <li key={track.soundcloudUrl} className="list-none">
          <TrackCard track={track} index={index} />
        </li>
      ))}
    </ul>
  );
}

function TrackCard({ track, index }: { track: Track; index: number }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { load } = useMiniPlayer();

  useEffect(() => {
    return withSCWidget(iframeRef.current, (widget) => {
      // F7 from xhigh iter-0: register PLAY handler inside READY so
      // a fast first-click on a fresh page load doesn't miss the
      // initial PLAY event (the widget can drop early binds fired
      // before the SC iframe has finished handshaking).
      widget.bind(SC_EVENT.READY, () => {
        widget.bind(SC_EVENT.PLAY, () => {
          // F2 from xhigh iter-0: pause BEFORE handing off, always.
          // Swapping the order shipped double-audio for a frame
          // (full-size + mini both playing). The following two lines
          // are load-bearing in order; a pin in
          // lib/copy-guards.test.ts requires pause-then-load.
          widget.pause();
          load(index);
        });
      });
    });
  }, [index, load]);

  return (
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
          ref={iframeRef}
          src={embedSrc(track.soundcloudUrl, { visual: true })}
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
  );
}
