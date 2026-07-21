/**
 * Render-layer tests for TrackList (Phase 5 scaffold, follows Phase 2/3/4
 * fixture-driven render pattern per closed ironic-miss n=9 rule).
 *
 * Covers:
 * - Empty-state branch renders the placeholder + no list + no iframe.
 * - Non-empty renders one <article> per track with a SoundCloud
 *   iframe whose src wraps the soundcloudUrl.
 * - iframe carries title (a11y) + loading="lazy" + height=166.
 * - Optional-field discipline:
 *   - date renders only when set
 *   - description renders only when set
 * - Multiple tracks render in order.
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import type { Track } from "@/lib/content";
import { TrackList } from "@/components/track-list";

afterEach(cleanup);

const baseTrack: Track = {
  title: "Test Track A",
  soundcloudUrl: "https://soundcloud.com/benjoslin/test-a",
};

describe("TrackList empty state (Phase 5 scaffold)", () => {
  it("renders the empty-state placeholder when tracks is empty", () => {
    const { container } = render(<TrackList tracks={[]} />);
    const empty = container.querySelector('[data-testid="track-empty"]');
    expect(empty).not.toBeNull();
    expect(empty!.textContent).toContain("Music coming soon");
  });

  it("does not render the list or any iframes when tracks is empty", () => {
    const { container } = render(<TrackList tracks={[]} />);
    expect(container.querySelector('[data-testid="track-list"]')).toBeNull();
    expect(container.querySelector("iframe")).toBeNull();
  });
});

describe("TrackList non-empty render (Phase 5 scaffold)", () => {
  it("renders one <article> per track with a SoundCloud iframe wrapping the URL", () => {
    const tracks: Track[] = [
      baseTrack,
      { ...baseTrack, title: "Test Track B", soundcloudUrl: "https://soundcloud.com/benjoslin/test-b" },
      { ...baseTrack, title: "Test Track C", soundcloudUrl: "https://soundcloud.com/benjoslin/test-c" },
    ];
    const { container } = render(<TrackList tracks={tracks} />);
    const list = container.querySelector('[data-testid="track-list"]');
    expect(list).not.toBeNull();
    const articles = list!.querySelectorAll("article");
    expect(articles.length).toBe(3);
    const iframes = container.querySelectorAll("iframe");
    expect(iframes.length).toBe(3);
    // Each iframe src must be the soundcloud player URL wrapping that
    // track's soundcloudUrl.
    const srcs = Array.from(iframes).map((f) => f.getAttribute("src") ?? "");
    for (const track of tracks) {
      const found = srcs.find((s) =>
        s.includes(encodeURIComponent(track.soundcloudUrl)),
      );
      expect(
        found,
        `iframe wrapping ${track.soundcloudUrl} not found`,
      ).toBeDefined();
      expect(found!.startsWith("https://w.soundcloud.com/player/?")).toBe(true);
    }
  });

  it("iframe carries the track title (a11y) + lazy loading + fixed 166 height", () => {
    const { container } = render(<TrackList tracks={[baseTrack]} />);
    const iframe = container.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe!.getAttribute("title")).toBe("Test Track A");
    expect(iframe!.getAttribute("loading")).toBe("lazy");
    expect(iframe!.getAttribute("height")).toBe("166");
  });

  it("renders the track title as an h2", () => {
    const { container } = render(<TrackList tracks={[baseTrack]} />);
    const h2 = container.querySelector("h2");
    expect(h2).not.toBeNull();
    expect(h2!.textContent).toContain("Test Track A");
  });
});

describe("TrackList optional-field discipline (Phase 5 scaffold)", () => {
  it("skips the date eyebrow when track.date is absent", () => {
    const { container } = render(<TrackList tracks={[baseTrack]} />);
    expect(container.querySelector('[data-testid="track-date"]')).toBeNull();
    expect(container.textContent).toContain("Test Track A");
  });

  it("renders the date eyebrow with the given value when track.date is set", () => {
    const tracks: Track[] = [{ ...baseTrack, date: "2024" }];
    const { container } = render(<TrackList tracks={tracks} />);
    const d = container.querySelector('[data-testid="track-date"]');
    expect(d).not.toBeNull();
    expect(d!.textContent).toContain("2024");
  });

  it("skips the description when track.description is absent", () => {
    const { container } = render(<TrackList tracks={[baseTrack]} />);
    expect(
      container.querySelector('[data-testid="track-description"]'),
    ).toBeNull();
  });

  it("renders the description with the given text when track.description is set", () => {
    const tracks: Track[] = [
      { ...baseTrack, description: "Recorded at Ithaca, spring 2022." },
    ];
    const { container } = render(<TrackList tracks={tracks} />);
    const d = container.querySelector('[data-testid="track-description"]');
    expect(d).not.toBeNull();
    expect(d!.textContent).toContain("Recorded at Ithaca, spring 2022.");
  });
});
