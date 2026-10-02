// The frontend's data layer: typed accessors over src/content/data.ts, with the
// live GitHub figures merged in for the profile. Everything here is async and
// side-effect free from the caller's point of view, so the homepage reads
// exactly as it did when the content came from a database.
//
// Projects are the exception: their stars, forks, language and README come from
// GitHub too, but are merged in @/lib/projects and re-exported here.

import {
  experiences,
  faqs,
  fundingLinks,
  profile,
  services,
  skills,
  socialLinks,
  taglines,
} from "./data";
import type {
  ContributionCalendar,
  Experience,
  Faq,
  FundingLink,
  Profile,
  Service,
  Skill,
  SocialLink,
} from "./types";
import { getContributionCalendar as fetchGithubCalendar, getUserStats } from "@/lib/github";
import { professionalYears } from "@/lib/experience";

// Only the types consumers actually import from this module are re-exported; the rest
// are imported straight from @/content/types.
export type { Experience, Service } from "./types";
export { getProjects } from "@/lib/projects";

// GitHub account the About figures are read from.
const GITHUB_USERNAME = "tfshorifulislam";

// The About figures come from GitHub so they cannot go stale; the content file
// only holds the fallbacks used when GitHub is unreachable.
export async function getProfile(): Promise<Profile> {
  // Years is NOT GitHub-derived: it is professional experience, taken from the
  // experience entries. GitHub's account age answers a different question (how
  // long the account has existed) and counted hobby years as professional ones.
  const years = professionalYears(experiences.map((e) => e.period)) ?? profile.stats.years;

  let { repos, stars, followers } = profile.stats;

  try {
    const github = await getUserStats(GITHUB_USERNAME);
    // A missing account (null) is not an error worth logging loudly; a throwing
    // fetch is, because it means the numbers on screen are stale.
    if (github) {
      repos = github.publicRepos;
      stars = github.totalStars;
      followers = github.followers;
    }
  } catch (error) {
    // A GitHub outage, a rate limit or a missing GITHUB_TOKEN must never take the
    // page down: the authored numbers above are always there. Only the message
    // is logged, so the request headers - and the token - cannot reach the logs.
    console.error(
      `[profile] GitHub stats for ${GITHUB_USERNAME} unavailable, using fallbacks: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  return { ...profile, stats: { years, repos, stars, followers } };
}

/**
 * A year of daily GitHub contribution activity, or null when it is unavailable.
 *
 * Null is a normal outcome, not just an error: GraphQL has no anonymous mode, so
 * an unset GITHUB_TOKEN, a rate limit or an outage all mean "no graph to show".
 * The section hides itself on null, which is why nothing here throws.
 */
export async function getContributionCalendar(): Promise<ContributionCalendar | null> {
  try {
    return await fetchGithubCalendar(GITHUB_USERNAME);
  } catch (error) {
    // Logged as a message, not the Error, so request headers cannot reach the log.
    console.error(
      `[contributions] GitHub calendar for ${GITHUB_USERNAME} unavailable: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return null;
  }
}

export async function getExperiences(): Promise<Experience[]> {
  return [...experiences].sort((a, b) => a.order - b.order);
}

export async function getSkills(): Promise<Skill[]> {
  return [...skills].sort((a, b) => a.order - b.order);
}

export async function getServices(): Promise<Service[]> {
  return [...services].sort((a, b) => a.order - b.order);
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  return [...socialLinks].sort((a, b) => a.order - b.order);
}

/** The address every "email me" affordance links to: the Email social link,
 *  falling back to the one below if that entry is ever removed. */
export async function getContactEmail(): Promise<string> {
  const link = socialLinks.find((s) => s.platform.toLowerCase() === "email");
  return link ? link.url.replace("mailto:", "") : "nkr.shoriful.nkr@gmail.com";
}

export async function getFundingLinks(): Promise<FundingLink[]> {
  return [...fundingLinks].sort((a, b) => a.order - b.order);
}

export async function getFaqs(): Promise<Faq[]> {
  return [...faqs].sort((a, b) => a.order - b.order);
}

// The pick happens in JS, so the tagline rotates once per prerender rather than
// per visitor.
export async function getRandomTagline(): Promise<string> {
  if (taglines.length === 0) return "Rise above limits";
  return taglines[Math.floor(Math.random() * taglines.length)];
}
