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

// Static-generate one page per known section so the routes still ship as
// pre-rendered HTML at build time (matches the Phase 0 shape: 5 static
// stubs, no dynamic runtime).
export function generateStaticParams() {
  return homeCards.map((c) => ({ section: c.href.replace(/^\//, "") }));
}

// Only the known segments resolve; strays 404.
export const dynamicParams = false;

function cardForSegment(segment: string) {
  return homeCards.find((c) => c.href === `/${segment}`);
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
