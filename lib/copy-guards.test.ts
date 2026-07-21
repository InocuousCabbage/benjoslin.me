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
import { career, education, projects, photos, tracks } from "@/lib/content";

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

  it("home page renders typographic section links via SectionBlock (not shadcn Card wrappers)", () => {
    const home = readFileSync(join(REPO_ROOT, "app", "page.tsx"), "utf-8");
    // No shadcn Card wrapping the section links.
    expect(home).not.toMatch(/from ["']@\/components\/ui\/card["']/);
    expect(home).not.toContain("<Card");
    // Home imports + renders SectionBlock (delegated block treatment).
    expect(home).toMatch(/from ["']@\/components\/section-block["']/);
    expect(home).toMatch(/<SectionBlock/);
    // The Read-more affordance lives inside SectionBlock (rendered text,
    // not just a comment). Check the JSX region there, not the home
    // source (which has "Read more" only in a code comment).
    const block = readFileSync(
      join(REPO_ROOT, "components", "section-block.tsx"),
      "utf-8",
    );
    expect(block).toMatch(/>\s*Read more\s*</);
  });

  // Iter-7 (B1 + D2 + D4 + D5 + D6) regression pins. Each addition has a
  // dedicated pin so a refactor can't quietly collapse one of the five.
  // Iter-8 codifies F2/F3/F4/F6 gaps found by xhigh iter-7 (opacity gate,
  // 50% centered fallback, focus-within mirror, first:border-t-0).
  it("SectionBlock composes B1+D2+D4+D6 (hairline divider, numbered prefix, radial sheen, kinetic arrow)", () => {
    const block = readFileSync(
      join(REPO_ROOT, "components", "section-block.tsx"),
      "utf-8",
    );
    // Client component (state + useEffect for matchMedia).
    expect(block).toMatch(/["']use client["']/);
    // B1: hairline divider between blocks (first:border-t-0 skips leading).
    expect(block).toMatch(/border-t\s+border-white\/5/);
    expect(block).toMatch(/first:border-t-0/);
    // D2: 01/02/03 numbered prefix via zero-padded index.
    expect(block).toMatch(/padStart\(2,\s*["']0["']\)/);
    // D4: radial-gradient with cursor-x/cursor-y CSS variables.
    expect(block).toContain("radial-gradient");
    expect(block).toContain("--cursor-x");
    expect(block).toContain("--cursor-y");
    // D4 a11y: reduced-motion + coarse-pointer matchMedia gates cursor-track.
    expect(block).toContain("(prefers-reduced-motion: reduce)");
    expect(block).toContain("(hover: hover) and (pointer: fine)");
    // Iter-8 F2 fix: opacity gate on the sheen overlay must include
    // opacity-0 default AND group-hover:opacity-100 AND focus-within
    // mirror. Adversarially verified: removing group-hover:opacity-100
    // and leaving opacity-100 (permanent sheen) previously slipped.
    expect(block).toMatch(/opacity-0[^"]*group-hover:opacity-100/);
    // Iter-8 F3 fix: centered-fallback defaults for --cursor-x/y must be
    // 50%. Adversarially verified: changing to "0px" clips the gradient
    // to the top-left corner for reduced-motion users.
    expect(block).toMatch(/["']--cursor-x["']\s+as\s+string\]:\s*["']50%["']/);
    expect(block).toMatch(/["']--cursor-y["']\s+as\s+string\]:\s*["']50%["']/);
    // Iter-8 F4 fix: every group-hover:* interaction has a
    // group-focus-within:* counterpart so keyboard-only users get the
    // same affordances. Assert focus-within mirrors for the three D6
    // motion classes + D4 opacity gate.
    expect(block).toMatch(/group-focus-within:opacity-100/);
    expect(block).toMatch(/group-focus-within:scale-x-100/);
    expect(block).toMatch(/group-focus-within:translate-x-1/);
    // D6 hover counterparts still present (regression guard against
    // dropping mouse affordance while adding focus).
    expect(block).toMatch(/group-hover:translate-x-1/);
    expect(block).toMatch(/group-hover:scale-x-100/);
    // Iter-8 F7 fix: onMouseMove is rAF-throttled. Guard on the pattern
    // shape so a future revert to per-move getBoundingClientRect + two
    // setProperty writes gets caught.
    expect(block).toMatch(/requestAnimationFrame/);
  });

  // Iter-9 V1: cursor-tracked hero shimmer. Client component wraps the
  // hero name; CSS keyframe handles ambient; JS drives --shimmer-x for
  // cursor-track mode. Regression pins codify all four moving parts:
  // component + CSS + a11y gates + Home wire-up.
  it("HeroName (V1) is a client component with matchMedia gates and rAF-throttled cursor tracking", () => {
    const hero = readFileSync(
      join(REPO_ROOT, "components", "hero-name.tsx"),
      "utf-8",
    );
    expect(hero).toMatch(/["']use client["']/);
    // Cursor tracking + a11y bailouts on both prefers-reduced-motion AND
    // coarse-pointer devices. Both must have matchMedia change listeners
    // for mid-session toggles.
    expect(hero).toContain("(prefers-reduced-motion: reduce)");
    expect(hero).toContain("(hover: hover) and (pointer: fine)");
    expect(hero).toMatch(/addEventListener\(["']change["']/);
    // rAF-throttled mousemove writing --shimmer-x. Iter-11 same-class
    // sweep: strengthen from string-existence to actual setProperty
    // call shape so a refactor that keeps the import but drops the
    // wire-up gets caught.
    expect(hero).toContain("requestAnimationFrame");
    expect(hero).toContain("--shimmer-x");
    expect(hero).toMatch(/setProperty\(["']--shimmer-x["']/);
    // Idle-out timer for cursor-parked -> revert to ambient.
    expect(hero).toMatch(/setTimeout/);
    // SSR default of data-shimmer="idle" so first paint runs the ambient
    // keyframe without JS. Active mode toggled by JS on cursor move.
    expect(hero).toMatch(/data-shimmer=["']idle["']/);
    expect(hero).toMatch(/dataset\.shimmer\s*=\s*["']active["']/);
    expect(hero).toMatch(/dataset\.shimmer\s*=\s*["']idle["']/);
  });

  it("globals.css defines .hero-shimmer + hero-shimmer-ambient keyframe with reduced-motion bail", () => {
    const css = readFileSync(join(REPO_ROOT, "app", "globals.css"), "utf-8");
    // .hero-shimmer clips a linear gradient onto text.
    expect(css).toMatch(/\.hero-shimmer\s*\{[^}]*background-clip:\s*text/);
    expect(css).toMatch(/-webkit-background-clip:\s*text/);
    // Background position reads --shimmer-x so JS + keyframe can both
    // drive the bright peak.
    expect(css).toMatch(/background-position:\s*var\(--shimmer-x/);
    // Ambient keyframe.
    expect(css).toContain("@keyframes hero-shimmer-ambient");
    // Idle mode plays the ambient keyframe; active mode clears it.
    expect(css).toMatch(/\.hero-shimmer\[data-shimmer=["']idle["']\]\s*\{\s*animation:\s*hero-shimmer-ambient/);
    expect(css).toMatch(/\.hero-shimmer\[data-shimmer=["']active["']\]\s*\{\s*animation:\s*none/);
    // Reduced-motion bail must strip the ambient animation.
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]{0,200}\.hero-shimmer[\s\S]{0,200}animation:\s*none/);
  });

  // Iter-10 V2 + iter-11 F2/F3/F5 codifications. Pin shapes strengthened
  // from existence-check to behavior-check where feasible.
  it("FooterParticles (V2) has IO observing canvas, motionOk-return branch, and per-frame DPR sync", () => {
    const p = readFileSync(
      join(REPO_ROOT, "components", "footer-particles.tsx"),
      "utf-8",
    );
    expect(p).toMatch(/["']use client["']/);
    expect(p).toMatch(/<canvas/);
    expect(p).toMatch(/pointer-events-none/);
    expect(p).toMatch(/aria-hidden/);
    // Iter-11 F2 codification: pin actual io.observe(canvas) call
    // (specifically the `io` variable name from the IO effect, not any
    // other .observe(canvas) like the ResizeObserver's) + disconnect
    // presence. Prevents the dead-observer regression class.
    expect(p).toContain("IntersectionObserver");
    expect(p).toMatch(/\bio\.observe\(canvas\)/);
    expect(p).toMatch(/\.disconnect\(\)/);
    // A11y gates + change listeners for mid-session toggles.
    expect(p).toContain("(prefers-reduced-motion: reduce)");
    expect(p).toContain("(hover: hover) and (pointer: fine)");
    expect(p).toMatch(/addEventListener\(["']change["']/);
    expect(p).toContain("requestAnimationFrame");
    expect(p).toContain("cancelAnimationFrame");
    // Iter-11 F2: pin the actual early-return-after-static-draw shape
    // inside the motionOk branch. Require `return;` (with semicolon)
    // so a commented-out `// return removed` doesn't satisfy the pin.
    expect(p).toMatch(
      /if\s*\(\s*!motionOk\s*\)\s*\{\s*[\s\S]{0,120}drawStatic\(\);[\s\S]{0,60}return\s*;/,
    );
    // Iter-11 F5: DPR must be re-read inside syncCanvasSize per frame,
    // not captured once at effect entry.
    expect(p).toMatch(/window\.devicePixelRatio\s*\|\|\s*1/);
    // Belt-and-suspenders: the DPR read line must sit inside a
    // function body (syncCanvasSize). Grep the source for the
    // signature pattern.
    expect(p).toMatch(
      /const\s+syncCanvasSize\s*=\s*\(\)\s*=>\s*\{[\s\S]{0,300}window\.devicePixelRatio/,
    );
  });

  it("FooterParticles seeds particles ONCE per lifetime (iter-11 F3 fix)", () => {
    const p = readFileSync(
      join(REPO_ROOT, "components", "footer-particles.tsx"),
      "utf-8",
    );
    // The one-shot seed guard.
    expect(p).toMatch(/particlesRef\.current\.length\s*===\s*0/);
    // Rescale-preserving-continuity helper is called on resize instead
    // of a full reseed.
    expect(p).toContain("rescaleParticles");
    // Belt-and-suspenders: seedParticles calls must be few (one-shot
    // seed effect + the empty-guard branch inside resize). Prevents a
    // future refactor from calling seedParticles inside the render
    // effect and reshuffling on every IO/motionOk toggle.
    const seedCalls = p.match(/seedParticles\(/g) || [];
    expect(seedCalls.length).toBeGreaterThanOrEqual(1);
    expect(seedCalls.length).toBeLessThanOrEqual(3);
  });

  // Iter-10 V3 + iter-11 F1/F2 codifications.
  it("GlitchText (V3) enforces alnum-only cycling + reduced-motion early return + settle-back", () => {
    const g = readFileSync(
      join(REPO_ROOT, "components", "glitch-text.tsx"),
      "utf-8",
    );
    expect(g).toMatch(/["']use client["']/);
    expect(g).toMatch(/onMouseEnter/);
    expect(g).toMatch(/onMouseLeave/);
    expect(g).toContain("(prefers-reduced-motion: reduce)");
    // Iter-11 F2: pin the actual early-return shape so a future revert
    // that drops the return statement gets caught.
    expect(g).toMatch(/if\s*\(\s*!motionOk\s*\)\s*return/);
    expect(g).toMatch(/aria-label=\{original\}/);
    expect(g).toMatch(/aria-hidden/);
    expect(g).toMatch(/clearTimeout/);
    // Iter-11 F1 codification: alnum-only cycling predicate is load-
    // bearing. Wrapping '©' or a space in GlitchText was a runtime
    // no-op because those characters don't match the predicate. Pin
    // the exact predicate shape.
    expect(g).toMatch(/\/\[a-zA-Z0-9\]\/\.test/);
    // Iter-11 F2: pin the settle-back-to-original step. Multiline
    // anchored so a commented-out `// workingChars[i] = originalChar`
    // doesn't satisfy the pin.
    expect(g).toMatch(/^\s*workingChars\[i\]\s*=\s*originalChar/m);
  });

  it("SiteFooter mounts FooterParticles + wraps ONLY alnum-bearing text in GlitchText (iter-11 F1)", () => {
    const f = readFileSync(
      join(REPO_ROOT, "components", "site-footer.tsx"),
      "utf-8",
    );
    expect(f).toMatch(/from ["']@\/components\/footer-particles["']/);
    expect(f).toMatch(/from ["']@\/components\/glitch-text["']/);
    expect(f).toContain("<FooterParticles");
    expect(f).toContain("<GlitchText");
    expect(f).toContain("All rights reserved");
    expect(f).toContain("<CurrentYear");
    expect(f).not.toContain("new Date()");
    // Iter-11 F1 codification: the © symbol must not be wrapped in
    // GlitchText because '©' fails the alnum-only cycling predicate
    // (runtime no-op class). Guard against reintroduction.
    expect(f).not.toMatch(/<GlitchText>\{?[`'"][^`'"]*©/);
  });

  it("[section] dynamic route excludes segments that have dedicated pages (Phase 2 M1 + Phase 3)", () => {
    // Iter-M1 codification: generateStaticParams must filter out any
    // segment that has its own app/<segment>/page.tsx so the build
    // doesn't emit duplicate ComingSoon routes AND so a delete of the
    // dedicated file falls through to 404 instead of silently
    // reverting to a stub. Pin the exclusion set + the filter shape.
    const dyn = readFileSync(
      join(REPO_ROOT, "app", "[section]", "page.tsx"),
      "utf-8",
    );
    // DEDICATED_ROUTES set contains /career + /education + /projects + /photo + /music.
    expect(dyn).toMatch(/DEDICATED_ROUTES[\s\S]{0,200}["']\/career["']/);
    expect(dyn).toMatch(/DEDICATED_ROUTES[\s\S]{0,200}["']\/education["']/);
    expect(dyn).toMatch(/DEDICATED_ROUTES[\s\S]{0,200}["']\/projects["']/);
    expect(dyn).toMatch(/DEDICATED_ROUTES[\s\S]{0,200}["']\/photo["']/);
    expect(dyn).toMatch(/DEDICATED_ROUTES[\s\S]{0,200}["']\/music["']/);
    // generateStaticParams filters using the exclusion set.
    expect(dyn).toMatch(/homeCards[\s\S]{0,200}\.filter\([\s\S]{0,80}DEDICATED_ROUTES\.has/);
    // cardForSegment also guards so a request that reaches the dynamic
    // route for a dedicated slug returns undefined (which triggers
    // notFound()) rather than serving the stub.
    expect(dyn).toMatch(/DEDICATED_ROUTES\.has\(href\)/);
  });

  // Phase 2: /career + /education content wire-up. Data lives in
  // lib/content.ts; pages render pure. Each Ben-provided datum pinned
  // + optional-field-absent behavior pinned. Ironic-miss n=8 discipline:
  // adversarial-verified below (not just import + shape existence).
  it("career data (Phase 2) pins the exact ReVision + Lever roles Ben provided", () => {
    // Two phases: ReVision (2 roles) + Lever (1 role).
    expect(career).toHaveLength(2);
    expect(career[0].label).toBe("ReVision Energy");
    expect(career[0].roles).toHaveLength(2);
    // Coordinator role.
    expect(career[0].roles[0].title).toBe("Digital Marketing Coordinator");
    expect(career[0].roles[0].company).toBe("ReVision Energy");
    expect(career[0].roles[0].dates).toBe("Jan 2023 - May 2025");
    // Analyst role.
    expect(career[0].roles[1].title).toBe("Digital Marketing Analyst");
    expect(career[0].roles[1].company).toBe("ReVision Energy");
    expect(career[0].roles[1].dates).toBe("Jun 2025 - present");
    // Lever phase.
    expect(career[1].label).toBe("Lever Marketing");
    expect(career[1].roles).toHaveLength(1);
    expect(career[1].roles[0].title).toBe("Founder");
    expect(career[1].roles[0].company).toBe("Lever Marketing");
    expect(career[1].roles[0].dates).toBe("Apr 2026 - present");
    // Optional-field discipline: impact absent + initiatives empty per
    // Ben's Phase 2 answer ("leave empty, Ben backfills").
    for (const phase of career) {
      for (const role of phase.roles) {
        expect(role.impact).toBeUndefined();
        expect(role.initiatives).toEqual([]);
      }
    }
  });

  it("education data (Phase 2) pins Ithaca College with Ben's provided activities", () => {
    expect(education).toHaveLength(1);
    const [ithaca] = education;
    expect(ithaca.school).toBe("Ithaca College");
    expect(ithaca.degree).toBe("B.S. Business Administration");
    // Order-independent presence check for the three activities Ben
    // listed: Dean's List, Minor in Audio Production, Rugby team.
    expect(ithaca.activities).toContain("Dean's List");
    expect(ithaca.activities).toContain("Minor in Audio Production");
    expect(ithaca.activities).toContain("Rugby team");
    expect(ithaca.activities).toHaveLength(3);
    // Optional-field discipline: gradYear absent + coursework empty
    // per Ben's Phase 2 answer.
    expect(ithaca.gradYear).toBeUndefined();
    expect(ithaca.coursework).toEqual([]);
  });

  // The four M2-flagged shape-only pins (role.impact ternary,
  // role.initiatives length guard, school.gradYear ternary,
  // school.coursework length guard) moved to render-layer tests in
  // components/{career-log,education-list}.render.test.tsx per iter-M2
  // ironic-miss n=9 close. What remains here is the source-shape
  // pinning that is still behavior-relevant (page uses site.name /
  // lib/content, dark theme classes, no-headshot discipline). The
  // conditional-render logic itself is now enforced by RTL render
  // tests that assert DOM presence/absence under fixture variants,
  // which passes under a valid ternary -> && refactor and fails
  // under an always-render regression.
  it("Career page wires CareerLog with the real career data + dark theme + no-headshot", () => {
    const p = readFileSync(join(REPO_ROOT, "app", "career", "page.tsx"), "utf-8");
    expect(p).toMatch(/from ["']@\/lib\/content["']/);
    expect(p).toMatch(/from ["']@\/components\/career-log["']/);
    expect(p).toMatch(/<CareerLog\s+phases=\{career\}/);
    // Dark theme + typography match Phase 0.
    expect(p).toContain("text-white");
    // No headshot / no image in the page shell.
    expect(p).not.toMatch(/<img\b/i);
    expect(p).not.toMatch(/from ["']next\/image["']/);
    // Iter-L1 (Ben post-preview): eyebrow-only heading matching enzo.
    // Verbatim "Career" as the h1 with the small uppercase eyebrow
    // classes; the previous "Career log" phrase is gone.
    expect(p).not.toContain("Career log");
    expect(p).toMatch(/<h1[^>]*uppercase[^>]*>\s*Career\s*<\/h1>/);
  });

  // Phase 3: /projects content wire-up. Ben-approved one-liners + chips
  // + order pinned exactly; changing them requires another Ben Y.
  it("projects data (Phase 3) pins Ben-approved one-liners + chips + order", () => {
    // Exact order per Ben: Lever, hiring-agent, mealprep.
    expect(projects).toHaveLength(3);
    expect(projects[0].name).toBe("Lever Marketing");
    expect(projects[1].name).toBe("hiring-agent");
    expect(projects[2].name).toBe("mealprep.benjoslin.me");
    // URLs.
    expect(projects[0].href).toBe("https://leverco.marketing");
    expect(projects[1].href).toBe(
      "https://github.com/InocuousCabbage/hiring-agent",
    );
    expect(projects[2].href).toBe("https://mealprep.benjoslin.me");
    // One-liners are Ben-approved verbatim strings.
    expect(projects[0].oneLiner).toBe(
      "Fractional CMO strategy paired with custom AI agents that actually implement it.",
    );
    expect(projects[1].oneLiner).toBe(
      "Personal hiring pipeline that ingests job alerts, tailors application materials, and can auto-apply to Greenhouse roles behind a Gmail approval loop.",
    );
    expect(projects[2].oneLiner).toBe(
      "Meal-prep planner built on Lovable. Vercel migration in progress.",
    );
    // Chips per Ben's Y (Anthropic swap applied on hiring-agent).
    expect(projects[0].chips).toEqual([
      "Next.js",
      "AI agents",
      "Fractional CMO",
      "Strategy Sprint",
    ]);
    expect(projects[1].chips).toEqual([
      "Python",
      "Playwright",
      "Gmail API",
      "Greenhouse",
      "Anthropic",
    ]);
    expect(projects[2].chips).toEqual(["Lovable", "React"]);
    // Optional-field discipline: mealprep has a note (migration
    // pending); Lever + hiring-agent don't. Lever + hiring-agent have
    // year; mealprep doesn't per "unknown start date, leave absent".
    expect(projects[0].year).toBe("2026");
    expect(projects[1].year).toBe("2026");
    expect(projects[2].year).toBeUndefined();
    expect(projects[0].note).toBeUndefined();
    expect(projects[1].note).toBeUndefined();
    expect(projects[2].note).toBe("Migration to Vercel pending");
  });

  // Phase 4 populate: photos are auto-generated into
  // lib/photos.generated.ts by scripts/populate-photos.mjs from the KB
  // Personal / Best photos folder (37 unique after dedup). Pin the
  // populated invariants so a botched re-run gets caught before merge.
  it("photos data (Phase 4 populate) is a non-empty ordered array with valid Photo shape", () => {
    expect(Array.isArray(photos)).toBe(true);
    // 37 = 38 source files - 1 exact-content-hash duplicate.
    expect(photos.length).toBe(37);
    // Every entry has the required Photo fields with sensible values.
    for (const p of photos) {
      expect(typeof p.src).toBe("string");
      expect(p.src.startsWith("/photos/")).toBe(true);
      expect(p.src.endsWith(".jpg")).toBe(true);
      expect(typeof p.alt).toBe("string");
      expect(p.alt.length).toBeGreaterThan(0);
      expect(p.width).toBeGreaterThan(0);
      expect(p.height).toBeGreaterThan(0);
      // blurDataURL is a data URL (base64 JPEG).
      expect(p.blurDataURL?.startsWith("data:image/jpeg;base64,")).toBe(true);
      // srcSet exists on every populated photo (pipeline invariant).
      expect(typeof p.srcSet).toBe("string");
      // Every entry in srcSet must be a valid `<path> <n>w` pair (no
      // corrupted middle tokens). Strengthened from a substring match
      // after adv-verify #2 showed a single corrupted head entry could
      // slip past the earlier loose regex.
      const entries = p.srcSet!.split(", ");
      expect(entries.length).toBeGreaterThan(0);
      for (const entry of entries) {
        expect(
          entry,
          `bad srcSet entry "${entry}" in ${p.src}`,
        ).toMatch(/^\/photos\/[a-z0-9-]+(?:-w\d+)?\.jpg \d+w$/);
      }
      // Widths must be ascending so the browser picks correctly.
      const widths = entries.map((e) =>
        parseInt(e.split(" ")[1] as string, 10),
      );
      for (let i = 1; i < widths.length; i++) {
        expect(
          widths[i]! > widths[i - 1]!,
          `srcSet widths not ascending for ${p.src}: ${widths.join(",")}`,
        ).toBe(true);
      }
    }
  });

  it("photos are ordered EXIF-date-descending with undated at the end (populate script contract)", () => {
    // Extract date fields (undefined for undated). Sort key mirrors the
    // populate script: date || "0000-00-00", DESC. Walking the array
    // must show monotonically non-increasing sort keys.
    let prev = "9999-99-99";
    for (const p of photos) {
      const key = p.date ?? "0000-00-00";
      expect(
        key <= prev,
        `out-of-order photo ${p.src}: date=${key} follows ${prev}`,
      ).toBe(true);
      prev = key;
    }
  });

  it("photos have unique src paths (dedup contract holds)", () => {
    const seen = new Set<string>();
    for (const p of photos) {
      expect(seen.has(p.src), `duplicate photo src ${p.src}`).toBe(false);
      seen.add(p.src);
    }
    expect(seen.size).toBe(photos.length);
  });

  it("content.ts re-exports photos from the generated file (not a stale inline array)", () => {
    const c = readFileSync(join(REPO_ROOT, "lib", "content.ts"), "utf-8");
    expect(c).toMatch(/export\s*\{\s*photos\s*\}\s*from\s*["']@\/lib\/photos\.generated["']/);
    // Guard against a merge conflict resurrecting the scaffold placeholder
    // (const photos: Photo[] = [] as the last-word declaration).
    expect(c).not.toMatch(/export\s+const\s+photos\s*:\s*Photo\[\]\s*=\s*\[\s*\]/);
  });

  // Phase 5 populate: Ben's 10 SoundCloud tracks, order as-sent. No
  // per-track title/date/description overrides (SoundCloud widget
  // renders each track's own metadata inside the iframe).
  it("tracks data (Phase 5 populate) pins Ben's 10 SoundCloud URLs in as-sent order", () => {
    expect(Array.isArray(tracks)).toBe(true);
    expect(tracks.length).toBe(10);
    // Ben's post-populate reorder: "i-never-want-this-to-end" moved
    // from position 5 to position 1; everything else shifts down.
    const expectedOrder = [
      "https://soundcloud.com/ben_joslin/i-never-want-this-to-end",
      "https://soundcloud.com/ben_joslin/i_aint_even_jewelzformaster-6",
      "https://soundcloud.com/ben_joslin/0223a1",
      "https://soundcloud.com/ben_joslin/0123a1",
      "https://soundcloud.com/ben_joslin/0323a",
      "https://soundcloud.com/ben_joslin/hedonism",
      "https://soundcloud.com/ben_joslin/mving_in_slowmotionm4a",
      "https://soundcloud.com/ben_joslin/shwmeluv",
      "https://soundcloud.com/ben_joslin/sadsaturday-ft-andrew-brown",
      "https://soundcloud.com/ben_joslin/right-now-right-now",
    ];
    expect(tracks.map((t) => t.soundcloudUrl)).toEqual(expectedOrder);
    // No populate URL carries a ?si= tracking param (weemeemee's
    // dispatch instruction: strip before storing).
    for (const t of tracks) {
      expect(t.soundcloudUrl.includes("?si=")).toBe(false);
      expect(t.soundcloudUrl.startsWith("https://soundcloud.com/ben_joslin/")).toBe(true);
      // No per-track overrides on this populate; SoundCloud renders
      // its own title inside the iframe. A future edit that adds
      // title/date/description to one track shouldn't fail this pin
      // (it only asserts the SHIPPED overrides are absent right now).
      expect(t.title).toBeUndefined();
      expect(t.date).toBeUndefined();
      expect(t.description).toBeUndefined();
    }
  });

  it("Music page wires TrackList with the real tracks data + dark theme + eyebrow h1 + first-person intro", () => {
    const p = readFileSync(
      join(REPO_ROOT, "app", "music", "page.tsx"),
      "utf-8",
    );
    expect(p).toMatch(/from ["']@\/lib\/content["']/);
    expect(p).toMatch(/from ["']@\/components\/track-list["']/);
    expect(p).toMatch(/<TrackList\s+tracks=\{tracks\}/);
    expect(p).toContain("text-white");
    // Eyebrow-only h1 matches the Phase 2 L1 pattern.
    expect(p).toMatch(/<h1[^>]*uppercase[^>]*>\s*Music\s*<\/h1>/);
    // First-person intro exists (Ben-editable placeholder). Content
    // is intentionally short + not pinned verbatim so Ben can rewrite
    // during populate without invalidating this test.
    expect(p).toMatch(/data-testid=["']music-intro["']/);
  });

  // Phase 5 dispatch (Ben SoundCloud-only decision): TrackList renders
  // SoundCloud iframe embeds. Pin the pattern (embed URL builder,
  // 166px height, iframe title = track title) so a refactor that
  // drops the embed or breaks the URL wrap fails loud. Render-layer
  // tests in track-list.render.test.tsx are the primary gate; this
  // pin is the source-shape backstop.
  it("TrackList composes SoundCloud embed URLs with player defaults + 166 height", () => {
    const g = readFileSync(
      join(REPO_ROOT, "components", "track-list.tsx"),
      "utf-8",
    );
    // Phase 5.5: URL composition moved to lib/soundcloud-widget.ts.
    // TrackList imports embedSrc from there instead of inlining
    // URLSearchParams; pin the import + call shape so the wiring
    // can't drift silently.
    expect(g).toMatch(/from ["']@\/lib\/soundcloud-widget["']/);
    expect(g).toMatch(/embedSrc\(track\.soundcloudUrl/);
    // Fixed height 166 matches SoundCloud's default single-track embed.
    expect(g).toMatch(/height=["']166["']/);
    // Empty-state branch shape (same strengthening as Phase 4).
    expect(g).toMatch(/if\s*\(\s*tracks\.length\s*===\s*0\s*\)\s*\{/);
    // iframe carries the track title (or a fallback) for a11y so
    // screen readers get a meaningful label when SoundCloud's own
    // widget title hasn't loaded yet.
    expect(g).toMatch(/title=\{track\.title\s*\?\?\s*["']SoundCloud player["']\}/);
    // h2 renders only when track.title is set (SoundCloud embed
    // renders its own metadata; no need to duplicate).
    expect(g).toMatch(/track\.title\s*\?\s*\(/);
    // Lazy loading so many-tracks page doesn't hydrate every embed
    // on first paint.
    expect(g).toMatch(/loading=["']lazy["']/);
    // Phase 5.5: each full-size embed intercepts PLAY + hands the
    // track off to the mini-player via useMiniPlayer().load(index).
    // Pin the intercept binding shape so a refactor that drops
    // coordination fails loud.
    expect(g).toMatch(/from ["']@\/lib\/mini-player-context["']/);
    expect(g).toMatch(/useMiniPlayer\(\)/);
    expect(g).toMatch(/widget\.bind\(SC_EVENT\.PLAY/);
    // F2 from xhigh iter-0: pause MUST precede load(). Ordered
    // regex catches a swap that would ship double-audio for a frame.
    expect(g).toMatch(/widget\.pause\(\)[\s\S]{0,120}load\(index\)/);
    // F7 from xhigh iter-0: bind PLAY inside a READY callback so
    // fast first-clicks aren't dropped.
    expect(g).toMatch(/widget\.bind\(SC_EVENT\.READY[\s\S]{0,200}widget\.bind\(SC_EVENT\.PLAY/);
  });

  // Phase 5.5 new: lib/soundcloud-widget.ts is the shared helper
  // module owning URL composition + SC.Widget lifecycle glue.
  it("lib/soundcloud-widget owns embedSrc + widget lifecycle helpers", () => {
    const g = readFileSync(
      join(REPO_ROOT, "lib", "soundcloud-widget.ts"),
      "utf-8",
    );
    expect(g).toMatch(/https:\/\/w\.soundcloud\.com\/player\/\?/);
    expect(g).toMatch(/URLSearchParams/);
    // visual param drives the compact-vs-waveform split.
    expect(g).toMatch(/visual:\s*visual\s*\?\s*["']true["']\s*:\s*["']false["']/);
    // withSCWidget polls for window.SC and returns a cleanup.
    expect(g).toMatch(/window\.SC/);
    expect(g).toMatch(/setInterval/);
    // SC event constants exported so components don't hardcode strings.
    expect(g).toMatch(/PLAY:\s*["']play["']/);
    expect(g).toMatch(/FINISH:\s*["']finish["']/);
  });

  // Phase 5.5 new: MiniPlayer mounted at RootLayout via
  // MiniPlayerRoot so it survives route unmount.
  it("RootLayout wraps children in MiniPlayerRoot and loads the SC widget script", () => {
    const layout = readFileSync(
      join(REPO_ROOT, "app", "layout.tsx"),
      "utf-8",
    );
    expect(layout).toMatch(/from ["']@\/components\/mini-player-root["']/);
    expect(layout).toContain("<MiniPlayerRoot>");
    // next/script loads SC widget API with lazyOnload so it doesn't
    // block first paint on routes that don't touch music.
    expect(layout).toMatch(/from ["']next\/script["']/);
    expect(layout).toContain("https://w.soundcloud.com/player/api.js");
    expect(layout).toMatch(/strategy=["']lazyOnload["']/);
  });

  it("MiniPlayer renders null when idle, fixed bottom-right, a11y-labeled controls", () => {
    const m = readFileSync(
      join(REPO_ROOT, "components", "mini-player.tsx"),
      "utf-8",
    );
    expect(m).toMatch(/["']use client["']/);
    // Pre-first-play the DOM stays clean (nothing rendered).
    // Post-first-play, the panel stays mounted (F4 pattern) but is
    // hidden via aria-hidden + opacity when activeIndex is null.
    expect(m).toMatch(/if\s*\(\s*!hasMounted\s*\)\s*return\s+null/);
    expect(m).toMatch(/aria-hidden=\{hidden\}/);
    // Fixed positioning at bottom-right.
    expect(m).toMatch(/fixed\s+bottom-4\s+right-4/);
    // safe-area-inset for iOS home-indicator devices.
    expect(m).toContain("safe-area-inset-bottom");
    // aria-label landmark.
    expect(m).toMatch(/aria-label=["']Mini music player["']/);
    // Every control is a real <button> with aria-label.
    expect(m).toMatch(/aria-label=["']Previous track["']/);
    expect(m).toMatch(/aria-label=["']Next track["']/);
    expect(m).toMatch(/aria-label=["']Close mini player["']/);
    // Uses embedSrc with visual=false so the compact 80px player
    // ships, not the waveform variant.
    expect(m).toMatch(/embedSrc\([^)]*visual:\s*false/);
    expect(m).toMatch(/height=["']80["']/);
    // Reduced-motion gate strips the fade-in transition.
    expect(m).toContain("(prefers-reduced-motion: reduce)");
    // F3 from xhigh iter-0: FINISH must bind to next() so an album
    // auto-advances through the tracks[] array.
    expect(m).toMatch(/SC_EVENT\.FINISH[\s\S]{0,60}next\(\)/);
    // F4 from xhigh iter-0: stable-iframe pattern. Track swaps go
    // through widget.load() on a persistent widget ref, NOT through
    // an iframe remount (which resets user-activation context and
    // breaks Chrome/Safari autoplay policy on 2nd+ tracks).
    expect(m).toMatch(/w\.load\(track\.soundcloudUrl/);
    expect(m).toMatch(/auto_play:\s*true/);
    // F7 from xhigh iter-0: bind PLAY/PAUSE/FINISH inside a READY
    // callback so fast first-clicks aren't dropped.
    expect(m).toMatch(/widget\.bind\(SC_EVENT\.READY[\s\S]{0,400}widget\.bind\(SC_EVENT\.PLAY/);
    // F5 from xhigh iter-0: load-into-widget effect depends on
    // loadNonce so same-index re-loads still trigger a widget.load()
    // (React would otherwise skip the effect on state-equality).
    expect(m).toMatch(/\[activeIndex,\s*loadNonce/);
  });

  // F1 from xhigh iter-0: viewport-fit=cover must be set on the
  // Next.js viewport export so iOS Safari returns non-zero
  // env(safe-area-inset-*) values. Without cover, the mini-player's
  // safe-area padding ships as dead code and the panel sits under
  // the iPhone home-indicator gesture zone.
  it("RootLayout exports viewport with viewportFit=cover for iOS safe-area", () => {
    const layout = readFileSync(
      join(REPO_ROOT, "app", "layout.tsx"),
      "utf-8",
    );
    // Named `viewport` export with viewportFit set to cover.
    expect(layout).toMatch(/export\s+const\s+viewport\s*:\s*Viewport/);
    expect(layout).toMatch(/viewportFit:\s*["']cover["']/);
  });

  // F6 from xhigh iter-0: withSCWidget must wrap the SC.Widget()
  // call in try/catch so a mismatched-SDK-version throw doesn't
  // hammer the console with an uncaught exception every 200ms
  // until the 15s timeout.
  it("withSCWidget wraps SC.Widget() in try/catch to swallow poll-time throws", () => {
    const g = readFileSync(
      join(REPO_ROOT, "lib", "soundcloud-widget.ts"),
      "utf-8",
    );
    // The tryBind function body contains a try/catch around the
    // Widget factory call.
    expect(g).toMatch(/try\s*\{[\s\S]{0,120}window\.SC\.Widget\(iframe\)[\s\S]{0,120}\}\s*catch/);
  });

  it("Photo page wires PhotoGrid with the real photos data + dark theme + eyebrow h1", () => {
    const p = readFileSync(
      join(REPO_ROOT, "app", "photo", "page.tsx"),
      "utf-8",
    );
    expect(p).toMatch(/from ["']@\/lib\/content["']/);
    expect(p).toMatch(/from ["']@\/components\/photo-grid["']/);
    expect(p).toMatch(/<PhotoGrid\s+photos=\{photos\}/);
    expect(p).toContain("text-white");
    // Eyebrow-only heading matches Phase 2 L1 pattern (same as Career,
    // Education, Projects).
    expect(p).toMatch(/<h1[^>]*uppercase[^>]*>\s*Photo\s*<\/h1>/);
  });

  // Phase 4 dispatch (Ben layout decision): PhotoGrid uses react-masonry-css
  // for varying-height layout + yet-another-react-lightbox for click-to-
  // preview. Pin the imports + reduced-motion gate so a refactor that drops
  // either lib fails loud. a11y behavior (keyboard nav, focus trap) is
  // library-provided; render-layer tests in photo-grid.render.test.tsx
  // exercise the click-to-open + empty-state branches.
  it("PhotoGrid mounts masonry + lightbox with reduced-motion gate", () => {
    const g = readFileSync(
      join(REPO_ROOT, "components", "photo-grid.tsx"),
      "utf-8",
    );
    expect(g).toMatch(/["']use client["']/);
    expect(g).toMatch(/from ["']react-masonry-css["']/);
    expect(g).toMatch(/from ["']yet-another-react-lightbox["']/);
    // Reduced-motion gate must strip the lightbox animation.
    expect(g).toContain("(prefers-reduced-motion: reduce)");
    expect(g).toMatch(/animation=\{reducedMotion\s*\?/);
    // Empty-state branch must remain (server-safe placeholder before
    // Ben's originals land). Ironic-miss guard: match the code shape
    // (`if (photos.length === 0) {`) rather than the bare token so
    // deleting the branch while leaving the string in a docstring
    // comment doesn't slip. Render-layer tests in
    // photo-grid.render.test.tsx are the primary gate; this pin is
    // the source-shape backstop.
    expect(g).toMatch(/if\s*\(\s*photos\.length\s*===\s*0\s*\)\s*\{/);
    // Every tile is a <button> (not a bare <div>) so keyboard-only users
    // can open the lightbox with Enter/Space.
    expect(g).toMatch(/<button/);
  });

  it("Projects page wires ProjectList with the real projects data + dark theme + no-headshot", () => {
    const p = readFileSync(
      join(REPO_ROOT, "app", "projects", "page.tsx"),
      "utf-8",
    );
    expect(p).toMatch(/from ["']@\/lib\/content["']/);
    expect(p).toMatch(/from ["']@\/components\/project-list["']/);
    expect(p).toMatch(/<ProjectList\s+projects=\{projects\}/);
    expect(p).toContain("text-white");
    expect(p).not.toMatch(/<img\b/i);
    expect(p).not.toMatch(/from ["']next\/image["']/);
    // Eyebrow-only heading matches Phase 2 L1 pattern.
    expect(p).toMatch(/<h1[^>]*uppercase[^>]*>\s*Projects\s*<\/h1>/);
  });

  it("Education page wires EducationList with the real education data + dark theme + no-headshot", () => {
    const p = readFileSync(
      join(REPO_ROOT, "app", "education", "page.tsx"),
      "utf-8",
    );
    expect(p).toMatch(/from ["']@\/lib\/content["']/);
    expect(p).toMatch(/from ["']@\/components\/education-list["']/);
    expect(p).toMatch(/<EducationList\s+schools=\{education\}/);
    // Dark theme + typography match Phase 0.
    expect(p).toContain("text-white");
    expect(p).not.toMatch(/<img\b/i);
    expect(p).not.toMatch(/from ["']next\/image["']/);
    // Iter-L1: eyebrow-only heading, "Where I studied" phrase gone.
    expect(p).not.toContain("Where I studied");
    expect(p).toMatch(/<h1[^>]*uppercase[^>]*>\s*Education\s*<\/h1>/);
  });

  it("Home page uses HeroName inside the hero H1 (site.name still single-source)", () => {
    const home = readFileSync(join(REPO_ROOT, "app", "page.tsx"), "utf-8");
    expect(home).toMatch(/from ["']@\/components\/hero-name["']/);
    expect(home).toMatch(/<HeroName>\{site\.name\}<\/HeroName>/);
    // site.name still the single source (F4 guard reinforced).
    expect(home).toContain("site.name");
    expect(home).not.toMatch(/Ben\s+Joslin/);
  });

  it("Home renders SectionBlocks inside a <ul> (iter-8 F5: correct AT semantics)", () => {
    // xhigh iter-7 F5: <article> inside <nav> announces "article" 5x.
    // Fix: <ul>/<li> is the correct navigation-list primitive.
    const home = readFileSync(join(REPO_ROOT, "app", "page.tsx"), "utf-8");
    expect(home).toContain("<ul");
    const block = readFileSync(
      join(REPO_ROOT, "components", "section-block.tsx"),
      "utf-8",
    );
    expect(block).toContain("<li");
    // Guard against <article> reintroduction (the class F5 codified).
    expect(block).not.toMatch(/<article\b/);
  });

  it("GrainOverlay (D5) exists as a fixed low-opacity noise layer and mounts in root layout", () => {
    const grain = readFileSync(
      join(REPO_ROOT, "components", "grain-overlay.tsx"),
      "utf-8",
    );
    // Fixed layer, no pointer capture, low opacity.
    expect(grain).toMatch(/fixed\s+inset-0/);
    expect(grain).toMatch(/pointer-events-none/);
    // Low opacity — regex catches opacity-[0.0X] and opacity-[0.0XY] shapes
    // so a value like 0.03 or 0.035 both pass; catches drift above 0.099.
    expect(grain).toMatch(/opacity-\[0\.0\d{1,2}\]/);
    // Inline SVG turbulence noise, no external asset dep.
    expect(grain).toContain("feTurbulence");
    // Iter-8 F1 fix: mix-blend-mode must not be `overlay` because
    // overlay(black, white) = black — the whole feature ships invisible
    // on the site's bg-black. Pin to `mix-blend-screen` (adds white noise
    // on top of black; composes cleanly over non-black surfaces too).
    expect(grain).toContain("mix-blend-screen");
    expect(grain).not.toContain("mix-blend-overlay");
    // Mounted in root layout above content.
    const layout = readFileSync(join(REPO_ROOT, "app", "layout.tsx"), "utf-8");
    expect(layout).toContain("<GrainOverlay");
    expect(layout).toMatch(/from ["']@\/components\/grain-overlay["']/);
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

  it("home hero applies Enzo-matched vertical rhythm (iter-6 F-Ben-preview)", () => {
    // Ben post-preview: "sizing above and below my name should be larger."
    // Enzo hero compiled CSS: min-h-[58vh] md:min-h-[64vh] py-20 md:py-28
    // items-center. Pin all four so a future refactor that shrinks the
    // hero back to a tight py-16 fails loud.
    const home = readFileSync(join(REPO_ROOT, "app", "page.tsx"), "utf-8");
    const heroMatch = home.match(/<header[\s\S]*?<\/header>/);
    expect(heroMatch).not.toBeNull();
    const hero = heroMatch![0];
    expect(hero).toMatch(/min-h-\[58vh\]/);
    expect(hero).toMatch(/md:min-h-\[64vh\]/);
    expect(hero).toMatch(/py-20/);
    expect(hero).toMatch(/md:py-28/);
    expect(hero).toMatch(/items-center/);
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
