"use client";

import type { ReactNode } from "react";
import { MiniPlayerProvider } from "@/lib/mini-player-context";
import { MiniPlayer } from "@/components/mini-player";
import { tracks } from "@/lib/content";

/**
 * Client boundary for the site-wide mini-player. Wraps app children
 * with the MiniPlayerProvider (state) and renders the MiniPlayer as
 * a sibling so it survives route unmount.
 *
 * Mounted from app/layout.tsx; keeps RootLayout itself a server
 * component (the Provider hook needs a client boundary but layout
 * metadata + fonts + JSON-LD stay server-rendered).
 */
export function MiniPlayerRoot({ children }: { children: ReactNode }) {
  return (
    <MiniPlayerProvider trackCount={tracks.length}>
      {children}
      <MiniPlayer />
    </MiniPlayerProvider>
  );
}
