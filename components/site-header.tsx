import Link from "next/link";
import { homeCards } from "@/lib/site";

/**
 * Sticky top nav, cloning enzosison.com's pattern: small text, muted
 * default color that lifts to full-white on hover. Order matches
 * homeCards for consistency with the home page section blocks.
 * "Home" prepended as the first item so users always have a route home
 * from any sub-page.
 */
export function SiteHeader() {
  const items = [{ title: "Home", href: "/" }, ...homeCards];
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-5xl items-center gap-4 overflow-x-auto px-6 py-4 text-sm font-medium sm:gap-6"
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap text-white/60 transition-colors hover:text-white"
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </header>
  );
}
