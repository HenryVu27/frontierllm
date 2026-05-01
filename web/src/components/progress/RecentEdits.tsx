/**
 * RecentEdits — shows the last N manifest entries by lastModified.
 * Each row: title + relative time + link.
 */

import { Link } from "react-router-dom";
import { recentlyEdited } from "@/lib/progress";
import { formatRelativeTime } from "@/lib/format";
import { getAllEntries } from "@/lib/manifest";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface Props {
  count?: number;
}

function entryHref(kind: string, slug: string): string {
  if (kind === "topic") return `/notes/${slug}`;
  if (kind === "orientation") return "/notes/07-frontier-labs/orientation";
  if (kind === "project") return `/projects/${slug}`;
  if (kind === "root") return "/about";
  return "/";
}

export function RecentEdits({ count = 5 }: Props) {
  const manifest = useMemo(() => ({
    generatedAt: "",
    entries: getAllEntries(),
  }), []);

  const entries = recentlyEdited(manifest, count);

  if (entries.length === 0) {
    return (
      <p className="font-sans text-sm text-muted-foreground">
        Nothing edited yet.
      </p>
    );
  }

  return (
    <ul className="space-y-0.5">
      {entries.map((entry) => (
        <li key={entry.slug}>
          <Link
            to={entryHref(entry.kind, entry.slug)}
            className={cn(
              "flex items-center justify-between gap-4 rounded-lg px-3 py-2",
              "transition-colors duration-150",
              "hover:bg-accent",
              "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1"
            )}
          >
            <span className="font-sans text-sm text-foreground truncate">
              {entry.title}
            </span>
            <span className="font-sans text-xs text-muted-foreground shrink-0 tabular-nums">
              {formatRelativeTime(entry.lastModified)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
