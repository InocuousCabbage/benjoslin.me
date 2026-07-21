/**
 * Shared SoundCloud widget API helpers (Phase 5.5).
 *
 * The SoundCloud Widget script (https://w.soundcloud.com/player/api.js)
 * hangs a `SC.Widget` factory on window. It wraps a mounted iframe so
 * we can bind to widget events (play, pause, finish) + control it
 * programmatically (play, pause, load). Loaded once via next/script in
 * app/layout.tsx with strategy="lazyOnload" so it doesn't block first
 * paint on routes that never touch music.
 */

export type SCWidget = {
  play: () => void;
  pause: () => void;
  bind: (event: string, handler: () => void) => void;
  load: (url: string, options?: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    SC?: {
      Widget: (iframe: HTMLIFrameElement | string) => SCWidget;
    };
  }
}

/** SC widget event constants used across the codebase. */
export const SC_EVENT = {
  READY: "ready",
  PLAY: "play",
  PAUSE: "pause",
  FINISH: "finish",
} as const;

/** Light-grey accent matches the /music page palette + site white/80 tier. */
export const SC_ACCENT = "cccccc";

/**
 * Compose a SoundCloud player URL for either the full-size embed
 * (waveform visible) or the compact mini-player (visual=false: shows
 * play button + title + progress bar, ~80px tall).
 */
export function embedSrc(
  soundcloudUrl: string,
  opts: { visual?: boolean; autoPlay?: boolean } = {},
): string {
  const { visual = true, autoPlay = false } = opts;
  const params = new URLSearchParams({
    url: soundcloudUrl,
    color: `#${SC_ACCENT}`,
    auto_play: autoPlay ? "true" : "false",
    hide_related: "false",
    show_comments: "false",
    show_user: "true",
    show_reposts: "false",
    show_teaser: "true",
    visual: visual ? "true" : "false",
  });
  return `https://w.soundcloud.com/player/?${params.toString()}`;
}

/**
 * Bind an iframe to the SC.Widget API when the script is ready. The
 * widget script loads lazily, so callers cannot assume window.SC is
 * available at mount time. This helper polls briefly + returns a
 * cleanup function.
 *
 * The callback receives the widget wrapper; use widget.bind(...) to
 * attach event handlers. The widget script doesn't expose a reliable
 * unbind-by-handler-reference, so handlers effectively last until the
 * iframe unmounts (which discards the widget anyway).
 */
export function withSCWidget(
  iframe: HTMLIFrameElement | null,
  callback: (widget: SCWidget) => void,
): () => void {
  if (!iframe) return () => {};
  let cancelled = false;

  const tryBind = () => {
    if (cancelled) return true;
    if (typeof window === "undefined" || !window.SC) return false;
    // F6 from xhigh iter-0: wrap SC.Widget() in try/catch so a
    // corrupted iframe / SDK-version-mismatch throw is treated as
    // "not ready yet, keep polling" instead of hammering the console
    // with an uncaught exception every 200ms until timeout.
    try {
      const widget = window.SC.Widget(iframe);
      callback(widget);
      return true;
    } catch {
      return false;
    }
  };

  if (tryBind()) return () => {};

  const intervalId = window.setInterval(() => {
    if (tryBind()) window.clearInterval(intervalId);
  }, 200);
  const timeoutId = window.setTimeout(() => {
    window.clearInterval(intervalId);
  }, 15_000);

  return () => {
    cancelled = true;
    window.clearInterval(intervalId);
    window.clearTimeout(timeoutId);
  };
}
