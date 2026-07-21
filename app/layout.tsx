import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GrainOverlay } from "@/components/grain-overlay";
import { MiniPlayerRoot } from "@/components/mini-player-root";

/* Inter (body) + Geist (display / heading), matching the enzosison.com
 * visual-clone directive. Both loaded via next/font so they're inlined at
 * build time and don't block LCP.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

/**
 * viewportFit=cover is load-bearing: the mini-player at
 * components/mini-player.tsx uses env(safe-area-inset-bottom/right)
 * to avoid the iPhone home-indicator gesture zone. Without cover,
 * iOS Safari returns 0 for those env values and the padding ships
 * as dead code (F1 from xhigh iter-0). Keep aligned with the
 * mini-player's safe-area usage; a delete of either side re-opens
 * the class.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
 * type here. No image field since Ben's home explicitly has no headshot.
 */
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
      className={`${inter.variable} ${geist.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-black text-white">
        <GrainOverlay />
        <MiniPlayerRoot>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </MiniPlayerRoot>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <Script
          src="https://w.soundcloud.com/player/api.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
