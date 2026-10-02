export const SITE = {
  // Canonical production origin (https://shorifulislam.com). Env-driven so a fork can
  // point at its own domain, with the origin below as the default: a clone runs
  // with no .env at all, and a hard requirement here would break `npm run dev`
  // before anything renders.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://shorifulislam.com").replace(/\/$/, ""),
  name: "Shoriful Islam",
  title: "Shoriful Islam - Software Engineer & AI Lead",
  description:
    "Shoriful Islam is a Software Development Engineer and AI Lead from Bangladesh who builds fast, reliable web and mobile products across modern front-end and back-end stacks.",
  handle: "@shorifulislam07",
  sameAs: [
    "https://github.com/tfshorifulislam",
    "https://www.linkedin.com/in/shorifulislam",
    "https://twitter.com/shorifulislam07",
    "https://www.instagram.com/shorifulislam",
  ],
} as const;
