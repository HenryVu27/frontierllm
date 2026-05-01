/**
 * NotesIndexPage — /notes
 * Phase 6: Full implementation.
 * - Header + Grid/List toggle (URL ?view=grid|list, persisted via useUiPrefs).
 * - 7-card grid of TopicProgressCard components.
 */

import { useSearchParams } from "react-router-dom";
import { LayoutGrid, List } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { TopicProgressCard } from "@/components/progress/TopicProgressCard";
import { getTopics } from "@/lib/manifest";
import { useUiPrefs } from "@/hooks/useUiPrefs";
import { cn } from "@/lib/utils";

export function NotesIndexPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { prefs, setPref } = useUiPrefs();

  // URL param ?view= overrides stored pref
  const urlView = searchParams.get("view");
  const view: "grid" | "list" =
    urlView === "grid" || urlView === "list" ? urlView : prefs.notesView;

  const handleViewChange = (next: "grid" | "list") => {
    setPref("notesView", next);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("view", next);
      return params;
    }, { replace: true });
  };

  // Show note topics only (exclude orientation)
  const topics = getTopics().filter((t) => t.kind === "topic");

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-4xl font-light leading-tight tracking-tight text-foreground mb-1">
            Notes
          </h1>
          <p className="font-sans text-sm text-muted-foreground leading-relaxed">
            The conceptual layer.
          </p>
        </div>

        {/* View toggle */}
        <div
          role="group"
          aria-label="View layout"
          className="inline-flex items-center rounded-lg border border-border bg-muted p-0.5 gap-0.5 shrink-0 mt-1"
        >
          <button
            type="button"
            aria-pressed={view === "grid"}
            aria-label="Grid view"
            title="Grid view"
            onClick={() => handleViewChange("grid")}
            className={cn(
              "flex items-center justify-center w-7 h-7 rounded-md",
              "transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1",
              view === "grid"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-pressed={view === "list"}
            aria-label="List view"
            title="List view"
            onClick={() => handleViewChange("list")}
            className={cn(
              "flex items-center justify-center w-7 h-7 rounded-md",
              "transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1",
              view === "list"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Topic cards */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <TopicProgressCard key={topic.slug} topic={topic} variant="grid" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {topics.map((topic) => (
            <TopicProgressCard key={topic.slug} topic={topic} variant="list" />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
