"use client";

import { useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import type { Photo } from "@/lib/content";

/**
 * Presentational Photo grid + click-to-lightbox. Accepts photos as a
 * prop so render-layer tests can mount fixture data. The default export
 * in app/photo/page.tsx wraps this with the real `photos` from
 * lib/content.ts (which re-exports the generated array).
 *
 * Rendering: native <img srcSet=... sizes=...>. The srcSet lists the
 * pre-generated variants from scripts/populate-photos.mjs (640/828/
 * 1200/1920 mozjpeg), so responsive delivery is a static-asset lookup
 * and Vercel's image optimizer is not invoked. This keeps hosting cost
 * at zero and gives predictable quality per Ben's Y on 82% mozjpeg.
 *
 * Layout per Ben's Phase 4 dispatch (mid-scaffold decision):
 * - Masonry (varying heights per aspect ratio) via react-masonry-css.
 *   breakpointCols default:3 / 1279:2 / 639:1.
 * - Click-to-lightbox via yet-another-react-lightbox. Keyboard nav
 *   (arrows + escape + focus trap) is library-provided.
 * - prefers-reduced-motion strips lightbox animations.
 * - blurDataURL is painted as the button's backgroundImage so tiles
 *   show a low-frequency preview before the JPG loads; the loaded
 *   img covers it via absolute-fill + object-cover.
 * - Every tile is a <button> with aria-label mentioning alt so
 *   keyboard-only users can open the lightbox with Enter/Space.
 *
 * Empty-state discipline (Phase 4 scaffold):
 * - photos.length === 0 renders a graceful "Photos coming soon"
 *   placeholder. Retained after populate so the render tests + a
 *   future truncation guard still exercise this branch.
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
              style={{
                aspectRatio: `${photo.width} / ${photo.height}`,
                backgroundImage: photo.blurDataURL
                  ? `url("${photo.blurDataURL}")`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                {...(photo.srcSet ? { srcSet: photo.srcSet } : {})}
                sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-[filter,transform] duration-300 group-hover:brightness-110 motion-safe:group-hover:-translate-y-0.5"
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
          ...(p.srcSet
            ? {
                srcSet: p.srcSet.split(", ").map((entry) => {
                  const [src, w] = entry.split(" ");
                  return {
                    src,
                    width: parseInt(w, 10),
                    height: Math.round(
                      (parseInt(w, 10) * p.height) / p.width,
                    ),
                  };
                }),
              }
            : {}),
        }))}
        animation={reducedMotion ? { fade: 0, swipe: 0 } : undefined}
      />
    </>
  );
}
