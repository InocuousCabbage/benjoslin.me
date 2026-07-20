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
 *   etc). Ben's Bellamy-context lesson generalized to this codebase.
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

/**
 * Shell-free grep. Uses spawnSync with an argv array so patterns containing
 * shell metacharacters ($, backtick, \) cannot escape the argument.
 */
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
  if (result.status === 1) return []; // grep exits 1 on no match, expected.
  if (result.status !== 0) {
    throw new Error(`grep failed: status=${result.status} stderr=${result.stderr}`);
  }
  return (result.stdout || "")
    .split("\n")
    .filter((line) => line && !line.endsWith("copy-guards.test.ts"));
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

  // Broadened em-dash guard: scan ALL user-visible root markdown files
  // (auto-discovered via readdirSync). AGENTS.md is intentionally excluded:
  // agent-internal content, not user-visible. v1-HISTORICAL sections inside
  // any doc are scoped out via a regex anchor.
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

  // xhigh iter-1 ironic-miss n=5 -> iter-2 F16 ironic-miss n=6 fix.
  // The iter-1 URL-shape regex was tautological (`[^/7]` only rejected
  // handles STARTING with 7, not containing 7; `benjoslin7` still passed).
  // Pin the exact known-good URLs; split per social so a failure on one
  // handle doesn't hide the state of the other two (vitest short-circuits
  // on the first expect failure within an `it` block).
  //
  // Adversarially verified iter-2: temporarily rewrote all three URLs to
  // .../benjoslin7/... and confirmed the tests fail; reverted and confirmed
  // green.
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

describe("structural expectations", () => {
  it("home page uses the site.name from lib/site.ts (no hard-coded 'Ben Joslin' string)", () => {
    const home = readFileSync(join(REPO_ROOT, "app", "page.tsx"), "utf-8");
    expect(home).toContain("site.name");
    // xhigh iter-1 F4: also guard against bare JSX text `<h1>Ben Joslin</h1>`
    // which would sidestep the single-source-of-truth without a quoted string.
    expect(home).not.toMatch(/Ben\s+Joslin/);
  });

  it("home page does not include an <img> or Next Image (no headshot per Ben spec)", () => {
    const home = readFileSync(join(REPO_ROOT, "app", "page.tsx"), "utf-8");
    expect(home).not.toMatch(/<img\b/i);
    expect(home).not.toMatch(/from ["']next\/image["']/);
  });

  it("layout registers Raleway + Roboto next/font families (as function calls, not just imports)", () => {
    const layout = readFileSync(join(REPO_ROOT, "app", "layout.tsx"), "utf-8");
    // xhigh iter-1 F6: assert the FUNCTION CALL, not just the import symbol,
    // so a refactor that drops the call site but keeps the import is caught.
    expect(layout).toContain("Raleway(");
    expect(layout).toContain("Roboto(");
    // Belt-and-suspenders: the CSS variable must be wired onto <html> so
    // the font is actually applied, not just imported.
    expect(layout).toMatch(/raleway\.variable/);
    expect(layout).toMatch(/roboto\.variable/);
  });

  it("layout renders SphereCursor and SiteFooter", () => {
    const layout = readFileSync(join(REPO_ROOT, "app", "layout.tsx"), "utf-8");
    expect(layout).toContain("<SphereCursor");
    expect(layout).toContain("<SiteFooter");
  });

  it("layout ships schema.org Person JSON-LD (not a business type)", () => {
    const layout = readFileSync(join(REPO_ROOT, "app", "layout.tsx"), "utf-8");
    expect(layout).toContain('"@type": "Person"');
    // Ban common business schema types on the personal site.
    for (const businessType of ["LocalBusiness", "Organization", "Corporation"]) {
      expect(layout).not.toContain(`"@type": "${businessType}"`);
    }
  });

  it("home lists exactly the 5 spec'd section cards", () => {
    // xhigh iter-1 F13: import homeCards directly rather than parsing source
    // text with regex. Fails on ordering drift AND on missing/extra entries.
    const titles = homeCards.map((c) => c.title);
    expect(titles).toEqual(["Career", "Education", "Projects", "Photo", "Music"]);
  });

  it("sphere-cursor returns null when reduced-motion or coarse-pointer bails", () => {
    // xhigh iter-1 F2 codification: assert the SOURCE has the early-return
    // pattern (`if (!active) return null;`) so a future rewrite doesn't
    // re-introduce the stuck-black-square regression.
    const src = readFileSync(
      join(REPO_ROOT, "components", "sphere-cursor.tsx"),
      "utf-8",
    );
    expect(src).toMatch(/if\s*\(\s*!active\s*\)\s*return\s*null\s*;/);
  });
});
