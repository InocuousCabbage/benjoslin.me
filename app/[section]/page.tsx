import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/coming-soon";
import { homeCards } from "@/lib/site";

/**
 * Dynamic route stub. Consolidates the five sub-route ComingSoon stubs
 * (/career, /education, /projects, /photo, /music) into a single file so
 * title + canonical + segment name can't drift out of sync with lib/site.ts
 * homeCards. Only the segments in homeCards resolve; anything else 404s.
 */

/**
 * Static-generate one page per still-stub section. Segments that have
 * their own dedicated `app/<segment>/page.tsx` (currently /career and
 * /education per Phase 2) are excluded so the build doesn't emit
 * duplicate ComingSoon routes and so a delete of the dedicated file
 * falls through to a 404 instead of silently reverting to a stub.
 */
const DEDICATED_ROUTES = new Set([
  "/career",
  "/education",
  "/projects",
  "/photo",
  "/music",
]);

export function generateStaticParams() {
  return homeCards
    .filter((c) => !DEDICATED_ROUTES.has(c.href))
    .map((c) => ({ section: c.href.replace(/^\//, "") }));
}

// Only the known segments resolve; strays 404.
export const dynamicParams = false;

function cardForSegment(segment: string) {
  const href = `/${segment}`;
  if (DEDICATED_ROUTES.has(href)) return undefined;
  return homeCards.find((c) => c.href === href);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const card = cardForSegment(section);
  if (!card) return {};
  return {
    title: card.title,
    alternates: { canonical: `/${section}` },
  };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const card = cardForSegment(section);
  if (!card) notFound();
  return <ComingSoon title={card.title} />;
}
