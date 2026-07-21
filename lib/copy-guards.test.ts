/**
 * Regression guards for benjoslin.me. Grep-based tests that fail loud if a
 * banned string reappears in the source tree or lands in a user-visible
 * root markdown. Rewritten with Phase 0 visual clone in mind (dark theme,
 * Inter+Geist fonts, typographic section links, Enzo-pattern footer).
 *
 * Ben's standing rules enforced here:
 * - No em dashes anywhere (literal U+2014). Root markdown scanned outside
 *   any explicit v1-HISTORICAL section.
 * - No AI-tell adjective class (delve, leverage, seamless, robust,
 *   meticulous, cutting-edge, utilize, furthermore, moreover, "in
 *   conclusion", "it is important to note"). Case-insensitive.
 * - No aspirational-completeness "done" phrasings (done look, done every
 *   visit, etc). Bellamy-context lesson generalized here.
 * - No #morethanjustlawns (Bellamy holdover; keep the pattern of banning
 *   inherited-Squarespace hashtags in one place).
 *
 * The guards INTENTIONALLY exclude this file itself (which contains the
 * banned literals as assertion strings).
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { homeCards, site } from "@/lib/site";

const REPO_ROOT = join(__dirname, "..");

function grepScanned(pattern: string, opts?: { ignoreCase?: boolean }): string[] {
  const args = [
    "-rln",
    ...(opts?.ignoreCase ? ["-i"] : []),
    "-F",
    pattern,
    "app",
    "components",
    "lib",
  ];
  const result = spawnSync("grep", args, { cwd: REPO_ROOT, encoding: "utf-8" });
  if (result.status === 1) return [];
  if (result.status !== 0) {
    throw new Error(`grep failed: status=${result.status} stderr=${result.stderr}`);
  }
  return (result.stdout || "")
    .split("\n")
    .filter((line) => line && !line.endsWith("copy-guards.test.ts"));
}

describe("README content-guard (pivot-history stale-drift, iter-3 F17 codified)", () => {
  // README.md drifted in iter-3 because the pivot rewrote fonts + removed
  // the sphere cursor but README kept describing the pre-pivot state as
  // current. Codify: bans the pre-pivot terms in README so a future pivot
  // that forgets to update README fails loud.
  const README = readFileSync(join(REPO_ROOT, "README.md"), "utf-8");
  const BANNED_IN_README = [
    "Raleway",
    "Roboto",
    "sphere-cursor",
    "sphere cursor",
    "hover-blue",
    "#00b2ff",
    "cursor: none",
  ];
  for (const term of BANNED_IN_README) {
    it(`README does not describe pre-pivot term "${term}" as current`, () => {
      expect(README).not.toContain(term);
    });
  }
});

describe("copy-guards", () => {
  it("does not ship em dash (U+2014) anywhere in the source tree", () => {
    expect(grepScanned("—")).toEqual([]);
  });

  it("does not ship '#morethanjustlawns' (Bellamy holdover; keep the pattern in one place)", () => {
    expect(grepScanned("#morethanjustlawns")).toEqual([]);
  });

  it("does not ship AI-tell adjectives (delve, leverage, seamless, robust, meticulous, ...)", () => {
    const AI_TELLS = [
      "delve",
      "delves",
      "delving",
      "leverage",
      "leverages",
      "leveraging",
      "seamless",
      "seamlessly",
      "robust",
      "robustly",
      "meticulous",
      "meticulously",
      "cutting-edge",
      "cutting edge",
      "utilize",
      "utilizes",
      "utilizing",
      "furthermore",
      "moreover",
      "in conclusion",
      "it is important to note",
    ];
    for (const term of AI_TELLS) {
      const hits = grepScanned(term, { ignoreCase: true });
      expect(hits, `AI-tell "${term}" found in: ${hits.join(", ")}`).toEqual([]);
    }
  });

  it("does not ship aspirational-completeness 'done' phrasings", () => {
    const asp = [
      "a done one",
      "looking done",
      "done every visit",
      "done every time",
      "a done property",
      "done property",
      "done look",
    ];
    for (const phrase of asp) {
      const hits = grepScanned(phrase);
      expect(
        hits,
        `aspirational-completeness "done" phrase found: "${phrase}"`,
      ).toEqual([]);
    }
  });

  it("does not ship authored em dash (U+2014) in user-visible root markdown", () => {
    const rootDocs = readdirSync(REPO_ROOT).filter(
      (f) => f.endsWith(".md") && f !== "AGENTS.md",
    );
    const violations: string[] = [];
    for (const doc of rootDocs) {
      const path = join(REPO_ROOT, doc);
      const text = readFileSync(path, "utf-8");
      const historicalMarker = /^##\s+.*\bv1 HISTORICAL\b/m;
      const match = historicalMarker.exec(text);
      const authoredContent = match ? text.slice(0, match.index) : text;
      const lines = authoredContent.split("\n");
      lines.forEach((line, i) => {
        if (line.includes("—")) {
          violations.push(`${doc}:${i + 1}: ${line.trim().slice(0, 80)}`);
        }
      });
    }
    expect(violations).toEqual([]);
  });

  // xhigh iter-2 F16 codified: pin exact URLs per social. Split per social
  // so a single failure doesn't hide the state of the other two. Adversarial-
  // verified (inject benjoslin7, confirm 3 tests fail, revert).
  it("site.socials.github pins to Ben's exact known handle", () => {
    expect(site.socials.github).toBe("https://github.com/benjoslin");
  });
  it("site.socials.linkedin pins to Ben's exact known handle", () => {
    expect(site.socials.linkedin).toBe("https://www.linkedin.com/in/benjoslin/");
  });
  it("site.socials.instagram pins to Ben's exact known handle", () => {
    expect(site.socials.instagram).toBe("https://www.instagram.com/benjoslin/");
  });
});

describe("visual clone (enzosison.com pattern)", () => {
  it("layout body uses dark theme (bg-black text-white)", () => {
    const layout = readFileSync(join(REPO_ROOT, "app", "layout.tsx"), "utf-8");
    expect(layout).toMatch(/bg-black/);
    expect(layout).toMatch(/text-white/);
    // Guard against light-theme leakage from the pre-pivot Squarespace palette.
    expect(layout).not.toMatch(/bg-\[?#f6f6f6\]?/);
    expect(layout).not.toMatch(/#00b2ff/);
  });

  it("globals.css sets --background to black and --foreground to white", () => {
    const css = readFileSync(join(REPO_ROOT, "app", "globals.css"), "utf-8");
    expect(css).toMatch(/--background:\s*#000000/);
    expect(css).toMatch(/--foreground:\s*#ffffff/);
    // Sphere-cursor rules removed cleanly.
    expect(css).not.toContain("cursor: none");
    // Pre-pivot hover accent should be gone.
    expect(css).not.toContain("#00b2ff");
    expect(css).not.toContain("--hover-blue");
  });

  it("layout registers Inter + Geist next/font families as function calls", () => {
    const layout = readFileSync(join(REPO_ROOT, "app", "layout.tsx"), "utf-8");
    expect(layout).toContain("Inter(");
    expect(layout).toContain("Geist(");
    expect(layout).toMatch(/inter\.variable/);
    expect(layout).toMatch(/geist\.variable/);
    // Pre-pivot fonts should be gone.
    expect(layout).not.toContain("Raleway");
    expect(layout).not.toContain("Roboto");
  });

  it("sphere cursor is fully removed (no component, no mount, no CSS)", () => {
    // Component file should be gone.
    const componentsDir = readdirSync(join(REPO_ROOT, "components"));
    expect(componentsDir).not.toContain("sphere-cursor.tsx");
    // Layout should not mount it.
    const layout = readFileSync(join(REPO_ROOT, "app", "layout.tsx"), "utf-8");
    expect(layout).not.toContain("SphereCursor");
    expect(layout).not.toContain("sphere-cursor");
  });

  it("home page renders typographic section links (Read more pattern), not shadcn Card wrappers", () => {
    const home = readFileSync(join(REPO_ROOT, "app", "page.tsx"), "utf-8");
    // Read more anchor pattern present.
    expect(home).toContain("Read more");
    // No shadcn Card wrapping the section links.
    expect(home).not.toMatch(/from ["']@\/components\/ui\/card["']/);
    expect(home).not.toContain("<Card");
  });

  it("layout renders SiteHeader + SiteFooter", () => {
    const layout = readFileSync(join(REPO_ROOT, "app", "layout.tsx"), "utf-8");
    expect(layout).toContain("<SiteHeader");
    expect(layout).toContain("<SiteFooter");
  });

  it("SiteHeader nav spreads the entire homeCards array (no slice / filter drift)", () => {
    const header = readFileSync(
      join(REPO_ROOT, "components", "site-header.tsx"),
      "utf-8",
    );
    // Reads homeCards from lib/site.ts.
    expect(header).toContain("homeCards");
    // Home is explicitly prepended.
    expect(header).toMatch(/["']Home["']/);
    // xhigh iter-3 F18: strengthen. If SiteHeader stops spreading the whole
    // homeCards array (e.g. .slice(0, 3), or a .filter that drops one) the
    // render output silently drops sections. The header is data-driven so
    // titles/hrefs don't appear as literal strings in the source; catch the
    // drift by banning array-narrowing methods on the homeCards spread.
    // A future re-order or shape change is fine; a truncation is not.
    expect(header).not.toMatch(/homeCards\s*\.\s*slice\b/);
    expect(header).not.toMatch(/homeCards\s*\.\s*filter\b/);
    // Iterate pattern must be present so the array actually renders.
    expect(header).toMatch(/\.map\s*\(/);
    // Belt-and-suspenders: assert item.title AND item.href are rendered so
    // a future refactor that drops one field is caught. (item name may be
    // anything - the test just needs the property access shape to exist.)
    expect(header).toMatch(/\.title/);
    expect(header).toMatch(/\.href/);
  });

  it("SiteFooter uses a client CurrentYear component (no SSG-frozen year)", () => {
    // xhigh iter-3 F19 codified: `new Date().getFullYear()` in a Server
    // Component freezes at build time. Fix pattern is a client component
    // that reads the year at hydration. Guard against a revert that puts
    // `new Date()` back into SiteFooter itself.
    const footer = readFileSync(
      join(REPO_ROOT, "components", "site-footer.tsx"),
      "utf-8",
    );
    expect(footer).toContain("<CurrentYear");
    expect(footer).not.toContain("new Date()");
    const currentYear = readFileSync(
      join(REPO_ROOT, "components", "current-year.tsx"),
      "utf-8",
    );
    expect(currentYear).toMatch(/["']use client["']/);
  });

  it("SiteFooter uses Enzo verbatim copyright + icon row (LinkedIn/GitHub/Instagram)", () => {
    const footer = readFileSync(
      join(REPO_ROOT, "components", "site-footer.tsx"),
      "utf-8",
    );
    // xhigh iter-5 F22 codified: Ben chose verbatim Enzo copyright.
    // No 'Ben Joslin' prefix in the copyright line, no site.name reference
    // in the footer copy at all.
    expect(footer).toContain("All rights reserved");
    expect(footer).not.toMatch(/\{site\.name\}\s*&copy;/);
    expect(footer).not.toMatch(/\{site\.name\}\s*©/);
    expect(footer).not.toMatch(/Ben Joslin\s*&copy;/);
    // Inline SVG icon components for the three socials (lucide-react's
    // brand marks were removed for trademark reasons; inline SVG keeps
    // deps + hover behavior clean).
    expect(footer).toMatch(/LinkedinIcon/);
    expect(footer).toMatch(/GithubIcon/);
    expect(footer).toMatch(/InstagramIcon/);
    // All three socials must be represented via the site.socials pin.
    expect(footer).toContain("site.socials.linkedin");
    expect(footer).toContain("site.socials.github");
    expect(footer).toContain("site.socials.instagram");
  });

  it("SiteHeader container matches hero max-width (max-w-3xl, iter-5 F21)", () => {
    // Ben post-preview F21: narrow nav to match hero max-w-3xl. Enzo has
    // a mismatch (nav wider than hero); Ben chose the cleaner symmetric
    // shape. Pin the width so a future refactor doesn't drift back to
    // the wider max-w-5xl default.
    const header = readFileSync(
      join(REPO_ROOT, "components", "site-header.tsx"),
      "utf-8",
    );
    expect(header).toMatch(/max-w-3xl/);
    expect(header).not.toMatch(/max-w-5xl/);
  });

  it("home page uses site.name for hero and does not hard-code the name string", () => {
    const home = readFileSync(join(REPO_ROOT, "app", "page.tsx"), "utf-8");
    expect(home).toContain("site.name");
    // xhigh iter-1 F4: bare JSX guard.
    expect(home).not.toMatch(/Ben\s+Joslin/);
  });

  it("home page does not include a hero image (no headshot per Ben spec)", () => {
    const home = readFileSync(join(REPO_ROOT, "app", "page.tsx"), "utf-8");
    // <img> is allowed in the optional footer-photo slot (conditional on
    // homeFooterPhoto being non-null). That's an Enzo-pattern lifestyle
    // photo, not a hero headshot. Guard the HERO region specifically:
    // extract the <header>...</header> block and assert no img/Image there.
    const heroMatch = home.match(/<header[\s\S]*?<\/header>/);
    expect(heroMatch).not.toBeNull();
    expect(heroMatch![0]).not.toMatch(/<img\b/i);
    expect(heroMatch![0]).not.toMatch(/next\/image/);
  });

  it("layout ships schema.org Person JSON-LD (not a business type)", () => {
    const layout = readFileSync(join(REPO_ROOT, "app", "layout.tsx"), "utf-8");
    expect(layout).toContain('"@type": "Person"');
    for (const businessType of ["LocalBusiness", "Organization", "Corporation"]) {
      expect(layout).not.toContain(`"@type": "${businessType}"`);
    }
  });

  it("home lists exactly the 5 spec'd section cards", () => {
    const titles = homeCards.map((c) => c.title);
    expect(titles).toEqual(["Career", "Education", "Projects", "Photo", "Music"]);
  });
});
