/**
 * Ben Joslin content data. Career + education datums live here so the
 * page components stay pure render code and the source of truth for
 * dates / role names / school lives in one file that Ben can edit
 * directly.
 *
 * Voice guidance for future edits (per weemeemee's Phase 2 dispatch):
 * concrete-first-person, don't over-polish, no em dashes anywhere,
 * no AI-tell adjective class (see the copy-guards test suite for the
 * banned word list). Dates use ASCII hyphen "-" (not en dash or em
 * dash) so the em-dash guard doesn't false-positive on the range
 * separator.
 */

export type Role = {
  title: string;
  company: string;
  dates: string;
  /** One-line impact statement. Left absent until Ben backfills; the
   * page component skips rendering the impact line when this field
   * is undefined. */
  impact?: string;
  /** Projects + initiatives worked on in this role. Ben backfills from
   * an external source doc (per Phase 2 dispatch). The page component
   * renders an empty state when the array is empty, and a bullet list
   * when populated. Never invent bullets; leave the array empty until
   * Ben provides source content. */
  initiatives: string[];
};

export type CareerPhase = {
  /** Phase label rendered as the section heading (matches enzosison
   * /tech phase pattern). */
  label: string;
  roles: Role[];
};

export const career: CareerPhase[] = [
  {
    label: "ReVision Energy",
    roles: [
      {
        title: "Digital Marketing Coordinator",
        company: "ReVision Energy",
        dates: "Jan 2023 - May 2025",
        initiatives: [],
      },
      {
        title: "Digital Marketing Analyst",
        company: "ReVision Energy",
        dates: "Jun 2025 - present",
        initiatives: [],
      },
    ],
  },
  {
    label: "Lever Marketing",
    roles: [
      {
        title: "Founder",
        company: "Lever Marketing",
        dates: "Apr 2026 - present",
        initiatives: [],
      },
    ],
  },
];

export type Education = {
  school: string;
  degree: string;
  /** Non-empty list of activities, honors, minors, team involvements. */
  activities: string[];
  /** Coursework chip list, rendered when non-empty. Left empty until
   * Ben provides source content; page component hides the section
   * when the array is empty. */
  coursework: string[];
  /** Graduation year. Left absent per Ben's Phase 2 answer; page
   * component skips rendering the year line when undefined. */
  gradYear?: string;
};

export const education: Education[] = [
  {
    school: "Ithaca College",
    degree: "B.S. Business Administration",
    activities: ["Dean's List", "Minor in Audio Production", "Rugby team"],
    coursework: [],
  },
];

export type Project = {
  name: string;
  /** External URL that the "View project" affordance links to. */
  href: string;
  /** One-liner describing what the project does. Ben-approved copy. */
  oneLiner: string;
  /** Tech / positioning chips shown as small pills on the card. */
  chips: string[];
  /** Optional start year or year range. Rendered when non-empty. */
  year?: string;
  /** Optional short note (e.g. "migration to Vercel pending"). Renders
   * when non-empty so we can flag in-progress status without inventing
   * capabilities. */
  note?: string;
};

/**
 * Ben-approved Phase 3 project list. Order per Ben (Lever agency
 * first, then most-mature side-build, then in-progress migration).
 * One-liners + chips are the exact strings Ben Y'd; changing them
 * requires another Ben Y.
 */
export const projects: Project[] = [
  {
    name: "Lever Marketing",
    href: "https://leverco.marketing",
    oneLiner:
      "Fractional CMO strategy paired with custom AI agents that actually implement it.",
    chips: ["Next.js", "AI agents", "Fractional CMO", "Strategy Sprint"],
    year: "2026",
  },
  {
    name: "hiring-agent",
    href: "https://github.com/InocuousCabbage/hiring-agent",
    oneLiner:
      "Personal hiring pipeline that ingests job alerts, tailors application materials, and can auto-apply to Greenhouse roles behind a Gmail approval loop.",
    chips: ["Python", "Playwright", "Gmail API", "Greenhouse", "Anthropic"],
    year: "2026",
  },
  {
    name: "mealprep.benjoslin.me",
    href: "https://mealprep.benjoslin.me",
    oneLiner:
      "Meal-prep planner built on Lovable. Vercel migration in progress.",
    chips: ["Lovable", "React"],
    note: "Migration to Vercel pending",
  },
];

export type Photo = {
  /** Default served path under /public (e.g. "/photos/img-0001-w1920.jpg").
   * Used as the src fallback + as the "largest" variant reference. */
  src: string;
  /** Full srcset attribute value composed of the sharp+mozjpeg output
   * variants (e.g. "/photos/img-w640.jpg 640w, /photos/img-w828.jpg 828w,
   * ..."). Optional so fixture-driven render tests can mount a Photo
   * without generating variants; when absent, the browser falls back to
   * `src`. */
  srcSet?: string;
  /** Mandatory alt text for a11y. Extracted from EXIF Description or
   * Ben-provided when originals land; never blank. */
  alt: string;
  /** Original (rotation-corrected) pixel width. Drives layout aspect
   * ratio + prevents CLS. */
  width: number;
  /** Original (rotation-corrected) pixel height. */
  height: number;
  /** Optional base64 data URL blur placeholder from sharp. When present,
   * PhotoGrid paints it as a background under the tile until the img
   * fires load. */
  blurDataURL?: string;
  /** Optional caption rendered under the photo when present. Empty
   * strings and undefined are both treated as absent. */
  caption?: string;
  /** Optional ISO date (YYYY-MM-DD) extracted from EXIF DateTimeOriginal.
   * Not rendered by default; used by the populate script for sort order
   * and kept for future date-grouping. */
  date?: string;
};

// Phase 4 populate: photos are auto-generated by
// scripts/populate-photos.mjs into lib/photos.generated.ts. Re-export
// here so consumers keep importing from "@/lib/content".
export { photos } from "@/lib/photos.generated";

/**
 * SoundCloud track. Ben's own audio productions (Ithaca College minor
 * in Audio Production). Content type locked to SoundCloud embeds per
 * his Phase 5 answer; if he later adds Spotify or direct-file tracks,
 * the type can grow a kind discriminator then.
 */
export type Track = {
  /** Optional title override. When absent, the SoundCloud embed renders
   * the track name inside the iframe (widget default) and no h2 is
   * emitted above it. Set only when you want to override SoundCloud's
   * own metadata (e.g. cleaner display name than the slug). */
  title?: string;
  /** The public SoundCloud track URL (https://soundcloud.com/user/track).
   * Wrapped by the SoundCloud player embed at render time. Strip any
   * `?si=...` tracking params before adding here; they aren't needed
   * by the widget URL. */
  soundcloudUrl: string;
  /** Optional year (YYYY) or year-month (YYYY-MM) label. Rendered as a
   * small eyebrow when present. */
  date?: string;
  /** Optional short description under the title. Rendered when set. */
  description?: string;
};

/**
 * Phase 5 populate: Ben's 10 SoundCloud tracks, order as-sent. No
 * per-track title / date / description overrides; SoundCloud's widget
 * renders each track's own metadata inside the iframe.
 */
export const tracks: Track[] = [
  { soundcloudUrl: "https://soundcloud.com/ben_joslin/i_aint_even_jewelzformaster-6" },
  { soundcloudUrl: "https://soundcloud.com/ben_joslin/0223a1" },
  { soundcloudUrl: "https://soundcloud.com/ben_joslin/0123a1" },
  { soundcloudUrl: "https://soundcloud.com/ben_joslin/0323a" },
  { soundcloudUrl: "https://soundcloud.com/ben_joslin/i-never-want-this-to-end" },
  { soundcloudUrl: "https://soundcloud.com/ben_joslin/hedonism" },
  { soundcloudUrl: "https://soundcloud.com/ben_joslin/mving_in_slowmotionm4a" },
  { soundcloudUrl: "https://soundcloud.com/ben_joslin/shwmeluv" },
  { soundcloudUrl: "https://soundcloud.com/ben_joslin/sadsaturday-ft-andrew-brown" },
  { soundcloudUrl: "https://soundcloud.com/ben_joslin/right-now-right-now" },
];
