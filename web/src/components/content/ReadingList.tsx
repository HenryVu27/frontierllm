/**
 * ReadingList — interactive reading list for a topic.
 *
 * Features:
 * - Progress bar + "X / Y read" count
 * - Filter: All / Unread / Read (persists to useUiPrefs; URL ?status= overrides)
 * - "Mark all read" + "Reset" with confirmation dialog
 * - Renders ReadingListItem rows
 *
 * Props: slug — the topic slug. Reads manifest entry's readingList.
 */

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getEntry } from "@/lib/manifest";
import { getAllEntries } from "@/lib/manifest";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useUiPrefs } from "@/hooks/useUiPrefs";
import { topicReadCount } from "@/lib/progress";
import { ReadingListItem } from "@/components/content/ReadingListItem";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Filter = "all" | "unread" | "read";

interface Props {
  slug: string;
}

export function ReadingList({ slug }: Props) {
  const entry = getEntry(slug);
  const { progress, setItem, clearTopic } = useReadingProgress();
  const { prefs, setPref } = useUiPrefs();
  const [searchParams] = useSearchParams();
  const [resetOpen, setResetOpen] = useState(false);

  // URL ?status= param overrides the stored pref
  const urlStatus = searchParams.get("status") as Filter | null;
  const filter: Filter =
    urlStatus && ["all", "unread", "read"].includes(urlStatus)
      ? (urlStatus as Filter)
      : prefs.readingFilter;

  const items = useMemo(() => entry?.readingList ?? [], [entry]);

  // Get manifest for clearTopic (needs the full manifest object)
  const manifest = useMemo(() => {
    const entries = getAllEntries();
    // We need to reconstruct the Manifest shape for clearTopic
    return {
      generatedAt: "",
      entries,
    };
  }, []);

  const { read, total } = useMemo(
    () =>
      topicReadCount(slug, manifest, progress),
    [slug, manifest, progress]
  );

  const pct = total > 0 ? Math.round((read / total) * 100) : 0;

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) =>
      filter === "read"
        ? progress[item.id]?.status === "read"
        : (progress[item.id]?.status ?? "unread") === "unread"
    );
  }, [items, filter, progress]);

  const handleFilterChange = useCallback(
    (value: string) => {
      setPref("readingFilter", value as Filter);
    },
    [setPref]
  );

  const handleMarkAllRead = useCallback(() => {
    for (const item of items) {
      setItem(item.id, "read");
    }
  }, [items, setItem]);

  const handleReset = useCallback(() => {
    clearTopic(slug, manifest);
    setResetOpen(false);
  }, [slug, manifest, clearTopic]);

  if (!entry) {
    return (
      <div className="py-4 font-sans text-sm text-muted-foreground">
        No reading list found for this topic.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Header row: progress + filter + actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Progress bar + count */}
        <div className="flex-1 min-w-[180px]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-sans text-xs text-muted-foreground">
              {read} / {total} read
            </span>
            <span className="font-sans text-xs text-muted-foreground">
              {pct}%
            </span>
          </div>
          <Progress
            value={pct}
            className="h-1.5"
            aria-label={`${read} of ${total} items read`}
          />
        </div>

        {/* Filter dropdown */}
        <Select value={filter} onValueChange={handleFilterChange}>
          <SelectTrigger
            className="h-8 font-sans text-xs w-28"
            aria-label="Filter reading list"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-sans text-xs">
              All ({total})
            </SelectItem>
            <SelectItem value="unread" className="font-sans text-xs">
              Unread ({total - read})
            </SelectItem>
            <SelectItem value="read" className="font-sans text-xs">
              Read ({read})
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Actions */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 font-sans text-xs"
          onClick={handleMarkAllRead}
          disabled={read === total && total > 0}
        >
          Mark all read
        </Button>

        <Dialog open={resetOpen} onOpenChange={setResetOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 font-sans text-xs text-muted-foreground hover:text-destructive"
              disabled={read === 0}
            >
              Reset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset reading progress?</DialogTitle>
              <DialogDescription>
                This will mark all {total} items in{" "}
                <strong>{entry.title}</strong> as unread. This cannot be
                undone (though you can re-tick items).
              </DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton>
              <Button
                variant="destructive"
                onClick={handleReset}
                className="font-sans text-sm"
              >
                Reset progress
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Item list */}
      {filteredItems.length === 0 ? (
        <p className="py-6 text-center font-sans text-sm text-muted-foreground">
          {filter === "read"
            ? "No items marked as read yet."
            : filter === "unread"
            ? "All items are read — great work!"
            : "No reading list items for this topic."}
        </p>
      ) : (
        <ul
          className={cn("space-y-0.5")}
          aria-label={`Reading list — ${filteredItems.length} items`}
        >
          {filteredItems.map((item) => (
            <ReadingListItem key={item.id} item={item} slug={slug} />
          ))}
        </ul>
      )}
    </div>
  );
}
