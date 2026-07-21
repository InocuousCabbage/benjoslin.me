/**
 * Unit tests for the MiniPlayerProvider state machine (Phase 5.5).
 * Mounts a probe component that reads the API + exposes it to the
 * test, then drives it via fireEvent-style state changes.
 *
 * Covers: initial null state, load, next/prev wrap-around, close
 * clears state, sessionStorage hydration + persistence, out-of-range
 * hydrated index guarded.
 */
import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { render, act, cleanup } from "@testing-library/react";
import {
  MiniPlayerProvider,
  useMiniPlayer,
} from "@/lib/mini-player-context";

afterEach(() => {
  cleanup();
  sessionStorage.clear();
});

let captured: ReturnType<typeof useMiniPlayer> | null = null;

function Probe() {
  captured = useMiniPlayer();
  return null;
}

function mount(trackCount: number) {
  captured = null;
  render(
    <MiniPlayerProvider trackCount={trackCount}>
      <Probe />
    </MiniPlayerProvider>,
  );
}

describe("MiniPlayerProvider initial state", () => {
  it("starts with activeIndex null and isPlaying false", () => {
    mount(10);
    expect(captured!.activeIndex).toBeNull();
    expect(captured!.isPlaying).toBe(false);
  });
});

describe("MiniPlayerProvider load / close", () => {
  it("load(i) sets activeIndex to i and isPlaying to true", () => {
    mount(10);
    act(() => captured!.load(3));
    expect(captured!.activeIndex).toBe(3);
    expect(captured!.isPlaying).toBe(true);
  });

  it("close() resets activeIndex to null and isPlaying to false", () => {
    mount(10);
    act(() => captured!.load(3));
    act(() => captured!.close());
    expect(captured!.activeIndex).toBeNull();
    expect(captured!.isPlaying).toBe(false);
  });
});

describe("MiniPlayerProvider next / prev cycling", () => {
  it("next() from null starts at 0", () => {
    mount(10);
    act(() => captured!.next());
    expect(captured!.activeIndex).toBe(0);
  });

  it("prev() from null starts at 0", () => {
    mount(10);
    act(() => captured!.prev());
    expect(captured!.activeIndex).toBe(0);
  });

  it("next() wraps to 0 after the last index", () => {
    mount(3);
    act(() => captured!.load(2));
    act(() => captured!.next());
    expect(captured!.activeIndex).toBe(0);
  });

  it("prev() wraps to last index from 0", () => {
    mount(3);
    act(() => captured!.load(0));
    act(() => captured!.prev());
    expect(captured!.activeIndex).toBe(2);
  });

  it("next() advances 0 -> 1 -> 2", () => {
    mount(3);
    act(() => captured!.load(0));
    act(() => captured!.next());
    expect(captured!.activeIndex).toBe(1);
    act(() => captured!.next());
    expect(captured!.activeIndex).toBe(2);
  });

  it("next() is a no-op when trackCount is 0", () => {
    mount(0);
    act(() => captured!.next());
    expect(captured!.activeIndex).toBeNull();
  });
});

describe("MiniPlayerProvider sessionStorage persist + hydrate", () => {
  beforeEach(() => sessionStorage.clear());

  it("persists activeIndex to sessionStorage on load", () => {
    mount(10);
    act(() => captured!.load(4));
    const raw = sessionStorage.getItem("mini-player-v1");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.activeIndex).toBe(4);
  });

  it("removes the sessionStorage entry on close", () => {
    mount(10);
    act(() => captured!.load(4));
    act(() => captured!.close());
    expect(sessionStorage.getItem("mini-player-v1")).toBeNull();
  });

  it("hydrates activeIndex from sessionStorage on mount", () => {
    sessionStorage.setItem(
      "mini-player-v1",
      JSON.stringify({ activeIndex: 2 }),
    );
    mount(10);
    expect(captured!.activeIndex).toBe(2);
  });

  it("guards against a hydrated index that is out of range for the current trackCount", () => {
    sessionStorage.setItem(
      "mini-player-v1",
      JSON.stringify({ activeIndex: 99 }),
    );
    mount(10);
    expect(captured!.activeIndex).toBeNull();
  });

  it("ignores malformed sessionStorage payload", () => {
    sessionStorage.setItem("mini-player-v1", "not-json{{");
    mount(10);
    expect(captured!.activeIndex).toBeNull();
  });
});

describe("useMiniPlayer without a Provider", () => {
  it("returns a no-op API so tests can mount consumers directly", () => {
    // The Probe outside a Provider would otherwise throw before
    // this Phase-5.5 refactor.
    render(<Probe />);
    expect(captured!.activeIndex).toBeNull();
    expect(captured!.isPlaying).toBe(false);
    // Calling load / next / prev / close does not throw.
    expect(() => {
      captured!.load(1);
      captured!.next();
      captured!.prev();
      captured!.close();
      captured!.setPlaying(true);
    }).not.toThrow();
  });
});
