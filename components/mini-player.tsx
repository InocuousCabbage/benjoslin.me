"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { tracks } from "@/lib/content";
import { useMiniPlayer } from "@/lib/mini-player-context";
import {
  SC_ACCENT,
  SC_EVENT,
  embedSrc,
  withSCWidget,
  type SCWidget,
} from "@/lib/soundcloud-widget";

/**
 * Site-wide persistent floating mini-player (Phase 5.5 dispatch,
 * iter-1 hardening per xhigh findings F1/F3/F4/F5/F6/F7).
 *
 * MOUNT LIFECYCLE (F4 fix): the iframe stays mounted from the first
 * activation onward. Track changes go through widget.load(newUrl,
 * {auto_play: true, callback: () => widget.play()}), NOT via an
 * iframe remount (previous pattern keyed the iframe on activeIndex,
 * which reset the widget on every change and broke Chrome / Safari
 * autoplay-policy on 2nd+ tracks because the fresh iframe no longer
 * carried user-activation context). widgetRef persists across track
 * changes; the READY-then-bind pattern (F7) ensures event handlers
 * catch fast first-clicks.
 *
 * SAME-INDEX RE-LOAD (F5 fix): the load effect depends on both
 * activeIndex AND loadNonce. load(sameIndex) still bumps nonce ->
 * effect re-runs -> widget.load restarts audio. Without the nonce,
 * React skipped the effect on same-index re-loads (paused widget
 * stayed paused, state said isPlaying:true).
 *
 * CLOSE semantics (unchanged): activeIndex -> null hides the panel
 * + calls widget.pause() so audio actually stops. The iframe stays
 * mounted so the next load() reuses the same widget + user activation
 * context.
 *
 * Renders null until the first activation ever, so pre-play the
 * DOM stays clean.
 *
 * Corner (bottom-right), icon set (inline SVG), Context (over
 * Zustand), no-minimize (close = reset) all remain my judgment
 * calls per the original dispatch.
 */
export function MiniPlayer() {
  const { activeIndex, loadNonce, close, next, prev, setPlaying } =
    useMiniPlayer();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<SCWidget | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [entered, setEntered] = useState(false);

  // First-mount latch: once true, the iframe stays in the DOM for
  // the rest of the session so widget.load() can swap tracks without
  // losing user-activation context.
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    if (activeIndex !== null && !hasMounted) setHasMounted(true);
  }, [activeIndex, hasMounted]);

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

  // Bind widget lifecycle ONCE after the iframe first mounts (F7):
  // register PLAY/PAUSE/FINISH handlers inside a READY callback so
  // a fast first-click doesn't miss the initial PLAY event.
  useEffect(() => {
    if (!hasMounted) return;
    return withSCWidget(iframeRef.current, (widget) => {
      widgetRef.current = widget;
      widget.bind(SC_EVENT.READY, () => {
        widget.bind(SC_EVENT.PLAY, () => setPlaying(true));
        widget.bind(SC_EVENT.PAUSE, () => setPlaying(false));
        widget.bind(SC_EVENT.FINISH, () => next());
      });
    });
  }, [hasMounted, next, setPlaying]);

  // Swap track via widget.load() on every activeIndex OR loadNonce
  // change. Same-index re-load works because loadNonce bumps even
  // when activeIndex stays put (F5).
  useEffect(() => {
    if (!hasMounted) return;
    const w = widgetRef.current;
    if (!w) return;
    if (activeIndex === null) {
      try {
        w.pause();
      } catch {
        // widget may not be READY yet on very early close; safe to ignore.
      }
      return;
    }
    const track = tracks[activeIndex];
    if (!track) return;
    try {
      w.load(track.soundcloudUrl, {
        auto_play: true,
        color: `#${SC_ACCENT}`,
        visual: false,
        show_user: true,
        show_comments: false,
        show_reposts: false,
        show_teaser: false,
        hide_related: true,
        callback: () => {
          try {
            w.play();
          } catch {
            // widget may drop the callback under autoplay-policy edge cases.
          }
        },
      });
    } catch {
      // load() may throw on transient SDK state; UI stays in the
      // last-known-good position.
    }
  }, [activeIndex, loadNonce, hasMounted]);

  // Initial src for first mount only (widget.load takes over after).
  const initialSrc = useMemo(() => {
    if (activeIndex === null) return "";
    const t = tracks[activeIndex];
    if (!t) return "";
    return embedSrc(t.soundcloudUrl, { visual: false, autoPlay: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMounted]);

  if (!hasMounted) return null;

  const hidden = activeIndex === null;
  const track = activeIndex !== null ? tracks[activeIndex] : null;
  const displayTitle = track?.title ?? "SoundCloud player";
  const opacityClass = entered && !hidden ? "opacity-100" : "opacity-0";
  const transitionClass = reducedMotion
    ? ""
    : "transition-opacity duration-300";
  const pointerClass = hidden ? "pointer-events-none" : "";

  return (
    <aside
      data-testid="mini-player"
      aria-label="Mini music player"
      aria-hidden={hidden}
      className={`fixed bottom-4 right-4 z-50 flex w-[min(92vw,400px)] flex-col overflow-hidden rounded-md border border-white/10 bg-black/90 shadow-2xl backdrop-blur-md ${opacityClass} ${transitionClass} ${pointerClass}`}
      style={{
        bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
        right: "calc(1rem + env(safe-area-inset-right, 0px))",
      }}
    >
      <iframe
        ref={iframeRef}
        data-testid="mini-player-iframe"
        src={initialSrc}
        title={displayTitle}
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
          {activeIndex !== null ? `${activeIndex + 1} / ${tracks.length}` : ""}
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
