import Link from "next/link";
import { site } from "@/lib/site";

/**
 * Minimal footer. Ben's spec: LinkedIn + GitHub + Instagram only, no X/Twitter,
 * no contact form, no other socials.
 */
export function SiteFooter() {
  const socials: Array<{ label: string; href: string }> = [
    { label: "LinkedIn", href: site.socials.linkedin },
    { label: "GitHub", href: site.socials.github },
    { label: "Instagram", href: site.socials.instagram },
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center">
        <p>&copy; {new Date().getFullYear()} {site.name}</p>
        <nav aria-label="Socials" className="flex gap-5">
          {socials.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-[color:var(--hover-blue)]"
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
