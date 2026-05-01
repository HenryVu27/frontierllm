/**
 * useScrollSpy — tracks the currently-visible heading as the user scrolls.
 *
 * Uses IntersectionObserver with a rootMargin biased toward the top of the
 * viewport so that the heading that is logically "active" (just scrolled
 * past) is highlighted, not the one about to enter the viewport.
 *
 * rootMargin: "-80px 0% -66% 0%"
 *   - top offset of 80px accounts for the sticky Topbar (56px) + breathing room.
 *   - bottom offset of 66% means only headings in roughly the top third of
 *     the viewport trigger a change, which feels natural during reading.
 */

import { useEffect, useRef, useState } from "react";

export function useScrollSpy(ids: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);
  // Track which ids are currently intersecting
  const intersecting = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (ids.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            intersecting.current.add(entry.target.id);
          } else {
            intersecting.current.delete(entry.target.id);
          }
        }

        // Pick the first id (in document order) that is currently intersecting
        const first = ids.find((id) => intersecting.current.has(id));
        if (first !== undefined) {
          setActiveId(first);
        }
      },
      {
        rootMargin: "-80px 0% -66% 0%",
        threshold: 0,
      }
    );

    const elements: Element[] = [];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        elements.push(el);
      }
    }

    return () => {
      for (const el of elements) observer.unobserve(el);
      observer.disconnect();
    };
  }, [ids]);

  return activeId;
}
