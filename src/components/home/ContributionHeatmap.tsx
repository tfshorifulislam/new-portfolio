"use client";

import { useCallback, useMemo, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";

import type { ContributionCalendar } from "@/content/types";
import { cn } from "@/utils/cn";

// Weeks run horizontally and days stack Sunday-first, like GitHub's calendar.
// 13px cells with a 3px gap are repeated by the month row, the weekday column and
// the cells themselves, so both axes line up with no measurement at runtime.
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
// GitHub labels every other row; all seven would not fit beside 13px cells.
const LABELLED_ROWS = new Set([1, 3, 5]);

const LEVEL_CLASS = [
  "bg-contrib-0",
  "bg-contrib-1",
  "bg-contrib-2",
  "bg-contrib-3",
  "bg-contrib-4",
] as const;

const MONTH_FORMAT = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const DAY_FORMAT = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * The five intensity steps, as GitHub's quartiles of the account's own non-zero
 * days rather than fixed cut-offs.
 *
 * A fixed "10 or more is the top bucket" scale would push most of a busy year
 * into one colour and leave the middle of the ramp unused, which is exactly why
 * GitHub derives its buckets from the data too.
 *
 * GitHub's literal hexes are deliberately not painted: they are fixed to
 * GitHub's light theme (a near-white empty cell and dark greens), which glares on
 * this site's deep dark ground and ignores all four brand palettes. The scale is
 * stepped through the --contrib-* tokens instead, so it follows the theme.
 */
type ContributionScale = readonly [number, number, number];

function contributionScale(counts: readonly number[]): ContributionScale {
  const active = counts.filter((count) => count > 0).sort((a, b) => a - b);
  if (active.length === 0) return [0, 0, 0];

  const quantile = (q: number) =>
    active[Math.min(active.length - 1, Math.floor(active.length * q))];
  return [quantile(0.25), quantile(0.5), quantile(0.75)];
}

/** Bucket a day's count into 0 (no activity) to 4 (busiest) using those quartiles. */
function contributionLevel(count: number, scale: ContributionScale): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  const [q1, q2, q3] = scale;
  if (count <= q1) return 1;
  if (count <= q2) return 2;
  if (count <= q3) return 3;
  return 4;
}

/** Parse "YYYY-MM-DD" as a UTC instant. `new Date(string)` does the same, but doing
 *  it explicitly stops a negative local offset from rendering the day before. */
function parseDay(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function describeDay(count: number, date: string): string {
  const label =
    count === 0
      ? "No contributions"
      : `${count.toLocaleString("en-US")} contribution${count === 1 ? "" : "s"}`;
  return `${label} on ${DAY_FORMAT.format(parseDay(date))}`;
}

type Tooltip = { date: string; count: number; x: number; y: number; below: boolean };

export function ContributionHeatmap({ calendar }: { calendar: ContributionCalendar }) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  const scale = useMemo(
    () =>
      contributionScale(
        calendar.weeks.flatMap((week) => week.contributionDays).map((d) => d.contributionCount),
      ),
    [calendar.weeks],
  );

  /** Label a week when it is the first week of a new month. Keyed off the week's own
   *  first day, which stays correct for the partial first and last weeks. */
  const monthLabels = useMemo(
    () =>
      calendar.weeks.map((week) => {
        const first = week.contributionDays[0];
        return first
          ? { key: first.date.slice(0, 7), label: MONTH_FORMAT.format(parseDay(first.date)) }
          : null;
      }),
    [calendar.weeks],
  );

  // One delegated listener rather than ~370: the tooltip needs the hovered cell's
  // rect, and a handler per cell would be a lot of bookkeeping for a static grid.
  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const cell = (event.target as HTMLElement).closest<HTMLElement>("[data-day]");
    if (!cell) {
      setTooltip(null);
      return;
    }
    const { day, count } = cell.dataset;
    if (!day || count === undefined) return;

    const rect = cell.getBoundingClientRect();
    // The bubble is much wider than a cell and the grid scrolls, so the hovered
    // cell can sit against either edge: keep the bubble inside the viewport.
    const margin = 96;
    setTooltip({
      date: day,
      count: Number(count),
      x: Math.min(Math.max(rect.left + rect.width / 2, margin), window.innerWidth - margin),
      y: rect.top,
      // Flip below the cell rather than off the top of the page.
      below: rect.top < 72,
    });
  }, []);

  const firstDay = calendar.weeks[0]?.contributionDays[0];
  const lastDay = calendar.weeks.at(-1)?.contributionDays.at(-1);

  return (
    <div>
      <div
        role="img"
        aria-label={
          firstDay && lastDay
            ? `GitHub contribution calendar: ${calendar.totalContributions.toLocaleString("en-US")} contributions between ${firstDay.date} and ${lastDay.date}.`
            : "GitHub contribution calendar"
        }
      >
        {/* Horizontal scroll rather than shrinking: 13px cells stay legible and
            tappable, and only this element scrolls, so the page never overflows. */}
        <div
          className="overflow-x-auto pb-1"
          onPointerMove={onPointerMove}
          onPointerLeave={() => setTooltip(null)}
        >
          <div className="min-w-max">
            <div className="mb-1.5 flex gap-[3px]">
              {calendar.weeks.map((week, index) => (
                <div
                  key={week.contributionDays[0]?.date ?? index}
                  className="relative h-3 w-[13px] shrink-0"
                >
                  {/* One label per new month, and never one so close to the right
                      edge that it would be clipped by the scroller. */}
                  {monthLabels[index] &&
                    monthLabels[index]?.key !== monthLabels[index - 1]?.key &&
                    calendar.weeks.length - index >= 3 && (
                      <span className="text-muted absolute top-0 left-0 font-mono text-[10px] leading-none whitespace-nowrap">
                        {monthLabels[index]?.label}
                      </span>
                    )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="flex shrink-0 flex-col gap-[3px]">
                {WEEKDAYS.map((weekday, row) => (
                  <span
                    key={weekday}
                    className="text-muted flex h-[13px] items-center font-mono text-[10px] leading-none"
                  >
                    {LABELLED_ROWS.has(row) ? weekday : null}
                  </span>
                ))}
              </div>

              <div className="flex gap-[3px]">
                {calendar.weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[3px]">
                    {week.contributionDays.map((day) => (
                      <div
                        key={day.date}
                        data-day={day.date}
                        data-count={day.contributionCount}
                        className={cn(
                          "hover:ring-foreground/50 size-[13px] rounded-[3px] transition-shadow duration-150 hover:ring-1",
                          LEVEL_CLASS[contributionLevel(day.contributionCount, scale)],
                        )}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        <span className="text-muted mr-1 font-mono text-[10px] tracking-widest uppercase">
          Less
        </span>
        {LEVEL_CLASS.map((className, level) => (
          <span key={level} className={cn("size-[10px] rounded-[2px]", className)} />
        ))}
        <span className="text-muted ml-1 font-mono text-[10px] tracking-widest uppercase">
          More
        </span>
      </div>

      {/* Portalled to the body on purpose: the graph sits inside a Card with
          backdrop-blur and inside a Reveal with a transform, and either one
          becomes the containing block for a position:fixed descendant. */}
      {tooltip &&
        createPortal(
          <div
            role="tooltip"
            style={{ left: tooltip.x, top: tooltip.below ? tooltip.y + 21 : tooltip.y - 8 }}
            className={cn(
              "border-border bg-surface text-foreground pointer-events-none fixed z-50 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] whitespace-nowrap shadow-lg backdrop-blur-md",
              "-translate-x-1/2",
              tooltip.below ? "" : "-translate-y-full",
            )}
          >
            {describeDay(tooltip.count, tooltip.date)}
          </div>,
          document.body,
        )}
    </div>
  );
}
