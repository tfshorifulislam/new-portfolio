import { projects as curation } from "@/content/data";
import type { Project } from "@/content/types";
import { getCachedRepoData } from "@/lib/github-cache";
import type { GithubRepo } from "@/lib/github";

export type MergedProject = Project & {
  stars: number | null;
  forks: number | null;
  language: string | null;
  description: string | null;
  homepage: string | null;
  htmlUrl: string | null;
  readmeExcerpt: string | null;
};

/** Pure: merge curation rows with live repos, sort featured-first. */
function mergeProjects(
  curation: Project[],
  repos: GithubRepo[],
  readmeExcerpts: Map<string, string | null> = new Map(),
): MergedProject[] {
  const byName = new Map(repos.map((r) => [r.name.toLowerCase(), r]));

  const merged: MergedProject[] = curation.map((c) => {
    const live = byName.get(c.repo.toLowerCase());
    const language = live ? live.language : null;
    return {
      ...c,
      // The language is rendered as its own chip, so a tag repeating it is a visible
      // duplicate ("Dart Dart" on three cards). Curation data legitimately lists the
      // language among tags, so drop it here rather than editing every row.
      tags: c.tags.filter((t) => t.toLowerCase() !== (language ?? "").toLowerCase()),
      stars: live ? live.stargazers_count : null,
      forks: live ? live.forks_count : null,
      language,
      description: c.customBlurb ?? (live ? live.description : null),
      homepage: live ? live.homepage : null,
      htmlUrl: live ? live.html_url : null,
      readmeExcerpt: readmeExcerpts.get(c.repo.toLowerCase()) ?? null,
    };
  });

  return merged.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.order !== b.order) return a.order - b.order;
    return (b.stars ?? 0) - (a.stars ?? 0);
  });
}

/** Async wrapper: read the curated list + cached GitHub stats, then merge.
 *  The cache is 24h-TTL; GitHub failures fall back to it so the section always
 *  renders. */
export async function getProjects(): Promise<MergedProject[]> {
  const OWNER = "shorifulislam";
  const slugs = curation.map((c) => `${OWNER}/${c.repo}`);

  const cacheMap = await getCachedRepoData(slugs);

  // Build GithubRepo-shaped objects from cache so mergeProjects stays unchanged
  const repos: GithubRepo[] = curation.map((c) => {
    const slug = `${OWNER}/${c.repo}`;
    const stats = cacheMap.get(slug);
    return {
      name: c.repo,
      full_name: slug,
      html_url: stats?.htmlUrl ?? `https://github.com/${slug}`,
      description: stats?.description ?? null,
      homepage: stats?.homepage ?? null,
      language: stats?.language ?? null,
      stargazers_count: stats?.stars ?? 0,
      forks_count: stats?.forks ?? 0,
      open_issues_count: 0,
      topics: [],
      fork: false,
      archived: false,
      pushed_at: new Date().toISOString(),
    };
  });

  const readmeExcerpts = new Map(
    curation.map((c) => [
      c.repo.toLowerCase(),
      cacheMap.get(`${OWNER}/${c.repo}`)?.readmeExcerpt ?? null,
    ]),
  );

  return mergeProjects(curation, repos, readmeExcerpts);
}
