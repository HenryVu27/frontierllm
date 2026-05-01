/**
 * ReadingListItem — a single row in a reading list.
 *
 * Renders: checkbox, title (external link), em-dash, gloss, meta pill,
 * clock + read time when available.
 *
 * Items with no parseable structure (text-only entries) render as a plain
 * text row with a checkbox and no external link.
 */

import { useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import type { ReadingListItem as ReadingListItemType } from "@/lib/manifest";

// ─── Kind → badge label mapping ───────────────────────────────────────────────

const KIND_LABELS: Record<string, string> = {
  paper: "paper",
  blog: "blog",
  talk: "talk",
  code: "code",
  report: "report",
};

// ─── Read-time estimation ─────────────────────────────────────────────────────

/** Very rough: attempt to parse "N min" from meta string. */
function parseReadTime(meta?: string): string | null {
  if (!meta) return null;
  const match = meta.match(/(\d+)\s*min/i);
  return match ? `${match[1]} min` : null;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  item: ReadingListItemType;
  /** The topic slug this item belongs to (for progress key lookup). */
  slug: string;
}

export function ReadingListItem({ item }: Props) {
  const { progress, toggleItem } = useReadingProgress();
  const isRead = progress[item.id]?.status === "read";

  const handleCheckedChange = useCallback(() => {
    toggleItem(item.id);
  }, [item.id, toggleItem]);

  const readTime = parseReadTime(item.meta);

  return (
    <li
      className={cn(
        "group flex items-start gap-3 rounded-lg px-3 py-2.5",
        "transition-colors duration-150",
        "hover:bg-accent/40",
        isRead && "opacity-70"
      )}
    >
      {/* Checkbox */}
      <div className="mt-0.5 shrink-0">
        <Checkbox
          id={`item-${item.id}`}
          checked={isRead}
          onCheckedChange={handleCheckedChange}
          aria-label={`Mark "${item.title || item.text}" as ${isRead ? "unread" : "read"}`}
          className={cn(
            "transition-all duration-150",
            isRead && "scale-[0.95] opacity-80"
          )}
        />
      </div>

      {/* Row content */}
      <div className="flex-1 min-w-0">
        <label
          htmlFor={`item-${item.id}`}
          className="cursor-pointer"
        >
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
            {/* Title — link if we have a URL, plain text otherwise */}
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1",
                  "font-serif text-[17px] leading-snug",
                  "text-foreground underline decoration-border underline-offset-2",
                  "transition-colors duration-150",
                  "hover:text-primary hover:decoration-primary",
                  "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1 focus-visible:rounded",
                  isRead && "line-through decoration-muted-foreground"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {item.title || item.text}
                <ExternalLink
                  className="w-3 h-3 shrink-0 text-muted-foreground opacity-60"
                  aria-hidden="true"
                />
              </a>
            ) : (
              <span
                className={cn(
                  "font-serif text-[17px] leading-snug text-foreground",
                  isRead && "line-through decoration-muted-foreground"
                )}
              >
                {item.title || item.text}
              </span>
            )}

            {/* Gloss — em-dash + muted text */}
            {item.gloss && (
              <span className="font-sans text-sm text-muted-foreground leading-snug">
                — {item.gloss}
              </span>
            )}
          </div>

          {/* Meta row: kind pill + read time */}
          {(item.kind || readTime) && (
            <div className="flex items-center gap-2 mt-1.5">
              {item.kind && KIND_LABELS[item.kind] && (
                <Badge
                  variant="outline"
                  className="font-sans text-xs px-1.5 py-0 h-5 rounded-full border-border text-muted-foreground"
                >
                  {KIND_LABELS[item.kind]}
                </Badge>
              )}
              {readTime && (
                <span className="flex items-center gap-1 font-sans text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  {readTime}
                </span>
              )}
            </div>
          )}
        </label>
      </div>
    </li>
  );
}
