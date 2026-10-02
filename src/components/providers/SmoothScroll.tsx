"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Page-wide smooth scrolling, mounted once in the root layout.
 *
 * - `anchors: true` delegates same-page `#id` links to `lenis.scrollTo` instead of the
 *   browser's own jump. `scrollTo` reads each target's `scroll-margin-top`, so the existing
 *   `scroll-mt-24` on every section keeps landing clear of the fixed navbar.
 * - `autoRaf: true` hands the animation frame loop to Lenis; `destroy()` cancels it and drops
 *   every listener, which is all React Strict Mode's double mount needs.
 * - `respectReducedMotion` is left at its default (true): under `prefers-reduced-motion: reduce`
 *   Lenis drops smoothing entirely and anchor jumps land instantly.
 *
 * `syncTouch` is left at its default (false) so touch devices keep the platform's own inertial
 * scrolling, which is both smoother and safer on iOS than emulated wheel physics.
 */
export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      anchors: true,
      autoRaf: true,
    });

    return () => lenis.destroy();
  }, []);

  return null;
}
