import { getReadme, getRepo } from "@/lib/github";
import { toExcerpt } from "@/lib/readme";

// In-memory, 24h TTL. There is no database behind this: the homepage is
// prerendered, so the cache exists to keep a running server from refetching the
// same repos on every regeneration, not to persist anything between deploys.
// Anything lost on a cold start is simply refetched.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export type CachedRepoStats = {
  stars: number;
  forks: number;
  language: string | null;
  description: string | null;
  homepage: string | null;
  htmlUrl: string;
  readmeExcerpt: string | null;
};

type Entry<T> = { value: T; fetchedAt: number };

const repoCache = new Map<string, Entry<CachedRepoStats>>();

function isStale(entry: Entry<unknown>, now = Date.now()): boolean {
  return now - entry.fetchedAt > CACHE_TTL_MS;
}

function emptyStats(slug: string): CachedRepoStats {
  return {
    stars: 0,
    forks: 0,
    language: null,
    description: null,
    homepage: null,
    htmlUrl: `https://github.com/${slug}`,
    readmeExcerpt: null,
  };
}

/**
 * Live repo stats plus a stripped README excerpt, memoised for 24h. Never
 * throws: a rate limit, a network error or a deleted repo falls back to
 * whatever is already cached, so the section always renders.
 */
export async function getCachedRepoData(slugs: string[]): Promise<Map<string, CachedRepoStats>> {
  const result = new Map<string, CachedRepoStats>();

  await Promise.all(
    slugs.map(async (slug) => {
      const cached = repoCache.get(slug);
      if (cached && !isStale(cached)) {
        result.set(slug, cached.value);
        return;
      }

      try {
        const live = await getRepo(slug);
        if (!live) {
          // 404: renamed, deleted or private. Cache the empty result so a repo that is
          // gone is not refetched on every regeneration, but keep any older entry so a
          // rename that flips back does not blank the card.
          const value = cached?.value ?? emptyStats(slug);
          repoCache.set(slug, { value, fetchedAt: Date.now() });
          result.set(slug, value);
          return;
        }

        let readmeExcerpt = cached?.value.readmeExcerpt ?? null;
        try {
          const markdown = await getReadme(slug);
          readmeExcerpt = markdown === null ? "" : toExcerpt(markdown);
        } catch {
          /* keep whatever we had; the next 24h refresh tries again */
        }

        const value: CachedRepoStats = {
          stars: live.stargazers_count,
          forks: live.forks_count,
          language: live.language,
          description: live.description,
          homepage: live.homepage,
          htmlUrl: live.html_url,
          readmeExcerpt,
        };
        repoCache.set(slug, { value, fetchedAt: Date.now() });
        result.set(slug, value);
      } catch {
        result.set(slug, cached?.value ?? emptyStats(slug));
      }
    }),
  );

  return result;
}
