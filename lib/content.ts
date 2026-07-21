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
