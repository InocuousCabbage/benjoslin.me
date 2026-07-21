"use client";

import { useEffect, useState } from "react";

/**
 * Renders the current year. Client-side so the SSG'd footer year doesn't
 * freeze at build time. Next 16 App Router pattern per vercel:nextjs skill
 * hydration-error guidance (Date-in-Server-Component is a hydration
 * mismatch source): render a stable fallback on the server, replace at
 * hydration with the real year. Uses a build-time year for the initial
 * pass so first-paint reads correct 24h/day at the moment of build; the
 * hydration swap covers the year-rollover edge case.
 */
const BUILD_YEAR = new Date().getFullYear();

export function CurrentYear() {
  const [year, setYear] = useState<number>(BUILD_YEAR);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return <>{year}</>;
}
