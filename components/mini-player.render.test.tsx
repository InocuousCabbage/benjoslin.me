/**
 * Render-layer tests for MiniPlayer (Phase 5.5, follows Phase 2/3/4/5
 * fixture-driven render pattern per closed ironic-miss n=9 rule).
 *
 * Covers:
 * - Idle state: activeIndex null renders NOTHING (no <aside>, no iframe).
 * - Active state: renders <aside> + iframe with the SoundCloud embed
 *   URL that wraps the active track's soundcloudUrl + visual=false.
 * - Controls: previous / next / close buttons dispatch to the store.
 * - Position label: "N / total" reflects the active index + total.
 * - Iframe title falls back to "SoundCloud player" when track.title
 *   is absent (matches TrackList behavior).
 *
 * window.SC is intentionally NOT stubbed in these tests; withSCWidget
 * gracefully no-ops when it's missing (polls until a 15s timeout).
 * Widget-level integration is a prod-eyeball responsibility per the
 * rendering-blind-spot n=5 gate.
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
import {
  MiniPlayerProvider,
  useMiniPlayer,
} from "@/lib/mini-player-context";
import { MiniPlayer } from "@/components/mini-player";
import { tracks } from "@/lib/content";

afterEach(() => {
  cleanup();
  sessionStorage.clear();
});

// A control cluster that lets the test drive load() from outside the
// mini-player. Keeps the tests focused on MiniPlayer render behavior
// while the state machine itself is unit-tested in
// lib/mini-player-context.test.tsx.
function Controller({ children }: { children: React.ReactNode }) {
  return (
    <MiniPlayerProvider trackCount={tracks.length}>
      <TestHarness />
      {children}
    </MiniPlayerProvider>
  );
}
let harness: ReturnType<typeof useMiniPlayer> | null = null;
function TestHarness() {
  harness = useMiniPlayer();
  return null;
}

describe("MiniPlayer idle state (Phase 5.5)", () => {
  it("renders nothing when activeIndex is null", () => {
    const { container } = render(
      <Controller>
        <MiniPlayer />
      </Controller>,
    );
    expect(
      container.querySelector('[data-testid="mini-player"]'),
    ).toBeNull();
    expect(container.querySelector("iframe")).toBeNull();
  });
});

describe("MiniPlayer active state (Phase 5.5)", () => {
  it("renders the panel + iframe when a track is loaded", () => {
    render(
      <Controller>
        <MiniPlayer />
      </Controller>,
    );
    act(() => harness!.load(0));
    const panel = document.querySelector('[data-testid="mini-player"]');
    expect(panel).not.toBeNull();
    const iframe = document.querySelector(
      '[data-testid="mini-player-iframe"]',
    ) as HTMLIFrameElement;
    expect(iframe).not.toBeNull();
    expect(iframe.getAttribute("height")).toBe("80");
    // URL wraps the active track's soundcloudUrl with visual=false.
    const src = iframe.getAttribute("src") ?? "";
    expect(src.startsWith("https://w.soundcloud.com/player/?")).toBe(true);
    expect(
      src.includes(encodeURIComponent(tracks[0]!.soundcloudUrl)),
    ).toBe(true);
    expect(src.includes("visual=false")).toBe(true);
  });

  it("iframe title falls back to 'SoundCloud player' when track.title is absent", () => {
    render(
      <Controller>
        <MiniPlayer />
      </Controller>,
    );
    act(() => harness!.load(0));
    const iframe = document.querySelector(
      '[data-testid="mini-player-iframe"]',
    );
    expect(iframe!.getAttribute("title")).toBe("SoundCloud player");
  });

  it("position label reads 'N / total'", () => {
    render(
      <Controller>
        <MiniPlayer />
      </Controller>,
    );
    act(() => harness!.load(2));
    const pos = document.querySelector(
      '[data-testid="mini-player-position"]',
    );
    expect(pos!.textContent).toBe(`3 / ${tracks.length}`);
  });

  it("close button clears state so the panel unmounts", () => {
    render(
      <Controller>
        <MiniPlayer />
      </Controller>,
    );
    act(() => harness!.load(1));
    const closeBtn = document.querySelector(
      'button[aria-label="Close mini player"]',
    ) as HTMLButtonElement;
    fireEvent.click(closeBtn);
    expect(harness!.activeIndex).toBeNull();
    expect(
      document.querySelector('[data-testid="mini-player"]'),
    ).toBeNull();
  });

  it("next button advances the active index (wrapping at end)", () => {
    render(
      <Controller>
        <MiniPlayer />
      </Controller>,
    );
    act(() => harness!.load(tracks.length - 1));
    const nextBtn = document.querySelector(
      'button[aria-label="Next track"]',
    ) as HTMLButtonElement;
    fireEvent.click(nextBtn);
    expect(harness!.activeIndex).toBe(0);
  });

  it("previous button steps back (wrapping at start)", () => {
    render(
      <Controller>
        <MiniPlayer />
      </Controller>,
    );
    act(() => harness!.load(0));
    const prevBtn = document.querySelector(
      'button[aria-label="Previous track"]',
    ) as HTMLButtonElement;
    fireEvent.click(prevBtn);
    expect(harness!.activeIndex).toBe(tracks.length - 1);
  });
});
