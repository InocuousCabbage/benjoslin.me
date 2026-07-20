import type { Metadata } from "next";
import { Raleway, Roboto } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { SiteFooter } from "@/components/site-footer";
import { SphereCursor } from "@/components/sphere-cursor";

/* Raleway = display / heading font (matches current benjoslin.me Squarespace
 * CSS extract). Roboto = body font (same extract). Both loaded via next/font
 * so they're inlined at build time and don't block LCP.
 */
const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${site.domain}`),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description:
    "Ben Joslin: career, education, projects, photography, and music.",
  robots: { index: true, follow: true },
};

/* JSON-LD Person schema. Personal site, so schema.org/Person is the right
 * type here (a business type would be wrong for a portfolio). Server-rendered
 * inline so it ships with the HTML. Fields kept minimal until Ben confirms
 * extended bio content. */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: `https://${site.domain}`,
  sameAs: [
    site.socials.linkedin,
    site.socials.github,
    site.socials.instagram,
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${raleway.variable} ${roboto.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SphereCursor />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  );
}
