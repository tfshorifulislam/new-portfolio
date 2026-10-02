"use client";

import { useCallback, useMemo, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";

import type { ContributionCalendar } from "@/content/types";
import { cn } from "@/utils/cn";

// Weeks run horizontally and days stack Sunday-first, like GitHub's calendar.
// One CSS grid holds the month row, the weekday column and the cells, so all three
// share a single set of tracks: the weekday labels land on the cell rows and the month
// labels land on the week columns by construction, with nothing measured at runtime.
//
// Track sizes are deliberately fluid. Column 1 is a fixed narrow label gutter and the
// remaining tracks are 1fr each, so the weeks share whatever width the card has left
// over and the cells (aspect-square, full track width) grow with it. Below the md
// breakpoint the grid keeps a floor width - sized from the week count so cells stay
// legible - and the outer scroller takes over; at md and up there is no floor, so the
// graph spans the full card content edge to edge with nothing to scroll.
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
// GitHub labels every other row; all seven would not fit beside a 23px gutter.
const LABELLED_ROWS = new Set([1, 3, 5]);

// 18px of label text plus 5px, so with the 3px grid gap the first cell still starts
// 26px in - the same label-to-cell distance as before the grid was fluid.
const LABEL_COL = "23px";
const GAP = "3px";
// Narrowest a cell may get before the mobile scroller is preferred over shrinking.
const MIN_CELL = "11px";

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

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const cell = (event.target as HTMLElement).closest<HTMLElement>("[data-day]");
    if (!cell) {
      setTooltip(null);
      return;
    }
    const { day, count } = cell.dataset;
    if (!day || count === undefined) return;

    const rect = cell.getBoundingClientRect();

    const margin = 96;
    setTooltip({
      date: day,
      count: Number(count),
      x: Math.min(Math.max(rect.left + rect.width / 2, margin), window.innerWidth - margin),
      y: rect.top,
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
        <div
          className="overflow-x-auto pb-1"
          onPointerMove={onPointerMove}
          onPointerLeave={() => setTooltip(null)}
        >
          <div
            style={
              {
                "--weeks": calendar.weeks.length,
                "--label-col": LABEL_COL,
                "--gap": GAP,
                "--min-cell": MIN_CELL,
              } as React.CSSProperties
            }
            className="grid min-w-[calc(var(--label-col)+var(--weeks)*var(--min-cell)+(var(--weeks)-1)*var(--gap))] grid-cols-[var(--label-col)_repeat(var(--weeks),minmax(0,1fr))] gap-[var(--gap)] md:min-w-0"
          >
            {/* Row 1: month labels, each pinned to the start of the week column it opens. */}
            {calendar.weeks.map((week, index) => (
              <div
                key={week.contributionDays[0]?.date ?? index}
                style={{ gridRow: 1, gridColumn: index + 2 }}
                className="relative h-3"
              >
                {monthLabels[index] &&
                  monthLabels[index]?.key !== monthLabels[index - 1]?.key &&
                  calendar.weeks.length - index >= 3 && (
                    <span className="text-muted absolute top-0 left-0 font-mono text-[10px] leading-none whitespace-nowrap">
                      {monthLabels[index]?.label}
                    </span>
                  )}
              </div>
            ))}

            {/* Column 1: weekday labels on rows 2-8, the same rows the cells occupy.
                h-0 + self-center keeps the label out of track sizing entirely: an auto
                row would otherwise be floored by the 10px line box and come out taller
                than the cells. With a definite zero height the label contributes nothing,
                so the rows stay uniform and square-driven, and self-center still puts the
                text on its row's centre line. It overflows into the neighbouring row,
                which is always unlabelled. */}
            {WEEKDAYS.map((weekday, row) => (
              <span
                key={weekday}
                style={{ gridRow: row + 2, gridColumn: 1 }}
                className="text-muted flex h-0 items-center self-center font-mono text-[10px] leading-none"
              >
                {LABELLED_ROWS.has(row) ? weekday : null}
              </span>
            ))}

            {/* Rows 2-8: the cells themselves. */}
            {calendar.weeks.map((week, weekIndex) =>
              week.contributionDays.map((day, dayIndex) => (
                <div
                  key={day.date}
                  data-day={day.date}
                  data-count={day.contributionCount}
                  style={{ gridRow: dayIndex + 2, gridColumn: weekIndex + 2 }}
                  className={cn(
                    "hover:ring-foreground/50 aspect-square w-full rounded-[3px] transition-shadow duration-150 hover:ring-1",
                    LEVEL_CLASS[contributionLevel(day.contributionCount, scale)],
                  )}
                />
              )),
            )}
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
