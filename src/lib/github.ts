import { z } from "zod";

import type { ContributionCalendar } from "@/content/types";

const GITHUB_API = "https://api.github.com";
const GITHUB_GRAPHQL = "https://api.github.com/graphql";
const REVALIDATE_SECONDS = 3600;
// The About figures move slowly, so they revalidate on the same 12h cadence the
// homepage regenerates on rather than the hourly one the project cards use.
const USER_STATS_REVALIDATE_SECONDS = 43200;
// GitHub caps per_page at 100; the loop below stops on the first short page.
const REPOS_PER_PAGE = 100;
// A hard stop so a malformed response repeating full pages cannot hang a
// prerender. 20 pages is 2,000 repositories, far past any real account.
const MAX_REPO_PAGES = 20;

// ---------- GitHub REST API response ----------
// https://docs.github.com/en/rest/repos/repos#get-a-repository
const githubRepoSchema = z.object({
  name: z.string(),
  full_name: z.string(),
  html_url: z.httpUrl(),
  description: z.string().nullable(),
  homepage: z.string().nullable(),
  language: z.string().nullable(),
  stargazers_count: z.number(),
  forks_count: z.number(),
  open_issues_count: z.number(),
  topics: z.array(z.string()).default([]),
  fork: z.boolean(),
  archived: z.boolean(),
  pushed_at: z.string(),
});

// Account-level counts for the About figures.
// https://docs.github.com/en/rest/users/users#get-a-user
const githubUserSchema = z.object({
  login: z.string(),
  followers: z.number(),
  public_repos: z.number(),
});

// One entry of GET /users/{username}/repos. Only the star count is read, so the
// schema stays minimal instead of validating a dozen fields nobody consumes.
// https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user
const githubUserRepoSchema = z.object({
  stargazers_count: z.number(),
});

export type GithubRepo = z.infer<typeof githubRepoSchema>;

function authHeaders(): HeadersInit {
  // Server-only token (NOT NEXT_PUBLIC_*) — this code never runs on the client,
  // so the token is never bundled into the browser. Used only to raise GitHub's
  // anonymous rate limit (60/hr) to the authenticated 5,000/hr for public reads.
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type GithubUserStats = {
  followers: number;
  publicRepos: number;
  totalStars: number;
};

/**
 * GET /users/{username} - the follower count and the public repo count in one
 * request. Returns null when the account does not exist; throws on any other
 * failure so the caller can fall back to the authored numbers.
 */
async function fetchUser(username: string): Promise<z.infer<typeof githubUserSchema> | null> {
  const res = await fetch(`${GITHUB_API}/users/${encodeURIComponent(username)}`, {
    headers: authHeaders(),
    next: { revalidate: USER_STATS_REVALIDATE_SECONDS, tags: ["github"] },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub getUser ${username} failed: ${res.status}`);
  return githubUserSchema.parse(await res.json());
}

/**
 * Total stars across every public repository, summed from stargazers_count.
 *
 * The endpoint caps per_page at 100 and says nothing about a total, so the
 * figure has to be paged in: a single request silently undercounts any account
 * with more repos than fit in one page. Paging stops on the first page that
 * comes back short (including an empty one), which is how the end is detected.
 */
async function fetchStarTotal(username: string): Promise<number> {
  let total = 0;

  for (let page = 1; page <= MAX_REPO_PAGES; page++) {
    const url = `${GITHUB_API}/users/${encodeURIComponent(username)}/repos?type=owner&per_page=${REPOS_PER_PAGE}&page=${page}`;
    const res = await fetch(url, {
      headers: authHeaders(),
      next: { revalidate: USER_STATS_REVALIDATE_SECONDS, tags: ["github"] },
    });
    if (!res.ok)
      throw new Error(`GitHub listRepos ${username} (page ${page}) failed: ${res.status}`);

    const repos = z.array(githubUserRepoSchema).parse(await res.json());
    total += repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

    if (repos.length < REPOS_PER_PAGE) return total;
  }

  return total;
}

/**
 * Account-level stats from the REST API: followers and public repo count from
 * the user endpoint, total stars from a paged sum over the repos. Returns null
 * when the account is absent; throws so the caller can fall back.
 */
export async function getUserStats(username: string): Promise<GithubUserStats | null> {
  const user = await fetchUser(username);
  if (!user) return null;

  return {
    followers: user.followers,
    publicRepos: user.public_repos,
    totalStars: await fetchStarTotal(username),
  };
}

/** Fetch a single repo by "owner/name". Returns null on 404. Throws on bad schema. */
export async function getRepo(slug: string): Promise<GithubRepo | null> {
  const res = await fetch(`${GITHUB_API}/repos/${slug}`, {
    headers: authHeaders(),
    next: { revalidate: REVALIDATE_SECONDS, tags: ["github"] },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub getRepo ${slug} failed: ${res.status}`);
  return githubRepoSchema.parse(await res.json());
}

/** Fetch a repo's README as raw markdown. Returns null when the repo has none (404),
 *  which is common enough that it is not an error. Throws on other failures so the
 *  caller can fall back to cache. */
export async function getReadme(slug: string): Promise<string | null> {
  const res = await fetch(`${GITHUB_API}/repos/${slug}/readme`, {
    // The raw media type returns markdown directly instead of base64 JSON.
    headers: { ...authHeaders(), Accept: "application/vnd.github.raw" },
    next: { revalidate: REVALIDATE_SECONDS, tags: ["github"] },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub getReadme ${slug} failed: ${res.status}`);
  return res.text();
}

// ---------- Contribution calendar (GraphQL) ----------
// The calendar exists only in GraphQL; there is no REST equivalent, and per-day
// counts cannot be derived from the REST user or repositories endpoints.
// https://docs.github.com/en/graphql/reference/objects#contributioncalendar
const CONTRIBUTION_CALENDAR_QUERY = `query ($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
            weekday
            color
          }
        }
      }
    }
  }
}`;

const githubContributionCalendarSchema = z.object({
  // Optional because a failed query returns `errors` and often no `data` at all.
  data: z
    .object({
      user: z
        .object({
          contributionsCollection: z.object({
            contributionCalendar: z.object({
              totalContributions: z.number(),
              weeks: z.array(
                z.object({
                  contributionDays: z.array(
                    z.object({
                      contributionCount: z.number(),
                      date: z.string(),
                      weekday: z.number(),
                      color: z.string(),
                    }),
                  ),
                }),
              ),
            }),
          }),
        })
        .nullable(),
    })
    .optional(),
  // GraphQL reports query failures in the body with HTTP 200, so `errors` has to be
  // read explicitly - otherwise a rejected query is indistinguishable from no data.
  errors: z.array(z.object({ message: z.string() })).optional(),
});

/**
 * A year of daily contribution counts for the account.
 *
 * GraphQL rejects unauthenticated requests outright, so unlike the REST reads
 * above this one genuinely needs GITHUB_TOKEN: returns null when it is unset,
 * and throws on transport, GraphQL or schema failures so the caller can log the
 * reason and drop the section rather than render an empty calendar.
 */
export async function getContributionCalendar(
  username: string,
): Promise<ContributionCalendar | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const res = await fetch(GITHUB_GRAPHQL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query: CONTRIBUTION_CALENDAR_QUERY, variables: { login: username } }),
    // Same 12h cadence as the About figures: both are read by the same prerender.
    next: { revalidate: USER_STATS_REVALIDATE_SECONDS, tags: ["github"] },
  });
  if (!res.ok) throw new Error(`GitHub contributionCalendar ${username} failed: ${res.status}`);

  const parsed = githubContributionCalendarSchema.parse(await res.json());
  if (parsed.errors?.length) {
    throw new Error(`GitHub contributionCalendar ${username} error: ${parsed.errors[0].message}`);
  }

  const user = parsed.data?.user;
  if (!user) return null;

  const { totalContributions, weeks } = user.contributionsCollection.contributionCalendar;
  return { totalContributions, weeks };
}
