/**
 * Ben Joslin canonical site facts. Source of truth for name, socials, and
 * domain. Don't invent values; if you need a field that isn't here, ask Ben
 * (via weemeemee) and add it here.
 */
export const site = {
  name: "Ben Joslin",
  domain: "benjoslin.me",
  // github handle is `benjoslin` (verified 200). The Vercel team ID
  // benjoslin7-5934s-projects is a signup artifact and is not Ben's handle
  // on any other platform.
  socials: {
    linkedin: "https://www.linkedin.com/in/benjoslin/",
    github: "https://github.com/benjoslin",
    instagram: "https://www.instagram.com/benjoslin/",
  },
} as const;

/**
 * Home page section blocks. Order defines the on-page order. Each block
 * links to a dedicated sub-route rendered by app/[section]/page.tsx.
 * Order per Ben's spec: Career, Education, Projects, Photo, Music.
 * Subtitles read as one-line teasers, not two-word category chips.
 */
export const homeCards = [
  {
    title: "Career",
    subtitle: "ReVision Energy, then Lever Marketing",
    href: "/career",
  },
  {
    title: "Education",
    subtitle: "Ithaca College, B.S. Business Administration",
    href: "/education",
  },
  {
    title: "Projects",
    subtitle: "Agency, software, and side builds",
    href: "/projects",
  },
  {
    title: "Photo",
    subtitle: "Photography on a Canon 2000D",
    href: "/photo",
  },
  {
    title: "Music",
    subtitle: "Audio production work",
    href: "/music",
  },
] as const;

/**
 * Optional lifestyle photo + caption at the bottom of the home page.
 * Enzo's home has one; Ben's Phase 0 doesn't ship one until he provides
 * the source photo + caption. Set to non-null to render, null to hide.
 * The home page checks this null and renders nothing when unset so we
 * don't ship an empty slot.
 */
export type HomeFooterPhoto = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

export const homeFooterPhoto: HomeFooterPhoto | null = null;
