"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { tracks } from "@/lib/content";
import { useMiniPlayer } from "@/lib/mini-player-context";
import {
  SC_EVENT,
  embedSrc,
  withSCWidget,
  type SCWidget,
} from "@/lib/soundcloud-widget";

/**
 * Site-wide persistent floating mini-player (Phase 5.5 dispatch).
 * Mounted in RootLayout so it survives route unmount. Renders null
 * while activeIndex is null (no track loaded); becomes a fixed
 * bottom-right ~400px-wide panel when a track is active.
 *
 * SoundCloud widget with visual=false: shows play button + track
 * title + progress bar, ~80px tall. Waveform is stripped so the
 * player stays compact.
 *
 * Custom controls (in the panel footer):
 * - Previous / Next: cycle through the tracks[] array from
 *   lib/content.ts, wrapping at ends. Reads trackCount from the
 *   MiniPlayerProvider.
 * - Close: unloads audio + hides + resets to no-track state.
 *
 * A11y:
 * - <aside aria-label="Mini music player"> so screen readers get
 *   a landmark.
 * - Every control is a real <button> with aria-label.
 * - Fade-in transition is stripped under prefers-reduced-motion.
 * - respects env(safe-area-inset-bottom) on iOS home-indicator.
 *
 * The corner (bottom-right) is my /frontend-design taste call per
 * weemeemee's dispatch: standard music-player convention +
 * doesn't collide with the site footer's left-anchored copyright
 * row. Ben can eyeball + iterate.
 */
export function MiniPlayer() {
  const { activeIndex, close, next, prev, setPlaying } = useMiniPlayer();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<SCWidget | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (activeIndex === null) {
      setEntered(false);
      return;
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex === null) return;
    return withSCWidget(iframeRef.current, (widget) => {
      widgetRef.current = widget;
      widget.bind(SC_EVENT.PLAY, () => setPlaying(true));
      widget.bind(SC_EVENT.PAUSE, () => setPlaying(false));
      widget.bind(SC_EVENT.FINISH, () => next());
    });
  }, [activeIndex, next, setPlaying]);

  const src = useMemo(() => {
    if (activeIndex === null) return "";
    const t = tracks[activeIndex];
    if (!t) return "";
    return embedSrc(t.soundcloudUrl, { visual: false, autoPlay: true });
  }, [activeIndex]);

  if (activeIndex === null) return null;
  const track = tracks[activeIndex];
  if (!track) return null;

  const opacityClass = entered ? "opacity-100" : "opacity-0";
  const transitionClass = reducedMotion ? "" : "transition-opacity duration-300";

  return (
    <aside
      data-testid="mini-player"
      aria-label="Mini music player"
      className={`fixed bottom-4 right-4 z-50 flex w-[min(92vw,400px)] flex-col overflow-hidden rounded-md border border-white/10 bg-black/90 shadow-2xl backdrop-blur-md ${opacityClass} ${transitionClass}`}
      style={{
        bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
        right: "calc(1rem + env(safe-area-inset-right, 0px))",
      }}
    >
      <iframe
        ref={iframeRef}
        data-testid="mini-player-iframe"
        key={activeIndex}
        src={src}
        title={track.title ?? "SoundCloud player"}
        width="100%"
        height="80"
        scrolling="no"
        allow="autoplay"
        className="block w-full border-0"
      />
      <div className="flex items-center gap-3 border-t border-white/10 px-3 py-2">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous track"
          className="rounded p-1 text-white/60 transition-colors hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="currentColor"
            aria-hidden
          >
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next track"
          className="rounded p-1 text-white/60 transition-colors hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="currentColor"
            aria-hidden
          >
            <path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2z" />
          </svg>
        </button>
        <span
          data-testid="mini-player-position"
          className="ml-auto text-xs tabular-nums text-white/50"
        >
          {activeIndex + 1} / {tracks.length}
        </span>
        <button
          type="button"
          onClick={close}
          aria-label="Close mini player"
          className="rounded p-1 text-white/60 transition-colors hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="currentColor"
            aria-hidden
          >
            <path d="M18.3 5.71L12 12.01l-6.3-6.3-1.42 1.41L10.59 13.4l-6.3 6.3 1.41 1.41L12 14.83l6.29 6.29 1.42-1.41-6.3-6.3 6.29-6.3z" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
