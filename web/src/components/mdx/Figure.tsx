import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FigureProps {
  caption: string;
  id?: string;
  number?: string | number;
  /** Optional className for the inner figure body wrapper. */
  bodyClassName?: string;
  children: ReactNode;
}

/**
 * Minimalist figure wrapper for SVG diagrams and interactive visualisations.
 *
 * - Centres the figure body and renders a small caption underneath.
 * - Soft entrance animation (fade + slight Y) on first render; respects
 *   prefers-reduced-motion globally via the CSS reset.
 * - Accepts an `id` for anchor linking from the prose.
 */
export function Figure({
  caption,
  id,
  number,
  bodyClassName,
  children,
}: FigureProps) {
  return (
    <motion.figure
      id={id}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className="my-8 not-prose"
    >
      <div
        className={cn(
          "rounded-lg border border-border bg-card/40",
          "px-4 sm:px-6 py-5",
          "flex flex-col items-center justify-center",
          bodyClassName,
        )}
      >
        {children}
      </div>
      <figcaption className="mt-2 text-xs text-muted-foreground italic leading-relaxed text-center px-2">
        {number !== undefined && (
          <span className="font-medium not-italic mr-1 text-foreground/80">
            Figure {number}.
          </span>
        )}
        {caption}
      </figcaption>
    </motion.figure>
  );
}
