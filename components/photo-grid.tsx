"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Masonry from "react-masonry-css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import type { Photo } from "@/lib/content";

/**
 * Presentational Photo grid + click-to-lightbox. Accepts photos as a
 * prop so render-layer tests can mount fixture data. The default export
 * in app/photo/page.tsx wraps this with the real `photos` from
 * lib/content.ts.
 *
 * Layout per Ben's Phase 4 dispatch (mid-scaffold decision):
 * - Masonry (varying heights per aspect ratio) via react-masonry-css.
 *   Left-to-right visual flow (row-major), not CSS-columns top-to-bottom.
 * - Column counts: 3 on wide screens (>1279px), 2 on tablet/mid-desktop
 *   (640-1279px), 1 on mobile (<640px). Each tile is large enough for
 *   presence (~500px+ on the 2-col case) rather than thumbnail-sized.
 * - Click-to-lightbox via yet-another-react-lightbox. Keyboard nav
 *   (arrow keys + escape + focus trap) is built into the library.
 * - prefers-reduced-motion strips lightbox transitions.
 * - next/image with sizes attr for per-column responsive delivery;
 *   blurDataURL wired when present so tiles fade in on hydration.
 *
 * Empty-state discipline (Phase 4 scaffold):
 * - photos.length === 0 renders a graceful "Photos coming soon"
 *   placeholder so the route is reachable + typography stable before
 *   Ben's originals land. This branch is server-safe.
 * - photos.length > 0 mounts the masonry grid + lightbox on the client.
 *
 * Dark theme + typography match Phases 0-3.
 */
export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (photos.length === 0) {
    return (
      <div
        data-testid="photo-empty"
        className="flex flex-col gap-3 border-t border-white/10 pt-8"
      >
        <p className="text-sm text-white/60 sm:text-base">
          Photos coming soon.
        </p>
      </div>
    );
  }

  return (
    <>
      <Masonry
        breakpointCols={{ default: 3, 1279: 2, 639: 1 }}
        className="my-masonry-grid flex w-auto -ml-4"
        columnClassName="my-masonry-grid_column pl-4 bg-clip-padding"
        data-testid="photo-grid"
      >
        {photos.map((photo, i) => (
          <figure key={photo.src} className="mb-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={`Open ${photo.alt} in lightbox`}
              className="group relative block w-full overflow-hidden rounded-sm bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                {...(photo.blurDataURL
                  ? {
                      placeholder: "blur" as const,
                      blurDataURL: photo.blurDataURL,
                    }
                  : {})}
                className="object-cover transition-[filter,transform] duration-300 group-hover:brightness-110 motion-safe:group-hover:-translate-y-0.5"
              />
            </button>
            {photo.caption ? (
              <figcaption
                data-testid="photo-caption"
                className="text-xs text-white/50 sm:text-sm"
              >
                {photo.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </Masonry>
      <Lightbox
        open={openIndex !== null}
        index={openIndex ?? 0}
        close={() => setOpenIndex(null)}
        slides={photos.map((p) => ({
          src: p.src,
          alt: p.alt,
          width: p.width,
          height: p.height,
          description: p.caption,
        }))}
        animation={reducedMotion ? { fade: 0, swipe: 0 } : undefined}
      />
    </>
  );
}
