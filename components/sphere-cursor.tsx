"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Custom sphere cursor. Fixed-position circle that follows the mouse with a
 * ~120ms easing lag via requestAnimationFrame; mix-blend-mode: difference
 * inverts against whatever it sits over so it stays legible on light and
 * accent backgrounds without a per-page color prop. Grows on hoverable
 * elements (a, button, [role='button'], [data-cursor-hover]) via a
 * `[data-hover]` attribute swap.
 *
 * Bailout conditions (F2 fix - previously the JSX rendered a permanent
 * 24px black square at (0,0) for these users):
 * - prefers-reduced-motion: reduce
 * - pointer: coarse (touch)
 * We check both once at mount AND subscribe to matchMedia change events so
 * a user toggling reduce-motion mid-session or plugging a mouse into an
 * iPad mid-session gets the right behavior without a reload.
 *
 * When we DO render, we mark <html data-sphere-cursor="active"> so
 * globals.css can scope `cursor: none` to only the case where the sphere
 * cursor is actually visible (prevents the "hybrid device loses cursor
 * entirely" class where cursor:none applies but the sphere bails).
 */
function shouldRenderSphere(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return false;
  return true;
}

export function SphereCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  // Re-evaluate on media-query changes (reduce-motion toggle,
  // trackpad plug-in on iPad, etc.).
  useEffect(() => {
    if (typeof window === "undefined") return;
    setActive(shouldRenderSphere());
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hoverFine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const onChange = () => setActive(shouldRenderSphere());
    reduce.addEventListener("change", onChange);
    hoverFine.addEventListener("change", onChange);
    return () => {
      reduce.removeEventListener("change", onChange);
      hoverFine.removeEventListener("change", onChange);
    };
  }, []);

  // Toggle a data attribute on <html> so globals.css can scope cursor:none
  // to the active state. Without this, hybrid devices where the sphere
  // bails leave the native cursor hidden with no replacement.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (active) {
      document.documentElement.dataset.sphereCursor = "active";
    } else {
      delete document.documentElement.dataset.sphereCursor;
    }
    return () => {
      delete document.documentElement.dataset.sphereCursor;
    };
  }, [active]);

  // Mouse-follow rAF loop. Only runs while active. Includes an idle-out
  // optimization so the loop pauses when the mouse hasn't moved and the
  // dot has settled at the target position.
  useEffect(() => {
    if (!active) return;
    const dot = dotRef.current;
    if (!dot) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let raf = 0;
    let idle = false;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const t = e.target;
      const isHoverable =
        t instanceof Element &&
        !!t.closest("a, button, [role='button'], [data-cursor-hover]");
      dot.dataset.hover = isHoverable ? "true" : "false";
      if (idle) {
        idle = false;
        raf = window.requestAnimationFrame(tick);
      }
    };

    const tick = () => {
      // Easing constant. 0.18 = smooth ~120ms trailing lag; higher = snappier.
      currentX += (mouseX - currentX) * 0.18;
      currentY += (mouseY - currentY) * 0.18;
      dot.style.transform = `translate3d(${currentX - 12}px, ${currentY - 12}px, 0)`;
      // Idle-out: if we're within 0.5px of the target, stop the loop and
      // wait for the next mousemove to resume. Saves battery on laptops.
      if (Math.abs(mouseX - currentX) < 0.5 && Math.abs(mouseY - currentY) < 0.5) {
        idle = true;
        return;
      }
      raf = window.requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.cancelAnimationFrame(raf);
    };
  }, [active]);

  // F2 fix: return null when we're not going to run. Previously the JSX
  // rendered unconditionally, leaving a stuck 24px block for reduce-motion
  // and coarse-pointer users.
  if (!active) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] size-6 rounded-full bg-white mix-blend-difference transition-[width,height,margin] duration-200 ease-out data-[hover=true]:size-10 data-[hover=true]:-ml-2 data-[hover=true]:-mt-2"
    />
  );
}
