"use client";

import Link from "next/link";
import { type CSSProperties, type MouseEvent, useEffect, useRef, useState } from "react";

/**
 * Home section block (B1 + D2 + D4 + D6 composed).
 *
 * B1: typographic block, borderless, hairline `border-t border-white/5`
 * between blocks (first:border-t-0 skips the leading divider so the hero
 * isn't double-underlined). No shadcn Card wrapper.
 * D2: 01/02/03/04/05 muted display prefix at left.
 * D4 (interpretation b per weemeemee): soft radial gradient inside the
 * block anchored to cursor position, revealed on group-hover/group-focus-
 * within. Falls back to a centered gradient (--cursor-x: 50% / --cursor-y:
 * 50% defaults) on prefers-reduced-motion or coarse-pointer devices. Move
 * handler is rAF-throttled to one style write per frame.
 * D6: kinetic arrow micro on the "Read more" affordance. Fires on hover AND
 * keyboard focus so keyboard-only users get the same affordance.
 *
 * Rendered as an <li> inside the parent <ul> for correct AT semantics
 * (an earlier iteration used the article element, which announces
 * sub-optimally when nested inside the sections nav).
 */
export function SectionBlock({
  index,
  title,
  subtitle,
  href,
}: {
  index: number;
  title: string;
  subtitle: string;
  href: string;
}) {
  const ref = useRef<HTMLLIElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [trackCursor, setTrackCursor] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hoverFine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const evaluate = () => setTrackCursor(!reduce.matches && hoverFine.matches);
    evaluate();
    reduce.addEventListener("change", evaluate);
    hoverFine.addEventListener("change", evaluate);
    return () => {
      reduce.removeEventListener("change", evaluate);
      hoverFine.removeEventListener("change", evaluate);
    };
  }, []);

  // Cancel any pending rAF on unmount so we don't leak the closure.
  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const onMove = trackCursor
    ? (e: MouseEvent<HTMLLIElement>) => {
        const el = ref.current;
        if (!el) return;
        const clientX = e.clientX;
        const clientY = e.clientY;
        // Batch getBoundingClientRect + two setProperty writes into a
        // single rAF per frame. Same-class F7 codification.
        if (rafRef.current != null) return;
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          const rect = el.getBoundingClientRect();
          el.style.setProperty("--cursor-x", `${clientX - rect.left}px`);
          el.style.setProperty("--cursor-y", `${clientY - rect.top}px`);
        });
      }
    : undefined;

  // CSS custom-property defaults so the gradient centers itself when
  // cursor-tracking is off (reduced-motion / coarse pointer). Radius is
  // fixed at 400px; opacity ramps via the group-hover overlay class below.
  const style: CSSProperties = {
    ["--cursor-x" as string]: "50%",
    ["--cursor-y" as string]: "50%",
  };

  return (
    <li
      ref={ref}
      onMouseMove={onMove}
      style={style}
      className="group relative list-none border-t border-white/5 first:border-t-0"
    >
      {/* D4 radial-gradient sheen overlay. inset-0 fills the block.
       * Opacity ramps on hover OR keyboard focus so keyboard-only users
       * get the same affordance mouse users get. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
        style={{
          background:
            "radial-gradient(400px circle at var(--cursor-x) var(--cursor-y), rgba(255,255,255,0.05), transparent 70%)",
        }}
      />
      <Link
        href={href}
        className="relative grid grid-cols-[auto_1fr_auto] items-baseline gap-4 py-8 sm:gap-6 sm:py-10"
      >
        <span
          aria-hidden
          className="font-display text-3xl font-semibold text-white/20 tabular-nums sm:text-4xl"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <div>
          <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight text-white transition-opacity group-hover:opacity-95 group-focus-within:opacity-95 sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 text-sm text-white/60 group-hover:text-white/80 group-focus-within:text-white/80 sm:text-base">
            {subtitle}
          </p>
        </div>
        {/* D6 kinetic arrow micro. "Read more" underline reveals on hover
         * OR focus; arrow character translates right on hover OR focus.
         * Focus-within mirroring keeps keyboard nav parity with mouse. */}
        <p className="hidden shrink-0 items-center gap-2 text-sm text-white/60 sm:flex">
          <span className="relative">
            Read more
            <span
              aria-hidden
              className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100 group-focus-within:scale-x-100"
            />
          </span>
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-1 group-focus-within:translate-x-1"
          >
            &rarr;
          </span>
        </p>
      </Link>
    </li>
  );
}
