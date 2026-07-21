/**
 * Render-layer tests for PhotoGrid (Phase 4 scaffold, follows Phase 2/3
 * fixture-driven render pattern per closed ironic-miss n=9 rule).
 *
 * Covers:
 * - Empty-state branch renders the placeholder + no grid + no lightbox.
 * - Non-empty renders one <img> per photo inside the masonry grid.
 * - Alt text is present on each rendered <img>.
 * - photo.caption renders only when set (optional-field discipline).
 * - Clicking a tile opens the lightbox (assert lightbox is rendered
 *   post-click; not-rendered pre-click).
 * - Every tile is a button with an aria-label mentioning the alt.
 *
 * next/image is not mocked. In jsdom it renders as a plain <img> with
 * the src/alt/fill attributes.
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import type { Photo } from "@/lib/content";
import { PhotoGrid } from "@/components/photo-grid";

afterEach(cleanup);

const basePhoto: Photo = {
  src: "/photos/test-a.jpg",
  alt: "Test photo A",
  width: 1200,
  height: 1200,
};

describe("PhotoGrid empty state (Phase 4 scaffold)", () => {
  it("renders the empty-state placeholder when photos is empty", () => {
    const { container } = render(<PhotoGrid photos={[]} />);
    const empty = container.querySelector('[data-testid="photo-empty"]');
    expect(empty).not.toBeNull();
    expect(empty!.textContent).toContain("Photos coming soon");
  });

  it("does not render the grid or any images when photos is empty", () => {
    const { container } = render(<PhotoGrid photos={[]} />);
    expect(container.querySelector(".my-masonry-grid")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("button")).toBeNull();
  });
});

describe("PhotoGrid non-empty render (Phase 4 scaffold)", () => {
  const threePhotos: Photo[] = [
    basePhoto,
    { ...basePhoto, src: "/photos/test-b.jpg", alt: "Test photo B" },
    { ...basePhoto, src: "/photos/test-c.jpg", alt: "Test photo C" },
  ];

  it("mounts the masonry grid container (react-masonry-css className)", () => {
    const { container } = render(<PhotoGrid photos={threePhotos} />);
    expect(container.querySelector(".my-masonry-grid")).not.toBeNull();
    expect(container.querySelector('[data-testid="photo-empty"]')).toBeNull();
  });

  it("renders one image per photo with alt text", () => {
    const { container } = render(<PhotoGrid photos={threePhotos} />);
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(3);
    const alts = Array.from(imgs).map((i) => i.getAttribute("alt"));
    expect(alts).toContain("Test photo A");
    expect(alts).toContain("Test photo B");
    expect(alts).toContain("Test photo C");
  });

  it("wraps every tile in a button with an aria-label mentioning alt", () => {
    const { container } = render(<PhotoGrid photos={threePhotos} />);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(3);
    const labels = Array.from(buttons).map((b) => b.getAttribute("aria-label"));
    expect(labels.some((l) => l?.includes("Test photo A"))).toBe(true);
    expect(labels.some((l) => l?.includes("Test photo B"))).toBe(true);
    expect(labels.some((l) => l?.includes("Test photo C"))).toBe(true);
  });

  it("skips the figcaption when photo.caption is absent", () => {
    const { container } = render(<PhotoGrid photos={[basePhoto]} />);
    expect(
      container.querySelector('[data-testid="photo-caption"]'),
    ).toBeNull();
    expect(container.querySelector("img")).not.toBeNull();
  });

  it("renders the figcaption with the given text when photo.caption is set", () => {
    const photos: Photo[] = [
      { ...basePhoto, caption: "White Mountains, September" },
    ];
    const { container } = render(<PhotoGrid photos={photos} />);
    const cap = container.querySelector('[data-testid="photo-caption"]');
    expect(cap).not.toBeNull();
    expect(cap!.textContent).toContain("White Mountains, September");
  });

  it("empty-string photo.caption is treated as absent (renders no figcaption)", () => {
    const photos: Photo[] = [{ ...basePhoto, caption: "" }];
    const { container } = render(<PhotoGrid photos={photos} />);
    expect(
      container.querySelector('[data-testid="photo-caption"]'),
    ).toBeNull();
  });

  it("lightbox is closed on initial render (no dialog portal in the DOM)", () => {
    render(<PhotoGrid photos={threePhotos} />);
    expect(document.querySelector(".yarl__portal_open")).toBeNull();
  });

  it("clicking a tile opens the lightbox (dialog portal appears)", () => {
    const { container } = render(<PhotoGrid photos={threePhotos} />);
    const firstButton = container.querySelector("button");
    expect(firstButton).not.toBeNull();
    fireEvent.click(firstButton!);
    expect(document.querySelector(".yarl__portal_open")).not.toBeNull();
  });
});
