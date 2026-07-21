"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * Shared state for the site-wide floating mini-player (Phase 5.5).
 * Chose React Context over Zustand per the dispatch's "your choice":
 * the state is small (2 fields), consumer count is bounded (mini-player
 * + one card per track on /music), and staying zero-dep beats saving
 * ~1kb here. If the shape grows enough to hit Context re-render
 * fanout, migrate.
 *
 * Persistence: sessionStorage-only. Cross-tab isolation is desirable
 * (each tab has its own player state); cross-reload survival is nice
 * but not load-bearing (iframe reload restarts audio anyway).
 */

const STORAGE_KEY = "mini-player-v1";

type PersistedState = {
  activeIndex: number | null;
};

type API = {
  activeIndex: number | null;
  isPlaying: boolean;
  /**
   * Monotonically increasing counter bumped on every load()/next()/
   * prev(). MiniPlayer's load-into-widget effect depends on this so
   * re-loading the SAME index (user pauses via SC widget UI, then
   * clicks the same full-size embed) still triggers a re-load +
   * play instead of being silently skipped by React's state-equality
   * short-circuit (F5 from xhigh iter-0).
   */
  loadNonce: number;
  /** Load a track index into the player and start playing it. */
  load: (index: number) => void;
  /** Close the player: unloads audio + hides + resets state. */
  close: () => void;
  /** Advance to the next track, wrapping at the end. */
  next: () => void;
  /** Step back to the previous track, wrapping at the start. */
  prev: () => void;
  /** Set the play/pause state (fed by SC widget events). */
  setPlaying: (playing: boolean) => void;
};

const MiniPlayerContext = createContext<API | null>(null);

export function MiniPlayerProvider({
  children,
  trackCount,
}: {
  children: ReactNode;
  trackCount: number;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadNonce, setLoadNonce] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        if (
          typeof parsed.activeIndex === "number" &&
          parsed.activeIndex >= 0 &&
          parsed.activeIndex < trackCount
        ) {
          setActiveIndex(parsed.activeIndex);
        }
      }
    } catch {
      // Ignore malformed sessionStorage; fresh state is safe.
    }
    setHydrated(true);
  }, [trackCount]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (activeIndex === null) {
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ activeIndex } satisfies PersistedState),
        );
      }
    } catch {
      // Storage full or unavailable; state still works in memory.
    }
  }, [activeIndex, hydrated]);

  const load = useCallback((i: number) => {
    setActiveIndex(i);
    setIsPlaying(true);
    setLoadNonce((n) => n + 1);
  }, []);

  const close = useCallback(() => {
    setActiveIndex(null);
    setIsPlaying(false);
  }, []);

  const next = useCallback(() => {
    if (trackCount === 0) return;
    setActiveIndex((prev) =>
      prev === null ? 0 : (prev + 1) % trackCount,
    );
    setIsPlaying(true);
    setLoadNonce((n) => n + 1);
  }, [trackCount]);

  const prev = useCallback(() => {
    if (trackCount === 0) return;
    setActiveIndex((cur) =>
      cur === null ? 0 : (cur - 1 + trackCount) % trackCount,
    );
    setIsPlaying(true);
    setLoadNonce((n) => n + 1);
  }, [trackCount]);

  return (
    <MiniPlayerContext.Provider
      value={{
        activeIndex,
        isPlaying,
        loadNonce,
        load,
        close,
        next,
        prev,
        setPlaying: setIsPlaying,
      }}
    >
      {children}
    </MiniPlayerContext.Provider>
  );
}

const NOOP_API: API = {
  activeIndex: null,
  isPlaying: false,
  loadNonce: 0,
  load: () => {},
  close: () => {},
  next: () => {},
  prev: () => {},
  setPlaying: () => {},
};

/**
 * Consume the mini-player state. When called outside a
 * MiniPlayerProvider (e.g. isolated render-layer tests that mount
 * TrackList without the root layout), returns a no-op API instead of
 * throwing. This keeps the presentational components mountable in
 * tests without a Provider wrapper; production always has the Provider
 * because it lives in app/layout.tsx.
 */
export function useMiniPlayer(): API {
  return useContext(MiniPlayerContext) ?? NOOP_API;
}
