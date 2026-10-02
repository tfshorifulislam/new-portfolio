import { Reveal } from "@/components/motion/Reveal";
import { Card } from "@/components/ui/Card";
import { Section, SectionHeading } from "@/components/ui/Section";
import type { ContributionCalendar } from "@/content/types";
import { ContributionHeatmap } from "./ContributionHeatmap";

/**
 * GitHub's contribution calendar, shown directly beneath the About figures.
 *
 * Rendered from a Server Component: the calendar is fetched in
 * `src/lib/github.ts` and cached with Next's fetch cache, so neither the token
 * nor the request ever reaches the browser. Only the hover layer below is client.
 */
export function GithubContributions({ calendar }: { calendar: ContributionCalendar | null }) {
  // Unavailable is an ordinary outcome rather than an error: GraphQL has no
  // anonymous mode, so a missing token, a rate limit or an outage all land here.
  // The section drops out entirely instead of rendering an empty grid, and the
  // rest of the homepage is unaffected.
  if (!calendar || calendar.weeks.length === 0) return null;

  const firstDay = calendar.weeks[0]?.contributionDays[0];
  const lastDay = calendar.weeks.at(-1)?.contributionDays.at(-1);
  const range = firstDay && lastDay ? `${firstDay.date} to ${lastDay.date}` : "the last year";

  return (
    <Section id="github-activity" className="scroll-mt-24">
      <div>
        <Reveal>
          {/* No `number`: the eyebrow numbering runs 01-08 through the nav's
              sections, and renumbering them is not this section's business. */}
          <SectionHeading eyebrow="GitHub" title="GitHub Activity" />
        </Reveal>

        <Reveal delay={0.08}>
          <Card>
            <p className="text-muted mb-6 text-sm">
              <span className="text-foreground font-semibold tabular-nums">
                {calendar.totalContributions.toLocaleString("en-US")}
              </span>{" "}
              contributions in the last year, {range}.
            </p>

            <ContributionHeatmap calendar={calendar} />
          </Card>
        </Reveal>
      </div>
    </Section>
  );
}

export default GithubContributions;
