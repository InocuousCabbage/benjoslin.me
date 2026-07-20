/**
 * Regression guards for benjoslin.me. Grep-based tests that fail loud if a
 * banned string reappears in `src/` or lands in a user-visible root markdown.
 * Adapted from the Bellamy tweak-batch v2 pattern.
 *
 * Ben's standing rules enforced here:
 * - No em dashes anywhere (literal U+2014). Root markdown scanned outside
 *   any explicit v1-HISTORICAL section.
 * - No AI-tell adjective class (delve, leverage, seamless, robust, meticulous,
 *   cutting-edge, utilize, furthermore, moreover, "in conclusion", "it is
 *   important to note"). Case-insensitive.
 * - No aspirational-completeness "done" phrasings (done look, done every visit,
 *   etc). Ben's Bellamy-context lesson generalized to this codebase; if a
 *   phrase surfaces here without the aspirational sense, keep the guard tight
 *   and rephrase.
 * - No #morethanjustlawns (Bellamy holdover; keep the pattern of banning
 *   inherited-Squarespace hashtags in one place).
 *
 * The guards INTENTIONALLY exclude this file itself (which contains the
 * banned literals as assertion strings).
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const REPO_ROOT = join(__dirname, "..");

function grepScanned(pattern: string): string[] {
  // Scan app/, components/, lib/ (the source tree). Any hit outside this
  // test file itself is a real violation.
  try {
    const out = execSync(
      `grep -rln -F ${JSON.stringify(pattern)} app components lib`,
      { cwd: REPO_ROOT, encoding: "utf-8" },
    );
    return out.split("\n").filter((line) => line && !line.endsWith("copy-guards.test.ts"));
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 1) return [];
    throw err;
  }
}

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
      let hits: string[];
      try {
        const out = execSync(
          `grep -rlni -F ${JSON.stringify(term)} app components lib`,
          { cwd: REPO_ROOT, encoding: "utf-8" },
        );
        hits = out
          .split("\n")
          .filter((line) => line && !line.endsWith("copy-guards.test.ts"));
      } catch (err) {
        const e = err as { status?: number };
        if (e.status === 1) {
          hits = [];
        } else {
          throw err;
        }
      }
      expect(hits, `AI-tell "${term}" found in: ${hits.join(", ")}`).toEqual([]);
    }
  });

  it("does not ship aspirational-completeness 'done' phrasings", () => {
    // "done" in the aspirational-completeness sense reads as unfinished-
    // feeling per Ben's Bellamy-context lesson. Operational-done phrasings
    // ("gets the work done right", "we're done for the day") stay legal
    // via the specificity of the ban list.
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

  // Broadened em-dash guard: also scan repo-root user-visible markdown
  // (README.md and any future BRAINDUMP.md / DISCOVERY.md). AGENTS.md is
  // intentionally NOT scanned: agent-internal content, not user-visible.
  it("does not ship authored em dash (U+2014) in user-visible root markdown", () => {
    const rootDocs = ["README.md", "BRAINDUMP.md", "DISCOVERY.md"];
    const violations: string[] = [];
    for (const doc of rootDocs) {
      const path = join(REPO_ROOT, doc);
      let text: string;
      try {
        text = readFileSync(path, "utf-8");
      } catch {
        continue;
      }
      // If a v1 HISTORICAL section marker exists, only scan content BEFORE it.
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
});

describe("structural expectations", () => {
  it("home page uses the site.name from lib/site.ts (no hard-coded 'Ben Joslin' string)", () => {
    // The home hero should reference site.name so a future rename doesn't
    // silently drift on the home page while the layout metadata updates.
    const home = readFileSync(join(REPO_ROOT, "app", "page.tsx"), "utf-8");
    expect(home).toContain("site.name");
    // Belt-and-suspenders: no literal "Ben Joslin" hard-coded in the home
    // page (this would sidestep the site.name single source of truth).
    expect(home).not.toContain('"Ben Joslin"');
    expect(home).not.toContain("'Ben Joslin'");
  });

  it("home page does not include an <img> or Next Image (no headshot per Ben spec)", () => {
    const home = readFileSync(join(REPO_ROOT, "app", "page.tsx"), "utf-8");
    // Guard against reintroducing a hero headshot. If Ben ever wants one,
    // update this test to allow it explicitly.
    expect(home).not.toMatch(/<img\b/i);
    expect(home).not.toMatch(/from ["']next\/image["']/);
  });

  it("layout registers Raleway + Roboto next/font families", () => {
    const layout = readFileSync(join(REPO_ROOT, "app", "layout.tsx"), "utf-8");
    expect(layout).toMatch(/Raleway\s*[,(]/);
    expect(layout).toMatch(/Roboto\s*[,(]/);
  });

  it("layout renders SphereCursor and SiteFooter", () => {
    const layout = readFileSync(join(REPO_ROOT, "app", "layout.tsx"), "utf-8");
    expect(layout).toContain("<SphereCursor");
    expect(layout).toContain("<SiteFooter");
  });

  it("layout ships JSON-LD Person schema (not LocalBusiness)", () => {
    const layout = readFileSync(join(REPO_ROOT, "app", "layout.tsx"), "utf-8");
    expect(layout).toContain('"@type": "Person"');
    expect(layout).not.toContain("LocalBusiness");
  });

  it("home lists exactly the 5 spec'd section cards", () => {
    const siteFile = readFileSync(join(REPO_ROOT, "lib", "site.ts"), "utf-8");
    // Count title:"..." lines within homeCards. Simpler than parsing TS.
    const homeCardsBlock = siteFile.match(/homeCards\s*=\s*\[([\s\S]*?)\]\s*as const;/)?.[1];
    expect(homeCardsBlock).toBeDefined();
    // Word-boundary `\btitle:` so "subtitle:" doesn't also match.
    const titles = [...homeCardsBlock!.matchAll(/(?:^|\s|,|\{)title:\s*"([^"]+)"/g)].map((m) => m[1]);
    expect(titles).toEqual(["Career", "Education", "Projects", "Photo", "Music"]);
  });
});
