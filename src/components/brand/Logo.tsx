import { cn } from "@/utils/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        role="img"
        aria-label="Shoriful Islam logo"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <defs>
          {/* CSS variables rather than brand.ts constants: SVG stop-color resolves them,
              so the mark follows a runtime palette change instead of staying on the
              default. brand.ts is still the source of the default those vars hold. */}
          <linearGradient id="logo-sf" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="var(--brand-deep)" />
            <stop offset="1" stopColor="var(--brand-mid)" />
          </linearGradient>
        </defs>
        {/* "SF" monogram: same stroke weight, round caps, gradient and 32x32 box as the
            mark it replaces, so navbar and footer geometry is untouched. Two paths on a
            shared baseline - S (left), F (right) - rather than one ligature, to keep each
            letter's counters open and legible at 32px. Cap height 9..23 with the stroke
            landing on 7.5..24.5, matching the previous mark's optical height exactly. */}
        <path
          d="M14.02 10.91C13.6 9.64 12.3 9 10.7 9C8.3 9 5.22 10.4 5.22 12.56C5.22 14.73 7.7 15.75 10.3 16.25C12.9 16.76 14.02 17.78 14.02 19.95C14.02 21.98 12.5 23 10.2 23C8.6 23 7.2 22.24 6.5 20.96"
          fill="none"
          stroke="url(#logo-sf)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20.62 23V9H27M20.62 16.25H24.58"
          fill="none"
          stroke="url(#logo-sf)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
