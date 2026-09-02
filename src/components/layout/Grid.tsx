import React from "react";

import { cn } from "@/lib/utils";
import { variantClasses, paddingClasses } from "./layout-variants";
import type { SectionVariant } from "./layout-variants";

interface GridProps {
  children: React.ReactNode;
  className?: string;
  /** Background variant for the zone (Vercel-style section zone). */
  variant?: SectionVariant;
  /** Vertical padding scale for the zone. */
  padding?: "none" | "sm" | "md" | "lg";
  /** Render a hairline divider above the zone (Vercel section separation). */
  topDivider?: boolean;
  /** Render a hairline divider below the zone. */
  bottomDivider?: boolean;
  /** Render "+" corner markers on the zone (Vercel decorative detail). */
  corners?: "none" | "top" | "all";
}

/**
 * Vercel-style grid zone: a full-width section with a subtle full-bleed column
 * guide background rendered BEHIND the content (so solid content blocks cover
 * it), optional "+" corner markers, and hairline dividers. Content cells sit in
 * a 12-column grid (use `col-span-*` on children / `GridCell`).
 */
export const Grid = ({
  children,
  className,
  variant = "default",
  padding = "lg",
  topDivider = false,
  bottomDivider = false,
  corners = "top",
}: GridProps) => {
  const showTop = corners === "top" || corners === "all";
  const showBottom = corners === "all";

  return (
    <section className={cn("grid-zone", variantClasses[variant], className)}>
      {/* Hairline dividers at the zone edges (Vercel section separation) */}
      {topDivider && <div aria-hidden className='pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-border' />}
      {bottomDivider && (
        <div aria-hidden className='pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px bg-border' />
      )}

      {/* Guide layer - spans the full section height, centered + capped to match
          the content container width (so lines align with the columns). */}
      <div aria-hidden className='pointer-events-none absolute inset-x-0 top-0 bottom-0 mx-auto max-w-7xl'>
        <div
          className='grid-guides-layer left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8'
          style={{ "--grid-cols": 12, "--grid-gap": "1.5rem" } as React.CSSProperties}
        />
      </div>

      <div
        className={cn(
          "grid-zone__content mx-auto w-full max-w-7xl grid grid-cols-12 gap-6 px-4 sm:px-6 lg:px-8",
          paddingClasses[padding],
        )}
        style={{ "--grid-cols": 12, "--grid-gap": "1.5rem" } as React.CSSProperties}>
        {/* Vercel-style "+" markers centered on the first/last guide lines */}
        {showTop && <span aria-hidden className='grid-plus left-4 top-0 lg:left-8' />}
        {showTop && <span aria-hidden className='grid-plus right-4 top-0 lg:right-8' />}
        {showBottom && <span aria-hidden className='grid-plus bottom-0 left-4 lg:left-8' />}
        {showBottom && <span aria-hidden className='grid-plus right-4 bottom-0 lg:right-8' />}

        {children}
      </div>
    </section>
  );
};

interface GridCellProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A cell within the 12-column grid. Use Tailwind `col-span-*`/`md:col-span-*`
 * utilities in `className` to control how many columns it spans.
 */
export const GridCell = ({ children, className }: GridCellProps) => {
  return <div className={cn("min-w-0", className)}>{children}</div>;
};
