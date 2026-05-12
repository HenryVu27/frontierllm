/**
 * OrientationPage — /notes/07-frontier-labs/orientation
 * Phase 6: Full implementation.
 *
 * - Top banner: warm vermillion activity card.
 * - Primary checklist: interactive ReadingList for orientation.
 * - Below: full orientation content (via RenderedMarkdown) minus the
 *   "Targets" / reading list section (replaced by the interactive list above).
 */

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { RenderedMarkdown } from "@/components/content/RenderedMarkdown";
import { ReadingList } from "@/components/content/ReadingList";
import { getEntry } from "@/lib/manifest";
import { topicReadCount } from "@/lib/progress";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { getAllEntries } from "@/lib/manifest";
import { formatDate } from "@/lib/format";
import { Progress } from "@/components/ui/progress";
import { FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

const ORIENTATION_SLUG = "07-frontier-labs-orientation";

export function OrientationPage() {
  const entry = getEntry(ORIENTATION_SLUG);
  const { progress } = useReadingProgress();

  const manifest = useMemo(() => ({
    generatedAt: "",
    entries: getAllEntries(),
  }), []);

  const { read, total } = topicReadCount(ORIENTATION_SLUG, manifest, progress);
  const pct = total > 0 ? Math.round((read / total) * 100) : 0;

  const editorLink = entry?.path
    ? `vscode://file/${entry.path.replace(/\\/g, "/")}`
    : null;

  return (
    <PageContainer>
      {/* Activity banner */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 px-5 py-4 mb-8">
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-primary mb-2">
          First active activity
        </p>
        <p className="text-base text-foreground leading-relaxed">
          Read 6 recent frontier-model technical reports and produce a comparative writeup.
        </p>
        <p className="font-sans text-xs text-muted-foreground mt-2">
          Source guidance:{" "}
          <Link
            to="/notes/07-frontier-labs"
            className="text-primary underline underline-offset-2 hover:no-underline"
          >
            07 — Frontier labs
          </Link>
        </p>
      </div>

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground mb-1">
            {entry?.title ?? "Orientation Pass"}
          </h1>
          {entry && (
            <p className="font-sans text-xs text-muted-foreground">
              Last modified: {formatDate(entry.lastModified)}
            </p>
          )}
        </div>
        {editorLink && (
          <a
            href={editorLink}
            title="Open in VS Code"
            aria-label="Open source file in VS Code"
            className={cn(
              "flex items-center gap-1.5 shrink-0 mt-1",
              "font-sans text-xs text-muted-foreground",
              "hover:text-primary transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1"
            )}
          >
            <FileCode className="w-3.5 h-3.5" aria-hidden="true" />
            Open in editor
          </a>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-sans text-xs text-muted-foreground">
            {read} / {total} reports read
          </span>
          <span className="font-sans text-xs text-muted-foreground">{pct}%</span>
        </div>
        <Progress value={pct} className="h-1.5" aria-label={`${read} of ${total} reports read`} />
      </div>

      {/* Primary reading checklist */}
      <section aria-label="Orientation reading list" className="mb-10">
        <ReadingList slug={ORIENTATION_SLUG} />
      </section>

      {/* Full orientation content (RenderedMarkdown will skip the reading list section
          and show it via the interactive ReadingList above) */}
      <div className="border-t border-border pt-8">
        <RenderedMarkdown slug={ORIENTATION_SLUG} />
      </div>
    </PageContainer>
  );
}
