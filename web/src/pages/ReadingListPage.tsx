/**
 * ReadingListPage — /reading
 * Phase 6: Full implementation.
 *
 * Flat, filterable reading list across all topics.
 * Filters (URL-driven):
 *   ?status=all|unread|read
 *   ?topic=<slug>|all (comma-separated for multi-select)
 *   ?sort=topic|read-time|title
 *
 * When sort=topic (default), grouped by topic with section headings.
 */

import { useSearchParams, Link } from "react-router-dom";
import { useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ReadingListItem } from "@/components/content/ReadingListItem";
import { getTopics, getAllEntries } from "@/lib/manifest";
import type { ManifestEntry, ReadingListItem as ReadingListItemType } from "@/lib/manifest";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { totalReadingItems, totalReadItems } from "@/lib/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "unread" | "read";
type SortMode = "topic" | "read-time" | "title";

interface FlatItem {
  item: ReadingListItemType;
  topic: ManifestEntry;
}

// ─── Topic filter popover ─────────────────────────────────────────────────────

interface TopicFilterProps {
  topics: ManifestEntry[];
  selectedSlugs: Set<string>;
  onToggle: (slug: string) => void;
  onAll: () => void;
}

function TopicFilterPopover({ topics, selectedSlugs, onToggle, onAll }: TopicFilterProps) {
  const allSelected = selectedSlugs.size === 0;
  const label = allSelected
    ? "All topics"
    : selectedSlugs.size === 1
    ? topics.find((t) => selectedSlugs.has(t.slug))?.title ?? "1 topic"
    : `${selectedSlugs.size} topics`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 font-sans text-xs gap-1.5"
          aria-label="Filter by topic"
        >
          <Filter className="w-3 h-3" aria-hidden="true" />
          {label}
          <ChevronDown className="w-3 h-3" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-1">
          {/* All option */}
          <label className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer",
            "hover:bg-accent transition-colors duration-150"
          )}>
            <Checkbox
              checked={allSelected}
              onCheckedChange={onAll}
              aria-label="All topics"
            />
            <span className="font-sans text-xs text-foreground">All topics</span>
          </label>

          <div className="border-t border-border my-1" />

          {topics.map((topic) => (
            <label
              key={topic.slug}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer",
                "hover:bg-accent transition-colors duration-150"
              )}
            >
              <Checkbox
                checked={selectedSlugs.has(topic.slug)}
                onCheckedChange={() => onToggle(topic.slug)}
                aria-label={topic.title}
              />
              <span className="font-sans text-xs text-foreground truncate">
                {topic.title}
              </span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ReadingListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { progress } = useReadingProgress();

  // Parse URL params
  const status: StatusFilter = (() => {
    const s = searchParams.get("status") ?? "all";
    return ["all", "unread", "read"].includes(s) ? (s as StatusFilter) : "all";
  })();

  const topicParam = searchParams.get("topic") ?? "";
  const selectedSlugs = useMemo(() => {
    if (!topicParam) return new Set<string>();
    return new Set(topicParam.split(",").filter(Boolean));
  }, [topicParam]);

  const sort: SortMode = (() => {
    const s = searchParams.get("sort") ?? "topic";
    return ["topic", "read-time", "title"].includes(s) ? (s as SortMode) : "topic";
  })();

  // Data
  const topics = useMemo(() => getTopics(), []);
  const allEntries = useMemo(() => getAllEntries(), []);

  const manifest = useMemo(() => ({ generatedAt: "", entries: allEntries }), [allEntries]);

  const totalItems = totalReadingItems(manifest);
  const readItemsCount = totalReadItems(manifest, progress);

  // Build flat list
  const allFlat = useMemo<FlatItem[]>(() => {
    return topics.flatMap((topic) =>
      topic.readingList.map((item) => ({ item, topic }))
    );
  }, [topics]);

  // Apply filters
  const filtered = useMemo(() => {
    return allFlat.filter(({ item, topic }) => {
      // Status filter
      const itemStatus = progress[item.id]?.status ?? "unread";
      if (status === "read" && itemStatus !== "read") return false;
      if (status === "unread" && itemStatus === "read") return false;

      // Topic filter
      if (selectedSlugs.size > 0 && !selectedSlugs.has(topic.slug)) return false;

      return true;
    });
  }, [allFlat, status, selectedSlugs, progress]);

  // Sort
  const sorted = useMemo(() => {
    const items = [...filtered];
    if (sort === "title") {
      items.sort((a, b) =>
        (a.item.title || a.item.text).localeCompare(b.item.title || b.item.text)
      );
    } else if (sort === "read-time") {
      const parseMin = (meta?: string) => {
        if (!meta) return Infinity;
        const m = meta.match(/(\d+)\s*min/i);
        return m?.[1] ? parseInt(m[1], 10) : Infinity;
      };
      items.sort((a, b) => parseMin(a.item.meta) - parseMin(b.item.meta));
    }
    // "topic" sort: preserve topic order (default)
    return items;
  }, [filtered, sort]);

  // URL update helpers
  const setStatus = (v: StatusFilter) => {
    setSearchParams((p) => { const n = new URLSearchParams(p); n.set("status", v); return n; }, { replace: true });
  };

  const setSort = (v: SortMode) => {
    setSearchParams((p) => { const n = new URLSearchParams(p); n.set("sort", v); return n; }, { replace: true });
  };

  const toggleTopic = (slug: string) => {
    setSearchParams((p) => {
      const n = new URLSearchParams(p);
      const current = new Set((p.get("topic") ?? "").split(",").filter(Boolean));
      if (current.has(slug)) {
        current.delete(slug);
      } else {
        current.add(slug);
      }
      if (current.size === 0) n.delete("topic");
      else n.set("topic", [...current].join(","));
      return n;
    }, { replace: true });
  };

  const clearTopicFilter = () => {
    setSearchParams((p) => { const n = new URLSearchParams(p); n.delete("topic"); return n; }, { replace: true });
  };

  // Group by topic when sort=topic
  const groupedByTopic = useMemo(() => {
    if (sort !== "topic") return null;
    const groups = new Map<string, FlatItem[]>();
    for (const fi of sorted) {
      const slug = fi.topic.slug;
      if (!groups.has(slug)) groups.set(slug, []);
      groups.get(slug)!.push(fi);
    }
    return groups;
  }, [sorted, sort]);

  // Empty state messages
  const emptyMessage = (() => {
    if (filtered.length > 0) return null;
    if (status === "read") return "Nothing has been marked as read yet.";
    if (status === "unread") return "All caught up — nothing unread.";
    return "No items match these filters.";
  })();

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-4xl font-light leading-tight tracking-tight text-foreground mb-1">
          Reading list
        </h1>
        <p className="font-sans text-sm text-muted-foreground">
          Showing <span className="text-foreground font-medium">{sorted.length}</span> of{" "}
          <span className="text-foreground font-medium">{totalItems}</span> items,{" "}
          <span className="text-foreground font-medium">{readItemsCount}</span> read overall.
        </p>
      </div>

      {/* Filter controls */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {/* Status segmented control */}
        <div
          role="group"
          aria-label="Filter by status"
          className="inline-flex items-center rounded-lg border border-border bg-muted p-0.5 gap-0.5"
        >
          {(["all", "unread", "read"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={status === s}
              onClick={() => setStatus(s)}
              className={cn(
                "px-2.5 h-7 rounded-md font-sans text-xs transition-colors duration-150",
                "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1",
                status === s
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Topic filter */}
        <TopicFilterPopover
          topics={topics}
          selectedSlugs={selectedSlugs}
          onToggle={toggleTopic}
          onAll={clearTopicFilter}
        />

        {/* Sort */}
        <Select value={sort} onValueChange={(v) => setSort(v as SortMode)}>
          <SelectTrigger className="h-8 font-sans text-xs w-36" aria-label="Sort by">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="topic" className="font-sans text-xs">Topic order</SelectItem>
            <SelectItem value="title" className="font-sans text-xs">Title A–Z</SelectItem>
            <SelectItem value="read-time" className="font-sans text-xs">Read time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {emptyMessage ? (
        <div className="py-12 text-center">
          <p className="font-sans text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : groupedByTopic ? (
        // Grouped by topic
        <div className="space-y-8">
          {[...groupedByTopic.entries()].map(([slug, items]) => {
            const topic = topics.find((t) => t.slug === slug)!;
            return (
              <section key={slug}>
                <div className="flex items-center gap-2 mb-2">
                  <Link
                    to={`/notes/${slug}`}
                    className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors duration-150"
                  >
                    {topic.title}
                  </Link>
                  <span className="font-sans text-xs text-muted-foreground">
                    ({items.length})
                  </span>
                </div>
                <ul className="space-y-0.5">
                  {items.map(({ item }) => (
                    <ReadingListItem key={item.id} item={item} slug={slug} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        // Flat list
        <ul className="space-y-0.5">
          {sorted.map(({ item, topic }) => (
            <li key={item.id} className="flex items-start gap-2">
              {/* Topic pill prefix */}
              <span className="shrink-0 mt-3 font-mono text-[10px] text-muted-foreground bg-muted border border-border rounded px-1.5 py-0.5">
                {topic.slug.split("-")[0]}
              </span>
              <div className="flex-1 min-w-0">
                <ReadingListItem item={item} slug={topic.slug} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
