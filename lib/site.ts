/**
 * Ben Joslin canonical site facts. Source of truth for name, socials, and
 * domain. Don't invent values; if you need a field that isn't here, ask Ben
 * (via weemeemee) and add it here.
 */
export const site = {
  name: "Ben Joslin",
  domain: "benjoslin.me",
  socials: {
    linkedin: "https://www.linkedin.com/in/benjoslin/",
    github: "https://github.com/benjoslin7",
    instagram: "https://www.instagram.com/benjoslin/",
  },
} as const;

/**
 * Home page section cards. Order defines the on-page order. Each card
 * links to a dedicated sub-route rendered by that route's page.tsx.
 * Order per Ben's spec: Career, Education, Projects, Photo, Music.
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
