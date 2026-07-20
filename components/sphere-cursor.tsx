"use client";

import { useEffect, useRef } from "react";

/**
 * Custom sphere cursor. Fixed-position circle that follows the mouse with a
 * ~120ms easing lag via requestAnimationFrame; mix-blend-mode: difference
 * inverts against whatever it sits over so it stays legible on light and
 * accent backgrounds without needing a per-page color prop. Grows on
 * hoverable elements (a, button, [role='button']) via a `[data-hover]`
 * attribute swap.
 *
 * Reduced-motion users get an early return so nothing follows the pointer
 * and the native cursor stays visible (globals.css also drops cursor:none
 * for that media query).
 *
 * Pointer devices only: the cursor is hidden on coarse pointers (touch) via
 * a media-query check at mount so we don't paint an unused DOM node on
 * mobile Safari.
 */
export function SphereCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot = dotRef.current;
    if (!dot) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const t = e.target;
      const isHoverable =
        t instanceof Element &&
        !!t.closest("a, button, [role='button'], [data-cursor-hover]");
      dot.dataset.hover = isHoverable ? "true" : "false";
    };

    const tick = () => {
      // Easing constant. 0.18 = smooth ~120ms trailing lag; higher = snappier.
      currentX += (mouseX - currentX) * 0.18;
      currentY += (mouseY - currentY) * 0.18;
      dot.style.transform = `translate3d(${currentX - 12}px, ${currentY - 12}px, 0)`;
      raf = window.requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden size-6 rounded-full bg-white mix-blend-difference transition-[width,height,margin] duration-200 ease-out data-[hover=true]:size-10 data-[hover=true]:-ml-2 data-[hover=true]:-mt-2 md:block"
    />
  );
}
