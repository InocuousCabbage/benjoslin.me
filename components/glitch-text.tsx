"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * V3 signature moment: glitch-text easter egg on hover.
 *
 * Wraps a string. On mouseenter, each character briefly cycles through
 * random glyphs from GLYPH_POOL with a per-character stagger, then
 * resolves back to the original. Small surface area, hover-only, low
 * distraction.
 *
 * Bailouts:
 * - prefers-reduced-motion: skip the glitch entirely; render the
 *   original text as plain text so screen readers + reduced-motion
 *   users see stable characters at all times.
 *
 * Accessibility: the wrapping span keeps the original children as its
 * canonical text via aria-label. During the glitch cycle, character
 * spans are rendered but marked aria-hidden so screen readers announce
 * only the label. When settled, aria-hidden text matches the label.
 */

const GLYPH_POOL = "!@#$%^&*()_+-=[]{}<>?/|\\~`abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function pickGlyph(): string {
  return GLYPH_POOL[Math.floor(Math.random() * GLYPH_POOL.length)];
}

export function GlitchText({ children }: { children: string }) {
  const original = children;
  const [display, setDisplay] = useState(original);
  const [motionOk, setMotionOk] = useState(true);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const evaluate = () => setMotionOk(!reduce.matches);
    evaluate();
    reduce.addEventListener("change", evaluate);
    return () => reduce.removeEventListener("change", evaluate);
  }, []);

  // Cleanup any pending timeouts on unmount so we don't leak or write
  // to a stale component.
  useEffect(() => {
    return () => {
      for (const id of timeoutsRef.current) window.clearTimeout(id);
      timeoutsRef.current = [];
    };
  }, []);

  const clearAllTimeouts = () => {
    for (const id of timeoutsRef.current) window.clearTimeout(id);
    timeoutsRef.current = [];
  };

  const runGlitch = useCallback(() => {
    if (!motionOk) return;
    clearAllTimeouts();
    const chars = original.split("");
    // Each character cycles through 3-4 random glyphs staggered by
    // index, then settles back to the original character. Total
    // duration ~500ms for a 25-char string.
    const CYCLES_PER_CHAR = 4;
    const STAGGER_MS = 15;
    const CYCLE_MS = 40;
    const workingChars = [...chars];
    chars.forEach((originalChar, i) => {
      // Preserve spaces + non-alnum punctuation so the shape reads.
      const isCycled = /[a-zA-Z0-9]/.test(originalChar);
      if (!isCycled) return;
      for (let step = 0; step < CYCLES_PER_CHAR; step++) {
        const id = window.setTimeout(() => {
          workingChars[i] = pickGlyph();
          setDisplay(workingChars.join(""));
        }, i * STAGGER_MS + step * CYCLE_MS);
        timeoutsRef.current.push(id);
      }
      // Final settle: original character.
      const settleId = window.setTimeout(
        () => {
          workingChars[i] = originalChar;
          setDisplay(workingChars.join(""));
        },
        i * STAGGER_MS + CYCLES_PER_CHAR * CYCLE_MS,
      );
      timeoutsRef.current.push(settleId);
    });
  }, [motionOk, original]);

  const reset = useCallback(() => {
    clearAllTimeouts();
    setDisplay(original);
  }, [original]);

  return (
    <span
      aria-label={original}
      onMouseEnter={runGlitch}
      onMouseLeave={reset}
      className="cursor-default"
    >
      <span aria-hidden>{display}</span>
    </span>
  );
}
