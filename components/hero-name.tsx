"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";

/**
 * V1 signature moment: cursor-tracked hero shimmer.
 *
 * The hero name renders as text with a linear-gradient masked via
 * background-clip. The bright peak of the gradient's `background-position`
 * is driven by --shimmer-x. Two modes, gated by a data attribute on the
 * root span:
 *
 * - data-shimmer="idle" (SSR default + fallback for reduced-motion /
 *   coarse-pointer / cursor-parked-for-2s): a CSS keyframe animates
 *   background-position from 100% to 0% over 4.5s linear infinite:
 *   the Enzo pattern verbatim.
 * - data-shimmer="active": the ambient keyframe is cleared (animation:
 *   none), and JS updates --shimmer-x from cursor.clientX / innerWidth
 *   so the bright peak tracks the cursor's horizontal position across
 *   the whole viewport.
 *
 * Bailouts (return early on both, keep data-shimmer="idle" so SSR
 * ambient plays with no JS listener attached):
 * - prefers-reduced-motion: reduce
 * - coarse pointer (touch devices)
 * Both media queries have change listeners so mid-session toggles
 * (trackpad plug-in on iPad, reduce-motion flip in system settings)
 * update behavior without a reload.
 *
 * rAF throttle + idle-out: onMouseMove batches into one rAF per frame
 * and resets a 2s window; if the cursor stops moving, data-shimmer flips
 * back to "idle" so the ambient keyframe resumes and the rAF loop
 * naturally stays parked until the next mousemove.
 */
export function HeroName({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const idleRef = useRef<number | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hoverFine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const evaluate = () => setActive(!reduce.matches && hoverFine.matches);
    evaluate();
    reduce.addEventListener("change", evaluate);
    hoverFine.addEventListener("change", evaluate);
    return () => {
      reduce.removeEventListener("change", evaluate);
      hoverFine.removeEventListener("change", evaluate);
    };
  }, []);

  // Cleanup pending rAF + timeout on unmount so we don't leak closures
  // if the hero unmounts (e.g. RSC re-render).
  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (idleRef.current != null) window.clearTimeout(idleRef.current);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const clientX = e.clientX;
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          // Cursor position as a % of viewport width. Extend the range a
          // bit past the edges (background-size is 250% so background-
          // position: 100% still shows a bright band; treat viewport
          // edges as visual edges rather than clamping).
          const pct = (clientX / window.innerWidth) * 100;
          el.style.setProperty("--shimmer-x", `${pct}%`);
          el.dataset.shimmer = "active";
        });
      }
      if (idleRef.current != null) window.clearTimeout(idleRef.current);
      idleRef.current = window.setTimeout(() => {
        // Cursor parked for 2s: revert to ambient shimmer so the eye
        // isn't stuck on a frozen bright band.
        el.dataset.shimmer = "idle";
      }, 2000);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (idleRef.current != null) window.clearTimeout(idleRef.current);
      // Reset to idle on effect teardown so the next mount starts clean.
      if (el) el.dataset.shimmer = "idle";
    };
  }, [active]);

  // SSR default: data-shimmer="idle" so the ambient keyframe animates
  // immediately on first paint with no JS. --shimmer-x default at 50%
  // covers the "active but no cursor input yet" state cleanly.
  const style: CSSProperties = {
    ["--shimmer-x" as string]: "50%",
  };

  return (
    <span
      ref={ref}
      data-shimmer="idle"
      style={style}
      className="hero-shimmer inline-block"
    >
      {children}
    </span>
  );
}
