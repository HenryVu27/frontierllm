/**
 * Toc — table-of-contents component rendered in RightSidebar.
 *
 * Reads h2/h3 headings from the manifest entry (or from a prop directly).
 * Renders a flat anchor list with scroll-spy highlighting.
 *
 * Highlighted item uses the primary foreground tint to match active state.
 */

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import type { Heading } from "@/lib/manifest";

interface Props {
  headings: Heading[];
}

export function Toc({ headings }: Props) {
  const ids = useMemo(() => headings.map((h) => h.id), [headings]);
  const activeId = useScrollSpy(ids);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="On this page">
      <p className="font-sans text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
        On this page
      </p>
      <ul className="space-y-1" role="list">
        {headings.map((heading) => {
          const isActive = heading.id === activeId;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={cn(
                  "block font-sans text-[13px] leading-snug py-0.5",
                  "transition-colors duration-150",
                  "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1 rounded",
                  heading.level === 3 && "pl-3",
                  isActive
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={isActive ? "location" : undefined}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
