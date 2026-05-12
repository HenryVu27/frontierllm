/**
 * SearchResults — renders grouped search results on the /search page.
 *
 * Three groups: Pages / Headings / Reading items.
 * Each group: section heading + up to 10 results with "Show all (N)" expansion.
 * Each result row: title (with kind badge), breadcrumb to source.
 * Empty state: "No matches" + suggested actions.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Hash, BookOpen, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchDoc, GroupedResults } from "@/lib/search-index";

// ─── Result row ───────────────────────────────────────────────────────────────

interface ResultRowProps {
  doc: SearchDoc;
}

function KindBadge({ kind }: { kind: SearchDoc["kind"] }) {
  const config = {
    page: { label: "Page", icon: FileText, className: "text-primary border-primary/30 bg-primary/10" },
    heading: { label: "Heading", icon: Hash, className: "text-info border-info/30 bg-info/10" },
    "reading-item": { label: "Reading", icon: BookOpen, className: "text-warning border-warning/30 bg-warning/10" },
  } as const;

  const { label, icon: Icon, className } = config[kind];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded",
        "font-sans text-[10px] font-medium leading-none",
        "border shrink-0",
        className
      )}
    >
      <Icon className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

function ResultRow({ doc }: ResultRowProps) {
  return (
    <Link
      to={doc.href}
      className={cn(
        "group flex items-start gap-3 px-3 py-2.5 rounded-lg",
        "hover:bg-accent transition-colors duration-150",
        "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-sans text-sm text-foreground group-hover:text-primary transition-colors duration-150 font-medium truncate">
            {doc.title}
          </span>
          <KindBadge kind={doc.kind} />
        </div>
        {doc.subtitle && (
          <p className="font-sans text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-1">
            {doc.subtitle}
          </p>
        )}
        <p className="font-sans text-xs text-muted-foreground/70 mt-0.5">
          {doc.breadcrumb}
        </p>
      </div>
    </Link>
  );
}

// ─── Result group ─────────────────────────────────────────────────────────────

interface ResultGroupProps {
  title: string;
  docs: SearchDoc[];
  icon: React.ReactNode;
}

function ResultGroup({ title, docs, icon }: ResultGroupProps) {
  const [expanded, setExpanded] = useState(false);
  const PREVIEW_COUNT = 10; // Spec §10: cap at 10

  if (docs.length === 0) return null;

  const shown = expanded ? docs : docs.slice(0, PREVIEW_COUNT);
  const hasMore = docs.length > PREVIEW_COUNT;

  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-muted-foreground">{icon}</span>
        <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        <span className="font-sans text-xs text-muted-foreground/60 ml-auto">
          {docs.length} result{docs.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-0.5">
        {shown.map((doc) => (
          <ResultRow key={doc.id} doc={doc} />
        ))}
      </div>

      {hasMore && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={cn(
            "flex items-center gap-1.5 mt-2 px-3 py-1.5",
            "font-sans text-xs text-muted-foreground",
            "hover:text-primary transition-colors duration-150",
            "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1",
            "rounded"
          )}
        >
          <ChevronDown className="w-3 h-3" />
          Show all {docs.length} results
        </button>
      )}
    </section>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ query }: { query: string }) {
  return (
    <div className="py-12 text-center">
      <p className="text-xl font-medium tracking-tight text-foreground mb-2">
        No matches for &ldquo;{query}&rdquo;
      </p>
      <p className="font-sans text-sm text-muted-foreground/70 leading-relaxed mb-6">
        Try a broader term, a topic name, or a paper title.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Link
          to="/"
          className={cn(
            "inline-flex items-center px-4 py-2 rounded-lg",
            "font-sans text-sm font-medium",
            "border border-border",
            "text-foreground hover:text-primary hover:bg-accent",
            "transition-colors duration-150",
            "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1"
          )}
        >
          Go to Dashboard
        </Link>
        <Link
          to="/notes"
          className={cn(
            "inline-flex items-center px-4 py-2 rounded-lg",
            "font-sans text-sm font-medium",
            "text-muted-foreground hover:text-primary hover:bg-accent",
            "transition-colors duration-150",
            "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1"
          )}
        >
          Browse Notes
        </Link>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface SearchResultsProps {
  query: string;
  results: GroupedResults;
  isLoading?: boolean;
}

export function SearchResults({ query, results, isLoading }: SearchResultsProps) {
  const total =
    results.pages.length + results.headings.length + results.readingItems.length;

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <p className="font-sans text-sm text-muted-foreground">Searching…</p>
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="py-8 text-center">
        <p className="font-sans text-sm text-muted-foreground leading-relaxed">
          Type a query above. Try a topic name, paper title, or technique.
        </p>
      </div>
    );
  }

  if (total === 0) {
    return <EmptyState query={query} />;
  }

  return (
    <div className="space-y-8">
      <ResultGroup
        title="Pages"
        docs={results.pages}
        icon={<FileText className="w-3.5 h-3.5" />}
      />
      <ResultGroup
        title="Headings"
        docs={results.headings}
        icon={<Hash className="w-3.5 h-3.5" />}
      />
      <ResultGroup
        title="Reading Items"
        docs={results.readingItems}
        icon={<BookOpen className="w-3.5 h-3.5" />}
      />
    </div>
  );
}
