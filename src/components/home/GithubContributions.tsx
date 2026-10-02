import { Reveal } from "@/components/motion/Reveal";
import { Card } from "@/components/ui/Card";
import { Section, SectionHeading } from "@/components/ui/Section";
import type { ContributionCalendar } from "@/content/types";
import { ContributionHeatmap } from "./ContributionHeatmap";

export function GithubContributions({ calendar }: { calendar: ContributionCalendar | null }) {
 
  if (!calendar || calendar.weeks.length === 0) return null;

  const firstDay = calendar.weeks[0]?.contributionDays[0];
  const lastDay = calendar.weeks.at(-1)?.contributionDays.at(-1);
  const range = firstDay && lastDay ? `${firstDay.date} to ${lastDay.date}` : "the last year";

  return (
    <Section id="github-activity" className="scroll-mt-24">
      <div>
        <Reveal>
     
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
